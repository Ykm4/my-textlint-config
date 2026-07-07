// ルール(preset と単体ルール)。preset・ルールを増やすときはここに足す。
const path = require("path");

module.exports = {
  // AI 特有の不自然表現(過剰な太字・冗長なヘッジ・箇条書きの不統一)を検出する
  "preset-ai-writing": true,
  // 半角/全角スペース・約物前後の統一(fix 対応)
  "preset-ja-spacing": true,
  // 技術文書の基本(一文の長さ・読点数・二重否定 等)
  "preset-ja-technical-writing": {
    "sentence-length": { max: 120 },
    // 同梱コピーは preferInBody:"ですます" 固定で、規約(敬体か常体に統一・どちらでも可)と合わない。
    // 下の standalone 版(既定=多数派の自動判定)に一本化するため、こちらは無効化する。
    "no-mix-dearu-desumasu": false,
    // 漢字の連続長チェックは無効化する。
    // 2026-07-07 に直近ノート60件で計測した結果、検出199件・106種の連続漢字はすべて税務・法令の正規複合語(小規模企業共済・生命保険料控除・履歴事項全部証明書 等)で、誤検知率は実質100%だった。
    // 語長が7〜14字に分布するため、max 引き上げ(12でも1件残る)でも allow 登録(106種+増え続ける)でも解決しない。
    // 一方で正当な検出はこれまでの全文書で0件であり、税務・法令・医療など長い漢字複合語が正規語彙のドメインとは前提が合わない。
    "max-kanji-continuous-len": false
  },
  // 形式名詞のひらがな化(fix 対応)
  "ja-hiragana-keishikimeishi": true,
  // 敬体(です・ます)と常体(である)の混在検出
  "no-mix-dearu-desumasu": true,
  // 「〜たり〜たり」の並列で後半の「たり」欠落を検出する(例: 歌ったり踊るのが → 歌ったり踊ったりするのが)
  "prefer-tari-tari": true,
  // 康熙部首(U+2F00-2FD5)の混入検出。
  // PDF からのコピペ等で「⽇」(U+2F47)のような見た目同一・別コードポイントの文字が混じると、検索・grep・prh マッチが静かに壊れるため。
  "no-kangxi-radicals": true,
  // 表記統一辞書(fix 対応)。
  // 相対パスは消費側の cwd 基準で壊れるため、必ず __dirname 起点の絶対パスにする。
  prh: {
    rulePaths: [
      // 記法規約の機械化(囲み数字→[n]・全角句読点 等)
      path.resolve(__dirname, "../dict/prh.yml"),
      // 外字・機種依存文字の正規化(全角数字・組文字・ローマ数字 等)
      path.resolve(__dirname, "../dict/prh-gaiji.yml")
    ]
  }
};
