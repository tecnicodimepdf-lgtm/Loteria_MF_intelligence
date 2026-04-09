const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./state.json', 'utf8'));
const results = data.results;

console.log("Total de concursos:", results.length);

let allHave6 = true;
let allInRange = true;
let allUnique = true;
let allSorted = true;

let minSum = Infinity;
let maxSum = -Infinity;
let sumSum = 0;

let evenOddCounts = { '0/6': 0, '1/5': 0, '2/4': 0, '3/3': 0, '4/2': 0, '5/1': 0, '6/0': 0 };
let consecutives = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

results.forEach(r => {
  if (r.dezenas.length !== 6) allHave6 = false;
  
  let sum = 0;
  let evens = 0;
  let maxConsecutive = 0;
  let currentConsecutive = 0;
  
  for (let i = 0; i < r.dezenas.length; i++) {
    const d = r.dezenas[i];
    if (d < 1 || d > 60) allInRange = false;
    if (i > 0) {
        if (r.dezenas[i] === r.dezenas[i-1]) allUnique = false;
        if (r.dezenas[i] < r.dezenas[i-1]) allSorted = false;
        if (r.dezenas[i] === r.dezenas[i-1] + 1) {
            currentConsecutive++;
        } else {
            if (currentConsecutive > maxConsecutive) maxConsecutive = currentConsecutive;
            currentConsecutive = 0;
        }
    }
    sum += d;
    if (d % 2 === 0) evens++;
  }
  if (currentConsecutive > maxConsecutive) maxConsecutive = currentConsecutive;
  consecutives[maxConsecutive] = (consecutives[maxConsecutive] || 0) + 1;
  
  if (sum < minSum) minSum = sum;
  if (sum > maxSum) maxSum = sum;
  sumSum += sum;
  
  const odds = 6 - evens;
  evenOddCounts[`${evens}/${odds}`]++;
});

console.log("Todos têm exatamente 6 dezenas?", allHave6);
console.log("Todos estão no intervalo 1-60?", allInRange);
console.log("Todos os números são únicos no mesmo sorteio?", allUnique);
console.log("Soma mínima:", minSum);
console.log("Soma máxima:", maxSum);
console.log("Média da soma:", sumSum / results.length);
console.log("Distribuição Pares/Ímpares:", evenOddCounts);
console.log("Sequências consecutivas máximas por jogo:", consecutives);
