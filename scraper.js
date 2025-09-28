/*
scraper.js with team logos and channel logos
- Scrapes UK schedule from LiveSoccerTV
- Filters all UK teams (English + Scottish)
- Includes team logos and channel logos
- Debug logging enabled
*/

const puppeteer = require('puppeteer');
const fs = require('fs-extra');

// Full list of UK teams
const UK_TEAMS = [
  // Premier League
  'Arsenal','Aston Villa','Bournemouth','Brentford','Brighton','Burnley','Chelsea',
  'Crystal Palace','Everton','Fulham','Liverpool','Luton Town','Manchester City',
  'Manchester United','Newcastle United','Nottingham Forest','Sheffield United',
  'Tottenham Hotspur','West Ham United','Wolves',

  // Championship
  'Birmingham City','Blackburn Rovers','Blackpool','Bristol City','Cardiff City','Coventry City',
  'Huddersfield Town','Hull City','Ipswich Town','Leeds United','Leicester City','Millwall',
  'Middlesbrough','Norwich City','Peterborough United','Portsmouth','Preston North End',
  'Queens Park Rangers','Reading','Rotherham United','Sheffield Wednesday','Stoke City',
  'Sunderland','Watford','West Bromwich Albion','Wigan Athletic',

  // League One
  'Barnsley','Bolton Wanderers','Bristol Rovers','Burton Albion','Cambridge United','Charlton Athletic',
  'Exeter City','Fleetwood Town','Lincoln City','Port Vale','Shrewsbury Town','Stockport County',
  'Sunderland','Wigan Athletic','Wycombe Wanderers','Peterborough United','Ipswich Town',
  'Derby County','MK Dons','Morecambe','Northampton Town','Cheltenham Town','Oxford United','Reading',

  // League Two
  'Barrow','Bradford City','Carlisle United','Colchester United','Crewe Alexandra','Gillingham',
  'Harrogate Town','Hartlepool United','Leyton Orient','Mansfield Town','Newport County','Northampton Town',
  'Rochdale','Salford City','Shrewsbury Town','Stockport County','Swindon Town','Tranmere Rovers',
  'Walsall','Crawley Town','Exeter City','Forest Green Rovers','Port Vale','Stevenage',

  // Scottish Premiership
  'Aberdeen','Celtic','Dundee','Dundee United','Heart of Midlothian','Hibernian','Kilmarnock',
  'Livingston','Motherwell','Rangers','Ross County','St Johnstone',

  // Scottish Championship
  'Arbroath','Ayr United','Dunfermline Athletic','Greenock Morton','Hamilton Academical',
  'Inverness Caledonian Thistle','Partick Thistle','Queen of the South','Raith Rovers'
];

const OUTPUT_FILE = 'matches.json';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://www.livesoccertv.com/schedules/uk/', { waitUntil: 'networkidle2' });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const matches = await page.evaluate((UK_TEAMS) => {
    const result = [];
    const tables = document.querySelectorAll('table');

    tables.forEach(table => {
      const dateHeader = table.previousElementSibling?.innerText.trim() || 'Unknown Date';
      const rows = table.querySelectorAll('tbody tr');

      rows.forEach(r => {
        const cells = r.querySelectorAll('td');
        if (cells.length < 3) return;

        const time = cells[0]?.innerText.trim();

        // Team names and logos
        const teamCell = cells[1];
        const homeTeamEl = teamCell.querySelector('.team-home, .team-left') || teamCell.querySelector('span:first-child');
        const awayTeamEl = teamCell.querySelector('.team-away, .team-right') || teamCell.querySelector('span:last-child');

        if (!homeTeamEl || !awayTeamEl) return;

        const homeName = homeTeamEl.innerText.trim();
        const awayName = awayTeamEl.innerText.trim();

        if (!UK_TEAMS.includes(homeName) && !UK_TEAMS.includes(awayName)) return;

        // Logos if present
        const homeLogo = homeTeamEl.querySelector('img')?.src || '';
        const awayLogo = awayTeamEl.querySelector('img')?.src || '';

        // Channels and logos
        const channelsRaw = cells[2]?.innerHTML || '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(channelsRaw, 'text/html');
        const channelEls = doc.querySelectorAll('a, span');
        const channels = Array.from(channelEls).map(c => ({
          name: c.innerText.trim(),
          logo: c.querySelector('img')?.src || ''
        })).filter(c => c.name);

        result.push({
          date: dateHeader,
          time,
          home: { name: homeName, logo: homeLogo },
          away: { name: awayName, logo: awayLogo },
          channels
        });
      });
    });

    return result;
  }, UK_TEAMS);

  console.log(`Found ${matches.length} matches involving UK teams.`);
  matches.forEach(m => console.log(`${m.date} ${m.time}: ${m.home.name} vs ${m.away.name}`));

  await browser.close();

  await fs.writeJson(OUTPUT_FILE, matches, { spaces: 2 });
  console.log(`Saved matches to ${OUTPUT_FILE}`);
})();
