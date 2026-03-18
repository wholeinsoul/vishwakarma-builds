#!/bin/bash
# Download Noto Sans Devanagari fonts for Hindi infographic generation
# These fonts are Apache 2.0 licensed by Google

set -e

FONTS_DIR="$(dirname "$0")/../fonts"
mkdir -p "$FONTS_DIR"

echo "Downloading Noto Sans Devanagari fonts..."

# Regular weight
curl -sL "https://github.com/google/fonts/raw/main/ofl/notosansdevanagari/NotoSansDevanagari%5Bwdth%2Cwght%5D.ttf" \
  -o "$FONTS_DIR/NotoSansDevanagari-Regular.ttf"

# Bold weight (using static font for simplicity)
curl -sL "https://github.com/google/fonts/raw/main/ofl/notosansdevanagari/static/NotoSansDevanagari-Bold.ttf" \
  -o "$FONTS_DIR/NotoSansDevanagari-Bold.ttf"

echo "✅ Fonts downloaded to $FONTS_DIR"
ls -la "$FONTS_DIR"
