#!/bin/bash

# PDF Export Script using Pandoc
# Usage: ./export-pdf.sh <markdown-file>
# Example: ./export-pdf.sh SSD-Exam-Plan.md

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Check if file argument provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: No markdown file specified${NC}"
    echo -e "${BLUE}Usage: ./export-pdf.sh <markdown-file>${NC}"
    echo -e "${BLUE}Example: ./export-pdf.sh SSD-Exam-Plan.md${NC}"
    exit 1
fi

# Input file
INPUT_FILE="$1"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo -e "${RED}❌ Error: File not found: ${INPUT_FILE}${NC}"
    exit 1
fi

# Generate output filename (replace .md with .pdf)
OUTPUT_FILE="${INPUT_FILE%.md}.pdf"

echo -e "${BLUE}📄 Converting Markdown to PDF with Pandoc${NC}"
echo -e "${BLUE}Input:  ${INPUT_FILE}${NC}"
echo -e "${BLUE}Output: ${OUTPUT_FILE}${NC}"

# Check if pandoc is installed
if ! command -v pandoc &> /dev/null; then
    echo -e "${RED}❌ Error: pandoc is not installed${NC}"
    echo -e "${BLUE}Install with: brew install pandoc${NC}"
    exit 1
fi

# Extract metadata from YAML frontmatter
echo -e "${BLUE}📖 Reading metadata from file...${NC}"

# Extract title from YAML frontmatter (if exists), otherwise use first # heading
DOC_TITLE=$(sed -n '/^---$/,/^---$/p' "$INPUT_FILE" | grep '^title:' | sed 's/^title: *//; s/"//g; s/^ *//; s/ *$//')
if [ -z "$DOC_TITLE" ]; then
    # No title in YAML, extract the first # heading
    DOC_TITLE=$(grep -m 1 '^# ' "$INPUT_FILE" | sed 's/^# //')
    if [ -z "$DOC_TITLE" ]; then
        DOC_TITLE="Document"
        echo -e "${YELLOW}⚠️  Warning: No title in YAML or first-level heading found, using default${NC}"
    fi
fi
# Escape special LaTeX characters
DOC_TITLE=$(echo "$DOC_TITLE" | sed 's/&/\\&/g; s/#/\\#/g; s/%/\\%/g; s/_/\\_/g')

# Extract header-left from YAML frontmatter
HEADER_LEFT=$(sed -n '/^---$/,/^---$/p' "$INPUT_FILE" | grep '^header-left:' | sed 's/^header-left: *//; s/"//g; s/^ *//; s/ *$//')
if [ -z "$HEADER_LEFT" ]; then
    HEADER_LEFT="Document"
    echo -e "${YELLOW}⚠️  Warning: No header-left found in YAML frontmatter, using default${NC}"
fi
# Escape special LaTeX characters
HEADER_LEFT=$(echo "$HEADER_LEFT" | sed 's/&/\\&/g; s/#/\\#/g; s/%/\\%/g; s/_/\\_/g')

# Extract header-center from YAML frontmatter
HEADER_CENTER=$(sed -n '/^---$/,/^---$/p' "$INPUT_FILE" | grep '^header-center:' | sed 's/^header-center: *//; s/"//g; s/^ *//; s/ *$//')
if [ -z "$HEADER_CENTER" ]; then
    HEADER_CENTER=""
fi
# Escape special LaTeX characters
HEADER_CENTER=$(echo "$HEADER_CENTER" | sed 's/&/\\&/g; s/#/\\#/g; s/%/\\%/g; s/_/\\_/g')

# Extract header-right from YAML frontmatter
HEADER_RIGHT=$(sed -n '/^---$/,/^---$/p' "$INPUT_FILE" | grep '^header-right:' | sed 's/^header-right: *//; s/"//g; s/^ *//; s/ *$//')
if [ -z "$HEADER_RIGHT" ]; then
    HEADER_RIGHT="Author Name"
    echo -e "${YELLOW}⚠️  Warning: No header-right found in YAML frontmatter, using default${NC}"
fi
# Escape special LaTeX characters
HEADER_RIGHT=$(echo "$HEADER_RIGHT" | sed 's/&/\\&/g; s/#/\\#/g; s/%/\\%/g; s/_/\\_/g')

echo -e "${BLUE}   Title:         ${DOC_TITLE}${NC}"
echo -e "${BLUE}   Header Left:   ${HEADER_LEFT}${NC}"
echo -e "${BLUE}   Header Center: ${HEADER_CENTER}${NC}"
echo -e "${BLUE}   Header Right:  ${HEADER_RIGHT}${NC}"

# Run pandoc with metadata-based headers
pandoc "$INPUT_FILE" \
  -o "$OUTPUT_FILE" \
  --from markdown \
  --to pdf \
  --pdf-engine=xelatex \
  -M title="$DOC_TITLE" \
  --variable geometry:margin=2.5cm \
  --variable fontsize=11pt \
  --variable colorlinks=true \
  --variable linkcolor=blue \
  --variable urlcolor=blue \
  --variable toccolor=black \
  --highlight-style=tango \
  --include-in-header=<(cat <<EOF
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhead[L]{\small\textit{${HEADER_LEFT}}}
\fancyhead[C]{\small\textit{${HEADER_CENTER}}}
\fancyhead[R]{\small\textit{${HEADER_RIGHT}}}
\fancyfoot[C]{\small Page \thepage\ of \pageref{LastPage}}
\fancyfoot[L]{}
\fancyfoot[R]{}
\renewcommand{\headrulewidth}{0.4pt}
\renewcommand{\footrulewidth}{0.4pt}
\usepackage{lastpage}
EOF
) \
  2>&1

# Check if conversion was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PDF created successfully: ${OUTPUT_FILE}${NC}"
    echo -e "${GREEN}📊 File size: $(du -h "$OUTPUT_FILE" | cut -f1)${NC}"
    echo -e "${GREEN}📄 Pages: $(pdfinfo "$OUTPUT_FILE" 2>/dev/null | grep "^Pages:" | awk '{print $2}' || echo "N/A")${NC}"
else
    echo -e "${RED}❌ Error: PDF conversion failed${NC}"
    exit 1
fi
