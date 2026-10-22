const fs = require('fs');
const path = require('path');

const jobsPath = path.resolve(__dirname, '../linkedin-jobs-applied.json');
const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));

jobs.forEach(j => {
  // Extract company from title if title is e.g. "AI/ML Engineer | Jobgether | LinkedIn"
  if (j.title.includes('|')) {
    const parts = j.title.split('|').map(p => p.trim());
    if (parts.length >= 3 && parts[parts.length - 1].toLowerCase().includes('linkedin')) {
      j.title = parts[0];
      if (!j.company || j.company === '') j.company = parts[1];
    } else if (parts.length === 2 && parts[1].toLowerCase().includes('linkedin')) {
      j.title = parts[0];
    }
  }

  // Deduplicate repeated titles like "Senior AI Engineer Senior AI Engineer"
  j.title = j.title.replace(/\s*with verification/gi, '').trim();
  const words = j.title.split(' ');
  const half = Math.floor(words.length / 2);
  if (half >= 2 && words.length % 2 === 0) {
    const firstHalf = words.slice(0, half).join(' ');
    const secondHalf = words.slice(half).join(' ');
    if (firstHalf.toLowerCase() === secondHalf.toLowerCase()) {
      j.title = firstHalf;
    }
  }
  
  // Clean company
  j.company = j.company.replace(/\s*with verification/gi, '').trim();
});

fs.writeFileSync(jobsPath, JSON.stringify(jobs, null, 2), 'utf8');
console.log('Cleaned and standardized 50 jobs.');
