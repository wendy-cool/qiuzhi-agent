# qiuzhi-agent — 求职者深度背调 Agent

基于 Claude Code Skill 的求职背调工具，帮助求职者在投递简历或面试前全面了解目标公司。

## 功能

- **公司画像**：基本信息、融资上市、营收规模、发展阶段判断
- **产品矩阵分析**：产品全景图、内部横向对比、技术栈拆解、产品竞争力评估
- **竞品深度对比**：多维度产品能力对比、竞品求职含义分析
- **组织文化洞察**：团队结构、关键人物、技术文化、加班信号
- **面试攻略**：面试流程、技术考点、系统设计题方向、行为面准备
- **求职决策矩阵**：加权评分模型 + 最终建议

## 两种模式

| 模式 | 命令 | 用时 | 内容 |
|------|------|------|------|
| 快速 | `/qiuzhi <公司名>` | ~5分钟 | 6大模块：公司基本面、产品总览、人才信号、风险清单、求职速评、信息核实 |
| 深度 | `/qiuzhi --deep <公司名>` | ~15分钟 | 快速全部 + 产品深度拆解、竞品对比、组织洞察、面试攻略、决策矩阵 |

## 岗位定制

```
/qiuzhi 字节跳动 --position "后端开发"
```

指定岗位后，报告将精准匹配该岗位的技术栈、面试重点、薪资范围。

## 安装

1. 将 `SKILL.md` 复制到 `~/.claude/skills/qiuzhi/SKILL.md`
2. 重启 Claude Code（或刷新 skills）

## 使用

```
/qiuzhi 字节跳动
/qiuzhi --deep 帆软软件 --position "前端开发"
```

报告自动保存到 `~/Desktop/{公司名}_求职背调_{模式}_{日期}.md`

## 打印

```bash
node scripts/to-print.js ~/Desktop/字节跳动_求职背调_深度_20260516.md
```

## 项目结构

```
qiuzhi-agent/
├── SKILL.md                    # Agent 提示词定义
├── README.md                   # 项目说明
├── LICENSE                     # MIT License
├── package.json                # Node.js 配置
├── .gitignore
├── scripts/
│   └── to-print.js             # Markdown → HTML 打印转换
└── examples/                   # 示例报告
```

## License

MIT
