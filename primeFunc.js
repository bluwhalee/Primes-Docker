const fs = require('fs');

var start = parseInt(process.argv[2])
var end = parseInt(process.argv[3])
async function getPrimesInRange(start, end) {

    let primes = [];
    let data = fs.readFileSync('numbers.txt');
    primes = data.toString().split('\n').map((num) => {
        return +num;
    })
    const uniquePrimes = [...new Set(primes)];
    console.log(uniquePrimes)
    for (let num = start; num <= end; num++) {
      let isPrime = true;
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
          isPrime = false;
          break;
        }
      }
      if (isPrime && num > 1) {
        if (!uniquePrimes.includes(num)) {
          uniquePrimes.push(num);
          fs.appendFileSync('numbers.txt', `${num}\n`);
        }
      }
    }
    data = fs.readFileSync('numbers.txt', 'utf8');
    const lines = data.trim().split('\n');
    fs.writeFileSync('primes.txt', lines.join('\n'));
    return primes;
}
getPrimesInRange(start,end)
