# UK Football TV Guide (UK Teams Only)

This repository scrapes **UK football matches** from LiveSoccerTV and generates a JSON file (`matches.json`) for use in a hosted frontend.

## How it works
- `scraper.js` (Puppeteer) scrapes LiveSoccerTV’s UK schedule.
- Only matches involving **UK teams** are saved.
- GitHub Actions runs daily, updates `matches.json`.
- GitHub Pages serves the file publicly.
- Your `index.html` (hosted on your site) fetches and displays it.

## Setup
1. Clone repo & install dependencies:
   ```bash
   git clone https://github.com/USERNAME/uk-football-tv-guide.git
   cd uk-football-tv-guide
   npm install
