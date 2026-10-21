#!/usr/bin/env bash
# 把 PDF 的每一页渲染成 PNG，供切题工具使用
# 用法： ./pdf2png.sh /path/to/题库.pdf [dpi]
# 输出： PDF 同目录下的 pages/page-001.png ...

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "用法: $0 <input.pdf> [dpi]" >&2
  exit 1
fi

IN="$1"
DPI="${2:-220}"

if [ ! -f "$IN" ]; then
  echo "找不到文件: $IN" >&2
  exit 1
fi

OUT_DIR="$(cd "$(dirname "$IN")" && pwd)/pages"
mkdir -p "$OUT_DIR"

echo "渲染中：$IN  →  $OUT_DIR  (${DPI} dpi)"
gs -dNOPAUSE -dBATCH -dSAFER -q \
   -sDEVICE=png16m \
   -r"$DPI" \
   -dTextAlphaBits=4 \
   -dGraphicsAlphaBits=4 \
   -sOutputFile="$OUT_DIR/page-%03d.png" \
   "$IN"

COUNT=$(ls -1 "$OUT_DIR"/page-*.png 2>/dev/null | wc -l | tr -d ' ')
echo "完成，共 $COUNT 页。"
echo "接下来：打开 build/crop.html，导入这些 PNG 开始切题。"
