// 個人用の日本語 textlint 共有設定(config 型)。
// このファイルを「単一の真実」の入口とし、宣言の実体は lib/ 配下に関心ごとで分割する。
// .textlintrc.js が再 export し、各プロジェクトは require("my-textlint-config") で取り込んで prh 辞書を重ねて拡張する。
module.exports = {
  plugins: require("./lib/plugins"),
  filters: require("./lib/filters"),
  rules: require("./lib/rules")
};
