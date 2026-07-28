#!/usr/bin/env bash
# Download Bangladesh Protomaps PMTiles for offline map
# Run from project root: bash scripts/download-tiles.sh
set -euo pipefail

TILES_DIR="client/public/tiles"
OUTPUT="$TILES_DIR/bangladesh.pmtiles"
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

echo "=== Mukto Mesh — Download Bangladesh Map Tiles ==="
echo ""

# Check if tiles already exist
if [ -f "$OUTPUT" ] && [ -s "$OUTPUT" ]; then
  SIZE=$(du -h "$OUTPUT" | cut -f1)
  echo "✅ Tiles already exist: $OUTPUT ($SIZE)"
  echo "   Delete it first to re-download."
  exit 0
fi

# Download pmtiles CLI
PMTILES_CLI="$TMPDIR/pmtiles"
echo "📦 Downloading pmtiles CLI..."
if command -v pmtiles &>/dev/null; then
  PMTILES_CLI=$(command -v pmtiles)
  echo "   Using system pmtiles CLI"
else
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64) ARCH="x86_64" ;;
    aarch64|arm64) ARCH="arm64" ;;
    *) echo "❌ Unsupported architecture: $ARCH"; exit 1 ;;
  esac
  if [ "$OS" = "linux" ]; then
    URL="https://github.com/protomaps/go-pmtiles/releases/latest/download/go-pmtiles_1.31.2_Linux_${ARCH}.tar"
  elif [ "$OS" = "darwin" ]; then
    URL="https://github.com/protomaps/go-pmtiles/releases/latest/download/go-pmtiles_1.31.2_Darwin_${ARCH}.tar"
  else
    echo "❌ Unsupported OS: $OS. Download manually from https://github.com/protomaps/go-pmtiles/releases"
    exit 1
  fi
  curl -sL -o "$TMPDIR/pmtiles.tar" "$URL"
  tar xf "$TMPDIR/pmtiles.tar" -C "$TMPDIR"
  chmod +x "$PMTILES_CLI"
fi

echo "🗺️  Extracting Bangladesh tiles (bbox: 88,20.5,93,26.8)..."

# Try source.coop first (fastest CDN), then fall back to URL
SOURCE_URL="https://data.source.coop/protomaps/openstreetmap/planet/planet.pmtiles"
"$PMTILES_CLI" extract "$SOURCE_URL" "$OUTPUT" --bbox=88,20.5,93,26.8 2>&1 || {
  echo "   First URL failed, trying protomaps builds..."
  TODAY=$(date +%Y%m%d)
  "$PMTILES_CLI" extract "https://build.protomaps.com/$TODAY.pmtiles" "$OUTPUT" --bbox=88,20.5,93,26.8 2>&1 || {
    echo "❌ Failed to download tiles."
    echo "   Try downloading manually from https://maps.protomaps.com (select Bangladesh region)"
    exit 1
  }
}

SIZE=$(du -h "$OUTPUT" | cut -f1)
echo ""
echo "✅ Success! Tiles saved to: $OUTPUT ($SIZE)"
echo "   Start the server and the map will work offline."
