# CHANGELOG

## v1.0 (2026-05-16)

### 首次发布
- 核心 Agent prompt（SKILL.md）完整版 — 求职者视角深度背调
- 快速模式：6 节报告（公司基本面、产品总览、人才信号、风险清单、求职速评、信息核实）
- 深度模式：快速模式 + 6 节增量（产品深度拆解、竞品对比、组织洞察、面试攻略、薪资发展、决策矩阵）
- `--position` 岗位定制模式：技术栈匹配、面试重点、薪资精准匹配
- 3 轮 14 个并行搜索的信息采集架构
- 信息可信度 4 级标记体系（🔴官方 🟡第三方 🟠推测 ⚪待核实）
- 求职版专属模块：产品内部横向对比、竞品全景图+能力逐项PK、面试流程+备战指南、加权求职决策矩阵

### 配套工具
- **打印 HTML 导出**：`scripts/to-print.js` — .md → A4 打印优化 HTML，蓝色主题
- **Word 文档导出**：`scripts/to-docx.py` — .md → 排版良好 .docx（基于 python-docx）
- **Node.js 封装**：`scripts/to-docx.js` — macOS textutil 快速导出方案

### 项目结构
- 独立项目目录 `qiuzhi-agent/`，含 README、LICENSE（MIT）、.gitignore、package.json
- 从 [beijing-agent](https://github.com/wendy-cool/BGC---agent) 框架衍生，继承其并行搜索架构和报告生成范式
