#!/usr/bin/env bash
# PC全体で使う日本語校正 textlint ラッパー(方式A)。
# 任意のディレクトリにあるMarkdownを、この配下の共通設定・辞書でlint/fixする。
#
# 使い方:
#   ~/.config/textlint/textlint.sh <file.md> [<file2.md> ...]   # 検査(指摘のみ)
#   ~/.config/textlint/textlint.sh --fix <file.md>               # 自動修正
#   ~/.config/textlint/textlint.sh --format json <file.md>       # JSON出力(連携用)
set -euo pipefail

DIR="$HOME/.config/textlint"

exec "$DIR/node_modules/.bin/textlint" \
  --config "$DIR/index.js" \
  --rules-base-directory "$DIR/node_modules" \
  "$@"
