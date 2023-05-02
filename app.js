const fs = require('fs');
const cluster = require("cluster");
const totalCPUs = require('os').cpus().length;
const express = require('express');
const os = require('os');
const pidusage = require('pidusage');
let app = express();
const PORT = process.env.PORT || 3000;
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const port = 3001;
const { useCustomLoadavg } = require('loadavg-windows');
const cpu = require('windows-cpu');
const util = require('util');
const file = 'numbers.txt';
// const cpuUsage = util.promisify(pidusage.stat);

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
      console.log(num);
      primes.push(num);
      
      if (!primeNumbers.includes(num)){
        primeNumbers.push(num);
        fs.appendFileSync(file, num.toString() + '\n');
      }
    }
  }
  console.log(primes)
  return primes;
}

async function getStats()
{
  // const stats = await cpuUsage(process.pid);
  // const usage = stats.cpu;
  // const total = os.cpus().length * 100;
  // const percentage = Math.round(usage / total * 100 * 100) / 100;
  var avg_load = os.loadavg();
  let percentage = avg_load[0];
  const memstats = await pidusage(process.pid);
  //let memoryUsage = (memstats.memory / os.totalmem()) * 100;
  let memoryUsage = memstats.memory/1000000;
  //memory in percentage
  memoryUsage =  memoryUsage.toFixed(2)*100;
  var log = JSON.parse(fs.readFileSync('usagelog.json')) || []
  var logArray = Array.from(log)
  var obj = {}
  obj.cpuUsage = percentage;
  obj.memUsage = memoryUsage;
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;
  obj.timeStamp = dateTime;
  logArray.push(obj);
  fs.writeFile('usagelog.json', JSON.stringify(logArray), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}

setInterval(getStats,60000)
if (cluster.isMaster) {
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Master ${process.pid} is running`);
  setInterval(getStats,60000)
  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }
 
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
app.use(express.json());
// generate endpoint
app.post('/generate', async (req, res) => {
  const { from, to } = req.body;

  //generate prime numbers in the background
  let primes = await getPrimesInRange(from, to);
  
  res.json({ status: 'success' });
});

// get endpoint
app.get('/get', (req, res) => {
  const data = fs.readFileSync(file, 'utf8');
  const numbers = data.trim().split('\n').map(Number);
  res.json({ primes: numbers });
});

// monitor endpoint
app.post('/monitor', async (req, res) => {
  const { k } = req.body;
  let cpu=0.00
  let mem=0.00;
  //if(k>0)
  {
    let jsonData = JSON.parse(fs.readFileSync('usagelog.json'));
    let json = Array.from(jsonData)
    console.log(json.length)
    for(let i = json.length-1; i >= json.length-k;i--)
    {
      cpu = cpu + json[i].cpuUsage;
      mem = mem + json[i].memUsage;
      console.log(json[i].memUsage)
    }
    cpu=cpu/k;
    mem=mem/k;
  }
  res.json({ cpuUsage: cpu, memUsage : mem});
});
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
}


