const https = require('https');
const owner = 'ThanhTamSW';
const repo = 'calisthenics';
const headers = {'User-Agent':'Node.js','Accept':'application/vnd.github+json'};

function getJSON(path){ return new Promise((res,rej)=>{
  const opts = { hostname: 'api.github.com', path, headers };
  https.get(opts, r=>{ let d=''; r.on('data', c=>d+=c); r.on('end', ()=>{ try{ res(JSON.parse(d)); }catch(e){ rej(e); } }); }).on('error', rej);
}); }

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

(async()=>{
  try{
    const runs = await getJSON(`/repos/${owner}/${repo}/actions/runs?per_page=1`);
    if(!(runs.workflow_runs && runs.workflow_runs.length)){ console.log('NO_RUNS'); return; }
    const r = runs.workflow_runs[0];
    console.log('RUN_ID:'+r.id,'status:'+r.status,'conclusion:'+r.conclusion,'url:'+r.html_url);

    for(let attempt=0; attempt<24; attempt++){
      const jobs = await getJSON(`/repos/${owner}/${repo}/actions/runs/${r.id}/jobs`);
      if(jobs.jobs && jobs.jobs.length){
        const job = jobs.jobs[0];
        // fallback: look for actions/deploy-pages@v
        const deployStep2 = (job.steps||[]).find(s=> s.name && s.name.toLowerCase().includes('deploy to github pages') ) || (job.steps||[]).find(s=> s.name && s.name.toLowerCase().includes('deploy pages')) || (job.steps||[]).find(s=> s.name && s.name.toLowerCase().includes('deploy-pages'));
        console.log(new Date().toISOString(),'job.status='+job.status,'deployStep=' + (deployStep2? (deployStep2.name+' status='+deployStep2.status+' conclusion='+deployStep2.conclusion) : 'not found'));
        if(deployStep2 && deployStep2.status==='completed'){
          console.log('DEPLOY_CONCLUSION:'+deployStep2.conclusion);
          const siteRes = await new Promise(res=> https.get('https://ThanhTamSW.github.io/calisthenics/', r=>{ res({status:r.statusCode}); r.resume(); }).on('error', e=>res({error:e.message}))); 
          console.log('SITE_STATUS:'+ (siteRes.status||siteRes.error));
          process.exit(0);
        }
      }
      await sleep(5000);
    }
    console.log('TIMED_OUT_WAITING');
  }catch(e){ console.error('ERR', e && e.message); process.exit(2); }
})();
