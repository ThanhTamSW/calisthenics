const fs = require('fs');
const path = require('path');
const owner = 'ThanhTamSW';
const repo = 'calisthenics';
const runId = '31108123813';
const outDir = path.join(process.cwd(), '.github', 'logs');
const outFile = path.join(outDir, `run-${runId}-logs.zip`);
const headers = { 'User-Agent': 'Node.js', 'Accept': 'application/vnd.github+json' };

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function download(url, dest){
  return new Promise((resolve, reject)=>{
    const lib = url.startsWith('https') ? require('https') : require('http');
    const req = lib.get(url, { headers }, (res)=>{
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location){
        // follow redirect
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200){
        reject(new Error('HTTP ' + res.statusCode));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', ()=> file.close(()=> resolve(dest)));
      file.on('error', reject);
    });
    req.on('error', reject);
  });
}

(async()=>{
  try{
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/logs`;
    console.log('Downloading from', apiUrl);
    const dest = await download(apiUrl, outFile);
    const stats = fs.statSync(dest);
    console.log('Saved:', dest, 'size:', stats.size);
  }catch(e){
    console.error('ERROR', e.message);
    process.exit(2);
  }
})();
