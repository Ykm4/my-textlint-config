# my-textlint-config

個人用の日本語textlint共有設定。
文章を決定的なルールで機械的に整える共通基盤。設定の単一の真実は`index.js`(`lib/`の宣言を合成する)。

## 使い方

リリースはsemverのgitタグで管理する。`#semver:^1`で導入するとminor/patchの更新に追従し、破壊的変更(major)は明示的な上げ替えになる。

### グローバルで使う

任意のディレクトリの対応ファイル(フォーマットは後述)を、共通設定でlint/fixする。ここでの「グローバル」は、gitやmiseの用法と同じくユーザー単位(ホームディレクトリ配下へのインストール)を指す。

消費側ディレクトリ(置き場所は任意)にtextlint本体とこのパッケージをインストールする。呼び出すときは、インストール先の`index.js`を`--config`に、`node_modules`を`--rules-base-directory`に指定する。

#### 使用例

消費側ディレクトリを`~/.config/textlint`とした場合。

```bash
# セットアップ
mkdir -p ~/.config/textlint && cd ~/.config/textlint
npm i textlint "github:Ykm4/my-textlint-config#semver:^1"
```

```bash
# 実行(タスクランナーやエイリアスにまとめると便利)
~/.config/textlint/node_modules/.bin/textlint \
  --config ~/.config/textlint/node_modules/my-textlint-config/index.js \
  --rules-base-directory ~/.config/textlint/node_modules \
  path/to/file.md
```

```bash
# 更新
cd ~/.config/textlint && npm update my-textlint-config
```

自動修正は`--fix`、機械連携向けのJSON出力は`--format json`を付ける。

### プロジェクトで使う

各プロジェクトはこの基盤をgit依存で入れ、`.textlintrc.js`でrequireして業界辞書を重ねる。

#### 使用例

```bash
npm i -D "github:Ykm4/my-textlint-config#semver:^1"
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
npx textlint 'docs/**/*.md'
```

## 重要: `--config`には`index.js`を渡す

`--config .textlintrc.js`を指定するとtextlintが「No rules found」になる(rc-config-loaderの癖)。`--config`には`index.js`(またはパッケージ名`my-textlint-config`)を渡すこと。`.textlintrc.js`はエディタの自動検出用に残している。

## 構成

- `index.js` — 共有設定の入口(単一の真実)。`lib/`の宣言を合成する
- `lib/*.js` — plugins・filters・rulesの宣言の実体
- `.textlintrc.js` — `index.js`を再export(エディタ自動検出用)
- `dict/prh.yml` — 記法規約の表記統一辞書(囲み数字→[n]等・fix対応)
- `dict/prh-gaiji.yml` — 外字・機種依存文字の正規化辞書(全角数字・組文字・ローマ数字等・fix対応)
- `dict/allow.yml` — 誤検知抑制の許可辞書(既定は空)
- `mise.toml` — Nodeを固定(textlint v15はNode 20+ が必須)
- `test/` — golden fixtureテスト(`ok`が通り`ng`だと落ちる)
- `.github/workflows/ci.yml` — Node 20/22/24で`npm ci` → `npm test`
- `renovate.json` — `textlint-*`をグループ化し、CIが通ることを条件にpatch/minorへ自動追随

## 有効化しているルール

状態: 有効=既定のまま/一部有効=一部の項目を上書き/オプション=プロジェクト側の拡張前提。

| ルール | 状態 | 説明 |
| --- | --- | --- |
| `preset-ai-writing` | 有効 | AI特有の不自然表現(過剰な太字・冗長なヘッジ・箇条書きの不統一)を検出する |
| `preset-ja-spacing` | 有効 | 半角/全角スペース・約物前後の統一(fix対応) |
| `preset-ja-technical-writing` | 一部有効 | 一文の長さの上限を120に変更し、一部ルールを無効化(理由と計測結果は`lib/rules.js`のコメントを参照)。他の項目は既定値のまま有効 |
| `ja-hiragana-keishikimeishi` | 有効 | 形式名詞のひらがな化(fix対応) |
| `prefer-tari-tari` | 有効 | 「〜たり」並列で後半の「たり」欠落を検出 |
| `no-kangxi-radicals` | 有効 | 康熙部首の混入検出(fix対応)。PDF由来の見た目同一・別コードポイント文字を正す |
| `prh` | オプション | `dict/prh.yml`(記法規約)と`dict/prh-gaiji.yml`(外字・機種依存文字)の表記統一辞書(fix対応)。各プロジェクトは`rulePaths`に業界辞書を追加して重ねられる |

## フィルタ

- `node-types` — コードブロック・インラインコード・リンクを検査対象から除外する(経緯と実効性は`lib/filters.js`のコメントを参照)。
- `allowlist` — 既定辞書`dict/allow.yml`で誤検知を抑制する。各プロジェクトは`allowlistConfigPaths`に自分の許可辞書を追加して重ねられる。

## 対応フォーマットとプラグイン

- Markdown・プレーンテキストはtextlint標準同梱のためプラグインは不要
- HTML・LaTeX・MDXはこの基盤に同梱する(`textlint-plugin-html`/`textlint-plugin-latex2e`/`textlint-plugin-mdx`)。
- AsciiDocとソースコード内コメントはこの基盤に含めない(必要なプロジェクトが個別に取り込む)。

## テスト

```bash
npm test
```

`test/fixtures/ok`(指摘なし・exit 0)と`test/fixtures/ng`(指摘あり・exit 1)を検証する。ルールの更新で検出範囲が変わると落ちて気づける。
