#!/usr/bin/env node
// 将求职背调 .md 报告转为打印优化的 HTML，并在浏览器中打开
// 用法: node scripts/to-print.js ~/Desktop/字节跳动_求职背调_深度_20260516.md

const { marked } = require("marked");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("用法: node scripts/to-print.js <报告文件.md>");
  console.error("示例: node scripts/to-print.js ~/Desktop/字节跳动_求职背调_深度_20260516.md");
  process.exit(1);
}

const resolvedPath = path.resolve(
  inputPath.replace(/^~/, process.env.HOME)
);

if (!fs.existsSync(resolvedPath)) {
  console.error(`文件不存在: ${resolvedPath}`);
  process.exit(1);
}

const md = fs.readFileSync(resolvedPath, "utf-8");
const htmlBody = marked.parse(md);

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${path.basename(resolvedPath, ".md")}</title>
<style>
  @page {
    size: A4;
    margin: 15mm;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    font-size: 14px;
    line-height: 1.75;
    color: #1a1a1a;
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
    background: #fff;
  }

  h1 {
    font-size: 22px;
    margin: 28px 0 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #1a1a1a;
    page-break-after: avoid;
  }

  h2 {
    font-size: 18px;
    margin: 24px 0 12px;
    padding-bottom: 4px;
    border-bottom: 1px solid #e0e0e0;
    page-break-after: avoid;
  }

  h3 {
    font-size: 15px;
    margin: 18px 0 8px;
    page-break-after: avoid;
  }

  p {
    margin: 8px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 13px;
    page-break-inside: avoid;
    table-layout: fixed;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  th, td {
    border: 1px solid #ccc;
    padding: 6px 10px;
    text-align: left;
    vertical-align: top;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-all;
  }

  th {
    background: #f5f5f5;
    font-weight: 600;
  }

  blockquote {
    margin: 10px 0;
    padding: 8px 16px;
    border-left: 4px solid #3f51b5;
    background: #e8eaf6;
    color: #555;
  }

  blockquote p {
    margin: 4px 0;
  }

  code {
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 13px;
    font-family: "SF Mono", "Fira Code", monospace;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-all;
  }

  pre {
    background: #f5f5f5;
    padding: 12px 16px;
    border-radius: 4px;
    margin: 10px 0;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-all;
    overflow-x: hidden;
  }

  pre code {
    background: none;
    padding: 0;
  }

  ul, ol {
    margin: 8px 0 8px 24px;
  }

  li {
    margin: 4px 0;
  }

  hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 20px 0;
  }

  strong {
    font-weight: 600;
  }

  small {
    font-size: 12px;
    color: #888;
  }

  /* Print-specific styles */
  @media print {
    html {
      margin: 0;
      padding: 0;
    }

    body {
      margin: 15mm;
      padding: 0;
      max-width: none;
      font-size: 12px;
      line-height: 1.6;
      orphans: 3;
      widows: 3;
    }

    h1 { font-size: 20px; page-break-before: avoid; }
    h2 { font-size: 16px; page-break-before: avoid; }
    h3 { font-size: 14px; page-break-before: avoid; }
    table { font-size: 11px; table-layout: fixed; }
    th, td { font-size: 11px; word-wrap: break-word; overflow-wrap: break-word; }
    pre, code { font-size: 11px; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; }

    ul, ol { page-break-inside: avoid; }

    .no-print { display: none !important; }
  }

  .print-toolbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #3f51b5;
    color: #fff;
    padding: 10px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 1000;
    font-size: 13px;
  }

  .print-toolbar button {
    background: #fff;
    color: #3f51b5;
    border: none;
    padding: 6px 18px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
  }

  .print-toolbar button:hover {
    background: #e0e0e0;
  }

  body.with-toolbar {
    margin-top: 60px;
  }
</style>
</head>
<body class="with-toolbar">
<div class="print-toolbar no-print">
  <span>📄 ${path.basename(resolvedPath)}</span>
  <button onclick="window.print()">打印</button>
</div>

${htmlBody}
</body>
</html>`;

const outPath = resolvedPath.replace(/\.md$/, ".print.html");
fs.writeFileSync(outPath, html, "utf-8");

console.log(`打印版已生成: ${outPath}`);

exec(`open "${outPath}"`, (err) => {
  if (err) {
    console.error("无法自动打开浏览器，请手动打开上述文件");
  }
});
