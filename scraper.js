/*
scraper.js - Scrape UK football matches from LiveSoccerTV
Outputs matches.json to repo root
*/

const puppeteer = require('puppeteer');
const fs = require('fs-extra');

const UK_TEAMS = [
  'Arsenal','Aston Villa','Bournemouth','Brentford','Brighton','Burnley','Chelsea',
  'Crystal Palace','Everton','Fulham','Liverpool','Luton Town','Manchester City',
  'Manchester United','Newcastle United','Nottingham Forest','Sheffield United',
  'Tottenham Hotspur','West Ham United','Wolves'
];

const OUTPUT_FILE = 'matches.json';

(async ()=>{
  const browser = await puppeteer.launch({args:['--no-sandbox']});
  const page = await browser.newPage();
  await page.goto('https://www.livesoccertv.com/schedules/uk/', {waitUntil:'networkidle2'});

  const matches = await page.evaluate((UK_TEAMS)=>{
    const result = [];
    const tables = document.querySelectorAll('table');
    tables.forEach(table=>{
      const dateHeader = table.previousElementSibling?.innerText || '';
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(r=>{
        const cells = r.querySelectorAll('td');
        if(cells.length<3) return;
        const time = cells[0]?.innerText.trim();
        const matchText = cells[1]?.innerText.trim();
        const channelsRaw = cells[2]?.innerText.trim();
        if(!matchText.includes(' v ')) return;
        const [home, away] = matchText.split(' v ').map(t=>t.trim());
        if(!UK_TEAMS.includes(home) && !UK_TEAMS.includes(away)) return;
        const channels = channelsRaw.split(',').map(c=>({name:c.trim(), logo:''}));
        result.push({
          date: dateHeader,
          time,
          home:{name:home,logo:''},
          away:{name:away,logo:''},
          channels
        });
      });
    });
    return result;
  }, UK_TEAMS);

  await browser.close();
  await fs.writeJson(OUTPUT_FILE,matches,{spaces:2});
  console.log(`Saved ${matches.length} matches to ${OUTPUT_FILE}`);
})();
