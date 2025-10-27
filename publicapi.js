const axios = require('axios');

const SECRET_KEY = "2QdWKlLrnNnM5AotxCdZSj4WzVGjxUP3";
const ACCOUNT_ID = "5OF34891";
const BASE = "https://api.public.com";

// List of previously tested popular stocks
const symbols = [
  "AAPL","MSFT","GOOG","AMZN","TSLA","NVDA","META","NFLX","INTC","AMD",
  "BAC","JPM","WFC","C","GS","MS","SCHW","COF","PYPL","ADBE",
  "ORCL","CRM","IBM","QCOM","TXN","AVGO","SBUX","T","VZ","PEP",
  "KO","MCD","DIS","CVX","XOM","BA","GE","CAT","MMM","HON",
  "F","GM","NKE","LULU","BKNG","UBER","LYFT","SQ","SPOT","TWTR",
  "SNAP","ZM","DOCU","ROKU","CRWD","OKTA","NOW","TEAM","FSLY","PLTR",
  "SHOP","ETSY","PINS","DDOG","NET","ZS","MDB","CRSP","NIO","LI",
  "XPEV","RIVN","LCID","PLUG","BLNK","NKLA","FSR","HOOD","COIN","SOFI",
  "ABNB","EXPE","TRIP","MAR","HLT","WYNN","CZR","MGM","RCL","NCLH",
  "AAL","DAL","UAL","LUV","ALK","SAVE","RTX","LMT","NOC","GD",
  "BAH","HII","TDY","LHX","TXT","VLO","PSX","MPC","CVS","WBA",
  "DG","DLTR","WMT","TGT","COST","BJ","KR","KSS","JWN","M",
  "TJX","ROST","BURL","ULTA","CL","PG","KO","PEP","K","SJM",
  "HSY","MDLZ","GIS","CPB","MNST","BF.B","CHD","EL","CLX","KHC",
  "TAP","STZ","FIZZ","COKE","MO","PM","BTI","RAI","IMBBY","STI",
  "AXP","COIN","PYPL","SQ","MA","V","DFS","SYF","BK","USB",
  "PNC","CMA","TFC","FITB","KEY","HBAN","CFG","RF","MTB","SIVB",
  "ZION","FRC","PACW","WFC","JPM","GS","MS","BAC","SCHW","COF",
  "BLK","TROW","IVZ","BEN","ALL","MET","PRU","LNC","AIG","CINF",
  "TRV","HIG","AFL","XL","CB","PGR","RE","RNR","MMC","WLTW",
  "AJG","MKL","HBI","GIL","VFC","PVH","RL","TIF","NKE","UA",
  "YUM","MCD","SBUX","DNKN","CMG","DRI","EAT","SONC","WEN","SHAK",
  "BBY","FIVE","HD","LOW","DE","EMR","ETN","ROK","ITW","MMM",
  "CAT","GE","HON","LMT","NOC","RTX","TXT","HII","TDY","LHX",
  "BA","UAL","DAL","AAL","LUV","ALK","SAVE","F","GM","TSLA",
  "XPEV","NIO","LI","RIVN","LCID","PLUG","BLNK","NKLA","FSR","HOOD",
  "COIN","SOFI","ZM","DOCU","ROKU","SNAP","TWTR","SPOT","ETSY","PINS",
  "SHOP","CRWD","NET","ZS","MDB","DDOG","OKTA","NOW","TEAM","PLTR",
  "ADBE","MSFT","AAPL","GOOG","AMZN","META","NVDA","INTC","AMD","ORCL",
  "CRM","IBM","QCOM","TXN","AVGO","SBUX","T","VZ","PEP","KO",
  "MCD","DIS","CVX","XOM","BA","GE","CAT","MMM","HON","F",
  "GM","NKE","LULU","BKNG","UBER","LYFT","SQ","SPOT","TWTR","SNAP",
  "ZM","DOCU","ROKU","CRWD","OKTA","NOW","TEAM","FSLY","PLTR","SHOP",
  "ETSY","PINS","DDOG","NET","ZS","MDB","CRSP","NIO","LI","XPEV",
  "RIVN","LCID","PLUG","BLNK","NKLA","FSR","HOOD","COIN","SOFI","ABNB",
  "EXPE","TRIP","MAR","HLT","WYNN","CZR","MGM","RCL","NCLH","AAL",
  "DAL","UAL","LUV","ALK","SAVE","RTX","LMT","NOC","GD","BAH",
  "HII","TDY","LHX","TXT","VLO","PSX","MPC","CVS","WBA","DG",
  "DLTR","WMT","TGT","COST","BJ","KR","KSS","JWN","M","TJX",
  "ROST","BURL","ULTA","CL","PG","KO","PEP","K","SJM","HSY","MDLZ",
  "GIS","CPB","MNST","BF.B","CHD","EL","CLX","KHC","TAP","STZ",
  "FIZZ","COKE","MO","PM","BTI","RAI","IMBBY","STI","AXP","COIN",
  "PYPL","SQ","MA","V","DFS","SYF","BK","USB","PNC","CMA",
  "TFC","FITB","KEY","HBAN","CFG","RF","MTB","SIVB","ZION","FRC",
  "PACW","WFC","JPM","GS","MS","BAC","SCHW","COF","BLK","TROW","IVZ",
  "BEN","ALL","MET","PRU","LNC","AIG","CINF","TRV","HIG","AFL","XL",
  "CB","PGR","RE","RNR","MMC","WLTW","AJG","MKL","HBI","GIL","VFC",
  "PVH","RL","TIF","NKE","UA","YUM","MCD","SBUX","DNKN","CMG","DRI",
  "EAT","SONC","WEN","SHAK","BBY","FIVE","HD","LOW","DE","EMR",
  "ETN","ROK","ITW","MMM","CAT","GE","HON","LMT","NOC","RTX","TXT",
  "HII","TDY","LHX","BA","UAL","DAL","AAL","LUV","ALK","SAVE","F","GM",
  "TSLA","XPEV","NIO","LI","RIVN","LCID","PLUG","BLNK","NKLA","FSR","HOOD"
];

async function getAccessToken() {
  try {
    const res = await axios.post(
      `${BASE}/userapiauthservice/personal/access-tokens`,
      { validityInMinutes: 60, secret: SECRET_KEY },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data.accessToken;
  } catch (err) {
    console.error('Error fetching access token:', err.response ? err.response.data : err.message);
    return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function maxThroughputTest(accessToken) {
  const delayMs = 150; // ~800 requests/minute
  let successCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    try {
      await axios.post(
        `${BASE}/userapigateway/marketdata/${ACCOUNT_ID}/quotes`,
        { instruments: [{ symbol, type: 'EQUITY' }] },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      successCount++;
      console.log(`✅ ${symbol} succeeded (${successCount} total, delay ${delayMs}ms)`);
    } catch (err) {
      if (err.response && err.response.status === 429) {
        console.log(`🚨 Rate limit hit on ${symbol}!`);
        break;
      } else {
        console.log(`❌ ${symbol} error:`, err.response ? err.response.data : err.message);
      }
    }
    await sleep(delayMs);
  }

  const elapsed = ((Date.now() - startTime)/1000).toFixed(2);
  console.log(`\nTest complete!`);
  console.log(`Last successful symbol: ${symbols[successCount-1] || "None"}`);
  console.log(`Total successful requests: ${successCount}`);
  console.log(`Elapsed time: ${elapsed}s`);
}

(async () => {
  const token = await getAccessToken();
  if (token) {
    console.log(`🚀 Starting max throughput test (~800 requests/min)`);
    await maxThroughputTest(token);
  }
})();
