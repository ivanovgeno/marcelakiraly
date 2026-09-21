"""Publish only website files using explicit FTP over verified TLS."""

import ftplib
import os
from pathlib import Path
import ssl
import subprocess


class SessionReuseFTP_TLS(ftplib.FTP_TLS):
    """Reuse the verified control-channel TLS session for FTP data sockets."""

    def ntransfercmd(self, cmd, rest=None):
        conn, size = ftplib.FTP.ntransfercmd(self, cmd, rest)
        if self._prot_p:
            conn = self.context.wrap_socket(
                conn, server_hostname=self.host, session=self.sock.session
            )
        return conn, size


required = ("FTP_HOST", "FTP_USER", "FTP_PASSWORD", "FTP_REMOTE_DIR")
missing = [name for name in required if not os.environ.get(name, "").strip()]
if missing:
    raise SystemExit("Missing GitHub Actions secrets: " + ", ".join(missing))

host = os.environ["FTP_HOST"].strip()
remote_dir = os.environ["FTP_REMOTE_DIR"].strip()
if "://" in host or "/" in host or ":" in host:
    raise SystemExit("FTP_HOST must be a hostname without a protocol, path or port")
if remote_dir in (".", "..") or ".." in Path(remote_dir).parts:
    raise SystemExit("FTP_REMOTE_DIR must specify the website directory")

tracked = subprocess.check_output(["git", "ls-files", "-z"]).split(b"\0")
files = []
for raw in tracked:
    if not raw:
        continue
    relative = Path(os.fsdecode(raw))
    if (len(relative.parts) == 1 and relative.suffix in (".html", ".txt", ".xml")) or (
        relative.parts[0] == "assets" and len(relative.parts) > 1
    ):
        if relative.is_symlink() or not relative.is_file():
            raise SystemExit(f"Expected a regular website file: {relative}")
        files.append(relative)

if not files or Path("index.html") not in files:
    raise SystemExit("Website files are missing; nothing was uploaded")

# Upload assets before HTML so pages reference files that are already present.
files.sort(key=lambda path: (path.suffix == ".html", path.name == "index.html", str(path)))
context = ssl.create_default_context()
context.minimum_version = ssl.TLSVersion.TLSv1_2
ftp = SessionReuseFTP_TLS(context=context, timeout=45)
ftp.connect(host, 21)
ftp.auth()
ftp.login(os.environ["FTP_USER"], os.environ["FTP_PASSWORD"])
ftp.prot_p()
try:
    ftp.cwd(remote_dir)
except ftplib.error_perm:
    login_dir = ftp.pwd()
    print("Configured FTP_REMOTE_DIR is not accessible from the FTP login directory.")
    print("Checking whether the proposed /www/domains path is accessible:")
    for candidate in ("/www/domains", "www/domains", "/domains", "domains"):
        ftp.cwd(login_dir)
        try:
            ftp.cwd(candidate)
        except ftplib.error_perm:
            print(f"  {candidate}: unavailable")
            continue
        print(f"  {candidate}: available")
        if candidate.endswith("domains"):
            try:
                matches = [
                    name.rsplit("/", 1)[-1]
                    for name in ftp.nlst()
                    if "marcela" in name.lower() or "konstelace" in name.lower()
                ]
                print("  Possible matching domain folders: " + (", ".join(matches) or "none"))
            except ftplib.Error as exc:
                print(f"  Listing this directory failed: {type(exc).__name__}")
    ftp.quit()
    raise SystemExit("No files uploaded; set FTP_REMOTE_DIR to the web's exact document directory.")
base_dir = ftp.pwd()

uploaded = 0
try:
    for file in files:
        ftp.cwd(base_dir)
        for directory in file.parts[:-1]:
            try:
                ftp.cwd(directory)
            except ftplib.error_perm:
                ftp.mkd(directory)
                ftp.cwd(directory)
        with file.open("rb") as source:
            ftp.storbinary(f"STOR {file.name}", source)
        uploaded += 1
        print(f"Uploaded {file}")
finally:
    try:
        ftp.quit()
    except (OSError, ftplib.Error):
        ftp.close()

print(f"Uploaded {uploaded} website files to the configured directory.")
