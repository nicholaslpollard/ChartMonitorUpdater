// historicalDBBuilder.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const rateLimit = require('axios-rate-limit');
const { parse } = require('csv-parse');
require('dotenv').config();

// Initialize API Key and Set Rate Limiter
const API_KEY = process.env.FINNHUB_API_KEY;
const api = rateLimit(axios.create(), { maxRequests: 55, perMilliseconds: 60 * 1000, maxRPS: 55 });

// Path for storing the historical data and progress
const DATA_PATH = path.join(__dirname, '/Chart Monitor/Historical/6monthDB.json');
const PROGRESS_PATH = path.join(__dirname, '/Chart Monitor/Historical/progress.json');
const OPTIONABLE_PATH = path.join(__dirname, '/Chart Monitor/backtesters/optionable_stocks.csv');  // Updated to your location

// Timeframe options
const timeframes = ['15', '60', '240', 'D']; // 15 min, 1 hr, 4 hr, 1 day

// Load progress
let progress = {
  lastProcessedSymbol: null,
  lastProcessedTimeframe: null,
  lastTimestamp: null
};

if (fs.existsSync(PROGRESS_PATH)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'));
}

// Initialize JSON database structure
if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, JSON.stringify({}), 'utf-8');
}

// Function to fetch historical data
async function fetchHistoricalData(symbol, timeframe, start, end) {
  try {
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${timeframe}&from=${start}&to=${end}&token=${API_KEY}`;
    const response = await api.get(url);
    const data = response.data;

    if (data.s === 'no_data') {
      console.log(`No data for ${symbol} on ${timeframe}`);
      return [];
    }

    return data.t.map((timestamp, i) => ({
      symbol,
      timeframe,
      timestamp,
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }));
  } catch (err) {
    console.error(`Error fetching data for ${symbol}: ${err.message}`);
    return [];
  }
}

// Function to save progress
function saveProgress() {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
}

// Function to insert data into the JSON "database"
function insertData(candles) {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  candles.forEach(candle => {
    if (!data[candle.symbol]) {
      data[candle.symbol] = {};
    }
    if (!data[candle.symbol][candle.timeframe]) {
      data[candle.symbol][candle.timeframe] = [];
    }
    data[candle.symbol][candle.timeframe].push(candle);
  });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Function to get active symbols from the CSV file
async function getActiveSymbols() {
  return new Promise((resolve, reject) => {
    const symbols = [];
    fs.createReadStream(OPTIONABLE_PATH)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        // Assuming the symbol column is labeled 'Symbol', adjust if necessary
        if (row.Symbol) {
          symbols.push(row.Symbol);
        }
      })
      .on('end', () => {
        resolve(symbols);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

// Function to get start and end timestamps (6 months of data)
function getTimestamps() {
  const end = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
  const start = end - (6 * 30 * 24 * 60 * 60); // 6 months ago in Unix timestamp
  return { start, end };
}

// Function to process a symbol and store its data
async function processSymbol(symbol, start, end) {
  for (const timeframe of timeframes) {
    const candles = await fetchHistoricalData(symbol, timeframe, start, end);
    if (candles.length > 0) {
      insertData(candles);
      progress.lastProcessedSymbol = symbol;
      progress.lastProcessedTimeframe = timeframe;
      progress.lastTimestamp = candles[candles.length - 1].timestamp; // Save the last processed timestamp
      saveProgress();
      console.log(`Stored ${candles.length} candles for ${symbol} (${timeframe})`);
    }
  }
}

// Function to run the entire process
async function run() {
  const { start, end } = getTimestamps();
  const symbols = await getActiveSymbols();

  for (const symbol of symbols) {
    // Skip already processed symbol if progress is saved
    if (progress.lastProcessedSymbol === symbol) {
      console.log(`Resuming from ${symbol}...`);
    } else if (progress.lastProcessedSymbol !== null) {
      console.log(`Skipping ${symbol} since it was not processed yet.`);
      continue;
    }

    await processSymbol(symbol, start, end);
    console.log(`Finished processing ${symbol}`);
  }

  console.log('All data fetched and saved successfully!');
}

run().catch(console.error);
