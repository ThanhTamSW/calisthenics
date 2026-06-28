const fs = require('fs');
function fix(file, resolver) {
  let content = fs.readFileSync(file, 'utf8');
  let regex = /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> origin\/chore\/hardening-ci-auth-cors\r?\n/g;
  let newContent = content.replace(regex, (match, head, remote) => resolver(head, remote));
  fs.writeFileSync(file, newContent);
}

fix('.env.example', (h, r) => h + r);
fix('public/api/auth.php', (h, r) => h + r);
fix('src/App.jsx', (h, r) => h + r);
fix('src/components/Footer.jsx', (h, r) => h);
fix('src/components/Header.jsx', (h, r) => h);
fix('src/components/HeroSection.jsx', (h, r) => h);
fix('src/components/PortfolioGrid.jsx', (h, r) => 'import { useState, useEffect, useRef, useCallback, useMemo } from "react";\n');
fix('src/index.css', (h, r) => h + '\n' + r);
fix('src/main.jsx', (h, r) => '    <HelmetProvider>\n      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>\n        <LanguageProvider>\n          <App />\n        </LanguageProvider>\n      </BrowserRouter>\n    </HelmetProvider>\n');
