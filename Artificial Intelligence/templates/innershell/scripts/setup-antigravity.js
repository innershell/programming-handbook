#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const instructionsDir = path.join(__dirname, "..", ".github", "instructions");
const rulesDir = path.join(__dirname, "..", ".agent", "rules");

if (!fs.existsSync(instructionsDir)) {
  console.error("Instructions directory not found:", instructionsDir);
  process.exit(1);
}

if (!fs.existsSync(rulesDir)) {
  fs.mkdirSync(rulesDir, { recursive: true });
}

const files = fs.readdirSync(instructionsDir).filter((f) => f.endsWith(".md"));

function processAndWrite(content, targetName) {
  // Extract the first fenced block (```...```). If none, use whole file.
  const fenceMatch = content.match(/```[\s\S]*?```/m);
  const fenced = fenceMatch ? fenceMatch[0] : content;

  // Remove the starting ```<tag> and trailing ```
  const inner = fenced.replace(/^```.*\n/, "").replace(/\n```\s*$/, "");

  // Extract frontmatter --- ... --- if present
  const fmMatch = inner.match(/^[ \t]*---\n([\s\S]*?)\n---\n?/m);
  let frontmatter = "";
  let body = inner;
  if (fmMatch) {
    frontmatter = fmMatch[1];
    body = inner.slice(fmMatch[0].length);
  }

  // Find applyTo (if any) in frontmatter and convert to scope
  let scopeLine = "";
  if (frontmatter) {
    const applyMatch = frontmatter.match(
      /applyTo:\s*(?:"([^"]*)"|'([^']*)'|([^\n\r]+))/
    );
    if (applyMatch) {
      const val = applyMatch[1] || applyMatch[2] || applyMatch[3] || "";
      scopeLine = `scope: ${JSON.stringify(val.trim())}`;
    }
  }

  // Build target frontmatter with trigger always_on and optional scope
  const fmLines = ["---", "trigger: always_on"];
  if (scopeLine) fmLines.push(scopeLine);
  fmLines.push("---", "");

  const targetPath = path.join(rulesDir, targetName);
  const out = [fmLines.join("\n"), body.trimStart()].join("\n");
  fs.writeFileSync(targetPath, out, "utf8");
  console.log("Wrote", targetPath);
}

files.forEach((file) => {
  const src = path.join(instructionsDir, file);
  const content = fs.readFileSync(src, "utf8");
  const base = path.basename(file).split(".")[0];
  const targetName = `${base}.md`;
  processAndWrite(content, targetName);
});

// Also copy .github/copilot-instructions.md to .agent/rules/antigravity-instructions.md
const copilotPath = path.join(
  __dirname,
  "..",
  ".github",
  "copilot-instructions.md"
);
if (fs.existsSync(copilotPath)) {
  const copilotContent = fs.readFileSync(copilotPath, "utf8");
  processAndWrite(copilotContent, "GEMINI.md");
} else {
  console.warn(
    "copilot-instructions.md not found at expected path:",
    copilotPath
  );
}

console.log("Done.");
