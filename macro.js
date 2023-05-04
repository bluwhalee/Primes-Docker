const axios = require('axios');
const fs = require('fs');

// Define the range
const rangeStart = 1;
const rangeEnd = Math.pow(10, 12);


// Divide the range into three parts
const partSize = Math.floor((rangeEnd - rangeStart + 1) / 3);
const part1Start = rangeStart;
const part1End = part1Start + partSize - 1;
const part2Start = part1End + 1;
const part2End = part2Start + partSize - 1;
const part3Start = part2End + 1;
const part3End = rangeEnd;

async function logResourceUtilization(url, duration, filePath) {
    const now = new Date();
    const startTime = new Date(now - duration * 60 * 1000);
    const response = await axios.post(`${url}/monitor/${duration}`);
    const cpu = response.data.cpuUsage;
    const memory = response.data.memUsage;
    console.log(memory,cpu)
    const timestamp = now.toLocaleString();
    const csv = `${timestamp},${cpu},${memory}\n`;
    fs.appendFileSync(filePath, csv);
  }
async function getLatestPrimeNumbers(pngmUrls) {
    let allPrimes = [];

    for (const url of pngmUrls) {
        const response = await axios.get(`${url}/get`);
        allPrimes = allPrimes.concat(response.data.primes);
        console.log(allPrimes)
    }

    const uniquePrimes = [...new Set(allPrimes)];
    const sortedPrimes = uniquePrimes.sort((a, b) => a - b);
    //console.log(sortedPrimes)
    return sortedPrimes;
}
  
// Define the URL of the PNGM containers
const containerUrls = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003'
];

// Call the generate method on each container with its assigned range
Promise.all([
  axios.post(`${containerUrls[0]}/generate/${part1Start}/${part1End}`),
  axios.post(`${containerUrls[1]}/generate/${part2Start}/${part2End}`),
  axios.post(`${containerUrls[2]}/generate/${part3Start}/${part3End}`)
]).then(() => {
  console.log('Generation completed');
}).catch((error) => {
  console.error(error);
});

setInterval(()=>{
    let ran = Math.floor(Math.random() * 3);
    logResourceUtilization(containerUrls[ran],1,"D:\Cloud Comp\Ass3\app\log.csv")
},60000)
setInterval(()=>{
    (getLatestPrimeNumbers(containerUrls));
},120000)