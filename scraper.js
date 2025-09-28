const puppeteer = require('puppeteer');
const fs = require('fs-extra');

// Full list of UK teams (English & Scottish professional leagues)
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

  // Fixed timeout for compatibility
  await new Promise(resolve => setTimeout(resolve, 2000));

  const matches = await page.evaluate((UK_TEAMS) => {
    const result = [];
    const matchRows = document.querySelectorAll('.match-row'); // Robust selector

    matchRows.forEach(row => {
      const date = row.querySelector('.match-date')?.innerText.trim();
      const time = row.querySelector('.match-time')?.innerText.trim();
      const homeTeam = row.querySelector('.team-home')?.innerText.trim();
      const awayTeam = row.querySelector('.team-away')?.innerText.trim();

      if (!homeTeam || !awayTeam) return;

      // Only include matches involving UK teams
      if (!UK_TEAMS.includes(homeTeam) && !UK_TEAMS.includes(awayTeam)) return;

      const homeLogo = row.querySelector('.team-home img')?.src || '';
      const awayLogo = row.querySelector('.team-away img')?.src || '';

      const channels = Array.from(row.querySelectorAll('.broadcast-logo img')).map(img => ({
        logo: img.src,
        name: img.alt || 'Unknown Channel'
      }));

      result.push({
        date,
        time,
        home: { name: homeTeam, logo: homeLogo },
        away: { name: awayTeam, logo: awayLogo },
        channels
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
