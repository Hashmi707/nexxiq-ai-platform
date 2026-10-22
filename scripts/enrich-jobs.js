const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function enrich() {
  const jobsPath = path.resolve(__dirname, '../linkedin-jobs-applied.json');
  const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
  
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222', defaultViewport: null });
  const page = await browser.newPage();
  
  for (const j of jobs) {
    if (!j.title || !j.company || j.title.trim() === '') {
      try {
        console.log(`Enriching ${j.jobId}...`);
        await page.goto(j.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await new Promise(r => setTimeout(r, 2000));
        const meta = await page.evaluate(() => {
          const t = document.querySelector('h1')?.innerText?.trim() || document.title;
          const c = document.querySelector('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, .topcard__org-name-link')?.innerText?.trim() || '';
          return { t, c };
        });
        if (meta.t) j.title = meta.t.replace(/\s+/g, ' ');
        if (meta.c) j.company = meta.c.replace(/\s+/g, ' ');
        console.log(`Enriched ${j.jobId}: "${j.title}" @ "${j.company}"`);
      } catch (err) {
        console.error(`Failed ${j.jobId}:`, err.message);
      }
    }
  }
  
  await page.close();
  fs.writeFileSync(jobsPath, JSON.stringify(jobs, null, 2), 'utf8');
  console.log('Successfully updated jobs JSON.');
}

enrich().catch(console.error);
