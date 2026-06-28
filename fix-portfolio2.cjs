const fs = require('fs');
let newCode = fs.readFileSync('src/components/PortfolioGrid.jsx', 'utf8');

let oldCode = fs.readFileSync('PortfolioGrid_old.jsx', 'utf8');
const startIdx = oldCode.indexOf('const FALLBACK_PROJECTS = [');
const endIdx = oldCode.indexOf('];\n', startIdx) + 2;
const oldProjects = oldCode.substring(startIdx, endIdx);

const newStartIdx = newCode.indexOf('const FALLBACK_PROJECTS = [');
const newEndIdx = newCode.indexOf('];\n', newStartIdx) + 2;

if (newStartIdx !== -1 && newEndIdx !== -1) {
    newCode = newCode.substring(0, newStartIdx) + oldProjects + newCode.substring(newEndIdx);
}

newCode = newCode.replace(/if \(key === "thanh tich"\) return "Th.*tch";/g, 'if (key === "thanh tich") return "Thành tích";');
newCode = newCode.replace(/H.*nh tr.*nh<br \/>c.*a <em>m.*nh<\/em>/g, 'Hành trình<br />của <em>mình</em>');

fs.writeFileSync('src/components/PortfolioGrid.jsx', newCode);
