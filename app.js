const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

function formatDate(date) {
  return Math.floor(date.getTime() / 1000);
}



async function monitor(k) {
  if (isNaN(k)) {
    console.error(`Error monitoring system resources: invalid input value for k`);
    return null;
  }

  const now = new Date();
  const startTime = new Date(now - k * 60 * 1000);

  try {
    const { stdout: cpuUsage } = await exec(`top -l 1 -F -R -o cpu -U $(whoami) -stats pid,command,cpu,time -s 5 -S ${formatDate(startTime)}`);
    const { stdout: memoryUsage } = await exec(`top -l 1 -F -R -o mem -U $(whoami) -stats pid,command,mem,time -s 5 -S ${formatDate(startTime)}`);
    
    const cpuData = cpuUsage.trim().split('\n').slice(1).map(line => {
      const [pid, command, cpu, time] = line.trim().split(/\s+/);
      return { pid, command, cpu: parseFloat(cpu), time: parseFloat(time) };
    });

    const memoryData = memoryUsage.trim().split('\n').slice(1).map(line => {
      const [pid, command, mem, time] = line.trim().split(/\s+/);
      return { pid, command, mem: parseFloat(mem), time: parseFloat(time) };
    });

    const cpuUsageAvg = cpuData.reduce((acc, curr) => acc + curr.cpu, 0) / cpuData.length;
    const memoryUsageAvg = memoryData.reduce((acc, curr) => acc + curr.mem, 0) / memoryData.length;

    return { cpuUsage: `${cpuUsageAvg.toFixed(2)}%`, memoryUsage: `${memoryUsageAvg.toFixed(2)}%` };
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
  const startTime = new Date();
  const currentTime = new Date();
  const elapsed = (currentTime - startTime) / 1000 / 60; // elapsed time in minutes
  
  const { cpuUsage, memoryUsage } = await monitor(k);
  
  res.json({ cpuUsage, memoryUsage });


});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
