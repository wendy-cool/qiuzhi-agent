#!/usr/bin/env node
// 将求职背调 .md 报告转为 Word (.docx) 格式
// 原理: .md → .print.html（复用 to-print.js）→ .docx（macOS textutil）
// 用法: node scripts/to-docx.js ~/Desktop/帆软_求职背调_深度_20260516.md

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("用法: node scripts/to-docx.js <报告文件.md>");
  process.exit(1);
}

const resolvedPath = path.resolve(
  inputPath.replace(/^~/, process.env.HOME)
);

if (!fs.existsSync(resolvedPath)) {
  console.error(`文件不存在: ${resolvedPath}`);
  process.exit(1);
}

// Step 1: Generate print HTML (remove toolbar for clean docx)
const md = fs.readFileSync(resolvedPath, "utf-8");
const { marked } = require("marked");
const htmlBody = marked.parse(md);

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
    font-size: 14px;
    line-height: 1.75;
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
  }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 13px; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  h1 { font-size: 22px; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px; }
  h2 { font-size: 18px; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
  h3 { font-size: 15px; }
  blockquote { border-left: 4px solid #3f51b5; padding: 8px 16px; background: #e8eaf6; margin: 10px 0; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
  pre { background: #f5f5f5; padding: 12px; border-radius: 4px; white-space: pre-wrap; }
</style>
</head>
<body>
${htmlBody}
</body>
</html>`;

const tmpHtml = `/tmp/qiuzhi_docx_${Date.now()}.html`;
fs.writeFileSync(tmpHtml, html, "utf-8");

// Step 2: Convert HTML to docx via macOS textutil
const outPath = resolvedPath.replace(/\.md$/, ".docx");
try {
  execSync(`textutil -convert docx -output "${outPath}" "${tmpHtml}"`, { encoding: "utf-8" });
  console.log(`Word 版已生成: ${outPath}`);
} catch (e) {
  console.error("转换失败。请确认你用的是 macOS（textutil 为 macOS 内置工具）。");
  console.error(e.stderr || e.message);
} finally {
  fs.unlinkSync(tmpHtml);
}
