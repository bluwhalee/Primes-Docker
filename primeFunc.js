var start = parseInt(process.argv[2])
var end = parseInt(process.argv[3])
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
    console.log(primes)
    return primes;
}

