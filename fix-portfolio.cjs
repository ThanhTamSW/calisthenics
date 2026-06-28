const fs = require('fs');
let oldCode = fs.readFileSync('PortfolioGrid_old.jsx', 'utf8');
let newCode = fs.readFileSync('src/components/PortfolioGrid.jsx', 'utf8');

const regex = /const FALLBACK_PROJECTS = \[[\s\S]*?\];/;
let oldMatch = oldCode.match(regex);
if (oldMatch) {
  newCode = newCode.replace(regex, oldMatch[0]);
}

newCode = newCode.replace(/const TAGS = \["[^"]*", "[^"]*", "[^"]*", "[^"]*"\];/, 'const TAGS = ["Tất cả", "Giải đấu", "Thành tích", "Content"];');
newCode = newCode.replace(/if \(key === "tat ca"\) return "T\?t c\?";/g, 'if (key === "tat ca") return "Tất cả";');
newCode = newCode.replace(/if \(key === "giai dau"\) return "Gi\?i d\?u";/g, 'if (key === "giai dau") return "Giải đấu";');
newCode = newCode.replace(/if \(key === "thanh tich"\) return "Thnh tch";/g, 'if (key === "thanh tich") return "Thành tích";');
newCode = newCode.replace(/Hnh trnh<br \/>c\?a <em>mnh<\/em>/g, 'Hành trình<br />của <em>mình</em>');

fs.writeFileSync('src/components/PortfolioGrid.jsx', newCode);
