const cluster = require('cluster');
const totalCPUs = require('os').cpus().length;
const express = require('express');
const os = require('os');
const pidusage = require('pidusage');
let app = express();
const PORT = process.env.PORT || 3000;
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const port = 3001;

let primeNumbers = [];
if (cluster.isMaster) {
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Master ${process.pid} is running`);
 
  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }
 
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
}
else
{
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
        console.log(num);
        primes.push(num);
        if (!primeNumbers.includes(num)) {
          primeNumbers.push(num);
        }
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
  
    res.json({ status: 'success' });
  });
  
  // get endpoint
  app.get('/get', (req, res) => {
    res.json({ primes: primeNumbers });
  });
  
  // monitor endpoint
  app.post('/monitor', async (req, res) => {
    const { k } = req.body;
    const duration = k;
    // Validate the input parameter
    if (isNaN(duration)) {
      return res.status(400).json({ error: 'Invalid input parameter' });
    }
  
    const now = Date.now();
    const startTime = now - duration * 60 * 1000;
  
    try {
      const stats = await pidusage(process.pid, { startTime });
      const memoryUsage = Math.round((stats.memory / os.totalmem()) * 10000) / 100; // convert to percentage and round to 2 decimal places
      const cpuUsage = Math.round(stats.cpu * 10000) / 100; // convert to percentage and round to 2 decimal places
  
      res.json({ memoryUsage, cpuUsage });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching the usage data' });
    }
  });
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}


