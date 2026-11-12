/**
 * Quantitative aptitude. Original questions generated from templates; every answer is computed.
 */
import { gcd, inr, int, lcm, numMcq, pick, mcq, fmtNum, shuffle } from './lib.mjs';

const NAMES = ['Ravi', 'Sana', 'Arjun', 'Meera', 'Imran', 'Divya', 'Kiran', 'Ayesha', 'Rahul', 'Farhan', 'Priya', 'Zoya', 'Vikram', 'Nikhil', 'Fatima', 'Rohit'];
const two = (r) => {
  const a = pick(r, NAMES);
  let b = pick(r, NAMES);
  while (b === a) b = pick(r, NAMES);
  return [a, b];
};
const pct = (x) => `${fmtNum(x)}%`;
const u = (word) => (v) => `${fmtNum(v)} ${word}${v === 1 ? '' : 's'}`;

export const percentages = (r) =>
  pick(r, [
    () => {
      const p = pick(r, [5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 60, 75]);
      const n = int(r, 4, 40) * 20;
      const ans = (p * n) / 100;
      return numMcq(r, { q: `What is ${p}% of ${n}?`, ans, ex: `${p}% of ${n} = ${p}/100 × ${n} = ${fmtNum(ans)}.` });
    },
    () => {
      const base = int(r, 4, 30) * 50;
      const up = pick(r, [10, 20, 25, 30, 40, 50]);
      const nw = base + (base * up) / 100;
      return numMcq(r, { q: `A number increased by ${up}% becomes ${fmtNum(nw)}. What is the number?`, ans: base, ex: `Number × ${1 + up / 100} = ${fmtNum(nw)}, so number = ${fmtNum(nw)} ÷ ${1 + up / 100} = ${base}.` });
    },
    () => {
      const a = pick(r, [10, 20, 25, 30, 40, 50]);
      const b = pick(r, [10, 20, 25, 30, 40, 50]);
      const net = a - b - (a * b) / 100;
      const word = net >= 0 ? 'increase' : 'decrease';
      const ans = Math.abs(net);
      const f = (v) => `${fmtNum(v)}% ${word}`;
      return mcq(r, {
        q: `The price of an item is first increased by ${a}% and then decreased by ${b}%. What is the net change?`,
        correct: f(ans),
        wrong: [f(Math.abs(a - b) || 5), `${fmtNum(ans)}% ${word === 'increase' ? 'decrease' : 'increase'}`, f(ans + 2), 'No change'],
        ex: `Net change = ${a} − ${b} − (${a} × ${b})/100 = ${fmtNum(net)}%, a ${word} of ${fmtNum(ans)}%.`,
      });
    },
    () => {
      const total = int(r, 6, 20) * 50;
      const p = pick(r, [30, 35, 40, 45, 55, 60, 65]);
      const pass = (total * p) / 100;
      const got = pass - int(r, 5, 30);
      const short = pass - got;
      return numMcq(r, { q: `To pass an exam a student needs ${p}% of the total marks. She scored ${got} marks and failed by ${short} marks. What are the total marks?`, ans: total, ex: `Pass marks = ${got} + ${short} = ${pass}. ${p}% of total = ${pass}, so total = ${pass} × 100/${p} = ${total}.` });
    },
    () => {
      const [more, less] = pick(r, [[25, 20], [50, 33.33], [20, 16.67], [100, 50], [10, 9.09], [60, 37.5], [40, 28.57], [75, 42.86]]);
      return numMcq(r, { q: `A's income is ${more}% more than B's. By what percent is B's income less than A's?`, ans: less, f: pct, near: [more, less + 5, less - 3, more / 2, less + 2], ex: `Let B = 100, then A = ${100 + more}. B is less by ${more}/${100 + more} × 100 = ${fmtNum(less)}%.` });
    },
  ])();

export const profitLoss = (r) =>
  pick(r, [
    () => {
      const cp = int(r, 4, 60) * 25;
      const p = pick(r, [10, 12, 15, 20, 25, 30, 40]);
      const sp = cp + (cp * p) / 100;
      return numMcq(r, { q: `An article bought for ${inr(cp)} is sold at a profit of ${p}%. What is the selling price?`, ans: sp, f: inr, ex: `SP = CP × (100 + ${p})/100 = ${cp} × ${(100 + p) / 100} = ${inr(sp)}.` });
    },
    () => {
      const cp = int(r, 4, 40) * 100;
      const sp = cp - int(r, 1, 8) * (cp / 20);
      const loss = ((cp - sp) / cp) * 100;
      return numMcq(r, { q: `A phone bought for ${inr(cp)} is sold for ${inr(sp)}. What is the loss percentage?`, ans: loss, f: pct, ex: `Loss = ${cp - sp}. Loss% = ${cp - sp}/${cp} × 100 = ${fmtNum(loss)}%.` });
    },
    () => {
      const mp = int(r, 4, 40) * 100;
      const d = pick(r, [10, 15, 20, 25, 30]);
      const sp = mp - (mp * d) / 100;
      return numMcq(r, { q: `The marked price of a shirt is ${inr(mp)} and the shop gives a ${d}% discount. What does the customer pay?`, ans: sp, f: inr, ex: `Discount = ${d}% of ${mp} = ${(mp * d) / 100}. Price paid = ${inr(sp)}.` });
    },
    () => {
      const d1 = pick(r, [10, 20, 25]);
      const d2 = pick(r, [10, 20, 25]);
      const eff = d1 + d2 - (d1 * d2) / 100;
      return numMcq(r, { q: `Two successive discounts of ${d1}% and ${d2}% are equal to a single discount of:`, ans: eff, f: pct, ex: `Single discount = ${d1} + ${d2} − (${d1} × ${d2})/100 = ${fmtNum(eff)}%.` });
    },
    () => {
      const x = pick(r, [10, 12, 15, 20, 25]);
      const y = x + pick(r, [2, 4, 5, 6, 8]);
      // cost price of x articles = selling price of y articles → loss; of y = SP of x → profit
      const gain = ((y - x) / x) * 100;
      return numMcq(r, { q: `The cost price of ${y} pens equals the selling price of ${x} pens. What is the profit percentage?`, ans: Math.round(gain * 100) / 100, f: pct, ex: `Let each pen cost ₹1. SP of ${x} pens = ₹${y}, so profit on ${x} pens = ${y - x}. Profit% = ${y - x}/${x} × 100 = ${fmtNum(Math.round(gain * 100) / 100)}%.` });
    },
  ])();

export const simpleInterest = (r) =>
  pick(r, [
    () => {
      const p = int(r, 4, 50) * 500;
      const rate = pick(r, [4, 5, 6, 8, 9, 10, 12]);
      const t = int(r, 2, 6);
      const si = (p * rate * t) / 100;
      return numMcq(r, { q: `Find the simple interest on ${inr(p)} at ${rate}% per annum for ${t} years.`, ans: si, f: inr, ex: `SI = P × R × T / 100 = ${p} × ${rate} × ${t} / 100 = ${inr(si)}.` });
    },
    () => {
      const p = int(r, 4, 40) * 500;
      const rate = pick(r, [5, 6, 8, 10, 12]);
      const t = int(r, 2, 5);
      const amt = p + (p * rate * t) / 100;
      return numMcq(r, { q: `A sum amounts to ${inr(amt)} in ${t} years at ${rate}% simple interest per annum. What is the sum?`, ans: p, f: inr, ex: `Amount = P(1 + ${rate * t}/100), so P = ${amt} ÷ ${1 + (rate * t) / 100} = ${inr(p)}.` });
    },
    () => {
      const rate = pick(r, [5, 8, 10, 12.5, 20, 25]);
      const t = 100 / rate;
      return numMcq(r, { q: `At what time will a sum double itself at ${rate}% simple interest per annum?`, ans: t, f: u('year'), near: [t + 2, t - 2, t * 2, t + 4, t / 2, t + 1], ex: `Doubling means SI = P. P × ${rate} × T / 100 = P, so T = 100/${rate} = ${fmtNum(t)} years.` });
    },
    () => {
      const p = int(r, 4, 20) * 1000;
      const t = int(r, 2, 5);
      const rate = pick(r, [4, 5, 6, 8, 10]);
      const si = (p * rate * t) / 100;
      return numMcq(r, { q: `The simple interest on ${inr(p)} for ${t} years is ${inr(si)}. What is the rate of interest?`, ans: rate, f: (v) => `${fmtNum(v)}% p.a.`, near: [rate + 1, rate - 1, rate + 2, rate * 2, rate + 3], ex: `R = SI × 100 / (P × T) = ${si} × 100 / (${p} × ${t}) = ${rate}%.` });
    },
  ])();

export const compoundInterest = (r) =>
  pick(r, [
    () => {
      const p = int(r, 2, 20) * 1000;
      const rate = pick(r, [5, 10, 20]);
      const t = pick(r, [2, 3]);
      const amt = Math.round(p * (1 + rate / 100) ** t * 100) / 100;
      const ci = Math.round((amt - p) * 100) / 100;
      return numMcq(r, { q: `Find the compound interest on ${inr(p)} at ${rate}% per annum for ${t} years, compounded annually.`, ans: ci, f: inr, ex: `Amount = ${p} × (1 + ${rate}/100)^${t} = ${inr(amt)}. CI = ${inr(amt)} − ${inr(p)} = ${inr(ci)}.` });
    },
    () => {
      const p = int(r, 2, 40) * 500;
      const rate = pick(r, [5, 10, 20]);
      const diff = (p * rate * rate) / 10000;
      return numMcq(r, { q: `What is the difference between compound and simple interest on ${inr(p)} for 2 years at ${rate}% per annum?`, ans: diff, f: inr, ex: `For 2 years, CI − SI = P × (R/100)² = ${p} × (${rate}/100)² = ${inr(diff)}.` });
    },
    () => {
      const rate = pick(r, [10, 20, 25, 50]);
      const p = int(r, 2, 10) * 1000;
      const amt = p * (1 + rate / 100) ** 2;
      return numMcq(r, { q: `A sum becomes ${inr(amt)} in 2 years at ${rate}% compound interest per annum. Find the sum.`, ans: p, f: inr, ex: `P = ${amt} ÷ (1 + ${rate}/100)² = ${amt} ÷ ${(1 + rate / 100) ** 2} = ${inr(p)}.` });
    },
  ])();

export const ratio = (r) =>
  pick(r, [
    () => {
      const a = int(r, 1, 9);
      let b = int(r, 1, 9);
      while (b === a || gcd(a, b) > 1) b = int(r, 1, 9);
      const total = (a + b) * int(r, 5, 40);
      const share = (total * a) / (a + b);
      const [x, y] = two(r);
      return numMcq(r, { q: `${inr(total)} is divided between ${x} and ${y} in the ratio ${a}:${b}. What is ${x}'s share?`, ans: share, f: inr, ex: `${x}'s share = ${a}/${a + b} × ${total} = ${inr(share)}.` });
    },
    () => {
      const a = int(r, 2, 7), c = int(r, 2, 7);
      let b = int(r, 2, 7), d = int(r, 2, 7);
      while (b === a) b = int(r, 2, 7);
      while (d === c) d = int(r, 2, 7);
      const g1 = a * c, g2 = b * d, g = gcd(g1, g2);
      const f = (p, q) => `${p}:${q}`;
      return mcq(r, {
        q: `If A:B = ${a}:${b} and B:C = ${c}:${d}, what is A:C?`,
        correct: f(g1 / g, g2 / g),
        wrong: [f(a, d), f(a + c, b + d), f(g2 / g, g1 / g), f(a * d, b * c)],
        ex: `A:C = (A/B) × (B/C) = (${a}/${b}) × (${c}/${d}) = ${g1}:${g2} = ${g1 / g}:${g2 / g}.`,
      });
    },
    () => {
      const a = int(r, 2, 9), b = int(r, 2, 9);
      const k = int(r, 2, 9);
      const x = a * k, y = b * k;
      const add = int(r, 1, 9);
      const ans = `${(x + add) / gcd(x + add, y + add)}:${(y + add) / gcd(x + add, y + add)}`;
      return mcq(r, {
        q: `Two numbers are in the ratio ${a}:${b} and their sum is ${x + y}. If ${add} is added to each, what is the new ratio?`,
        correct: ans,
        wrong: [`${a}:${b}`, `${a + add}:${b + add}`, `${b}:${a}`, `${x}:${y + add}`],
        ex: `The numbers are ${x} and ${y}. After adding ${add}: ${x + add}:${y + add} = ${ans}.`,
      });
    },
  ])();

export const averages = (r) =>
  pick(r, [
    () => {
      const n = int(r, 4, 7);
      const nums = Array.from({ length: n }, () => int(r, 10, 99));
      const sum = nums.reduce((s, x) => s + x, 0);
      const avg = Math.round((sum / n) * 100) / 100;
      return numMcq(r, { q: `Find the average of ${nums.join(', ')}.`, ans: avg, ex: `Sum = ${sum}, count = ${n}, average = ${sum}/${n} = ${fmtNum(avg)}.` });
    },
    () => {
      const n = int(r, 10, 40);
      const avg = int(r, 20, 60);
      const newAge = int(r, 30, 70);
      const newAvg = Math.round(((n * avg + newAge) / (n + 1)) * 100) / 100;
      return numMcq(r, { q: `The average age of ${n} students is ${avg} years. When the teacher's age is included, the average becomes ${fmtNum(newAvg)} years. What is the teacher's age?`, ans: newAge, f: u('year'), ex: `Teacher = ${n + 1} × ${fmtNum(newAvg)} − ${n} × ${avg} = ${newAge} years.` });
    },
    () => {
      const first = 2 * int(r, 1, 30) - 1;
      const n = int(r, 5, 25);
      const last = first + 2 * (n - 1);
      const avg = (first + last) / 2;
      return numMcq(r, { q: `What is the average of the ${n} consecutive odd numbers starting from ${first}?`, ans: avg, ex: `Average of an arithmetic sequence = (first + last)/2 = (${first} + ${last})/2 = ${avg}.` });
    },
    () => {
      const m = int(r, 5, 12);
      const a1 = int(r, 40, 80);
      const k = int(r, 5, 12);
      const a2 = int(r, 40, 80);
      const ans = Math.round(((m * a1 + k * a2) / (m + k)) * 100) / 100;
      return numMcq(r, { q: `The average marks of ${m} boys is ${a1} and of ${k} girls is ${a2}. What is the average of the whole class?`, ans, ex: `Total = ${m} × ${a1} + ${k} × ${a2} = ${m * a1 + k * a2}. Average = ${m * a1 + k * a2}/${m + k} = ${fmtNum(ans)}.` });
    },
  ])();

export const ages = (r) =>
  pick(r, [
    () => {
      const son = int(r, 5, 20);
      const k = pick(r, [2, 3, 4]);
      const father = son * k;
      const yrs = int(r, 2, 10);
      const [a] = two(r);
      return numMcq(r, { q: `${a}'s father is ${k} times as old as ${a}. ${yrs} years ago, the sum of their ages was ${father + son - 2 * yrs}. How old is ${a} now?`, ans: son, f: u('year'), ex: `Let ${a} = x, father = ${k}x. (${k + 1}x − ${2 * yrs}) = ${father + son - 2 * yrs}, so x = ${son}.` });
    },
    () => {
      const a = int(r, 2, 5), b = int(r, 2, 5);
      if (a === b) return ages(r);
      const k = int(r, 3, 8);
      const yrs = int(r, 3, 10);
      const [x, y] = two(r);
      const ans = a * k + yrs;
      return numMcq(r, { q: `The present ages of ${x} and ${y} are in the ratio ${a}:${b}, and their total is ${(a + b) * k} years. What will ${x}'s age be after ${yrs} years?`, ans, f: u('year'), ex: `${x} = ${a}/${a + b} × ${(a + b) * k} = ${a * k}. After ${yrs} years: ${ans}.` });
    },
    () => {
      const diff = int(r, 20, 35);
      const child = int(r, 4, 15);
      const yrs = int(r, 2, 10);
      return numMcq(r, { q: `A mother was ${diff} years old when her daughter was born. If the daughter is ${child} years old now, how old will the mother be in ${yrs} years?`, ans: diff + child + yrs, f: u('year'), ex: `Mother now = ${diff} + ${child} = ${diff + child}. In ${yrs} years: ${diff + child + yrs}.` });
    },
  ])();

export const timeWork = (r) =>
  pick(r, [
    () => {
      const pairs = [[6, 12, 4], [10, 15, 6], [12, 24, 8], [20, 30, 12], [15, 10, 6], [18, 9, 6], [21, 42, 14], [8, 24, 6], [12, 4, 3], [30, 20, 12], [40, 60, 24], [14, 35, 10]];
      const [a, b, t] = pick(r, pairs);
      const [x, y] = two(r);
      return numMcq(r, { q: `${x} can finish a job in ${a} days and ${y} in ${b} days. Working together, in how many days will they finish it?`, ans: t, f: u('day'), ex: `Work per day = 1/${a} + 1/${b} = 1/${t}. Together: ${t} days.` });
    },
    () => {
      const [ab, a, b] = pick(r, [[10, 15, 30], [12, 20, 30], [6, 10, 15], [8, 12, 24], [20, 30, 60], [18, 30, 45], [4, 6, 12], [15, 20, 60]]);
      const [x, y] = two(r);
      return numMcq(r, { q: `${x} and ${y} together finish a task in ${ab} days. ${x} alone takes ${a} days. How long will ${y} alone take?`, ans: b, f: u('day'), ex: `${y}'s rate = 1/${ab} − 1/${a} = 1/${b}, so ${b} days.` });
    },
    () => {
      const men = int(r, 4, 20);
      const days = int(r, 6, 30);
      const d2 = pick(r, [2, 3, 4, 5, 6].map((k) => days * k).filter(Boolean));
      const men2 = (men * days) / d2;
      if (!Number.isInteger(men2) || men2 < 1) return timeWork(r);
      return numMcq(r, { q: `${men} workers can build a wall in ${days} days. How many days will ${men2} workers take to build the same wall?`, ans: d2, f: u('day'), ex: `Work = ${men} × ${days} = ${men * days} worker-days. ${men * days}/${men2} = ${d2} days.` });
    },
    () => {
      const [a, b] = pick(r, [[10, 15], [12, 18], [20, 30], [6, 12], [15, 30], [24, 12]]);
      const worked = int(r, 2, 4);
      const left = 1 - worked * (1 / a + 1 / b);
      const daysB = Math.round(left * b * 100) / 100;
      if (left <= 0) return timeWork(r);
      const [x, y] = two(r);
      return numMcq(r, { q: `${x} alone can do a job in ${a} days and ${y} alone in ${b} days. They work together for ${worked} days and then ${x} leaves. How many more days will ${y} take to finish?`, ans: daysB, f: u('day'), ex: `In ${worked} days they finish ${worked} × (1/${a} + 1/${b}) = ${fmtNum(Math.round((1 - left) * 1000) / 1000)}. Remaining ${fmtNum(Math.round(left * 1000) / 1000)} at 1/${b} per day = ${fmtNum(daysB)} days.` });
    },
  ])();

export const pipes = (r) =>
  pick(r, [
    () => {
      const [a, b, t] = pick(r, [[10, 15, 6], [12, 24, 8], [20, 30, 12], [6, 12, 4], [8, 24, 6], [30, 60, 20], [9, 18, 6]]);
      return numMcq(r, { q: `Pipe A fills a tank in ${a} hours and pipe B in ${b} hours. If both are opened together, how long will it take to fill the tank?`, ans: t, f: u('hour'), ex: `Rate = 1/${a} + 1/${b} = 1/${t}. Time = ${t} hours.` });
    },
    () => {
      const [a, b, t] = pick(r, [[10, 15, 30], [6, 10, 15], [12, 20, 30], [8, 12, 24], [4, 6, 12], [20, 30, 60], [15, 20, 60]]);
      return numMcq(r, { q: `A tap fills a tank in ${a} hours, but a leak empties the full tank in ${b} hours. With the leak, how long does the tap take to fill the tank?`, ans: t, f: u('hour'), ex: `Net rate = 1/${a} − 1/${b} = 1/${t}. Time = ${t} hours.` });
    },
    () => {
      const [a, b, c, t] = pick(r, [[10, 12, 15, 4], [6, 12, 4, 2], [20, 30, 60, 10], [12, 15, 20, 5], [6, 8, 24, 3]]);
      return numMcq(r, { q: `Three pipes can fill a tank in ${a}, ${b} and ${c} hours respectively. If all three are opened together, how long will the tank take to fill?`, ans: t, f: u('hour'), ex: `Rate = 1/${a} + 1/${b} + 1/${c} = 1/${t}. Time = ${t} hours.` });
    },
    () => {
      const cap = int(r, 4, 30) * 100;
      const inR = int(r, 3, 12) * 10;
      const outR = inR - int(r, 1, inR / 10 - 1) * 10;
      const t = cap / (inR - outR);
      if (!Number.isInteger(t) || outR <= 0) return pipes(r);
      return numMcq(r, { q: `A ${cap} litre tank is filled by a pipe at ${inR} litres per minute while a drain removes ${outR} litres per minute. How long does it take to fill the empty tank?`, ans: t, f: u('minute'), ex: `Net filling = ${inR} − ${outR} = ${inR - outR} L/min. Time = ${cap}/${inR - outR} = ${t} min.` });
    },
    () => {
      const [a, b] = pick(r, [[12, 18], [10, 15], [20, 30], [6, 9], [8, 12], [15, 25], [16, 24]]);
      const k = int(r, 2, 4);
      const left = 1 - k * (1 / a + 1 / b);
      if (left <= 0) return pipes(r);
      const more = Math.round(left * b * 100) / 100;
      return numMcq(r, { q: `Pipes A and B can fill a tank in ${a} and ${b} hours. Both are opened for ${k} hours, then A is closed. How much longer will B take to fill the tank?`, ans: more, f: u('hour'), ex: `In ${k} hours they fill ${k} × (1/${a} + 1/${b}). The rest (${fmtNum(Math.round(left * 1000) / 1000)} of the tank) at 1/${b} per hour takes ${fmtNum(more)} hours.` });
    },
  ])();

export const speedDistance = (r) =>
  pick(r, [
    () => {
      const s = pick(r, [18, 36, 54, 72, 90, 108]);
      const ms = (s * 5) / 18;
      return numMcq(r, { q: `Convert ${s} km/h into metres per second.`, ans: ms, f: (v) => `${fmtNum(v)} m/s`, ex: `${s} × 5/18 = ${ms} m/s.` });
    },
    () => {
      const [a, b] = pick(r, [[40, 60], [30, 60], [20, 30], [60, 90], [36, 45], [50, 75], [24, 40]]);
      const avg = (2 * a * b) / (a + b);
      return numMcq(r, { q: `A car goes from city X to Y at ${a} km/h and returns at ${b} km/h. What is the average speed for the round trip?`, ans: avg, f: (v) => `${fmtNum(v)} km/h`, near: [(a + b) / 2, avg + 2, avg - 2, avg + 5, avg - 4], ex: `Average speed = 2ab/(a + b) = 2 × ${a} × ${b}/${a + b} = ${fmtNum(avg)} km/h (not the simple mean ${(a + b) / 2}).` });
    },
    () => {
      const s = int(r, 3, 12) * 5;
      const t = int(r, 2, 8);
      const extra = pick(r, [5, 10, 15]);
      const d = s * t;
      const newT = d / (s + extra);
      return numMcq(r, { q: `A cyclist covers a distance in ${t} hours at ${s} km/h. How long will the same distance take at ${s + extra} km/h?`, ans: Math.round(newT * 100) / 100, f: u('hour'), ex: `Distance = ${s} × ${t} = ${d} km. Time = ${d}/${s + extra} = ${fmtNum(Math.round(newT * 100) / 100)} hours.` });
    },
    () => {
      const a = int(r, 3, 9) * 10, b = int(r, 2, 8) * 10;
      const t = int(r, 2, 5);
      const [x, y] = two(r);
      return numMcq(r, { q: `${x} and ${y} start from the same point and walk in opposite directions at ${a / 10} km/h and ${b / 10} km/h. How far apart are they after ${t} hours?`, ans: ((a + b) / 10) * t, f: (v) => `${fmtNum(v)} km`, ex: `Relative speed = ${a / 10} + ${b / 10} = ${(a + b) / 10} km/h. Distance = ${(a + b) / 10} × ${t} = ${fmtNum(((a + b) / 10) * t)} km.` });
    },
  ])();

export const trains = (r) =>
  pick(r, [
    () => {
      const s = pick(r, [36, 54, 72, 90, 108]);
      const t = int(r, 6, 20);
      const len = (s * 5) / 18 * t;
      return numMcq(r, { q: `A train running at ${s} km/h crosses a pole in ${t} seconds. What is the length of the train?`, ans: len, f: (v) => `${fmtNum(v)} m`, ex: `Speed = ${s} × 5/18 = ${(s * 5) / 18} m/s. Length = ${(s * 5) / 18} × ${t} = ${fmtNum(len)} m.` });
    },
    () => {
      const s = pick(r, [36, 54, 72, 90]);
      const train = int(r, 10, 30) * 10;
      const plat = int(r, 10, 40) * 10;
      const t = (train + plat) / ((s * 5) / 18);
      if (!Number.isInteger(t)) return trains(r);
      return numMcq(r, { q: `A ${train} m long train at ${s} km/h crosses a ${plat} m long platform. How long does it take?`, ans: t, f: u('second'), ex: `Distance = ${train} + ${plat} = ${train + plat} m. Speed = ${(s * 5) / 18} m/s. Time = ${t} s.` });
    },
    () => {
      const s1 = pick(r, [36, 54, 72]), s2 = pick(r, [18, 36, 54]);
      const l1 = int(r, 10, 25) * 10, l2 = int(r, 10, 25) * 10;
      const rel = ((s1 + s2) * 5) / 18;
      const t = (l1 + l2) / rel;
      if (!Number.isInteger(t * 10)) return trains(r);
      return numMcq(r, { q: `Two trains ${l1} m and ${l2} m long run in opposite directions at ${s1} km/h and ${s2} km/h. In how many seconds will they cross each other?`, ans: t, f: u('second'), ex: `Relative speed = (${s1} + ${s2}) × 5/18 = ${fmtNum(rel)} m/s. Time = (${l1} + ${l2})/${fmtNum(rel)} = ${fmtNum(t)} s.` });
    },
  ])();

export const boats = (r) =>
  pick(r, [
    () => {
      const b = int(r, 6, 20), s = int(r, 1, 5);
      return mcq(r, {
        q: `A boat's speed downstream is ${b + s} km/h and upstream is ${b - s} km/h. What are the speed of the boat in still water and the speed of the stream?`,
        correct: `${b} km/h and ${s} km/h`,
        wrong: [`${s} km/h and ${b} km/h`, `${b + s} km/h and ${b - s} km/h`, `${b + 1} km/h and ${s + 1} km/h`, `${b - 1} km/h and ${s} km/h`],
        ex: `Boat = (down + up)/2 = (${b + s} + ${b - s})/2 = ${b}. Stream = (down − up)/2 = ${s}.`,
      });
    },
    () => {
      const b = int(r, 8, 20), s = int(r, 1, 4);
      const d = (b + s) * int(r, 1, 4);
      return numMcq(r, { q: `A boat goes ${d} km downstream. Its speed in still water is ${b} km/h and the stream flows at ${s} km/h. How long does the trip take?`, ans: d / (b + s), f: u('hour'), ex: `Downstream speed = ${b} + ${s} = ${b + s} km/h. Time = ${d}/${b + s} = ${fmtNum(d / (b + s))} h.` });
    },
  ])();

export const mixtures = (r) =>
  pick(r, [
    () => {
      const c1 = int(r, 2, 6) * 10, c2 = c1 + int(r, 2, 6) * 10;
      const m = c1 + int(r, 1, (c2 - c1) / 10 - 1 || 1) * 10;
      if (!(m > c1 && m < c2)) return mixtures(r);
      const a = c2 - m, b = m - c1, g = gcd(a, b);
      return mcq(r, {
        q: `In what ratio must rice costing ₹${c1}/kg be mixed with rice costing ₹${c2}/kg so that the mixture costs ₹${m}/kg?`,
        correct: `${a / g}:${b / g}`,
        wrong: [`${b / g}:${a / g}`, `${c1 / 10}:${c2 / 10}`, `1:1`, `${a / g + 1}:${b / g}`, `${a / g}:${b / g + 1}`, `${a / g + 1}:${b / g + 2}`, `2:3`, `3:2`],
        ex: `By alligation: (${c2} − ${m}):(${m} − ${c1}) = ${a}:${b} = ${a / g}:${b / g}.`,
      });
    },
    () => {
      const total = int(r, 4, 12) * 10;
      const milk = pick(r, [60, 70, 75, 80, 90]);
      const water = (total * (100 - milk)) / 100;
      const add = int(r, 1, 4) * 5;
      const ans = Math.round(((water + add) / (total + add)) * 10000) / 100;
      return numMcq(r, { q: `A ${total} litre mixture has milk and water with ${milk}% milk. If ${add} litres of water is added, what percentage of the new mixture is water?`, ans, f: (v) => `${fmtNum(v)}%`, ex: `Water = ${fmtNum(water)} L. After adding: ${fmtNum(water + add)} of ${total + add} L = ${fmtNum(ans)}%.` });
    },
  ])();

export const numberSystem = (r) =>
  pick(r, [
    () => {
      const g = int(r, 2, 12);
      let a = int(r, 2, 9), b = int(r, 2, 9);
      while (gcd(a, b) !== 1 || a === b) b = int(r, 2, 9);
      return numMcq(r, { q: `Find the HCF of ${a * g} and ${b * g}.`, ans: g, near: [g * 2, g + 1, a * b, g * a, g - 1], ex: `${a * g} = ${g} × ${a} and ${b * g} = ${g} × ${b}; ${a} and ${b} share no factor, so HCF = ${g}.` });
    },
    () => {
      const [a, b, c] = shuffle(r, [4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20]).slice(0, 3);
      const l = lcm(lcm(a, b), c);
      return numMcq(r, { q: `Three bells ring at intervals of ${a}, ${b} and ${c} minutes. If they ring together now, after how many minutes will they next ring together?`, ans: l, f: u('minute'), near: [a * b, l / 2, l * 2, a + b + c, l + a], ex: `LCM(${a}, ${b}, ${c}) = ${l} minutes.` });
    },
    () => {
      const base = int(r, 2, 9), exp = int(r, 10, 99);
      const cyc = [];
      let x = base % 10;
      for (let i = 0; i < 4; i++) { cyc.push(x); x = (x * base) % 10; }
      const ans = cyc[(exp - 1) % 4];
      return mcq(r, { q: `What is the unit digit of ${base}^${exp}?`, correct: String(ans), wrong: shuffle(r, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].filter((d) => d !== String(ans))), ex: `Unit digits of ${base}^n repeat as ${[...new Set(cyc)].join(', ')}. ${exp} gives position ${((exp - 1) % 4) + 1} in the cycle, so ${ans}.` });
    },
    () => {
      const d = int(r, 7, 17);
      let n = int(r, 100, 999);
      if (n % d === 0) n += 1;
      const rem = n % d;
      const near = [rem + 1, rem + 2, rem - 1, rem + 3, d - rem].filter((v) => v > 0 && v < d && v !== rem);
      return numMcq(r, { q: `What is the remainder when ${n} is divided by ${d}?`, ans: rem, near, ex: `${n} = ${d} × ${Math.floor(n / d)} + ${rem}.` });
    },
    () => {
      const n = int(r, 10, 60);
      return numMcq(r, { q: `What is the sum of the first ${n} natural numbers?`, ans: (n * (n + 1)) / 2, near: [n * n, (n * (n - 1)) / 2, (n * (n + 1)) / 2 + n, n * (n + 1)], ex: `n(n + 1)/2 = ${n} × ${n + 1}/2 = ${(n * (n + 1)) / 2}.` });
    },
  ])();

const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const nCr = (n, k) => fact(n) / (fact(k) * fact(n - k));

export const permComb = (r) =>
  pick(r, [
    () => {
      const words = ['LEMON', 'TIGER', 'PLANT', 'SMILE', 'CHAIR', 'MANGO', 'DREAM', 'BRICK'];
      const w = pick(r, words);
      return numMcq(r, { q: `In how many ways can the letters of the word "${w}" be arranged?`, ans: fact(w.length), near: [fact(w.length - 1), fact(w.length) / 2, w.length ** 2, fact(w.length) * 2], ex: `${w.length} different letters can be arranged in ${w.length}! = ${fact(w.length)} ways.` });
    },
    () => {
      const w = pick(r, ['APPLE', 'BANANA', 'LETTER', 'COFFEE', 'GOOGLE', 'BALLOON']);
      const counts = {};
      for (const ch of w) counts[ch] = (counts[ch] ?? 0) + 1;
      const denom = Object.values(counts).reduce((p, c) => p * fact(c), 1);
      const ans = fact(w.length) / denom;
      return numMcq(r, { q: `How many different arrangements can be made from the letters of "${w}"?`, ans, near: [fact(w.length), ans * 2, ans / 2, ans + w.length], ex: `${w.length}! / ${Object.entries(counts).filter(([, c]) => c > 1).map(([k, c]) => `${c}! (${k})`).join(' × ')} = ${ans}.` });
    },
    () => {
      const n = int(r, 6, 12), k = int(r, 2, 4);
      return numMcq(r, { q: `In how many ways can a committee of ${k} be chosen from ${n} people?`, ans: nCr(n, k), near: [fact(n) / fact(n - k), nCr(n, k - 1), nCr(n, k) + n, nCr(n, k + 1)], ex: `${n}C${k} = ${n}!/(${k}! × ${n - k}!) = ${nCr(n, k)}.` });
    },
    () => {
      const m = int(r, 4, 8), w = int(r, 3, 6);
      const ans = nCr(m, 2) * nCr(w, 2);
      return numMcq(r, { q: `From ${m} men and ${w} women, how many teams of 2 men and 2 women can be formed?`, ans, near: [nCr(m + w, 4), ans * 2, nCr(m, 2) + nCr(w, 2), ans + 10], ex: `${m}C2 × ${w}C2 = ${nCr(m, 2)} × ${nCr(w, 2)} = ${ans}.` });
    },
  ])();

const frac = (n, d) => {
  const g = gcd(n, d);
  return `${n / g}/${d / g}`;
};

const FR = ['1/2', '1/3', '1/4', '1/6', '1/9', '5/36', '7/36', '2/9', '1/12', '5/12', '3/4', '2/3', '1/36', '1/18'];
const pmcq = (r, o) => mcq(r, { ...o, wrong: [...o.wrong, ...shuffle(r, FR)] });

export const probability = (r) =>
  pick(r, [
    () => {
      const target = int(r, 3, 11);
      let ways = 0;
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === target) ways++;
      return pmcq(r, { q: `Two dice are thrown. What is the probability that the sum is ${target}?`, correct: frac(ways, 36), wrong: [frac(ways + 1, 36), frac(Math.max(1, ways - 1) + 2, 36), `1/6`, `1/12`, frac(ways, 12)], ex: `${ways} of the 36 outcomes give ${target}, so ${frac(ways, 36)}.` });
    },
    () => {
      const red = int(r, 2, 8), blue = int(r, 2, 8), green = int(r, 1, 6);
      const t = red + blue + green;
      return pmcq(r, { q: `A bag has ${red} red, ${blue} blue and ${green} green balls. One ball is drawn at random. What is the probability that it is blue?`, correct: frac(blue, t), wrong: [frac(red, t), frac(green, t), frac(blue, t - blue), frac(blue + 1, t)], ex: `${blue} blue out of ${t} balls = ${frac(blue, t)}.` });
    },
    () => {
      const n = pick(r, [2, 3]);
      const outcomes = 2 ** n;
      return pmcq(r, { q: `${n} coins are tossed. What is the probability of getting at least one head?`, correct: frac(outcomes - 1, outcomes), wrong: [frac(1, outcomes), `1/2`, frac(n, outcomes), frac(outcomes - 2, outcomes)], ex: `P(no heads) = 1/${outcomes}, so P(at least one) = 1 − 1/${outcomes} = ${frac(outcomes - 1, outcomes)}.` });
    },
    () => {
      const card = pick(r, [['a king', 4], ['a heart', 13], ['a red card', 26], ['a face card', 12], ['an ace or a king', 8]]);
      return pmcq(r, { q: `A card is drawn from a well-shuffled pack of 52. What is the probability that it is ${card[0]}?`, correct: frac(card[1], 52), wrong: [frac(card[1] + 1, 52), `1/4`, `1/13`, `1/2`, `3/13`].filter((x) => x !== frac(card[1], 52)), ex: `${card[1]} favourable cards out of 52 = ${frac(card[1], 52)}.` });
    },
  ])();

export const mensuration = (r) =>
  pick(r, [
    () => {
      const l = int(r, 5, 40), b = int(r, 3, 30);
      return numMcq(r, { q: `A rectangle is ${l} m long and ${b} m wide. What is its perimeter?`, ans: 2 * (l + b), f: (v) => `${v} m`, near: [l * b, l + b, 2 * l + b, 2 * (l + b) + 2], ex: `Perimeter = 2(l + b) = 2(${l} + ${b}) = ${2 * (l + b)} m.` });
    },
    () => {
      const rr = pick(r, [7, 14, 21, 28, 35]);
      const area = (22 / 7) * rr * rr;
      return numMcq(r, { q: `Find the area of a circle of radius ${rr} cm (take π = 22/7).`, ans: area, f: (v) => `${fmtNum(v)} cm²`, near: [2 * (22 / 7) * rr, area / 2, area + rr, (22 / 7) * rr], ex: `πr² = 22/7 × ${rr} × ${rr} = ${fmtNum(area)} cm².` });
    },
    () => {
      const a = int(r, 3, 15);
      return numMcq(r, { q: `What is the volume of a cube with edge ${a} cm?`, ans: a ** 3, f: (v) => `${v} cm³`, near: [6 * a * a, a * a, a ** 3 + a, 3 * a], ex: `Volume = a³ = ${a}³ = ${a ** 3} cm³.` });
    },
    () => {
      const [p, q, h] = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]]);
      return numMcq(r, { q: `The two shorter sides of a right-angled triangle are ${p} cm and ${q} cm. What is its area?`, ans: (p * q) / 2, f: (v) => `${fmtNum(v)} cm²`, near: [p * q, h * p / 2, p + q + h, (p * q) / 2 + p], ex: `Area = ½ × ${p} × ${q} = ${fmtNum((p * q) / 2)} cm².` });
    },
    () => {
      const rr = pick(r, [7, 14]);
      const h = int(r, 5, 20);
      const v = (22 / 7) * rr * rr * h;
      return numMcq(r, { q: `Find the volume of a cylinder with radius ${rr} cm and height ${h} cm (π = 22/7).`, ans: v, f: (x) => `${fmtNum(x)} cm³`, near: [v / 3, 2 * (22 / 7) * rr * h, v + 100, v * 2], ex: `πr²h = 22/7 × ${rr}² × ${h} = ${fmtNum(v)} cm³.` });
    },
  ])();

export const dataInterpretation = (r) => {
  const years = ['2021', '2022', '2023', '2024', '2025'];
  const sales = years.map(() => int(r, 12, 60) * 10);
  const table = years.map((y, i) => `${y}: ${sales[i]} units`).join('\n');
  return pick(r, [
    () => {
      const tot = sales.reduce((s, x) => s + x, 0);
      return numMcq(r, { q: `A company's laptop sales were:\n${table}\n\nWhat is the average yearly sale?`, ans: tot / 5, f: (v) => `${fmtNum(v)} units`, ex: `Total = ${tot}. Average = ${tot}/5 = ${fmtNum(tot / 5)}.` });
    },
    () => {
      const i = int(r, 1, 4);
      const ch = Math.round(((sales[i] - sales[i - 1]) / sales[i - 1]) * 10000) / 100;
      if (ch === 0) return dataInterpretation(r);
      const word = ch > 0 ? 'increase' : 'decrease';
      const f = (v) => `${fmtNum(v)}% ${word}`;
      return mcq(r, { q: `A company's laptop sales were:\n${table}\n\nWhat was the percentage change in sales from ${years[i - 1]} to ${years[i]}?`, correct: f(Math.abs(ch)), wrong: [f(Math.abs(ch) + 5), f(Math.round(Math.abs((sales[i] - sales[i - 1]) / sales[i]) * 10000) / 100), `${fmtNum(Math.abs(ch))}% ${word === 'increase' ? 'decrease' : 'increase'}`, f(Math.abs(ch) / 2 + 1)], ex: `Change = ${sales[i] - sales[i - 1]} on ${sales[i - 1]} = ${fmtNum(ch)}%.` });
    },
    () => {
      const maxI = sales.indexOf(Math.max(...sales));
      return mcq(r, { q: `A company's laptop sales were:\n${table}\n\nIn which year were sales the highest?`, correct: years[maxI], wrong: years.filter((_, k) => k !== maxI), ex: `The largest value is ${sales[maxI]} in ${years[maxI]}.` });
    },
  ])();
};

/** Topic list: id, title, generator, short description. */
export const APTITUDE_TOPICS = [
  ['percentages', 'Percentages', percentages, 'Percent of a number, successive changes, exam marks.'],
  ['profit-loss', 'Profit, Loss and Discount', profitLoss, 'Cost price, selling price, discounts and successive discounts.'],
  ['simple-interest', 'Simple Interest', simpleInterest, 'Interest, amount, rate and time.'],
  ['compound-interest', 'Compound Interest', compoundInterest, 'Compound interest and the CI − SI difference.'],
  ['ratio-proportion', 'Ratio and Proportion', ratio, 'Dividing amounts, combining ratios.'],
  ['averages', 'Averages', averages, 'Simple and weighted averages.'],
  ['ages', 'Problems on Ages', ages, 'Present and future ages, age ratios.'],
  ['time-and-work', 'Time and Work', timeWork, 'Working together, alone and in shifts.'],
  ['pipes-and-cisterns', 'Pipes and Cisterns', pipes, 'Filling and emptying tanks.'],
  ['speed-distance', 'Time, Speed and Distance', speedDistance, 'Unit conversion, average speed, relative speed.'],
  ['trains', 'Problems on Trains', trains, 'Crossing poles, platforms and other trains.'],
  ['boats-streams', 'Boats and Streams', boats, 'Upstream and downstream speeds.'],
  ['mixtures-alligation', 'Mixtures and Alligation', mixtures, 'Mixing prices and concentrations.'],
  ['number-system', 'Number System', numberSystem, 'HCF, LCM, unit digits and remainders.'],
  ['permutations-combinations', 'Permutations and Combinations', permComb, 'Arrangements and selections.'],
  ['probability', 'Probability', probability, 'Dice, coins, cards and balls.'],
  ['mensuration', 'Mensuration', mensuration, 'Areas, perimeters and volumes.'],
  ['data-interpretation', 'Data Interpretation', dataInterpretation, 'Reading tables: averages and percentage changes.'],
];
