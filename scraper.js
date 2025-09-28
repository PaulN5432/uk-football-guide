const { getMatches } = require('livesoccertv-parser');
const fs = require('fs-extra');

const ukTeams = [
  'arsenal','chelsea','manchester-united','liverpool','tottenham-hotspur',
  'manchester-city','everton','west-ham','newcastle-united','leeds-united'
  // add more UK teams as needed
];

const OUTPUT_FILE = 'matches.json';

(async () => {
  const allMatches = [];

  for (const team of ukTeams) {
    try {
      const matches = await getMatches('england', team); // country slug, team slug
      allMatches.push(...matches);
    } catch (error) {
      console.error(`Error fetching matches for ${team}:`, error);
    }
  }

  // Optional: remove duplicates
  const uniqueMatches = Array.from(new Map(allMatches.map(m => [m.id || m.url, m])).values());

  await fs.writeJson(OUTPUT_FILE, uniqueMatches, { spaces: 2 });
  console.log(`Saved ${uniqueMatches.length} matches to ${OUTPUT_FILE}`);
})();
