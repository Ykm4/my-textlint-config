// フィルタ(誤検知・検査対象外の制御)。フィルタを増やすときはここに足す。
const path = require("path");

module.exports = {
  // コードブロック・インラインコード・リンクを検査対象から外す。
  // Link を除外すると URL に加えリンクテキストも検査されなくなる点は許容する。
  //
  // 実地検証で判明した実効性:
  // - Link: 実効ガード。リンクテキストは Str の子ノードを持つため、これが無いと ja-hiragana-keishikimeishi 等が形式名詞をリンク内で検査してしまう。
  // - CodeBlock / Code: 現行ルールセットに対しては防御的(保険)。
  //   prh は checkLink:false かつ Code/CodeBlock の中身(value)は元々 Str 化されないため未検査であり、このフィルタが無くても現状は抑制対象が発生しない。
  //   将来 prh の checkCodeComment 設定や新規ルール追加があった場合の保険として残す。
  "node-types": {
    nodeTypes: ["CodeBlock", "Code", "Link"]
  },
  // 誤検知の抑制。既定辞書は dict/allow.yml。
  // 各プロジェクトは allowlistConfigPaths に自分の許可辞書を足して重ねられる。
  allowlist: {
    allowlistConfigPaths: [path.resolve(__dirname, "../dict/allow.yml")]
  }
};
