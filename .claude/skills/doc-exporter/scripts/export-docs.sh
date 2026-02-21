#!/usr/bin/env bash
# export-docs.sh - Export project documentation to PDF/DOCX/HTML
# Usage: ./export-docs.sh [format] [file|all]
# Examples:
#   ./export-docs.sh pdf all          # Export all docs as PDF
#   ./export-docs.sh docx PRD.md      # Export PRD as DOCX
#   ./export-docs.sh html all         # Export all docs as HTML

set -euo pipefail

FORMAT="${1:-pdf}"
TARGET="${2:-all}"
DOCS_DIR="docs"
EXPORT_DIR="exports"
PROJECT_NAME=$(basename "$(pwd)")
DATE=$(date +%Y-%m-%d)

# Check pandoc installation
if ! command -v pandoc &>/dev/null; then
    echo "ERROR: pandoc not installed."
    echo "Install with: brew install pandoc"
    exit 1
fi

# Create export directory
mkdir -p "$EXPORT_DIR"

# Common pandoc flags
COMMON_FLAGS="--toc --toc-depth=3 --highlight-style=tango"

export_file() {
    local input="$1"
    local format="$2"
    local basename
    basename=$(basename "$input" .md)

    case "$format" in
        pdf)
            echo "Exporting $input -> $EXPORT_DIR/$basename.pdf"
            pandoc "$input" -o "$EXPORT_DIR/$basename.pdf" \
                $COMMON_FLAGS \
                -V geometry:margin=1in \
                -V fontsize=11pt \
                -V "title:$basename" \
                -V "date:$DATE" \
                --pdf-engine=xelatex 2>/dev/null || \
            pandoc "$input" -o "$EXPORT_DIR/$basename.pdf" \
                $COMMON_FLAGS \
                -V geometry:margin=1in \
                -V fontsize=11pt 2>/dev/null || \
            echo "  WARN: PDF export failed for $input (LaTeX engine may not be installed)"
            ;;
        docx)
            echo "Exporting $input -> $EXPORT_DIR/$basename.docx"
            pandoc "$input" -o "$EXPORT_DIR/$basename.docx" $COMMON_FLAGS
            ;;
        html)
            echo "Exporting $input -> $EXPORT_DIR/$basename.html"
            pandoc "$input" -o "$EXPORT_DIR/$basename.html" \
                $COMMON_FLAGS \
                --standalone \
                --metadata "title=$basename"
            ;;
        *)
            echo "ERROR: Unknown format '$format'. Use: pdf, docx, html"
            exit 1
            ;;
    esac
}

# Export
if [ "$TARGET" = "all" ]; then
    echo "=== Exporting all docs as $FORMAT ==="
    echo ""

    if [ ! -d "$DOCS_DIR" ]; then
        echo "ERROR: No docs/ directory found."
        exit 1
    fi

    count=0
    for file in "$DOCS_DIR"/*.md; do
        [ -f "$file" ] || continue
        export_file "$file" "$FORMAT"
        count=$((count + 1))
    done

    echo ""
    echo "=== Done: $count files exported to $EXPORT_DIR/ ==="
else
    # Single file
    if [ -f "$DOCS_DIR/$TARGET" ]; then
        export_file "$DOCS_DIR/$TARGET" "$FORMAT"
    elif [ -f "$TARGET" ]; then
        export_file "$TARGET" "$FORMAT"
    else
        echo "ERROR: File not found: $TARGET"
        echo "Looked in: $DOCS_DIR/$TARGET and $TARGET"
        exit 1
    fi
    echo "=== Done ==="
fi

# List exports
echo ""
echo "Exports:"
ls -lh "$EXPORT_DIR"/ 2>/dev/null
