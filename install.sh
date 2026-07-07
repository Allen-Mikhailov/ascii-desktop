#!/bin/bash
set -e
SRC="org.kde.asciiwallpaper"
DEST="$HOME/.local/share/plasma/wallpapers/org.kde.asciiwallpaper"

mkdir -p "$(dirname "$DEST")"
rm -rf "$DEST"
cp -r "$SRC" "$DEST"
echo "Installed to $DEST"

echo
echo "Verifying KPackage sees it..."
if command -v kpackagetool6 >/dev/null; then
    kpackagetool6 --type Plasma/Wallpaper --list | grep -i asciiwallpaper && \
        echo "OK: plugin registered" || \
        echo "WARNING: not showing in kpackagetool6 list -- check metadata.json for typos"
else
    echo "kpackagetool6 not found, skipping verification (not fatal)"
fi

echo
echo "Restarting plasmashell so the new wallpaper plugin is picked up..."
if command -v plasmashell >/dev/null; then
    kquitapp6 plasmashell 2>/dev/null || killall plasmashell 2>/dev/null || true
    sleep 1
    (plasmashell >/dev/null 2>&1 &) 
    echo "Restarted."
else
    echo "Could not find plasmashell binary -- log out and back in instead."
fi

echo
echo "Now: Right-click Desktop -> Configure Desktop and Wallpaper -> Wallpaper Type -> 'ASCII Art Wallpaper'"
echo "If it's still missing, try logging out/in fully, and check for errors with:"
echo "  plasmawindowed org.kde.asciiwallpaper"
