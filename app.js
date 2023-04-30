const express = require('express');
const primes = require('primes');
const ps = require('ps-node');
const app = express();
const PORT = process.env.PORT || 3000;
const os = require('os');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

async function monitor(k) {
    const now = new Date().getTime();
    const startTime = new Date(now - k * 60 * 1000).toISOString().replace('T', ' ').slice(0, -5);
  
    try {
      const { stdout: cpuUsage } = await exec(`typeperf "\\Processor(_Total)\\% Processor Time" -sc 1 -si ${k * 60}`);
      const { stdout: memoryUsage } = await exec(`typeperf "\\Memory\\Available Bytes" -sc 1 -si ${k * 60}`);
      
      return { cpuUsage, memoryUsage };
    } catch (err) {
      console.error(`Error monitoring system resources: ${err.message}`);
      return null;
    }
  }

let primeNumbers = [];

async function getPrimesInRange(start, end) {
    let primes = [];
    
    for (let num = start; num <= end; num++) {
      let isPrime = true;
      
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
          isPrime = false;
          break;
        }
      }
      
      if (isPrime && num > 1) {
        primes.push(num);
      }
    }
    
    return primes;
  }
  

app.use(express.json());

// generate endpoint
app.post('/generate', async (req, res) => {
  const { from, to } = req.body;

  // generate prime numbers in the background
  let primes = await getPrimesInRange(from, to);
    console.log(43);
    console.log(primes)
  res.json({ status: 'success' });
});

// get endpoint
app.get('/get', (req, res) => {
  res.json({ primes: primeNumbers });
});

// monitor endpoint
app.post('/monitor', async (req, res) => {
  const { k } = req.body;
  const { cpuUsage, memoryUsage } = await monitor(k);
  res.json({ cpuUsage, memoryUsage });


});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
