const https = require('https');
const owner = 'ThanhTamSW';
const repo = 'calisthenics';
const headers = {'User-Agent':'Node.js','Accept':'application/vnd.github+json'};

function getJSON(path){ return new Promise((res,rej)=>{
  const opts = { hostname: 'api.github.com', path, headers };
  https.get(opts, r=>{ let d=''; r.on('data', c=>d+=c); r.on('end', ()=>{ try{ res(JSON.parse(d)); }catch(e){ rej(e); } }); }).on('error', rej);
}); }

function getStatus(url){ return new Promise((res)=>{ const lib = url.startsWith('https')?require('https'):require('http'); lib.get(url, r=>{ res({statusCode: r.statusCode}); r.resume(); }).on('error', e=>res({error: e.message})); }); }

(async()=>{
  try{
    const runs = await getJSON(`/repos/${owner}/${repo}/actions/runs?per_page=1`);
    if(!(runs.workflow_runs && runs.workflow_runs.length)){
      console.log('NO_RUNS'); return;
    }
    const r = runs.workflow_runs[0];
    console.log('RUN_ID:' + r.id, 'status:' + r.status, 'conclusion:' + r.conclusion, 'url:' + r.html_url);
    const jobs = await getJSON(`/repos/${owner}/${repo}/actions/runs/${r.id}/jobs`);
    if(!(jobs.jobs && jobs.jobs.length)){
      console.log('NO_JOBS');
    } else {
      for(const job of jobs.jobs){
        console.log('JOB:' + job.name, 'status:' + job.status, 'conclusion:' + job.conclusion);
        for(const step of job.steps || []){
          console.log(' STEP:' + step.name, 'status:' + step.status, 'conclusion:' + step.conclusion);
        }
      }
    }
    const site = await getStatus('https://ThanhTamSW.github.io/calisthenics/');
    console.log('SITE_STATUS:' + (site.statusCode || site.error));
  }catch(e){ console.error('ERR', e && e.message); process.exit(2); }
})();
