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

let router = express.Router();

const stats = fs.createWriteStream('consumption.csv');

async function getStats()
{
  // const cpuUsage = process.cpuUsage();
  // const cpuPercentage = ((cpuUsage.user + cpuUsage.system) / os.cpus().length / 1000000) * 100;
  var avg_load = os.loadavg();
  let cpuPercentage = avg_load[0];
  const memoryUsage = process.memoryUsage().rss / 1024 / 1024; // convert to MB
  const date = new Date().toISOString();
  stats.write(`\n${date},${cpuPercentage.toFixed(2)},${memoryUsage.toFixed(2)}`);
}

// generate endpoint
router.post('/generate/:from/:to', async (req, res) => {
 // const { from, to } = req.body;
  const from = +req.params.from;
  const to = +req.params.to;
  if(from>to) res.send("invalid")
  else{
    exec(`node primeFunc.js ${from} ${to}`, async (err, stdout, stderr) => {
      if (err) {
          console.error(err);
          res.send('Error generating prime numbers');
      } else {
          res.send("Prime Numbers Generation Started ...");
      }
  });
  }


});

// get endpoint
router.get('/get', (req, res) => {
  const data = fs.readFileSync('numbers.txt', 'utf8');
  const numbers = data.trim().split('\n').map(Number);
  numbers.sort(function(a, b){return a - b});
  res.json({ primes: numbers });});

// monitor endpoint
router.post('/monitor/:min', async (req, res) => {
  const  k  = +req.params.min;
  console.log(k)
  let cpu=0.00
  let mem=0.00;
  let data = fs.readFileSync('consumption.csv');
  let lines = data.toString().split('\n');
  lines.reverse();
  let response = lines.splice(1, k);
  for(let i=0; i<k;i++)
  {
    let splits = lines[i].split(",");
    cpu =cpu + parseFloat(splits[1])
    mem = mem + parseInt(splits[2])
  }
  cpu=cpu/k;
  mem=mem/k;
  res.send({cpuUsage:cpu,memUsage:mem});
});

app.get('/', function(req, res) {
    res.send('Prime Numbers!');
});

app.use('/', router);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});


setInterval(()=>{getStats()}, 600)