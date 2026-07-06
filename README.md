# my-textlint-config

個人用の日本語 textlint 共有設定(config 型)。AIエージェント(Claude Code)が生成する日本語を、決定的なルールで機械的に整える共通基盤。文脈判断が要る「自然さ・文体・構成」の推敲は別の仕組み(`~/.claude/skills/ja-proofread`)が担う(分業)。

- リポジトリ本体は `~/other/my-textlint-config`。`~/.config/textlint` はそこへの symlink で、方式A のラッパーや mise はこの symlink 経由で参照する(将来 dotfiles が symlink を管理し、リポジトリ本体は別管理にできる)
- 設定の単一の真実は `index.js`。`.textlintrc.js` はそれを再 export するだけ
- 各プロジェクトはこれを require して業界固有の辞書を重ねて拡張する

## 使い方

### 方式A: PC全体の校正(ラッパー)

任意のディレクトリの Markdown を、この配下の共通設定で lint / fix する。

```bash
~/.config/textlint/textlint.sh path/to/file.md          # 検査(指摘のみ)
~/.config/textlint/textlint.sh --fix path/to/file.md     # 自動修正
~/.config/textlint/textlint.sh --format json file.md     # JSON出力
```

エイリアスを張ると便利。

```bash
alias ja-lint='~/.config/textlint/textlint.sh'
```

### 方式B: プロジェクト個別(共通基盤＋業界特化)

各プロジェクトはこの基盤を git 依存で入れ、`.textlintrc.js` で require して業界辞書を重ねる。

```bash
npm i -D github:Ykm4/my-textlint-config#v1.0.0
```

```js
// プロジェクトの .textlintrc.js
const path = require("path");
const base = require("my-textlint-config");
module.exports = {
  ...base,
  rules: {
    ...base.rules,
    // 業界固有の表記辞書を共通辞書に重ねる
    prh: { rulePaths: [...base.rules.prh.rulePaths, path.resolve(__dirname, "dict/industry.yml")] },
    // 必要ならプロジェクト向けに上書き
    "preset-ja-technical-writing": { "sentence-length": { max: 80 } }
  }
};
```

```bash
npx textlint --config my-textlint-config 'docs/**/*.md'
```

## 重要: `--config` には `index.js` を渡す

`--config .textlintrc.js` を指定すると textlint が「No rules found」になる(rc-config-loader の癖)。`--config` には `index.js`(またはパッケージ名 `my-textlint-config`)を渡すこと。`.textlintrc.js` はエディタの自動検出用に残している。

## 構成

- `index.js` — 共有設定の本体。単一の真実
- `.textlintrc.js` — `index.js` を再 export(エディタ自動検出用)
- `dict/prh.yml` — 表記統一辞書(囲み数字→[n] 等・fix 対応)
- `textlint.sh` — 方式A のラッパー(`--config index.js` ＋ `--rules-base-directory`)
- `mise.toml` — Node を固定(textlint v15 は Node 20+ が必須)
- `test/` — golden fixture テスト(`ok` が通り `ng` が落ちる)
- `.github/workflows/ci.yml` — Node 20/22/24 で `npm ci` → `npm test`
- `renovate.json` — `textlint-*` をグループ化し patch/minor を自動追随

## 有効化しているルール

- `preset-ai-writing` — AI特有の不自然表現(過剰な太字・冗長なヘッジ・箇条書きの不統一)
- `preset-ja-spacing` — 半角/全角スペース・約物前後の統一(fix 対応)
- `preset-ja-technical-writing` — 技術文書の基本(一文の長さ 120・読点数・二重否定 等)
- `ja-hiragana-keishikimeishi` — 形式名詞のひらがな化(fix 対応)
- `no-mix-dearu-desumasu` — 敬体(です・ます)と常体(である)のコピュラ混在検出
- `prh` — `dict/prh.yml` の表記統一辞書(fix 対応)

## テスト

```bash
npm test
```

`test/fixtures/ok` は指摘なし(exit 0)、`test/fixtures/ng` は指摘あり(exit 1)を検証する。ルールの更新で検出範囲が変わると落ちて気づける。

## 更新

ローカルは mise の一括更新に載せる(`~/.config/mise/config.toml` の `tools:update` に `textlint:update` を追加)。

```bash
npm --prefix ~/.config/textlint update   # 単発更新
mise r tools:update                       # 一括更新に含める場合
```

リポジトリ側は Renovate が `textlint-*` の patch/minor を CI green を条件に追随する。
