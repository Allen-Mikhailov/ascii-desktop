#!/bin/bash
# Compiles ascii.frag -> ascii.frag.qsb using Qt6's shader baker.
# Run this ON YOUR KDE MACHINE (needs qt6-shadertools / qsb installed).
set -e
DIR="org.kde.asciiwallpaper/contents/shaders"

# Search likely Qt6 install locations first so we don't accidentally pick up
# a Qt5 'qsb' shim earlier on PATH.
CANDIDATES=(
    /usr/lib/qt6/bin/qsb
    /usr/lib/x86_64-linux-gnu/qt6/bin/qsb
    /usr/lib64/qt6/bin/qsb
    /usr/lib64/qt6/libexec/qsb
)
QSB_BIN=""
for c in "${CANDIDATES[@]}"; do
    if [ -x "$c" ]; then QSB_BIN="$c"; break; fi
done

if [ -z "$QSB_BIN" ]; then
    QSB_BIN="$(find /usr -iname "qsb" -type f -executable 2>/dev/null | head -1)"
fi

if [ -z "$QSB_BIN" ]; then
    echo "qsb not found. Install it, e.g.:"
    echo "  Arch:    sudo pacman -S qt6-shadertools"
    echo "  Fedora:  sudo dnf install qt6-qtshadertools"
    echo "  Debian/Ubuntu: sudo apt install qt6-shadertools"
    echo "  (package appears installed but binary wasn't found in known paths -"
    echo "   run: dpkg -L qt6-shadertools | grep bin  -- and hardcode QSB_BIN here)"
    exit 1
fi

echo "Using qsb: $QSB_BIN"

"$QSB_BIN" --glsl "300 es,120,150" --hlsl 50 --msl 12 \
    -o "$DIR/ascii.frag.qsb" "$DIR/ascii.frag"

echo "Compiled: $DIR/ascii.frag.qsb"
