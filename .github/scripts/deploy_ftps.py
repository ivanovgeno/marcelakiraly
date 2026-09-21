"""Publish only website files using explicit FTP over verified TLS."""

import ftplib
import hashlib
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


required = ("FTP_HOST", "FTP_USER", "FTP_PASSWORD")
missing = [name for name in required if not os.environ.get(name, "").strip()]
if missing:
    raise SystemExit("Missing GitHub Actions secrets: " + ", ".join(missing))

host = os.environ["FTP_HOST"].strip()
if "://" in host or "/" in host or ":" in host:
    raise SystemExit("FTP_HOST must be a hostname without a protocol, path or port")

# The FTP account is already rooted inside /www. This folder is dedicated to
# the domain named by the owner; never upload into the shared /domains parent.
domain_directory = "konstelacesmarcelou.cz"
domains_parent = "/domains"

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
    ftp.cwd(domains_parent)
except ftplib.error_perm:
    ftp.quit()
    raise SystemExit("The FTP account cannot access /domains; no files uploaded.")
try:
    ftp.cwd(domain_directory)
except ftplib.error_perm:
    ftp.mkd(domain_directory)
    ftp.cwd(domain_directory)
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
    ftp.cwd(base_dir)
    downloaded = bytearray()
    ftp.retrbinary("RETR index.html", downloaded.extend)
    expected = hashlib.sha256(Path("index.html").read_bytes()).digest()
    if hashlib.sha256(downloaded).digest() != expected:
        raise SystemExit("The uploaded index.html did not match the repository file")
finally:
    try:
        ftp.quit()
    except (OSError, ftplib.Error):
        ftp.close()

print(f"Uploaded {uploaded} website files to /domains/{domain_directory}; index.html verified.")
