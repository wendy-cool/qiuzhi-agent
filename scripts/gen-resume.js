#!/usr/bin/env node
// 简历生成器：读取 JSON 配置文件，生成 A4 打印优化 HTML 简历
// 用法: node scripts/gen-resume.js <resume.json>
// 输出: ~/Desktop/{姓名}_简历_{日期}.html

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// ── 1. 参数解析 ──────────────────────────────────
const inputPath = process.argv[2];
if (!inputPath) {
  console.error("用法: node scripts/gen-resume.js <resume.json>");
  console.error("示例: node scripts/gen-resume.js resume.example.json");
  process.exit(1);
}

const resolvedPath = path.resolve(inputPath.replace(/^~/, process.env.HOME));
if (!fs.existsSync(resolvedPath)) {
  console.error(`文件不存在: ${resolvedPath}`);
  process.exit(1);
}

// ── 2. 读取并校验 JSON ──────────────────────────
let data;
try {
  data = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
} catch (e) {
  console.error(`JSON 解析失败: ${e.message}`);
  process.exit(1);
}

const required = ["name", "targetPosition"];
for (const key of required) {
  if (!data[key]) {
    console.error(`缺少必填字段: ${key}`);
    process.exit(1);
  }
}

// ── 3. 工具函数 ──────────────────────────────────
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const renderTags = (tags) => {
  if (!tags || !tags.length) return "";
  return tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("\n");
};

const renderBullets = (bullets) => {
  if (!bullets || !bullets.length) return "";
  return bullets.map((b) => `                    <li>${esc(b)}</li>`).join("\n");
};

const renderExperiences = (exps) => {
  if (!exps || !exps.length) return "";
  return exps
    .map(
      (exp) => `
            <div class="job-item">
                <div class="job-header">
                    <span class="job-title text-[0.9rem]">${esc(exp.title)}</span>
                    ${exp.duration ? `<span class="job-date">${esc(exp.duration)}</span>` : ""}
                </div>
                <ul>
${renderBullets(exp.bullets)}
                </ul>
            </div>`
    )
    .join("\n");
};

const renderCompetencies = (comps) => {
  if (!comps || !comps.length) return "";
  return comps
    .map(
      (c) => `                <div>
                    <h3 class="text-xs font-bold text-slate-800 uppercase mb-0.5">${esc(c.title)}</h3>
                    <p class="text-[0.75rem] text-slate-500 leading-snug">${esc(c.description)}</p>
                </div>`
    )
    .join("\n");
};

const renderSkills = (skills) => {
  if (!skills || !skills.length) return "";
  return skills
    .map(
      (s) =>
        `                <p class="text-[0.8rem] text-slate-600"><span class="font-bold text-slate-800">${esc(s.category)}：</span> ${esc(s.description)}</p>`
    )
    .join("\n");
};

const renderPhoto = (photo) => {
  if (!photo) {
    return `<img src="https://via.placeholder.com/85x110?text=Photo" alt="Photo" class="profile-photo">`;
  }
  return `<img src="${esc(photo)}" alt="${esc(data.name)}" class="profile-photo" onerror="this.src='https://via.placeholder.com/85x110?text=Photo'">`;
};

// ── 4. 生成 HTML ──────────────────────────────────
const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const nameSafe = data.name.replace(/[\\/:*?"<>|]/g, "_");
const outputPath = path.join(
  process.env.HOME,
  "Desktop",
  `${nameSafe}_简历_${today}.html`
);

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(data.name)} - ${esc(data.targetPosition)}简历</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

        * { box-sizing: border-box; }
        body {
            font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            line-height: 1.42;
        }

        .resume-page {
            width: 210mm;
            min-height: 297mm;
            margin: 20px auto;
            background: white;
            padding: 22mm 24mm;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            position: relative;
        }

        @media print {
            @page {
                size: A4 portrait;
                margin: 0;
            }
            body { background: white; padding: 0; margin: 0; }
            .resume-page {
                margin: 0;
                box-shadow: none;
                width: 210mm;
                height: 297mm;
                padding: 20mm 22mm;
                overflow: hidden;
            }
        }

        .section-title {
            display: flex;
            align-items: center;
            font-size: 1.05rem;
            font-weight: 700;
            color: #0f172a;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 3px;
            margin-bottom: 8px;
            margin-top: 14px;
            position: relative;
        }

        .section-title::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 45px;
            height: 2.5px;
            background-color: #0f172a;
        }

        .job-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1px; }
        .job-title { font-weight: 600; color: #0f172a; font-size: 0.95rem; }
        .job-date { font-size: 0.8rem; color: #64748b; font-weight: 500; }

        ul { list-style-type: none; padding-left: 0; }
        li { position: relative; padding-left: 12px; margin-bottom: 2px; font-size: 0.85rem; color: #334155; text-align: justify; }
        li::before {
            content: "•";
            position: absolute;
            left: 0;
            color: #94a3b8;
            font-weight: bold;
        }

        .tag {
            display: inline-block;
            padding: 1px 8px;
            background: #f1f5f9;
            border-radius: 3px;
            font-size: 0.65rem;
            font-weight: 600;
            color: #475569;
            margin-right: 4px;
        }

        .profile-photo {
            width: 85px;
            height: 110px;
            object-fit: cover;
            border-radius: 2px;
            border: 1px solid #e2e8f0;
        }

        strong { color: #0f172a; font-weight: 600; }
    </style>
</head>
<body>

    <div class="resume-page">
        <!-- Header -->
        <header class="flex justify-between items-start mb-4">
            <div class="flex-1">
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">${data.name.split("").map((c) => c + " ").join("")}</h1>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">意向岗位：${esc(data.targetPosition)}</p>

                <div class="space-y-0.5 text-sm text-slate-600 mb-3">
                    ${data.phone ? `<div class="flex items-center">
                        <span class="w-10 font-semibold text-slate-400">电话</span>
                        <span class="text-slate-800">${esc(data.phone)}</span>
                    </div>` : ""}
                    ${data.email ? `<div class="flex items-center">
                        <span class="w-10 font-semibold text-slate-400">邮箱</span>
                        <span class="text-slate-800">${esc(data.email)}</span>
                    </div>` : ""}
                </div>

                <div class="flex flex-wrap gap-y-1.5">
                    ${renderTags(data.tags)}
                </div>
            </div>
            <div class="ml-10">
                ${renderPhoto(data.photo)}
            </div>
        </header>

        ${data.education ? `
        <!-- Education -->
        <section>
            <h2 class="section-title">教育背景</h2>
            <div class="job-header">
                <span class="job-title">${esc(data.education.school)} · ${esc(data.education.degree)}</span>
                <span class="job-date">${esc(data.education.duration || "")}</span>
            </div>
            <ul class="mt-1">
                ${renderBullets(data.education.details)}
            </ul>
        </section>` : ""}

        ${data.coreCompetencies && data.coreCompetencies.length ? `
        <!-- Core Competencies -->
        <section>
            <h2 class="section-title">核心竞争力</h2>
            <div class="grid grid-cols-2 gap-x-10 gap-y-2">
                ${renderCompetencies(data.coreCompetencies)}
            </div>
        </section>` : ""}

        ${data.experiences && data.experiences.length ? `
        <!-- Experience -->
        <section>
            <h2 class="section-title">${data.experiences.some((e) => e.type === "work") ? "专业实习经历" : "实践经历"}</h2>
            ${renderExperiences(data.experiences.filter((e) => e.type === "work"))}
            ${data.experiences.some((e) => e.type === "campus" || e.type === "project") ? `
            <h2 class="section-title" style="margin-top: 14px;">校园与项目实践</h2>
            ${renderExperiences(data.experiences.filter((e) => e.type === "campus" || e.type === "project"))}` : ""}
        </section>` : ""}

        ${data.skills && data.skills.length ? `
        <!-- Skills -->
        <section>
            <h2 class="section-title">技能与加分项</h2>
            <div class="space-y-1">
                ${renderSkills(data.skills)}
            </div>
        </section>` : ""}
    </div>

</body>
</html>`;

// ── 5. 写入文件并打开 ─────────────────────────────
fs.writeFileSync(outputPath, html, "utf-8");
console.log(`✅ 简历已生成: ${outputPath}`);

exec(`open "${outputPath}"`, (err) => {
  if (err) {
    console.log("请手动在浏览器打开上述文件 (Cmd+O)");
  } else {
    console.log("📄 已在浏览器中打开，按 Cmd+P 打印预览");
  }
});
