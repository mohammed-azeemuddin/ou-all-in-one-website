/**
 * More aptitude question types, so a topic is not the same question with different numbers.
 * Each entry is one template (its own wording and its own working); answers are computed.
 * Wired into APTITUDE_TOPICS in aptitude.mjs. A template may throw to reject an awkward draw.
 */
import { fmtNum, gcd, inr, int, lcm, mcq, numMcq, pick } from './lib.mjs';

const pct = (x) => `${fmtNum(x)}%`;
const whole = (x) => {
  if (!Number.isInteger(x)) throw new Error('not whole');
  return x;
};
const frac = (n, d) => {
  const g = gcd(n, d);
  return d / g === 1 ? `${n / g}` : `${n / g}/${d / g}`;
};
/** Fraction answer with fraction distractors. */
const fracMcq = (r, { q, n, d, ex, alt = [] }) => {
  const right = frac(n, d);
  const wrong = [...alt.map(([a, b]) => frac(a, b)), frac(n + 1, d), frac(Math.max(1, n - 1), d), frac(n, d + 1), frac(d - n > 0 ? d - n : n + 2, d)].filter((w) => w !== right);
  return mcq(r, { q, correct: right, wrong, ex });
};
const C = (n, k) => {
  let x = 1;
  for (let i = 0; i < k; i++) x = (x * (n - i)) / (i + 1);
  return Math.round(x);
};
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));

export const EXTRA_APTITUDE = {
  percentages: [
    (r) => {
      const p = pick(r, [5, 10, 20]);
      const P = int(r, 2, 9) * 10000;
      const ans = whole((P * (100 + p) * (100 + p)) / 10000);
      return numMcq(r, { q: `The population of a town is ${P.toLocaleString('en-IN')} and grows by ${p}% every year. What will it be after 2 years?`, ans, f: (v) => v.toLocaleString('en-IN'), ex: `A ${p}% rise each year multiplies the population by (1 + ${p}/100) = ${1 + p / 100}. After year 1: ${P.toLocaleString('en-IN')} × ${1 + p / 100} = ${((P * (100 + p)) / 100).toLocaleString('en-IN')}. After year 2: ${((P * (100 + p)) / 100).toLocaleString('en-IN')} × ${1 + p / 100} = ${ans.toLocaleString('en-IN')}.` });
    },
    (r) => {
      const y = pick(r, [10, 20, 25, 40, 50]);
      const x = pick(r, [15, 30, 35, 45, 60, 75].filter((v) => v !== y));
      const k = int(r, 2, 12);
      const A = y * k;
      return numMcq(r, { q: `${x}% of ${A} is equal to ${y}% of which number?`, ans: x * k, ex: `${x}% of ${A} = ${(x * A) / 100}. That is ${y}% of N, so N = ${(x * A) / 100} × 100 / ${y} = ${x * k}.` });
    },
    (r) => {
      const [p, ans] = pick(r, [[25, 20], [20, 16.67], [50, 33.33], [10, 9.09], [60, 37.5], [100, 50], [30, 23.08]]);
      return numMcq(r, { q: `The price of sugar rises by ${p}%. By how much percent must a family cut its consumption so that its spending on sugar stays the same?`, ans, f: pct, near: [p, ans + 5, ans - 4, p / 2, ans + 2], ex: `Cut = ${p}/(100 + ${p}) × 100 = ${fmtNum(ans)}%.` });
    },
    (r) => {
      const a = pick(r, [20, 25, 40]);
      const b = pick(r, [20, 25, 50]);
      const X = int(r, 5, 30) * 1000;
      const S = whole((X * (100 - a) * (100 - b)) / 10000);
      return numMcq(r, { q: `A man spends ${a}% of his salary on rent and ${b}% of the rest on food. He saves the remaining ₹${S.toLocaleString('en-IN')}. What is his salary?`, ans: X, f: inr, ex: `Savings = salary × ${(100 - a) / 100} × ${(100 - b) / 100}, so salary = ${S} ÷ ${((100 - a) * (100 - b)) / 10000} = ${inr(X)}.` });
    },
    (r) => {
      const p = pick(r, [55, 60, 65, 70]);
      const V = int(r, 10, 90) * 100;
      const M = whole(((2 * p - 100) * V) / 100);
      return numMcq(r, { q: `In an election between two candidates, the winner got ${p}% of the valid votes and won by ${M.toLocaleString('en-IN')} votes. How many valid votes were cast?`, ans: V, f: (v) => v.toLocaleString('en-IN'), ex: `The margin is ${p}% − ${100 - p}% = ${2 * p - 100}% of the votes, so total = ${M} × 100 / ${2 * p - 100} = ${V.toLocaleString('en-IN')}.` });
    },
    (r) => {
      const p = pick(r, [60, 80, 120, 125, 150]);
      const q2 = pick(r, [40, 50, 80, 90, 110]);
      const ans = (p * q2) / 100;
      return numMcq(r, { q: `A's salary is ${p}% of B's salary, and B's salary is ${q2}% of C's salary. A's salary is what percent of C's salary?`, ans, f: pct, ex: `A = ${p}/100 × ${q2}/100 × C = ${fmtNum(ans)}% of C.` });
    },
    (r) => {
      const total = int(r, 4, 12) * 100;
      const boys = pick(r, [40, 45, 55, 60, 65]);
      const passB = pick(r, [50, 60, 70, 80]);
      const passG = pick(r, [60, 70, 80, 90]);
      const B = (total * boys) / 100;
      const G = total - B;
      const passed = whole((B * passB) / 100 + (G * passG) / 100);
      const ans = (passed / total) * 100;
      return numMcq(r, { q: `In a school of ${total} students, ${boys}% are boys. ${passB}% of the boys and ${passG}% of the girls passed an exam. What percentage of all the students passed?`, ans, f: pct, ex: `Boys = ${boys}% of ${total} = ${B}; girls = ${total} − ${B} = ${G}. Boys passed = ${passB}% of ${B} = ${(B * passB) / 100}; girls passed = ${passG}% of ${G} = ${(G * passG) / 100}. Total passed = ${(B * passB) / 100} + ${(G * passG) / 100} = ${passed}. Percentage = ${passed} ÷ ${total} × 100 = ${fmtNum(ans)}%.` });
    },
  ],

  'profit-loss': [
    (r) => {
      const CP = int(r, 3, 30) * 100;
      const l = pick(r, [5, 10, 15, 20]);
      const g = pick(r, [10, 15, 20, 25]);
      const SP1 = (CP * (100 - l)) / 100;
      return numMcq(r, { q: `Selling a watch for ${inr(SP1)} causes a loss of ${l}%. At what price should it be sold to gain ${g}%?`, ans: (CP * (100 + g)) / 100, f: inr, ex: `Cost = ${SP1} ÷ ${(100 - l) / 100} = ${CP}. For a ${g}% gain: ${CP} × ${(100 + g) / 100} = ${inr((CP * (100 + g)) / 100)}.` });
    },
    (r) => {
      const [w, ans] = pick(r, [[800, 25], [900, 11.11], [960, 4.17], [950, 5.26], [875, 14.29], [750, 33.33]]);
      return numMcq(r, { q: `A dishonest shopkeeper claims to sell at cost price but uses a weight of ${w} g instead of 1 kg. What is his gain percent?`, ans, f: pct, near: [100 - w / 10, ans + 3, ans - 2, ans * 1.5], ex: `He gives ${w} g but charges for 1000 g. Gain = ${1000 - w}/${w} × 100 = ${fmtNum(ans)}%.` });
    },
    (r) => {
      const b = int(r, 10, 24);
      const a = b + pick(r, [2, 3, 4, 5, 6]);
      const ans = ((a - b) / b) * 100;
      return numMcq(r, { q: `The cost price of ${a} articles equals the selling price of ${b} articles. What is the profit percent?`, ans, f: pct, ex: `Let each cost ₹1. ${b} articles cost ₹${b} but sell for ₹${a}. Profit = ${a - b}/${b} × 100 = ${fmtNum(ans)}%.` });
    },
    (r) => {
      const d = pick(r, [10, 20, 25]);
      const p = pick(r, [8, 17, 20, 26, 35]);
      const ans = ((100 + p) / (1 - d / 100)) - 100;
      return numMcq(r, { q: `A trader wants a ${p}% profit even after giving a ${d}% discount. By what percent above the cost price should he mark his goods?`, ans: Math.round(ans * 100) / 100, f: pct, ex: `Take cost = 100. Selling price = ${100 + p}, so marked price = ${100 + p} ÷ ${(100 - d) / 100} = ${fmtNum(100 + ans)}: ${fmtNum(ans)}% above cost.` });
    },
  ],

  'simple-interest': [
    (r) => {
      const T = pick(r, [4, 5, 8, 10, 20, 25]);
      return numMcq(r, { q: `A sum of money doubles itself in ${T} years at simple interest. What is the rate of interest per annum?`, ans: 100 / T, f: pct, ex: `Doubling means interest = principal, so R × ${T} = 100 and R = ${fmtNum(100 / T)}%.` });
    },
    (r) => {
      const R = pick(r, [5, 8, 10, 12.5, 20]);
      const T = pick(r, [2, 3, 4, 5, 6, 8]);
      const k = (R * T) / 100;
      const [n, d] = [Math.round(k * 20), 20];
      const g = gcd(n, d);
      return numMcq(r, { q: `The simple interest on a sum for ${T} years is ${n / g}/${d / g} of the sum. What is the rate per annum?`, ans: R, f: pct, ex: `SI/P = R × T / 100, so ${n / g}/${d / g} = R × ${T}/100 and R = ${fmtNum(R)}%.` });
    },
    (r) => {
      const P = int(r, 4, 40) * 500;
      const r1 = pick(r, [8, 10, 12]);
      const r2 = r1 - pick(r, [1, 2, 3]);
      const T = pick(r, [2, 3, 4, 5]);
      return numMcq(r, { q: `What is the difference between the simple interest on ${inr(P)} for ${T} years at ${r1}% and at ${r2}% per annum?`, ans: (P * (r1 - r2) * T) / 100, f: inr, ex: `Difference = P × (${r1} − ${r2}) × ${T}/100 = ${inr((P * (r1 - r2) * T) / 100)}.` });
    },
    (r) => {
      const r1 = pick(r, [8, 10, 12]);
      const r2 = pick(r, [4, 5, 6]);
      const x = int(r, 2, 20) * 500;
      const y = int(r, 2, 20) * 500;
      const I = whole((x * r1 + y * r2) / 100);
      return numMcq(r, { q: `₹${(x + y).toLocaleString('en-IN')} is lent in two parts, one at ${r1}% and the other at ${r2}% simple interest. The total interest after one year is ₹${I.toLocaleString('en-IN')}. How much was lent at ${r1}%?`, ans: x, f: inr, ex: `Let the ${r1}% part be x: ${r1}x/100 + ${r2}(${x + y} − x)/100 = ${I}, which gives x = ${inr(x)}.` });
    },
    (r) => {
      const P = int(r, 4, 30) * 1000;
      const R = pick(r, [5, 6, 8, 10]);
      const t1 = pick(r, [2, 3]);
      const t2 = t1 + pick(r, [2, 3]);
      const A1 = P + (P * R * t1) / 100;
      const A2 = P + (P * R * t2) / 100;
      return numMcq(r, { q: `A sum at simple interest amounts to ${inr(A1)} in ${t1} years and to ${inr(A2)} in ${t2} years. What is the sum?`, ans: P, f: inr, ex: `The extra amount over the extra years is pure interest: ${t2} − ${t1} = ${t2 - t1} years earn ${A2} − ${A1} = ${A2 - A1}. Interest per year = ${A2 - A1} ÷ ${t2 - t1} = ${(A2 - A1) / (t2 - t1)}. In ${t1} years the interest is ${t1} × ${(A2 - A1) / (t2 - t1)} = ${t1 * (A2 - A1) / (t2 - t1)}. Sum = ${A1} − ${t1 * (A2 - A1) / (t2 - t1)} = ${inr(P)}.` });
    },
    (r) => {
      const P = int(r, 2, 20) * 1200;
      const R = pick(r, [6, 8, 9, 10, 12]);
      const M = pick(r, [3, 4, 6, 8, 9]);
      return numMcq(r, { q: `What is the simple interest on ${inr(P)} at ${R}% per annum for ${M} months?`, ans: whole((P * R * M) / 1200), f: inr, ex: `${M} months = ${M}/12 year. SI = ${P} × ${R} × ${M}/12 ÷ 100 = ${inr((P * R * M) / 1200)}.` });
    },
    (r) => {
      const P = int(r, 4, 30) * 1000;
      const r1 = pick(r, [6, 8]);
      const t1 = pick(r, [2, 3]);
      const r2 = pick(r, [9, 10, 12]);
      const t2 = pick(r, [2, 4]);
      return numMcq(r, { q: `${inr(P)} is lent at ${r1}% simple interest for the first ${t1} years and at ${r2}% for the next ${t2} years. What is the total interest?`, ans: (P * (r1 * t1 + r2 * t2)) / 100, f: inr, ex: `${P} × ${r1} × ${t1}/100 + ${P} × ${r2} × ${t2}/100 = ${inr((P * (r1 * t1 + r2 * t2)) / 100)}.` });
    },
  ],

  'compound-interest': [
    (r) => {
      const P = int(r, 1, 9) * 1000;
      const R = pick(r, [10, 20]);
      const A = whole(P * (1 + R / 100) ** 3);
      return numMcq(r, { q: `What will ${inr(P)} amount to in 3 years at ${R}% per annum compound interest?`, ans: A, f: inr, ex: `${P} × ${1 + R / 100}³ = ${inr(A)}.` });
    },
    (r) => {
      const R = pick(r, [5, 10, 20]);
      const P = int(r, 4, 40) * (R === 5 ? 400 : 100);
      const A = whole(P * (1 + R / 100) ** 2);
      return numMcq(r, { q: `At ${R}% per annum compound interest, a sum becomes ${inr(A)} in 2 years. What is the sum?`, ans: P, f: inr, ex: `P = ${A} ÷ ${1 + R / 100}² = ${inr(P)}.` });
    },
    (r) => {
      const R = pick(r, [4, 5, 10]);
      const P = int(r, 2, 20) * (R === 4 ? 625 : 400);
      const diff = whole((P * R * R) / 10000);
      return numMcq(r, { q: `The difference between compound and simple interest on a sum for 2 years at ${R}% per annum is ${inr(diff)}. What is the sum?`, ans: P, f: inr, ex: `For 2 years, CI − SI = P(R/100)², so P = ${diff} × (100/${R})² = ${inr(P)}.` });
    },
    (r) => {
      const n = pick(r, [3, 4, 5, 6, 8]);
      const k = pick(r, [[4, 2], [8, 3], [16, 4]]);
      return numMcq(r, { q: `A sum doubles in ${n} years at compound interest. In how many years will it become ${k[0]} times itself?`, ans: n * k[1], f: (v) => `${v} years`, ex: `${k[0]} = 2^${k[1]}, so it takes ${k[1]} doubling periods: ${k[1]} × ${n} = ${n * k[1]} years.` });
    },
    (r) => {
      const R = pick(r, [5, 10, 20]);
      const P = int(r, 4, 40) * (R === 5 ? 400 : 100);
      const A = P * (1 + R / 100) ** 2;
      return numMcq(r, { q: `At what rate of compound interest per annum does ${inr(P)} become ${inr(A)} in 2 years?`, ans: R, f: pct, ex: `For compound interest, amount ÷ principal = (1 + R/100)². Here ${fmtNum(A)} ÷ ${P} = ${fmtNum(A / P)}. The square root of ${fmtNum(A / P)} is ${fmtNum(1 + R / 100)}, so 1 + R/100 = ${fmtNum(1 + R / 100)} and R = ${R}%.` });
    },
    (r) => {
      const P = int(r, 4, 40) * 400;
      const A = whole(P * 1.05 * 1.05);
      return numMcq(r, { q: `What is the compound interest on ${inr(P)} for 6 months at 20% per annum, compounded quarterly?`, ans: whole(A - P), f: inr, ex: `Quarterly rate 5% for 2 quarters: ${P} × 1.05² = ${A}. CI = ${inr(A - P)}.` });
    },
    (r) => {
      const R = pick(r, [5, 10, 20]);
      const P = int(r, 2, 9) * (R === 5 ? 40000 : 10000);
      const ans = whole(P * (1 - R / 100) ** 2);
      return numMcq(r, { q: `The population of a village is ${P.toLocaleString('en-IN')} and falls by ${R}% every year. What will it be after 2 years?`, ans, f: (v) => v.toLocaleString('en-IN'), ex: `A ${R}% fall each year multiplies the population by (1 − ${R}/100) = ${1 - R / 100}. After year 1: ${P.toLocaleString('en-IN')} × ${1 - R / 100} = ${((P * (100 - R)) / 100).toLocaleString('en-IN')}. After year 2: ${((P * (100 - R)) / 100).toLocaleString('en-IN')} × ${1 - R / 100} = ${ans.toLocaleString('en-IN')}.` });
    },
    (r) => {
      const R = pick(r, [10, 20]);
      const V = int(r, 2, 9) * 10000;
      const n = pick(r, [2, 3]);
      const ans = whole(V * (1 - R / 100) ** n);
      return numMcq(r, { q: `A machine bought for ${inr(V)} loses ${R}% of its value every year. What is it worth after ${n} years?`, ans, f: inr, ex: `${V} × ${1 - R / 100}^${n} = ${inr(ans)}.` });
    },
    (r) => {
      const R = pick(r, [10, 20]);
      const P = int(r, 2, 40) * 500;
      const ans = whole((P * (100 + R) * R) / 10000);
      return numMcq(r, { q: `What is the compound interest on ${inr(P)} for the second year only, at ${R}% per annum?`, ans, f: inr, ex: `After year 1 the amount is ${(P * (100 + R)) / 100}; year 2 interest = ${R}% of that = ${inr(ans)}.` });
    },
    (r) => {
      const P = int(r, 2, 40) * 500;
      const r1 = pick(r, [10, 20]);
      const r2 = pick(r, [10, 20].filter((x) => x !== r1).concat([30]));
      const ans = whole((P * (100 + r1) * (100 + r2)) / 10000 - P);
      return numMcq(r, { q: `What is the compound interest on ${inr(P)} for 2 years if the rate is ${r1}% in the first year and ${r2}% in the second year?`, ans, f: inr, ex: `Year 1 at ${r1}%: multiply by ${1 + r1 / 100}: ${P} × ${1 + r1 / 100} = ${(P * (100 + r1)) / 100}. Year 2 at ${r2}%: multiply by ${1 + r2 / 100}: ${(P * (100 + r1)) / 100} × ${1 + r2 / 100} = ${P + ans}. Compound interest = amount − principal = ${P + ans} − ${P} = ${inr(ans)}.` });
    },
  ],

  'ratio-proportion': [
    (r) => {
      const [a, b] = pick(r, [[3, 5], [2, 3], [4, 7], [5, 9]]);
      const k = int(r, 3, 15);
      const x = int(r, 2, 8);
      const g = gcd(a * k - x, b * k - x);
      if (a * k - x <= 0) throw new Error('neg');
      return numMcq(r, { q: `Two numbers are in the ratio ${a}:${b}. If ${x} is subtracted from each, the ratio becomes ${(a * k - x) / g}:${(b * k - x) / g}. What is the larger number?`, ans: b * k, ex: `Let them be ${a}k and ${b}k: (${a}k − ${x})/(${b}k − ${x}) = ${(a * k - x) / g}/${(b * k - x) / g} gives k = ${k}, so the larger is ${b * k}.` });
    },
    (r) => {
      const [a, b] = pick(r, [[2, 3], [3, 4], [4, 5], [5, 7]]);
      const k = int(r, 1000, 4000) / 100;
      const inc = pick(r, [[20, 10], [25, 20], [10, 20], [50, 25]]);
      const n = a * (100 + inc[0]);
      const m = b * (100 + inc[1]);
      const g = gcd(n, m);
      return mcq(r, { q: `The salaries of A and B are in the ratio ${a}:${b}. If A's salary rises by ${inc[0]}% and B's by ${inc[1]}%, what is the new ratio?`, correct: `${n / g}:${m / g}`, wrong: [`${a}:${b}`, `${a + 1}:${b + 1}`, `${m / g}:${n / g}`, `${n / g + 1}:${m / g}`], ex: `A rise of ${inc[0]}% multiplies A's share by ${(100 + inc[0]) / 100}: ${a} × ${(100 + inc[0]) / 100} = ${fmtNum((a * (100 + inc[0])) / 100)}. A rise of ${inc[1]}% multiplies B's share by ${(100 + inc[1]) / 100}: ${b} × ${(100 + inc[1]) / 100} = ${fmtNum((b * (100 + inc[1])) / 100)}. New ratio = ${fmtNum((a * (100 + inc[0])) / 100)} : ${fmtNum((b * (100 + inc[1])) / 100)} = ${n}:${m} (× 100) = ${n / g}:${m / g}.` });
    },
    (r) => {
      const [a, b, c] = [int(r, 1, 5), int(r, 2, 6), int(r, 3, 7)];
      const k = int(r, 50, 400);
      const T = (a + b + c) * k;
      return numMcq(r, { q: `₹${T.toLocaleString('en-IN')} is divided among A, B and C in the ratio ${a}:${b}:${c}. What is C's share?`, ans: c * k, f: inr, ex: `C gets ${c}/${a + b + c} × ${T} = ${inr(c * k)}.` });
    },
    (r) => {
      const [a, b, c, d] = [int(r, 2, 7), int(r, 3, 8), int(r, 2, 7), int(r, 3, 9)];
      const n = a * c;
      const m = b * d;
      const g = gcd(n, m);
      return mcq(r, { q: `If A:B = ${a}:${b} and B:C = ${c}:${d}, what is A:C?`, correct: `${n / g}:${m / g}`, wrong: [`${a}:${d}`, `${c}:${b}`, `${a * d}:${b * c}`, `${n / g + 1}:${m / g}`], ex: `A:C = (A/B) × (B/C) = ${a}/${b} × ${c}/${d} = ${n}/${m} = ${n / g}:${m / g}.` });
    },
    (r) => {
      const [x, y] = [int(r, 2, 9), int(r, 2, 9)];
      const a = x * x * int(r, 1, 3);
      const k = a / (x * x);
      const b = y * y * k;
      return numMcq(r, { q: `What is the mean proportional between ${a} and ${b}?`, ans: Math.sqrt(a * b), ex: `Mean proportional = √(${a} × ${b}) = ${Math.sqrt(a * b)}.` });
    },
    (r) => {
      const a = int(r, 2, 9);
      const b = a * int(r, 2, 5);
      const c = int(r, 2, 12) * a;
      return numMcq(r, { q: `What is the fourth proportional to ${a}, ${b} and ${c}?`, ans: (b * c) / a, ex: `${a} : ${b} = ${c} : x, so x = ${b} × ${c} / ${a} = ${(b * c) / a}.` });
    },
    (r) => {
      const [a, b, c] = pick(r, [[1, 2, 4], [2, 3, 4], [1, 2, 3], [3, 2, 1], [2, 1, 4]]);
      const k = int(r, 4, 40);
      const value = a * k * 1 + b * k * 0.5 + c * k * 0.25;
      if (!Number.isInteger(value)) throw new Error('paise');
      return numMcq(r, { q: `A bag has ₹1, 50-paise and 25-paise coins in the ratio ${a}:${b}:${c}, worth ₹${value} in all. How many 50-paise coins are there?`, ans: b * k, ex: `Value per set = ${a} × 1 + ${b} × 0.5 + ${c} × 0.25 = ₹${a + b * 0.5 + c * 0.25}. Sets = ${value} ÷ ${a + b * 0.5 + c * 0.25} = ${k}, so 50-paise coins = ${b} × ${k} = ${b * k}.` });
    },
  ],

  averages: [
    (r) => {
      const n = int(r, 10, 99);
      return numMcq(r, { q: `What is the average of the first ${n} natural numbers?`, ans: (n + 1) / 2, ex: `Sum = ${n}(${n} + 1)/2, so the average = (${n} + 1)/2 = ${fmtNum((n + 1) / 2)}.` });
    },
    (r) => {
      const n = pick(r, [5, 7, 9]);
      const avg = int(r, 20, 80) * 2;
      return numMcq(r, { q: `The average of ${n} consecutive even numbers is ${avg}. What is the largest of them?`, ans: avg + (n - 1), ex: `In a list of evenly spaced numbers, the middle one equals the average, so the middle (${(n + 1) / 2}th) number is ${avg}. The largest is ${(n - 1) / 2} places after it, each place adding 2: ${avg} + ${(n - 1) / 2} × 2 = ${avg + n - 1}.` });
    },
    (r) => {
      const n = int(r, 8, 20);
      const A = int(r, 25, 60);
      const k = pick(r, [1, 2, 3, 4]);
      return numMcq(r, { q: `A batsman's average after ${n} innings is ${A}. How many runs must he score in the next innings to raise his average by ${k}?`, ans: A + (n + 1) * k, ex: `New total = ${n + 1} × ${A + k} = ${(n + 1) * (A + k)}; old total = ${n * A}. Runs needed = ${(n + 1) * (A + k) - n * A}.` });
    },
    (r) => {
      const [v1, v2] = pick(r, [[40, 60], [30, 60], [20, 30], [60, 90], [45, 90], [36, 45], [48, 72]]);
      return numMcq(r, { q: `A car goes from A to B at ${v1} km/h and returns at ${v2} km/h. What is its average speed for the whole journey?`, ans: (2 * v1 * v2) / (v1 + v2), f: (v) => `${fmtNum(v)} km/h`, near: [(v1 + v2) / 2, (2 * v1 * v2) / (v1 + v2) + 4, (2 * v1 * v2) / (v1 + v2) - 3], ex: `For equal distances, average speed = 2 × ${v1} × ${v2} / (${v1} + ${v2}) = ${fmtNum((2 * v1 * v2) / (v1 + v2))} km/h.` });
    },
    (r) => {
      const n1 = int(r, 20, 50);
      const n2 = int(r, 20, 50);
      const a1 = int(r, 40, 70);
      const a2 = int(r, 50, 80);
      const ans = Math.round(((n1 * a1 + n2 * a2) / (n1 + n2)) * 100) / 100;
      return numMcq(r, { q: `Section A has ${n1} students with average marks ${a1}, and section B has ${n2} students with average ${a2}. What is the average of both sections together?`, ans, ex: `Total marks of A = ${n1} × ${a1} = ${n1 * a1}. Total marks of B = ${n2} × ${a2} = ${n2 * a2}. Together: ${n1 * a1} + ${n2 * a2} = ${n1 * a1 + n2 * a2} marks for ${n1} + ${n2} = ${n1 + n2} students. Average = ${n1 * a1 + n2 * a2} ÷ ${n1 + n2} = ${fmtNum(ans)}.` });
    },
  ],

  ages: [
    (r) => {
      const son = int(r, 5, 15);
      const k = pick(r, [3, 4]);
      const S = son * (k + 1);
      return numMcq(r, { q: `A father is ${k} times as old as his son. The sum of their ages is ${S} years. How old is the son?`, ans: son, f: (v) => `${v} years`, ex: `son + ${k} × son = ${S}, so son = ${S}/${k + 1} = ${son} years.` });
    },
    (r) => {
      const a = int(r, 20, 40);
      const b = a - int(r, 3, 10);
      const n = int(r, 3, 10);
      return numMcq(r, { q: `${n} years ago the sum of the ages of two sisters was ${a + b - 2 * n} years, and the elder is ${a - b} years older than the younger. How old is the elder sister now?`, ans: a, f: (v) => `${v} years`, ex: `Present sum = ${a + b - 2 * n} + ${2 * n} = ${a + b}. Elder = (${a + b} + ${a - b})/2 = ${a} years.` });
    },
    (r) => {
      const x = int(r, 6, 15);
      const k = pick(r, [2, 3]);
      const n = int(r, 4, 12);
      const father = k * (x + n) - n;
      return numMcq(r, { q: `A father is ${father} years old and his son is ${x}. In how many years will the father be ${k} times as old as his son?`, ans: n, f: (v) => `${v} years`, ex: `${father} + n = ${k}(${x} + n), so n = (${father} − ${k * x})/(${k} − 1) = ${n} years.` });
    },
    (r) => {
      const kids = int(r, 3, 6);
      const avg = int(r, 8, 14);
      const mother = int(r, 30, 45);
      return numMcq(r, { q: `The average age of ${kids} children is ${avg} years. If their mother's age is included, the average rises to ${fmtNum((kids * avg + mother) / (kids + 1))}. How old is the mother?`, ans: mother, f: (v) => `${v} years`, ex: `Total with mother = ${kids + 1} × ${fmtNum((kids * avg + mother) / (kids + 1))} = ${kids * avg + mother}; children = ${kids * avg}. Mother = ${mother} years.` });
    },
    (r) => {
      const k = pick(r, [2, 3]);
      const y = int(r, 2, 8);
      const S = 5 * y + 10 * k;
      return numMcq(r, { q: `The sum of the ages of 5 children born ${k} years apart is ${S} years. How old is the youngest child?`, ans: y, f: (v) => `${v} years`, ex: `Ages are y, y + ${k}, …, y + ${4 * k}. Sum = 5y + ${10 * k} = ${S}, so y = ${y}.` });
    },
    (r) => {
      const [a, b] = pick(r, [[3, 5], [2, 3], [4, 7], [5, 8], [3, 4]]);
      const k = int(r, 3, 10);
      const n = int(r, 3, 12);
      const A = a * k;
      const B = b * k;
      const g = gcd(A + n, B + n);
      return numMcq(r, { q: `The present ages of A and B are in the ratio ${a}:${b}. After ${n} years the ratio will be ${(A + n) / g}:${(B + n) / g}. What is B's present age?`, ans: B, f: (v) => `${v} years`, ex: `Let the ages be ${a}x and ${b}x. (${a}x + ${n})/(${b}x + ${n}) = ${(A + n) / g}/${(B + n) / g} gives x = ${k}, so B = ${B}.` });
    },
  ],

  'time-and-work': [
    (r) => {
      const k = pick(r, [2, 3, 4]);
      const t = int(r, 4, 16);
      return numMcq(r, { q: `A is ${k} times as efficient as B. Working together they finish a job in ${t} days. How long would B take alone?`, ans: t * (k + 1), f: (v) => `${v} days`, ex: `Let B do 1 unit of work a day; then A does ${k} units, so together they do ${k} + 1 = ${k + 1} units a day. In ${t} days they finish the job: total work = ${k + 1} × ${t} = ${(k + 1) * t} units. B alone does 1 unit a day, so B takes ${(k + 1) * t} days.` });
    },
    (r) => {
      const [a, b, c] = pick(r, [[10, 15, 30], [12, 18, 36], [6, 12, 12], [20, 30, 60], [8, 12, 24]]);
      return numMcq(r, { q: `A, B and C can finish a job alone in ${a}, ${b} and ${c} days. How many days will they take working together?`, ans: Math.round((1 / (1 / a + 1 / b + 1 / c)) * 100) / 100, f: (v) => `${fmtNum(v)} days`, ex: `1/${a} + 1/${b} + 1/${c} = ${fmtNum(1 / a + 1 / b + 1 / c)} of the job a day, so ${fmtNum(1 / (1 / a + 1 / b + 1 / c))} days.` });
    },
    (r) => {
      const [ab, bc, ca] = pick(r, [[12, 15, 20], [10, 15, 30], [6, 10, 15], [8, 12, 24], [20, 30, 60]]);
      const all = 2 / (1 / ab + 1 / bc + 1 / ca);
      return numMcq(r, { q: `A and B together finish a job in ${ab} days, B and C in ${bc} days, and C and A in ${ca} days. How long will A, B and C take together?`, ans: Math.round(all * 100) / 100, f: (v) => `${fmtNum(v)} days`, ex: `Adding the three pairs counts everyone twice: 2(A + B + C) = 1/${ab} + 1/${bc} + 1/${ca}, so together they take ${fmtNum(all)} days.` });
    },
    (r) => {
      const m1 = int(r, 4, 12);
      const d1 = int(r, 6, 20);
      const h1 = pick(r, [6, 8]);
      const h2 = pick(r, [4, 6, 8, 10].filter((x) => x !== h1));
      const d2 = int(r, 4, 16);
      const m2 = (m1 * d1 * h1) / (d2 * h2);
      if (!Number.isInteger(m2)) throw new Error('awkward');
      return numMcq(r, { q: `${m1} men working ${h1} hours a day finish a job in ${d1} days. How many men are needed to finish it in ${d2} days working ${h2} hours a day?`, ans: m2, f: (v) => `${v} men`, ex: `Men × days × hours stays constant: ${m1} × ${d1} × ${h1} = m × ${d2} × ${h2}, so m = ${m2}.` });
    },
    (r) => {
      const a = pick(r, [10, 12, 15, 20]);
      const b = pick(r, [15, 20, 30, 40].filter((x) => x !== a));
      const pay = int(r, 6, 30) * 100;
      const shareA = (pay * b) / (a + b);
      if (!Number.isInteger(shareA)) throw new Error('awkward');
      return numMcq(r, { q: `A can do a job in ${a} days and B in ${b} days. They finish it together and are paid ₹${pay.toLocaleString('en-IN')}. What is A's share?`, ans: shareA, f: inr, ex: `In one day A does 1/${a} of the job and B does 1/${b}. Working the same number of days, their shares are in the ratio 1/${a} : 1/${b}. Multiply both by ${a * b}: ${b} : ${a}. Total parts = ${b} + ${a} = ${a + b}. A gets ${b}/${a + b} × ${pay} = ${inr(shareA)}.` });
    },
    (r) => {
      const a = pick(r, [12, 15, 18, 20, 24]);
      const k = pick(r, [3, 4, 5, 6]);
      const done = k / a;
      const b = pick(r, [10, 12, 15, 30].filter((x) => x !== a));
      return numMcq(r, { q: `A can finish a job in ${a} days. He works for ${k} days and then B finishes the rest in ${fmtNum(b * (1 - done))} days. How long would B take to do the whole job alone?`, ans: b, f: (v) => `${v} days`, ex: `A does 1/${a} of the job each day, so in ${k} days he does ${k}/${a} = ${fmtNum(done)} of it. Work left = 1 − ${fmtNum(done)} = ${fmtNum(1 - done)}. B does that ${fmtNum(1 - done)} in ${fmtNum(b * (1 - done))} days, so the whole job (1) takes him ${fmtNum(b * (1 - done))} ÷ ${fmtNum(1 - done)} = ${b} days.` });
    },
  ],

  'pipes-and-cisterns': [
    (r) => {
      const [a, b] = pick(r, [[4, 6], [6, 9], [3, 4], [5, 7.5], [8, 12], [10, 15], [6, 10]]);
      return numMcq(r, { q: `Pipe A fills a tank in ${fmtNum(a)} hours and pipe B empties it in ${fmtNum(b)} hours. If both are open, how long does the empty tank take to fill?`, ans: (a * b) / (b - a), f: (v) => `${fmtNum(v)} hours`, ex: `Net rate = 1/${fmtNum(a)} − 1/${fmtNum(b)}, so time = ${fmtNum(a)} × ${fmtNum(b)} / (${fmtNum(b)} − ${fmtNum(a)}) = ${fmtNum((a * b) / (b - a))} hours.` });
    },
    (r) => {
      const [a, b, c] = pick(r, [[10, 12, 15], [6, 12, 12], [4, 6, 12], [5, 10, 10], [12, 15, 20], [6, 8, 24]]);
      const ans = 1 / (1 / a + 1 / b + 1 / c);
      return numMcq(r, { q: `Three pipes can fill a tank in ${a}, ${b} and ${c} hours respectively. How long will they take together?`, ans: Math.round(ans * 100) / 100, f: (v) => `${fmtNum(v)} hours`, ex: `1/${a} + 1/${b} + 1/${c} = ${fmtNum(1 / ans)} of the tank per hour, so ${fmtNum(ans)} hours.` });
    },
    (r) => {
      const [a, t] = pick(r, [[12, 8], [10, 6], [15, 10], [20, 12], [30, 12], [18, 9]]);
      return numMcq(r, { q: `Two pipes together fill a tank in ${t} hours. One of them alone takes ${a} hours. How long would the other take alone?`, ans: (a * t) / (a - t), f: (v) => `${fmtNum(v)} hours`, ex: `1/${t} − 1/${a} = 1/${fmtNum((a * t) / (a - t))}, so ${fmtNum((a * t) / (a - t))} hours.` });
    },
    (r) => {
      const [a, b] = pick(r, [[6, 8], [5, 6], [8, 10], [10, 12], [4, 5], [12, 15]]);
      return numMcq(r, { q: `A pipe fills a tank in ${a} hours, but because of a leak it takes ${b} hours. How long would the leak take to empty a full tank?`, ans: (a * b) / (b - a), f: (v) => `${fmtNum(v)} hours`, ex: `Leak rate = 1/${a} − 1/${b}, so it empties the tank in ${a} × ${b} / ${b - a} = ${fmtNum((a * b) / (b - a))} hours.` });
    },
    (r) => {
      const [a, b] = pick(r, [[10, 15], [12, 18], [20, 30], [6, 12], [15, 20]]);
      const k = pick(r, [2, 3, 4]);
      const left = 1 - k * (1 / a + 1 / b);
      if (left <= 0) throw new Error('full');
      return numMcq(r, { q: `Pipes A and B fill a tank in ${a} and ${b} hours. Both are opened for ${k} hours and then A is closed. How much longer does B take to fill the tank?`, ans: Math.round(left * b * 100) / 100, f: (v) => `${fmtNum(v)} hours`, ex: `Together A and B fill 1/${a} + 1/${b} of the tank per hour. In ${k} hours: ${k} × (1/${a} + 1/${b}) = ${fmtNum(1 - left)} of the tank. Left to fill = 1 − ${fmtNum(1 - left)} = ${fmtNum(left)}. B alone fills 1/${b} per hour, so it needs ${fmtNum(left)} × ${b} = ${fmtNum(left * b)} hours.` });
    },
    (r) => {
      const L = int(r, 5, 30) * 10;
      const t = int(r, 6, 40);
      return numMcq(r, { q: `A pipe pours ${L} litres a minute and fills a tank in ${t} minutes. What is the capacity of the tank?`, ans: L * t, f: (v) => `${v.toLocaleString('en-IN')} litres`, ex: `${L} × ${t} = ${(L * t).toLocaleString('en-IN')} litres.` });
    },
    (r) => {
      const [a, b] = pick(r, [[10, 15], [12, 24], [20, 30], [8, 12]]);
      const k = pick(r, [2, 3]);
      const done = k * (1 / a + 1 / b);
      if (done >= 1) throw new Error('full');
      const g = 60 * a * b;
      const n = Math.round(done * g);
      return mcq(r, { q: `Pipes A and B can fill a tank in ${a} and ${b} hours. What fraction of the tank is filled if both run for ${k} hours?`, correct: frac(n, g), wrong: [frac(k, a + b), frac(k, a), frac(k, b), frac(n + 60, g)], ex: `${k} × (1/${a} + 1/${b}) = ${frac(n, g)} of the tank.` });
    },
    (r) => {
      const k = pick(r, [3, 4, 5, 6]);
      const m = int(r, 5, 20);
      return numMcq(r, { q: `A pipe fills 1/${k} of a tank in ${m} minutes. How long will it take to fill the whole tank?`, ans: k * m, f: (v) => `${v} minutes`, ex: `${k} × ${m} = ${k * m} minutes.` });
    },
  ],

  'speed-distance': [
    (r) => {
      const v = pick(r, [18, 36, 54, 72, 90, 108, 126, 144]);
      return numMcq(r, { q: `Convert ${v} km/h into metres per second.`, ans: (v * 5) / 18, f: (x) => `${fmtNum(x)} m/s`, ex: `Multiply by 5/18: ${v} × 5/18 = ${(v * 5) / 18} m/s.` });
    },
    (r) => {
      const v1 = int(r, 3, 6);
      const v2 = v1 + int(r, 1, 4);
      const t = pick(r, [1, 2, 3]);
      return numMcq(r, { q: `A walks at ${v1} km/h. ${t} hour${t > 1 ? 's' : ''} later, B starts from the same place in the same direction at ${v2} km/h. How long after B starts will he catch A?`, ans: (v1 * t) / (v2 - v1), f: (x) => `${fmtNum(x)} hours`, ex: `A's head start = ${v1 * t} km. B gains ${v2 - v1} km/h, so ${v1 * t}/${v2 - v1} = ${fmtNum((v1 * t) / (v2 - v1))} hours.` });
    },
    (r) => {
      const [n, d] = pick(r, [[3, 4], [4, 5], [2, 3], [5, 6]]);
      const late = int(r, 10, 30);
      const usual = (n * late) / (d - n);
      return numMcq(r, { q: `Walking at ${n}/${d} of his usual speed, a man reaches his office ${late} minutes late. What is his usual time?`, ans: usual, f: (x) => `${fmtNum(x)} minutes`, ex: `At ${n}/${d} speed he takes ${d}/${n} of the usual time, so the extra ${d - n}/${n} of the usual time = ${late} min. Usual time = ${late} × ${n}/${d - n} = ${fmtNum(usual)} minutes.` });
    },
    (r) => {
      const v = int(r, 30, 70);
      const t1 = pick(r, [3, 4, 5, 6]);
      const t2 = pick(r, [2, 3, 4].filter((x) => x < t1));
      return numMcq(r, { q: `A car covers a distance in ${t1} hours at ${v} km/h. At what speed must it travel to cover the same distance in ${t2} hours?`, ans: (v * t1) / t2, f: (x) => `${fmtNum(x)} km/h`, ex: `Distance = ${v * t1} km, so speed = ${v * t1}/${t2} = ${fmtNum((v * t1) / t2)} km/h.` });
    },
  ],

  trains: [
    (r) => {
      const v = pick(r, [36, 54, 72, 90]);
      const t = int(r, 15, 40);
      const total = (v * 5 * t) / 18;
      const L = Math.round(total * pick(r, [0.4, 0.5, 0.6]));
      return numMcq(r, { q: `A train ${L} m long crosses a platform ${total - L} m long in ${t} seconds. What is its speed in km/h?`, ans: v, f: (x) => `${x} km/h`, ex: `Distance = ${L} + ${total - L} = ${total} m in ${t} s = ${total / t} m/s = ${v} km/h.` });
    },
    (r) => {
      const [v1, v2] = [pick(r, [36, 45, 54, 60]), pick(r, [36, 54, 72, 90])];
      const t = int(r, 6, 15);
      const L = (v1 + v2) * 5 * t / 18;
      const L1 = Math.round(L * 0.4);
      return numMcq(r, { q: `Two trains ${L1} m and ${fmtNum(L - L1)} m long run on parallel tracks in opposite directions at ${v1} km/h and ${v2} km/h. How long do they take to cross each other?`, ans: t, f: (x) => `${fmtNum(x)} seconds`, ex: `Relative speed = ${v1 + v2} km/h = ${fmtNum(((v1 + v2) * 5) / 18)} m/s. Time = ${fmtNum(L)} / ${fmtNum(((v1 + v2) * 5) / 18)} = ${t} s.` });
    },
    (r) => {
      const v2 = pick(r, [36, 45, 54]);
      const v1 = v2 + pick(r, [18, 36]);
      const t = int(r, 20, 50);
      const L = ((v1 - v2) * 5 * t) / 18;
      const L1 = Math.round(L / 2);
      return numMcq(r, { q: `A ${L1} m train running at ${v1} km/h overtakes a ${fmtNum(L - L1)} m train running at ${v2} km/h in the same direction. How long does it take to pass it completely?`, ans: t, f: (x) => `${fmtNum(x)} seconds`, ex: `Relative speed = ${v1 - v2} km/h = ${fmtNum(((v1 - v2) * 5) / 18)} m/s. Time = ${fmtNum(L)} / ${fmtNum(((v1 - v2) * 5) / 18)} = ${t} s.` });
    },
    (r) => {
      const v = pick(r, [45, 54, 63, 72]);
      const w = pick(r, [9]);
      const t = int(r, 8, 20);
      return numMcq(r, { q: `A train at ${v} km/h passes a man walking at ${w} km/h in the same direction in ${t} seconds. How long is the train?`, ans: ((v - w) * 5 * t) / 18, f: (x) => `${fmtNum(x)} m`, ex: `Relative speed = ${v - w} km/h = ${((v - w) * 5) / 18} m/s. Length = ${((v - w) * 5) / 18} × ${t} = ${((v - w) * 5 * t) / 18} m.` });
    },
    (r) => {
      const v = pick(r, [45, 54, 63, 81]);
      const w = 9;
      const t = int(r, 6, 16);
      return numMcq(r, { q: `A train running at ${v} km/h passes a man coming from the opposite direction at ${w} km/h in ${t} seconds. What is the length of the train?`, ans: ((v + w) * 5 * t) / 18, f: (x) => `${fmtNum(x)} m`, ex: `Relative speed = ${v + w} km/h = ${((v + w) * 5) / 18} m/s. Length = ${((v + w) * 5) / 18} × ${t} = ${((v + w) * 5 * t) / 18} m.` });
    },
    (r) => {
      const v = pick(r, [10, 15, 20, 25]);
      const t1 = int(r, 8, 20);
      const t2 = t1 + int(r, 8, 25);
      return numMcq(r, { q: `A train crosses a pole in ${t1} seconds and a ${v * (t2 - t1)} m platform in ${t2} seconds. How long is the train?`, ans: v * t1, f: (x) => `${x} m`, ex: `Crossing the pole takes ${t1} s (its own length); crossing the platform takes ${t2} s (its length plus the platform). So the extra ${t2} − ${t1} = ${t2 - t1} s is spent covering just the ${v * (t2 - t1)} m platform. Speed = ${v * (t2 - t1)} ÷ ${t2 - t1} = ${v} m/s. Length = speed × pole time = ${v} × ${t1} = ${v * t1} m.` });
    },
    (r) => {
      const v1 = int(r, 40, 80);
      const v2 = int(r, 40, 80);
      const t = pick(r, [2, 3, 4, 5]);
      return numMcq(r, { q: `Two trains start at the same time from stations ${(v1 + v2) * t} km apart and travel towards each other at ${v1} km/h and ${v2} km/h. After how long do they meet?`, ans: t, f: (x) => `${x} hours`, ex: `Moving towards each other, they close the gap at ${v1} + ${v2} = ${v1 + v2} km/h. Time to meet = distance ÷ closing speed = ${(v1 + v2) * t} ÷ ${v1 + v2} = ${t} hours.` });
    },
    (r) => {
      const v = pick(r, [36, 54, 72]);
      const L = int(r, 10, 30) * 10;
      const B = int(r, 10, 50) * 10;
      return numMcq(r, { q: `How long does a ${L} m train running at ${v} km/h take to cross a bridge ${B} m long?`, ans: (L + B) / ((v * 5) / 18), f: (x) => `${fmtNum(x)} seconds`, ex: `Distance = ${L + B} m at ${(v * 5) / 18} m/s = ${fmtNum((L + B) / ((v * 5) / 18))} s.` });
    },
    (r) => {
      const [v1, v2] = [pick(r, [36, 54, 72]), pick(r, [36, 54, 72])];
      const t = int(r, 6, 12);
      return numMcq(r, { q: `Two trains of equal length running in opposite directions at ${v1} km/h and ${v2} km/h cross each other in ${t} seconds. How long is each train?`, ans: (((v1 + v2) * 5) / 18) * t / 2, f: (x) => `${fmtNum(x)} m`, ex: `Moving towards each other, relative speed = ${v1} + ${v2} = ${v1 + v2} km/h. In m/s: ${v1 + v2} × 5/18 = ${((v1 + v2) * 5) / 18} m/s. In ${t} s they cover ${((v1 + v2) * 5) / 18} × ${t} = ${(((v1 + v2) * 5) / 18) * t} m, which is both trains together. Each train = ${(((v1 + v2) * 5) / 18) * t} ÷ 2 = ${fmtNum((((v1 + v2) * 5) / 18) * t / 2)} m.` });
    },
  ],

  'boats-streams': [
    (r) => {
      const b = int(r, 8, 20);
      const s = int(r, 1, 6);
      return numMcq(r, { q: `A boat goes downstream at ${b + s} km/h and upstream at ${b - s} km/h. What is its speed in still water?`, ans: b, f: (x) => `${x} km/h`, ex: `Still-water speed = (${b + s} + ${b - s})/2 = ${b} km/h.` });
    },
    (r) => {
      const b = int(r, 8, 20);
      const s = int(r, 1, 6);
      return numMcq(r, { q: `A man rows downstream at ${b + s} km/h and upstream at ${b - s} km/h. What is the speed of the current?`, ans: s, f: (x) => `${x} km/h`, ex: `Current = (${b + s} − ${b - s})/2 = ${s} km/h.` });
    },
    (r) => {
      const b = int(r, 8, 16);
      const s = int(r, 2, 5);
      const t1 = pick(r, [2, 3, 4]);
      const D = (b + s) * t1;
      const t2 = D / (b - s);
      return numMcq(r, { q: `A boat covers ${D} km downstream in ${t1} hours and the same distance upstream in ${fmtNum(t2)} hours. What is the speed of the boat in still water?`, ans: b, f: (x) => `${x} km/h`, ex: `Downstream speed = distance ÷ time = ${D} ÷ ${t1} = ${b + s} km/h. Upstream speed = ${D} ÷ ${fmtNum(t2)} = ${fmtNum(b - s)} km/h. Boat speed in still water = (downstream + upstream) ÷ 2 = (${b + s} + ${fmtNum(b - s)}) ÷ 2 = ${b} km/h.` });
    },
    (r) => {
      const b = int(r, 8, 16);
      const s = int(r, 2, 4);
      const D = (b * b - s * s) * pick(r, [1, 2]);
      return numMcq(r, { q: `A boat's speed in still water is ${b} km/h and the stream flows at ${s} km/h. How long does it take to go ${D} km downstream and come back?`, ans: D / (b + s) + D / (b - s), f: (x) => `${fmtNum(x)} hours`, ex: `Downstream speed = ${b} + ${s} = ${b + s} km/h, so going takes ${D} ÷ ${b + s} = ${fmtNum(D / (b + s))} h. Upstream speed = ${b} − ${s} = ${b - s} km/h, so returning takes ${D} ÷ ${b - s} = ${fmtNum(D / (b - s))} h. Total = ${fmtNum(D / (b + s))} + ${fmtNum(D / (b - s))} = ${fmtNum(D / (b + s) + D / (b - s))} hours.` });
    },
    (r) => {
      const k = pick(r, [2, 3]);
      const s = int(r, 2, 6);
      const b = (s * (k + 1)) / (k - 1);
      return numMcq(r, { q: `A man takes ${k} times as long to row a distance upstream as to row it downstream. If the stream flows at ${s} km/h, what is his speed in still water?`, ans: b, f: (x) => `${fmtNum(x)} km/h`, ex: `(b + ${s})/(b − ${s}) = ${k}, so b = ${s}(${k} + 1)/(${k} − 1) = ${fmtNum(b)} km/h.` });
    },
    (r) => {
      const b = int(r, 6, 12);
      const s = int(r, 1, 3);
      const D = int(r, 1, 4) * (b * b - s * s);
      const T = D / (b + s) + D / (b - s);
      return numMcq(r, { q: `A boatman rows to a place and back in ${fmtNum(T)} hours. His speed in still water is ${b} km/h and the current is ${s} km/h. How far is the place?`, ans: D, f: (x) => `${x} km`, ex: `Downstream speed = ${b} + ${s} = ${b + s} km/h; upstream speed = ${b} − ${s} = ${b - s} km/h. Time there and back: D/${b + s} + D/${b - s} = ${fmtNum(T)}. Combine the fractions: D × (${b - s} + ${b + s}) / (${b + s} × ${b - s}) = D × ${2 * b}/${(b + s) * (b - s)} = ${fmtNum(T)}. So D = ${fmtNum(T)} × ${(b + s) * (b - s)} ÷ ${2 * b} = ${D} km.` });
    },
    (r) => {
      const b = int(r, 6, 15);
      const s = int(r, 1, 4);
      const t = pick(r, [2, 3, 4, 5]);
      return numMcq(r, { q: `A swimmer can swim at ${b} km/h in still water. How far can he go against a ${s} km/h current in ${t} hours?`, ans: (b - s) * t, f: (x) => `${x} km`, ex: `Upstream speed = ${b} − ${s} = ${b - s} km/h, so ${(b - s)} × ${t} = ${(b - s) * t} km.` });
    },
    (r) => {
      const b = int(r, 8, 15);
      const s = int(r, 1, 4);
      return numMcq(r, { q: `A boat moves at ${b} km/h in still water and the river flows at ${s} km/h. What is its average speed for a round trip between two points?`, ans: Math.round(((b * b - s * s) / b) * 100) / 100, f: (x) => `${fmtNum(x)} km/h`, ex: `Average speed = (downstream × upstream)/still-water speed = ${b + s} × ${b - s} / ${b} = ${fmtNum((b * b - s * s) / b)} km/h.` });
    },
    (r) => {
      const b = int(r, 8, 15);
      const s = int(r, 1, 4);
      const t = pick(r, [1.5, 2, 2.5, 3]);
      return numMcq(r, { q: `How far does a boat travel downstream in ${fmtNum(t)} hours if its still-water speed is ${b} km/h and the stream flows at ${s} km/h?`, ans: (b + s) * t, f: (x) => `${fmtNum(x)} km`, ex: `Downstream speed = ${b + s} km/h, distance = ${b + s} × ${fmtNum(t)} = ${fmtNum((b + s) * t)} km.` });
    },
  ],

  'mixtures-alligation': [
    (r) => {
      const p1 = int(r, 20, 40);
      const p2 = p1 + int(r, 10, 30);
      const m = int(r, p1 + 2, p2 - 2);
      const g = gcd(p2 - m, m - p1);
      return mcq(r, { q: `Rice costing ₹${p1}/kg is mixed with rice costing ₹${p2}/kg. In what ratio must they be mixed to get a mixture worth ₹${m}/kg?`, correct: `${(p2 - m) / g}:${(m - p1) / g}`, wrong: [`${(m - p1) / g}:${(p2 - m) / g}`, `${p1}:${p2}`, `${(p2 - m) / g + 1}:${(m - p1) / g}`, '1:1'].filter((w) => w !== `${(p2 - m) / g}:${(m - p1) / g}`), ex: `By alligation, cheaper : dearer = (${p2} − ${m}) : (${m} − ${p1}) = ${(p2 - m) / g}:${(m - p1) / g}.` });
    },
    (r) => {
      const [a, b] = pick(r, [[3, 1], [4, 1], [5, 3], [7, 2], [2, 1]]);
      const k = int(r, 2, 12);
      const V = (a + b) * k;
      const [c, d] = pick(r, [[1, 1], [3, 2], [2, 1], [4, 3]].filter(([x, y]) => x / y < a / b));
      const water = (a * k * d) / c - b * k;
      if (!Number.isInteger(water) || water <= 0) throw new Error('awkward');
      return numMcq(r, { q: `A ${V}-litre mixture contains milk and water in the ratio ${a}:${b}. How much water must be added to make the ratio ${c}:${d}?`, ans: water, f: (x) => `${x} litres`, ex: `Milk = ${a * k} L stays the same. For ${c}:${d}, water must be ${a * k} × ${d}/${c} = ${(a * k * d) / c} L, so add ${water} L.` });
    },
    (r) => {
      const V = pick(r, [40, 50, 60, 80, 100]);
      const x = pick(r, [4, 5, 10, 20].filter((v) => v < V / 2));
      const left = V * (1 - x / V) ** 2;
      return numMcq(r, { q: `From a container of ${V} litres of milk, ${x} litres are taken out and replaced with water. This is done once more. How much milk is now in the container?`, ans: Math.round(left * 100) / 100, f: (v) => `${fmtNum(v)} litres`, ex: `Milk left = ${V} × (1 − ${x}/${V})² = ${fmtNum(left)} litres.` });
    },
    (r) => {
      const q1 = int(r, 10, 40);
      const q2 = int(r, 10, 40);
      const p1 = int(r, 30, 60);
      const p2 = p1 + int(r, 10, 40);
      return numMcq(r, { q: `${q1} kg of tea at ₹${p1}/kg is mixed with ${q2} kg at ₹${p2}/kg. What is the price of the mixture per kg?`, ans: Math.round(((q1 * p1 + q2 * p2) / (q1 + q2)) * 100) / 100, f: (v) => `₹${fmtNum(v)}`, ex: `Cost of the first lot = ${q1} × ${p1} = ₹${q1 * p1}. Cost of the second lot = ${q2} × ${p2} = ₹${q2 * p2}. Total cost = ${q1 * p1} + ${q2 * p2} = ₹${q1 * p1 + q2 * p2} for ${q1} + ${q2} = ${q1 + q2} kg. Price per kg = ${q1 * p1 + q2 * p2} ÷ ${q1 + q2} = ₹${fmtNum((q1 * p1 + q2 * p2) / (q1 + q2))}.` });
    },
    (r) => {
      const [x, y] = pick(r, [[40, 25], [30, 20], [60, 40], [50, 40], [20, 15], [45, 30]]);
      const V = pick(r, [20, 30, 40, 60]);
      const water = (V * x) / y - V;
      if (!Number.isInteger(water)) throw new Error('awkward');
      return numMcq(r, { q: `${V} litres of a solution is ${x}% alcohol. How much water must be added to make it ${y}% alcohol?`, ans: water, f: (v) => `${v} litres`, ex: `Alcohol now = ${x}% of ${V} = ${(V * x) / 100} L. Adding water does not change the alcohol. In the new solution ${(V * x) / 100} L must be ${y}% of the volume, so new volume = ${(V * x) / 100} × 100 ÷ ${y} = ${(V * x) / y} L. Water to add = ${(V * x) / y} − ${V} = ${water} L.` });
    },
    (r) => {
      const [a, b, m] = pick(r, [[20, 50, 30], [10, 40, 25], [30, 60, 40], [15, 45, 25], [20, 60, 35]]);
      const V = pick(r, [30, 60, 90, 120]);
      const xa = (V * (b - m)) / (b - a);
      if (!Number.isInteger(xa)) throw new Error('awkward');
      return numMcq(r, { q: `How many litres of a ${a}% acid solution must be mixed with a ${b}% solution to make ${V} litres of ${m}% solution?`, ans: xa, f: (v) => `${v} litres`, ex: `By alligation the ${a}% : ${b}% ratio is (${b} − ${m}):(${m} − ${a}), so ${a}% part = ${V} × ${b - m}/${b - a} = ${xa} litres.` });
    },
    (r) => {
      const [a, b] = pick(r, [[2, 3], [3, 2], [1, 1], [3, 1]]);
      const p1 = int(r, 100, 200);
      const p2 = p1 + int(r, 20, 80);
      const cost = (a * p1 + b * p2) / (a + b);
      const S = Math.round(cost * pick(r, [1.1, 1.2, 1.25]));
      const g = ((S - cost) / cost) * 100;
      return numMcq(r, { q: `A grocer mixes tea worth ₹${p1}/kg and ₹${p2}/kg in the ratio ${a}:${b} and sells the mixture at ₹${S}/kg. What is his profit percent?`, ans: Math.round(g * 100) / 100, f: pct, ex: `Cost of the mix = (${a} × ${p1} + ${b} × ${p2})/${a + b} = ₹${fmtNum(cost)}. Profit = (${S} − ${fmtNum(cost)})/${fmtNum(cost)} × 100 = ${fmtNum(g)}%.` });
    },
    (r) => {
      const V = pick(r, [20, 40, 50, 60]);
      const [x, y] = pick(r, [[10, 20], [20, 25], [15, 25], [20, 40], [12, 15]]);
      const evap = V - (V * x) / y;
      if (!Number.isInteger(evap)) throw new Error('awkward');
      return numMcq(r, { q: `${V} litres of sugar solution contains ${x}% sugar. How much water must evaporate to make it ${y}% sugar?`, ans: evap, f: (v) => `${v} litres`, ex: `Sugar = ${x}% of ${V} = ${(V * x) / 100} kg, and evaporation does not remove sugar. For ${y}% sugar, ${(V * x) / 100} kg must be ${y}% of the solution, so the solution must be ${(V * x) / 100} × 100 ÷ ${y} = ${(V * x) / y} L. Water to evaporate = ${V} − ${(V * x) / y} = ${evap} L.` });
    },
  ],

  'number-system': [
    (r) => {
      const n = int(r, 20, 150);
      return numMcq(r, { q: `What is the sum of the first ${n} natural numbers?`, ans: (n * (n + 1)) / 2, ex: `n(n + 1)/2 = ${n} × ${n + 1}/2 = ${(n * (n + 1)) / 2}.` });
    },
    (r) => {
      const [p, q2] = pick(r, [[2, 3], [2, 5], [3, 5], [2, 7]]);
      const [a, b] = [int(r, 1, 4), int(r, 1, 3)];
      const N = p ** a * q2 ** b;
      return numMcq(r, { q: `How many factors (divisors) does ${N} have?`, ans: (a + 1) * (b + 1), ex: `${N} = ${p}^${a} × ${q2}^${b}, so the number of factors = (${a} + 1)(${b} + 1) = ${(a + 1) * (b + 1)}.` });
    },
    (r) => {
      const h = pick(r, [7, 9, 11, 13, 17]);
      const rem = int(r, 1, h - 1);
      const [x, y, z] = [int(r, 5, 15), int(r, 16, 30), int(r, 31, 50)].map((k) => k * h + rem);
      return numMcq(r, { q: `What is the greatest number that divides ${x}, ${y} and ${z} leaving the same remainder in each case?`, ans: gcd(gcd(y - x, z - y), z - x), ex: `It is the HCF of the differences: ${y - x}, ${z - y}, ${z - x}, which is ${gcd(gcd(y - x, z - y), z - x)}.` });
    },
    (r) => {
      const [a, b, c] = pick(r, [[4, 6, 8], [6, 9, 12], [5, 6, 8], [8, 12, 16], [10, 15, 20], [12, 15, 18]]);
      const rem = int(r, 1, Math.min(a, b, c) - 1);
      const L = lcm(lcm(a, b), c);
      return numMcq(r, { q: `What is the smallest number that leaves a remainder of ${rem} when divided by ${a}, ${b} or ${c}?`, ans: L + rem, ex: `LCM of ${a}, ${b}, ${c} = ${L}; add the remainder: ${L + rem}.` });
    },
    (r) => {
      const n = int(r, 10, 60);
      return numMcq(r, { q: `What is the sum of the first ${n} odd numbers?`, ans: n * n, ex: `The sum of the first n odd numbers is n² = ${n * n}.` });
    },
    (r) => {
      const n = int(r, 20, 160);
      let z = 0;
      for (let k = 5; k <= n; k *= 5) z += Math.floor(n / k);
      return numMcq(r, { q: `How many zeros are there at the end of ${n}! (${n} factorial)?`, ans: z, ex: `Count the factors of 5: ${[5, 25, 125].filter((k) => k <= n).map((k) => `⌊${n}/${k}⌋`).join(' + ')} = ${z}.` });
    },
    (r) => {
      const digits = [int(r, 1, 9), int(r, 0, 9), int(r, 0, 9), int(r, 0, 9)];
      const s = digits.reduce((a, b) => a + b, 0);
      const d = (9 - (s % 9)) % 9;
      const shown = `${digits[0]}${digits[1]}*${digits[2]}${digits[3]}`;
      return numMcq(r, { q: `What is the smallest digit that can replace * so that ${shown} is divisible by 9?`, ans: d, near: [d + 1, d + 2, d + 3, (d + 4) % 10], ex: `The digit sum without * is ${s}. It must reach a multiple of 9, so * = ${d}.` });
    },
  ],

  'permutations-combinations': [
    (r) => {
      const [w, ans, why] = pick(r, [['APPLE', 60, '5!/2!'], ['BANANA', 60, '6!/(3! × 2!)'], ['LETTER', 180, '6!/(2! × 2!)'], ['SCHOOL', 360, '6!/2!'], ['ORANGE', 720, '6!'], ['MOTHER', 720, '6!'], ['COFFEE', 180, '6!/(2! × 2!)'], ['PEPPER', 60, '6!/(3! × 2!)']]);
      return numMcq(r, { q: `In how many ways can the letters of the word ${w} be arranged?`, ans, ex: `${w.length} letters with repeats accounted for: ${why} = ${ans}.` });
    },
    (r) => {
      const n = int(r, 6, 30);
      return numMcq(r, { q: `At a party ${n} people each shake hands once with everyone else. How many handshakes take place?`, ans: C(n, 2), ex: `Each handshake is a pair: ${n}C2 = ${n} × ${n - 1}/2 = ${C(n, 2)}.` });
    },
    (r) => {
      const n = int(r, 5, 20);
      return numMcq(r, { q: `How many diagonals does a polygon with ${n} sides have?`, ans: (n * (n - 3)) / 2, ex: `n(n − 3)/2 = ${n} × ${n - 3}/2 = ${(n * (n - 3)) / 2}.` });
    },
    (r) => {
      const n = int(r, 4, 8);
      return numMcq(r, { q: `In how many ways can ${n} people be seated around a round table?`, ans: fact(n - 1), ex: `Circular arrangements = (n − 1)! = ${n - 1}! = ${fact(n - 1)}.` });
    },
    (r) => {
      const m = int(r, 5, 8);
      const w = int(r, 4, 7);
      const a = int(r, 2, 3);
      const b = int(r, 1, 2);
      return numMcq(r, { q: `A committee of ${a} men and ${b} women is to be formed from ${m} men and ${w} women. In how many ways can this be done?`, ans: C(m, a) * C(w, b), ex: `${m}C${a} × ${w}C${b} = ${C(m, a)} × ${C(w, b)} = ${C(m, a) * C(w, b)}.` });
    },
    (r) => {
      const n = int(r, 5, 9);
      return numMcq(r, { q: `How many 3-digit numbers can be formed from the digits 1 to ${n} if no digit is repeated?`, ans: n * (n - 1) * (n - 2), ex: `${n} × ${n - 1} × ${n - 2} = ${n * (n - 1) * (n - 2)}.` });
    },
    (r) => {
      const n = int(r, 4, 7);
      return numMcq(r, { q: `In how many ways can ${n} different books be arranged on a shelf so that two particular books are always together?`, ans: 2 * fact(n - 1), ex: `Tie the two books as one unit: ${n - 1}! arrangements, and the pair can swap: 2 × ${fact(n - 1)} = ${2 * fact(n - 1)}.` });
    },
    (r) => {
      const n = int(r, 5, 15);
      return numMcq(r, { q: `How many triangles can be formed from ${n} points in a plane, no three of which are on one line?`, ans: C(n, 3), ex: `Any 3 points make a triangle: ${n}C3 = ${C(n, 3)}.` });
    },
    (r) => {
      const n = int(r, 3, 10);
      return numMcq(r, { q: `A shop has ${n} different fruits. In how many ways can a customer buy at least one fruit (one of each kind at most)?`, ans: 2 ** n - 1, ex: `Each fruit is either taken or not (2^${n}), minus the empty choice: ${2 ** n - 1}.` });
    },
  ],

  probability: [
    (r) => {
      const s = int(r, 3, 11);
      const ways = 6 - Math.abs(7 - s);
      return fracMcq(r, { q: `Two dice are thrown. What is the probability that the sum is ${s}?`, n: ways, d: 36, ex: `There are ${ways} ways to get ${s} out of 36 outcomes: ${frac(ways, 36)}.` });
    },
    (r) => {
      const n = pick(r, [2, 3, 4]);
      return fracMcq(r, { q: `${n} coins are tossed together. What is the probability of getting at least one head?`, n: 2 ** n - 1, d: 2 ** n, ex: `1 − P(all tails) = 1 − 1/${2 ** n} = ${frac(2 ** n - 1, 2 ** n)}.` });
    },
    (r) => {
      const [face, suit] = pick(r, [['king', 'heart'], ['queen', 'spade'], ['jack', 'diamond'], ['ace', 'club']]);
      return fracMcq(r, { q: `A card is drawn from a pack of 52. What is the probability that it is a ${face} or a ${suit}?`, n: 16, d: 52, ex: `13 ${suit}s + 4 ${face}s − 1 counted twice = 16. P = 16/52 = 4/13.` });
    },
    (r) => {
      const leap = r() < 0.5;
      return fracMcq(r, { q: `What is the probability that a ${leap ? 'leap' : 'non-leap'} year has 53 Sundays?`, n: leap ? 2 : 1, d: 7, ex: `A ${leap ? 'leap' : 'non-leap'} year has 52 weeks and ${leap ? 2 : 1} extra day${leap ? 's' : ''}; ${leap ? 2 : 1} of the 7 possible ${leap ? 'pairs' : 'days'} include a Sunday.` });
    },
    (r) => {
      const red = int(r, 3, 7);
      const blue = int(r, 3, 7);
      return fracMcq(r, { q: `A bag has ${red} red and ${blue} blue balls. Two balls are drawn at random without replacement. What is the probability that both are red?`, n: C(red, 2), d: C(red + blue, 2), ex: `${red}C2 / ${red + blue}C2 = ${C(red, 2)}/${C(red + blue, 2)} = ${frac(C(red, 2), C(red + blue, 2))}.` });
    },
    (r) => {
      const N = pick(r, [20, 30, 40, 50, 60, 100]);
      const k = pick(r, [3, 4, 6, 7]);
      return fracMcq(r, { q: `A number is picked at random from 1 to ${N}. What is the probability that it is a multiple of ${k}?`, n: Math.floor(N / k), d: N, ex: `Numbers from 1 to ${N}: ${N} equally likely choices. Multiples of ${k} up to ${N}: ${N} ÷ ${k} = ${fmtNum(N / k)}, so ${Math.floor(N / k)} of them (${k}, ${2 * k}, …, ${Math.floor(N / k) * k}). Probability = ${Math.floor(N / k)}/${N} = ${frac(Math.floor(N / k), N)}.` });
    },
    (r) => {
      const [what, n, ex] = pick(r, [['a doublet (both dice show the same number)', 6, '6 doublets out of 36 = 1/6.'], ['an even product', 27, 'Only odd × odd is odd (9 ways), so 27/36 = 3/4.'], ['a sum greater than 9', 6, 'Sums 10, 11, 12 occur 3 + 2 + 1 = 6 ways: 6/36 = 1/6.']]);
      return fracMcq(r, { q: `Two dice are rolled. What is the probability of getting ${what}?`, n, d: 36, ex });
    },
    (r) => {
      const [a, b] = [pick(r, [1, 2, 3]), pick(r, [1, 2, 3])];
      const [da, db] = [pick(r, [4, 5]), pick(r, [4, 5, 6])];
      const n = da * db - (da - a) * (db - b);
      return fracMcq(r, { q: `The probability that A solves a problem is ${a}/${da} and that B solves it is ${b}/${db}. If they try independently, what is the probability that the problem is solved?`, n, d: da * db, ex: `1 − (1 − ${a}/${da})(1 − ${b}/${db}) = 1 − ${(da - a) * (db - b)}/${da * db} = ${frac(n, da * db)}.` });
    },
  ],

  mensuration: [
    (r) => {
      const L = int(r, 10, 60);
      const B = int(r, 5, L - 1);
      return numMcq(r, { q: `A rectangular field is ${L} m long and ${B} m wide. What is its perimeter?`, ans: 2 * (L + B), f: (v) => `${v} m`, ex: `2 × (${L} + ${B}) = ${2 * (L + B)} m.` });
    },
    (r) => {
      const rr = int(r, 1, 6) * 7;
      return numMcq(r, { q: `What is the area of a circle of radius ${rr} cm? (Take π = 22/7.)`, ans: (22 / 7) * rr * rr, f: (v) => `${fmtNum(v)} cm²`, ex: `πr² = 22/7 × ${rr} × ${rr} = ${fmtNum((22 / 7) * rr * rr)} cm².` });
    },
    (r) => {
      const d = int(r, 4, 30) * 2;
      return numMcq(r, { q: `The diagonal of a square is ${d} cm. What is its area?`, ans: (d * d) / 2, f: (v) => `${fmtNum(v)} cm²`, ex: `Area = diagonal²/2 = ${d}²/2 = ${(d * d) / 2} cm².` });
    },
    (r) => {
      const [l, b, h] = [int(r, 5, 20), int(r, 4, 15), int(r, 3, 12)];
      return numMcq(r, { q: `What is the total surface area of a cuboid ${l} cm × ${b} cm × ${h} cm?`, ans: 2 * (l * b + b * h + h * l), f: (v) => `${v} cm²`, ex: `2(lb + bh + hl) = 2(${l * b} + ${b * h} + ${h * l}) = ${2 * (l * b + b * h + h * l)} cm².` });
    },
    (r) => {
      const rr = int(r, 1, 3) * 7;
      const h = int(r, 3, 24);
      return numMcq(r, { q: `What is the volume of a cone with base radius ${rr} cm and height ${h} cm? (π = 22/7)`, ans: Math.round((1 / 3) * (22 / 7) * rr * rr * h * 100) / 100, f: (v) => `${fmtNum(v)} cm³`, ex: `⅓πr²h = ⅓ × 22/7 × ${rr}² × ${h} = ${fmtNum((1 / 3) * (22 / 7) * rr * rr * h)} cm³.` });
    },
    (r) => {
      const rr = int(r, 1, 3) * 7;
      return numMcq(r, { q: `What is the surface area of a sphere of radius ${rr} cm? (π = 22/7)`, ans: 4 * (22 / 7) * rr * rr, f: (v) => `${fmtNum(v)} cm²`, ex: `4πr² = 4 × 22/7 × ${rr}² = ${fmtNum(4 * (22 / 7) * rr * rr)} cm².` });
    },
    (r) => {
      const L = int(r, 20, 60);
      const B = int(r, 10, 40);
      const w = int(r, 1, 4);
      return numMcq(r, { q: `A garden ${L} m × ${B} m has a path ${w} m wide all around it, outside. What is the area of the path?`, ans: (L + 2 * w) * (B + 2 * w) - L * B, f: (v) => `${v} m²`, ex: `The path is outside, so the outer rectangle is ${L} + 2 × ${w} = ${L + 2 * w} m by ${B} + 2 × ${w} = ${B + 2 * w} m. Outer area = ${L + 2 * w} × ${B + 2 * w} = ${(L + 2 * w) * (B + 2 * w)} m². Garden area = ${L} × ${B} = ${L * B} m². Path = ${(L + 2 * w) * (B + 2 * w)} − ${L * B} = ${(L + 2 * w) * (B + 2 * w) - L * B} m².` });
    },
    (r) => {
      const [d1, d2] = [int(r, 6, 30), int(r, 6, 30)];
      return numMcq(r, { q: `The diagonals of a rhombus are ${d1} cm and ${d2} cm. What is its area?`, ans: (d1 * d2) / 2, f: (v) => `${fmtNum(v)} cm²`, ex: `Area = d₁ × d₂ / 2 = ${d1} × ${d2}/2 = ${(d1 * d2) / 2} cm².` });
    },
  ],

  'data-interpretation': (() => {
    const years = [2020, 2021, 2022, 2023, 2024];
    const table = (r) => {
      const item = pick(r, ['scooters', 'phones', 'books', 'tickets', 'bicycles']);
      const vals = years.map(() => int(r, 12, 60) * 10);
      return { item, vals, text: `A shop's yearly sales of ${item}:\n${years.map((y, i) => `${y}: ${vals[i]}`).join('\n')}` };
    };
    return [
      (r) => {
        const t = table(r);
        return numMcq(r, { q: `${t.text}\nWhat were the total sales over the five years?`, ans: t.vals.reduce((a, b) => a + b, 0), ex: `${t.vals.join(' + ')} = ${t.vals.reduce((a, b) => a + b, 0)}.` });
      },
      (r) => {
        const t = table(r);
        const max = Math.max(...t.vals);
        const min = Math.min(...t.vals);
        return numMcq(r, { q: `${t.text}\nWhat is the difference between the highest and the lowest yearly sales?`, ans: max - min, ex: `Highest ${max}, lowest ${min}: difference ${max - min}.` });
      },
      (r) => {
        const t = table(r);
        const inc = t.vals.slice(1).map((v, i) => v - t.vals[i]);
        const best = Math.max(...inc);
        if (best <= 0 || inc.filter((x) => x === best).length > 1) throw new Error('no single rise');
        const y = years[inc.indexOf(best) + 1];
        return mcq(r, { q: `${t.text}\nIn which year was the increase over the previous year the largest?`, correct: String(y), wrong: years.slice(1).filter((x) => x !== y).map(String), ex: `Year-on-year changes: ${inc.map((d, i) => `${years[i + 1]}: ${d > 0 ? '+' : ''}${d}`).join(', ')}. The largest rise is in ${y}.` });
      },
      (r) => {
        const t = table(r);
        const [i, j] = [int(r, 0, 4), int(r, 0, 4)];
        if (i === j) throw new Error('same');
        const g = gcd(t.vals[i], t.vals[j]);
        return mcq(r, { q: `${t.text}\nWhat is the ratio of sales in ${years[i]} to sales in ${years[j]}?`, correct: `${t.vals[i] / g}:${t.vals[j] / g}`, wrong: [`${t.vals[j] / g}:${t.vals[i] / g}`, `${t.vals[i] / g + 1}:${t.vals[j] / g}`, `${t.vals[i] / g}:${t.vals[j] / g + 1}`], ex: `${t.vals[i]}:${t.vals[j]} = ${t.vals[i] / g}:${t.vals[j] / g}.` });
      },
      (r) => {
        const t = table(r);
        const i = int(r, 0, 4);
        const tot = t.vals.reduce((a, b) => a + b, 0);
        return numMcq(r, { q: `${t.text}\nWhat percentage of the five-year total was sold in ${years[i]}?`, ans: Math.round((t.vals[i] / tot) * 10000) / 100, f: pct, ex: `Five-year total = ${t.vals.join(' + ')} = ${tot}. Share of ${years[i]} = ${t.vals[i]} ÷ ${tot} × 100 = ${fmtNum((t.vals[i] / tot) * 100)}%.` });
      },
      (r) => {
        const t = table(r);
        const avg = t.vals.reduce((a, b) => a + b, 0) / 5;
        const n = t.vals.filter((v) => v > avg).length;
        return numMcq(r, { q: `${t.text}\nIn how many years were sales above the five-year average?`, ans: n, near: [n + 1, Math.max(0, n - 1), n + 2, 5 - n].filter((x) => x !== n && x >= 0), ex: `Average = ${fmtNum(avg)}. Years above it: ${years.filter((_, k) => t.vals[k] > avg).join(', ') || 'none'}, so ${n}.` });
      },
      (r) => {
        const t = table(r);
        const ch = ((t.vals[4] - t.vals[0]) / t.vals[0]) * 100;
        const word = ch >= 0 ? 'increase' : 'decrease';
        const f = (v) => `${fmtNum(v)}% ${word}`;
        const a = Math.round(Math.abs(ch) * 100) / 100;
        return mcq(r, { q: `${t.text}\nWhat is the percentage change in sales from 2020 to 2024?`, correct: f(a), wrong: [f(Math.round(a * 1.2 * 100) / 100 || 5), f(Math.round((a + 7) * 100) / 100), `${fmtNum(a)}% ${word === 'increase' ? 'decrease' : 'increase'}`], ex: `(${t.vals[4]} − ${t.vals[0]}) / ${t.vals[0]} × 100 = ${fmtNum(ch)}%, a ${word} of ${fmtNum(a)}%.` });
      },
      (r) => {
        const t = table(r);
        const [i, j] = [int(r, 0, 2), int(r, 3, 4)];
        return numMcq(r, { q: `${t.text}\nWhat is the average yearly sales from ${years[i]} to ${years[j]} (inclusive)?`, ans: Math.round((t.vals.slice(i, j + 1).reduce((a, b) => a + b, 0) / (j - i + 1)) * 100) / 100, ex: `(${t.vals.slice(i, j + 1).join(' + ')}) / ${j - i + 1} = ${fmtNum(t.vals.slice(i, j + 1).reduce((a, b) => a + b, 0) / (j - i + 1))}.` });
      },
      (r) => {
        const t = table(r);
        const i = int(r, 1, 4);
        const ch = ((t.vals[i] - t.vals[i - 1]) / t.vals[i - 1]) * 100;
        const word = ch >= 0 ? 'increase' : 'decrease';
        const f = (v) => `${fmtNum(v)}% ${word}`;
        const a = Math.round(Math.abs(ch) * 100) / 100;
        if (a === 0) throw new Error('flat');
        return mcq(r, { q: `${t.text}\nBy what percent did sales change from ${years[i - 1]} to ${years[i]}?`, correct: f(a), wrong: [f(Math.round(a * 1.3 * 100) / 100), f(Math.round((a + 5) * 100) / 100), `${fmtNum(a)}% ${word === 'increase' ? 'decrease' : 'increase'}`], ex: `(${t.vals[i]} − ${t.vals[i - 1]}) / ${t.vals[i - 1]} × 100 = ${fmtNum(ch)}%.` });
      },
    ];
  })(),
};
