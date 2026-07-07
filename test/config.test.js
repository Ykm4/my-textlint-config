// golden fixture テスト。束ねた設定全体の回帰を検知する。
// test/fixtures/ok は指摘なし(exit 0)、test/fixtures/ng は指摘あり(exit 1)を期待する。
// exit 2 は設定/ルール読み込みの失敗(バグ)なので、ng でも区別して落とす。
const { test } = require("node:test");
const assert = require("node:assert");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const ROOT = path.resolve(__dirname, "..");
const BIN = path.join(ROOT, "node_modules", ".bin", "textlint");
const CONFIG = path.join(ROOT, "index.js");
const RULES_BASE = path.join(ROOT, "node_modules");

function lint(file) {
  const r = spawnSync(BIN, ["--config", CONFIG, "--rules-base-directory", RULES_BASE, file], {
    cwd: ROOT,
    encoding: "utf8"
  });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

// fixtures ディレクトリは lint 対象ファイル専用。拡張子を列挙せず実ファイルを拾う
// (形式を増やしても同期不要。隠しファイル・ディレクトリだけ弾く)。
function fixtures(kind) {
  const dir = path.join(__dirname, "fixtures", kind);
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && !d.name.startsWith("."))
    .map((d) => path.join(dir, d.name));
}

for (const file of fixtures("ok")) {
  test(`ok: ${path.basename(file)} は指摘なし(exit 0)`, () => {
    const { code, out } = lint(file);
    assert.strictEqual(code, 0, `ok fixture が引っかかった(exit ${code}):\n${out}`);
  });
}

for (const file of fixtures("ng")) {
  test(`ng: ${path.basename(file)} は指摘あり(exit 1)`, () => {
    const { code, out } = lint(file);
    assert.strictEqual(code, 1, `ng fixture が期待どおり落ちない(exit ${code}):\n${out}`);
  });
}
