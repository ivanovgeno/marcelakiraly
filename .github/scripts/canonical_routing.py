"""Add canonical routing without replacing WEDOS' shared hosting rules."""

START = "# BEGIN konstelacesmarcelou.cz canonical URLs\n"
END = "# END konstelacesmarcelou.cz canonical URLs\n"
RULES = """# BEGIN konstelacesmarcelou.cz canonical URLs
RewriteEngine On
# Redirect an explicitly requested index.html before WEDOS' internal routing.
RewriteCond %{HTTP_HOST} ^(www\\.)?konstelacesmarcelou\\.cz$ [NC]
RewriteCond %{THE_REQUEST} \\s/+index\\.html[?\\s] [NC]
RewriteRule ^index\\.html$ https://konstelacesmarcelou.cz/ [R=301,L]
# Keep the requested page and query string when normalizing host and scheme.
RewriteCond %{HTTP_HOST} ^(www\\.)?konstelacesmarcelou\\.cz$ [NC]
RewriteCond %{HTTPS} !=on [OR]
RewriteCond %{HTTP_HOST} ^www\\.konstelacesmarcelou\\.cz$ [NC]
RewriteRule ^ https://konstelacesmarcelou.cz%{REQUEST_URI} [R=301,L]
# END konstelacesmarcelou.cz canonical URLs
"""


def with_canonical_rules(existing: str) -> str:
    """Prepend the domain-specific block, preserving all unrelated rules."""
    starts, ends = existing.count(START), existing.count(END)
    if starts != ends or starts > 1:
        raise ValueError("Ambiguous canonical rule markers; refusing to edit .htaccess")
    if starts:
        before, remainder = existing.split(START, 1)
        _, after = remainder.split(END, 1)
        return RULES + before + after
    return RULES + existing
