// 個人用の日本語 textlint 共有設定(config 型)。
// この1ファイルを「単一の真実」とし、.textlintrc.js が再 export する。
// 各プロジェクトは require("my-textlint-config") で取り込み、prh 辞書を重ねて拡張する。
const path = require("path");

module.exports = {
  rules: {
    // AI 特有の不自然表現(過剰な太字・冗長なヘッジ・箇条書きの不統一)を検出する
    "preset-ai-writing": true,
    // 半角/全角スペース・約物前後の統一(fix 対応)
    "preset-ja-spacing": true,
    // 技術文書の基本(一文の長さ・読点数・二重否定 等)
    "preset-ja-technical-writing": {
      "sentence-length": { max: 120 }
    },
    // 形式名詞のひらがな化(fix 対応)
    "ja-hiragana-keishikimeishi": true,
    // 敬体(です・ます)と常体(である)の混在検出
    "no-mix-dearu-desumasu": true,
    // 表記統一辞書(囲み数字→[n] 等・fix 対応)。
    // 相対パスは消費側の cwd 基準で壊れるため、必ず __dirname 起点の絶対パスにする。
    prh: {
      rulePaths: [path.resolve(__dirname, "dict/prh.yml")]
    }
  }
};
