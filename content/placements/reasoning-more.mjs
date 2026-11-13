/**
 * More reasoning question types, so a topic is not one question with different numbers.
 * Each entry is one template with its own wording and working; answers are computed.
 * Wired into REASONING_TOPICS in reasoning.mjs. A template may throw to reject a draw.
 */
import { fmtNum, int, mcq, numMcq, pick, shuffle } from './lib.mjs';

const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const at = (i) => L[((i % 26) + 26) % 26];
const pos = (ch) => L.indexOf(ch) + 1;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayMcq = (r, q, d, ex) => mcq(r, { q, correct: DAYS[d], wrong: shuffle(r, DAYS.filter((x) => x !== DAYS[d])), ex });
const letterMcq = (r, q, ch, ex) => mcq(r, { q, correct: ch, wrong: shuffle(r, [at(pos(ch)), at(pos(ch) - 2), at(pos(ch) + 1), at(pos(ch) - 3)]).filter((x) => x !== ch), ex });
const elevenths = (num) => {
  const w = Math.floor(num / 11);
  const f = num % 11;
  return f ? `${w} ${f}/11 minutes` : `${w} minutes`;
};
const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const dow = (y, m, d) => new Date(Date.UTC(y, m, d)).getUTCDay();

export const EXTRA_REASONING = {
  clocks: [
    (r) => {
      const H = int(r, 1, 10);
      const ans = elevenths(60 * H);
      return mcq(r, { q: `At what time between ${H} and ${H + 1} o'clock are the hands of a clock together?`, correct: `${ans} past ${H}`, wrong: [`${elevenths(60 * H + 11)} past ${H}`, `${5 * H} minutes past ${H}`, `${elevenths(60 * H - 22)} past ${H}`, `${elevenths(60 * H + 33)} past ${H}`], ex: `At ${H}:00 the hour hand is at ${H} × 30 = ${30 * H}° and the minute hand at 0°, so the hour hand is ${30 * H}° ahead. The minute hand moves 6° a minute and the hour hand 0.5°, so the minute hand gains 6 − 0.5 = 5.5° a minute. It catches up after ${30 * H} ÷ 5.5 = ${60 * H}/11 = ${ans}.` });
    },
    (r) => {
      const H = int(r, 1, 11);
      const num = H >= 6 ? 60 * H - 360 : 60 * H + 360;
      if (num / 11 >= 60 || num < 0) throw new Error('out');
      return mcq(r, { q: `At what time between ${H} and ${H + 1} o'clock are the hands of a clock exactly opposite each other?`, correct: `${elevenths(num)} past ${H}`, wrong: [`${elevenths(60 * H)} past ${H}`, `${elevenths(num + 22)} past ${H}`, `${(5 * H + 30) % 60} minutes past ${H}`, `${elevenths(Math.abs(num - 33))} past ${H}`], ex: `Opposite means 180° apart: |${30 * H} − 5.5m| = 180, so m = ${num}/11 = ${elevenths(num)}.` });
    },
    (r) => {
      const [cond, n, why] = pick(r, [['coincide (overlap)', 22, 'They coincide 11 times every 12 hours, so 22 times a day.'], ['at right angles', 44, 'They are at right angles 22 times every 12 hours, so 44 times a day.'], ['in a straight line (together or opposite)', 44, '22 coincidences and 22 opposite positions make 44 times a day.'], ['exactly opposite', 22, 'They are opposite 11 times every 12 hours, so 22 times a day.']]);
      return numMcq(r, { q: `How many times in a day (24 hours) are the hands of a clock ${cond}?`, ans: n, near: [24, 48, 22, 44, 11, 12, 20].filter((x) => x !== n), ex: why });
    },
    (r) => {
      const H = int(r, 1, 11);
      const M = int(r, 1, 11) * 5;
      let mh = 11 - H;
      let mm = 60 - M;
      if (mm === 60) { mm = 0; mh += 1; }
      if (mh <= 0) mh += 12;
      const show = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
      return mcq(r, { q: `A clock shows ${show(H, M)}. What time will its mirror image appear to show?`, correct: show(mh, mm), wrong: [show(12 - H, M), show(mh, M), show(H, 60 - M === 60 ? 0 : 60 - M), show(mh === 12 ? 1 : mh + 1, mm)].filter((w) => w !== show(mh, mm)), ex: `Mirror time = 11:60 − ${show(H, M)} = ${show(mh, mm)}.` });
    },
    (r) => {
      const g = pick(r, [2, 3, 4, 5]);
      const h = pick(r, [4, 5, 6, 8, 10]);
      const start = 8;
      const end = start + h;
      const shows = `${end > 12 ? end - 12 : end}:${String(g * h).padStart(2, '0')}`;
      return mcq(r, { q: `A clock gains ${g} minutes every hour. It is set right at 8 a.m. What time does it show when the correct time is ${end > 12 ? end - 12 : end} ${end >= 12 ? 'p.m.' : 'a.m.'}?`, correct: shows, wrong: [`${end > 12 ? end - 12 : end}:${String(g * h + g).padStart(2, '0')}`, `${end > 12 ? end - 12 : end}:${String(g).padStart(2, '0')}`, `${end > 12 ? end - 13 : end - 1}:${String(60 - g * h).padStart(2, '0')}`, `${end > 12 ? end - 12 : end}:${String(2 * g * h).padStart(2, '0')}`], ex: `In ${h} hours it gains ${g} × ${h} = ${g * h} minutes, so it shows ${shows}.` });
    },
    (r) => {
      const h = int(r, 1, 7);
      const m = int(r, 1, 11) * 5;
      return numMcq(r, { q: `Through how many degrees does the hour hand turn in ${h} hours ${m} minutes?`, ans: 30 * h + 0.5 * m, f: (v) => `${fmtNum(v)}°`, ex: `The hour hand moves 30° an hour and 0.5° a minute: ${30 * h} + ${0.5 * m} = ${fmtNum(30 * h + 0.5 * m)}°.` });
    },
    (r) => {
      const m = int(r, 5, 55);
      return numMcq(r, { q: `Through how many degrees does the minute hand turn in ${m} minutes?`, ans: 6 * m, f: (v) => `${v}°`, ex: `The minute hand moves 6° a minute: 6 × ${m} = ${6 * m}°.` });
    },
    (r) => {
      const H = int(r, 1, 11);
      const M = int(r, 1, 11) * 5;
      let a = Math.abs(30 * H - 5.5 * M);
      if (a > 180) a = 360 - a;
      return numMcq(r, { q: `What is the reflex angle between the hands of a clock at ${H}:${String(M).padStart(2, '0')}?`, ans: 360 - a, f: (v) => `${fmtNum(v)}°`, ex: `The smaller angle is |30 × ${H} − 5.5 × ${M}| = ${fmtNum(a)}°, so the reflex angle is 360 − ${fmtNum(a)} = ${fmtNum(360 - a)}°.` });
    },
    (r) => {
      const x = pick(r, [2, 3, 4, 5, 6]);
      const n = int(r, 3, 12);
      return numMcq(r, { q: `A clock loses ${x} minutes every day. It is set right on a Monday at noon. How many minutes slow will it be after ${n} days?`, ans: x * n, f: (v) => `${v} minutes`, ex: `${x} × ${n} = ${x * n} minutes slow.` });
    },
    (r) => {
      const D = int(r, 2, 22) * 15;
      const mins = D * 2;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const show = (hh, mm) => `${hh === 0 ? 12 : hh}:${String(mm).padStart(2, '0')}`;
      return mcq(r, { q: `Starting from 12 o'clock, the hour hand has turned through ${D}°. What time is it?`, correct: show(h, m), wrong: [show((h + 1) % 12, m), show(h, (m + 30) % 60), show(Math.floor(D / 30) % 12, (D % 30) * 2 + 10), show(h, (m + 15) % 60)].filter((w) => w !== show(h, m)), ex: `The hour hand turns 30° in 60 minutes, which is 0.5° a minute. So ${D}° takes ${D} ÷ 0.5 = ${mins} minutes = ${h} h ${m} min after 12: ${show(h, m)}.` });
    },
    (r) => {
      const H = int(r, 1, 11);
      let a = Math.abs(30 * H - 5.5 * 15);
      if (a > 180) a = 360 - a;
      return numMcq(r, { q: `What is the angle between the hands of a clock at a quarter past ${H}?`, ans: a, f: (v) => `${fmtNum(v)}°`, ex: `At ${H}:15 the angle is |30 × ${H} − 5.5 × 15| = ${fmtNum(a)}°.` });
    },
    (r) => {
      const [desc, n, why] = pick(r, [['strikes once at 1, twice at 2 and so on. How many times does it strike in 12 hours', 78, '1 + 2 + … + 12 = 78.'], ['strikes the number of the hour every hour. How many times does it strike in a full day', 156, 'Twice 1 + 2 + … + 12 = 2 × 78 = 156.'], ['strikes the hour every hour and once at every half hour. How many times does it strike in 12 hours', 90, '78 hourly strikes + 12 half-hour strikes = 90.']]);
      return numMcq(r, { q: `A clock ${desc}?`, ans: n, near: [n + 12, n - 12, n * 2, n + 6].filter((x) => x !== n && x > 0), ex: why });
    },
  ],

  'number-series': [
    (r) => {
      const a = int(r, 3, 40);
      const d = int(r, 3, 15);
      const s = [0, 1, 2, 3, 4].map((k) => a + k * d);
      return numMcq(r, { q: `Find the missing number: ${s[0]}, ${s[1]}, ?, ${s[3]}, ${s[4]}`, ans: s[2], ex: `Find the common difference from the terms you have: ${s[1]} − ${s[0]} = ${d} and ${s[4]} − ${s[3]} = ${d}. So each term goes up by ${d}, and the missing term is ${s[1]} + ${d} = ${s[2]} (check: ${s[2]} + ${d} = ${s[3]}).` });
    },
    (r) => {
      const st = int(r, 2, 8);
      const s = [0, 1, 2, 3, 4, 5].map((k) => (st + k) ** 2);
      const wi = int(r, 1, 4);
      const wrongVal = s[wi] + pick(r, [1, 2, -1, 3]);
      const shown = s.map((v, i) => (i === wi ? wrongVal : v));
      return mcq(r, { q: `Which number is wrong in the series: ${shown.join(', ')}?`, correct: String(wrongVal), wrong: shown.filter((v, i) => i !== wi).slice(0, 4).map(String), ex: `The terms are the squares of ${st} to ${st + 5}: ${s.map((v, i) => `${st + i}² = ${v}`).join(', ')}. Every term matches except ${wrongVal}, which should be ${st + wi}² = ${s[wi]}.` });
    },
    (r) => {
      const a = int(r, 2, 20);
      const d = int(r, 2, 9);
      const n = int(r, 10, 25);
      return numMcq(r, { q: `What is the ${n}th term of the series ${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, …?`, ans: a + (n - 1) * d, ex: `nth term = a + (n − 1)d = ${a} + ${n - 1} × ${d} = ${a + (n - 1) * d}.` });
    },
    (r) => {
      const s = [int(r, 1, 5), int(r, 2, 7)];
      while (s.length < 7) s.push(s[s.length - 1] + s[s.length - 2]);
      return numMcq(r, { q: `Complete the series: ${s.slice(0, 6).join(', ')}, ?`, ans: s[6], ex: `Each term is the sum of the two before it: ${s[4]} + ${s[5]} = ${s[6]}.` });
    },
    (r) => {
      const a = int(r, 1, 20);
      const d0 = int(r, 1, 5);
      const step = pick(r, [2, 3]);
      const s = [a];
      for (let k = 0; k < 5; k++) s.push(s[s.length - 1] + d0 + k * step);
      return numMcq(r, { q: `What comes next: ${s.slice(0, 5).join(', ')}, ?`, ans: s[5], ex: `The differences are ${d0}, ${d0 + step}, ${d0 + 2 * step}, ${d0 + 3 * step}, … (growing by ${step}), so next = ${s[4]} + ${d0 + 4 * step} = ${s[5]}.` });
    },
    (r) => {
      const k = pick(r, [2, 3]);
      const c = pick(r, [1, 2, -1]);
      const s = [int(r, 1, 6)];
      for (let i = 0; i < 5; i++) s.push(s[s.length - 1] * k + c);
      return numMcq(r, { q: `Which number should come next: ${s.slice(0, 5).join(', ')}, ?`, ans: s[5], ex: `Each term = previous × ${k} ${c >= 0 ? '+' : '−'} ${Math.abs(c)}: ${s[4]} × ${k} ${c >= 0 ? '+' : '−'} ${Math.abs(c)} = ${s[5]}.` });
    },
    (r) => {
      const st = int(r, 2, 6);
      const c = pick(r, [-1, 1, 2]);
      const s = [0, 1, 2, 3, 4].map((k) => (st + k) ** 3 + c);
      return numMcq(r, { q: `Fill in the blank: ${s.slice(0, 4).join(', ')}, ___`, ans: s[4], ex: `The terms are n³ ${c > 0 ? '+' : '−'} ${Math.abs(c)} for n = ${st} to ${st + 4}: ${st + 4}³ ${c > 0 ? '+' : '−'} ${Math.abs(c)} = ${s[4]}.` });
    },
    (r) => {
      const [a, d1] = [int(r, 1, 10), int(r, 2, 6)];
      const [b, d2] = [int(r, 20, 50), -int(r, 1, 4)];
      const s = [];
      for (let k = 0; k < 4; k++) s.push(a + k * d1, b + k * d2);
      return numMcq(r, { q: `Find the next term of the mixed series: ${s.slice(0, 7).join(', ')}, ?`, ans: s[7], ex: `Two series alternate: ${s.filter((_, i) => i % 2 === 0).join(', ')} (+${d1}) and ${s.filter((_, i) => i % 2 === 1).join(', ')} (${d2}). The next term is ${s[7]}.` });
    },
    (r) => {
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23];
      const st = int(r, 0, 3);
      const s = primes.slice(st, st + 5).map((p) => p * p);
      return numMcq(r, { q: `Which number completes the series: ${s.slice(0, 4).join(', ')}, ?`, ans: s[4], ex: `These are squares of consecutive primes ${primes.slice(st, st + 5).join(', ')}: the next is ${primes[st + 4]}² = ${s[4]}.` });
    },
    (r) => {
      const n = int(r, 10, 40);
      return numMcq(r, { q: `What is the sum of the first ${n} terms of the series 2, 4, 6, 8, …?`, ans: n * (n + 1), ex: `2 + 4 + … + 2n = n(n + 1) = ${n} × ${n + 1} = ${n * (n + 1)}.` });
    },
  ],

  'letter-series': [
    (r) => {
      const s = int(r, 0, 5);
      const seq = [s];
      for (let k = 1; k < 6; k++) seq.push(seq[k - 1] + k);
      if (seq[5] > 25) throw new Error('past Z');
      return letterMcq(r, `Which letter comes next: ${seq.slice(0, 5).map(at).join(', ')}, ?`, at(seq[5]), `The gaps grow by one (+1, +2, +3, +4, +5), so the next letter is ${at(seq[5])}.`);
    },
    (r) => {
      const s = int(r, 0, 10);
      const g = pick(r, [3, 4]);
      const pairs = [0, 1, 2, 3].map((k) => at(s + k * g) + at(s + k * g + 1));
      return mcq(r, { q: `Find the next pair: ${pairs.slice(0, 3).join(', ')}, ?`, correct: pairs[3], wrong: [at(s + 3 * g + 1) + at(s + 3 * g + 2), at(s + 3 * g - 1) + at(s + 3 * g), at(s + 3 * g) + at(s + 3 * g + 2)], ex: `Each pair starts ${g} letters after the previous one: the next is ${pairs[3]}.` });
    },
    (r) => {
      const s = int(r, 0, 8);
      const terms = [0, 1, 2, 3].map((k) => at(s + k) + at(25 - s - k));
      return mcq(r, { q: `What comes next in the pattern of opposite letters: ${terms.slice(0, 3).join(', ')}, ?`, correct: terms[3], wrong: [at(s + 3) + at(25 - s - 2), at(s + 4) + at(25 - s - 3), at(s + 2) + at(25 - s - 3)], ex: `The first letters go forward and the second letters go backward from Z: ${terms[3]}.` });
    },
    (r) => {
      const s = int(r, 0, 18);
      const g = [0, 1, 2, 3].map((k) => at(s + k) + at(s + k + 1) + at(s + k + 2));
      return mcq(r, { q: `Complete the series of three-letter groups: ${g.slice(0, 3).join(', ')}, ?`, correct: g[3], wrong: [at(s + 4) + at(s + 5) + at(s + 6), at(s + 3) + at(s + 5) + at(s + 6), at(s + 2) + at(s + 3) + at(s + 5)], ex: `Each group moves one letter forward: ${g[3]}.` });
    },
    (r) => {
      const s = int(r, 0, 6);
      const d = pick(r, [2, 3]);
      const t = [0, 1, 2, 3].map((k) => `${at(s + k * d)}${s + k * d + 1}`);
      return mcq(r, { q: `Find the next term of the letter-number series: ${t.slice(0, 3).join(', ')}, ?`, correct: t[3], wrong: [`${at(s + 3 * d)}${s + 3 * d}`, `${at(s + 3 * d + 1)}${s + 3 * d + 1}`, `${at(s + 3 * d)}${s + 3 * d + 2}`], ex: `Each letter is followed by its position in the alphabet, moving ${d} letters each time: ${t[3]}.` });
    },
    (r) => {
      const s = int(r, 15, 25);
      const d = pick(r, [2, 3]);
      const seq = [0, 1, 2, 3, 4].map((k) => s - k * d);
      return letterMcq(r, `Find the next letter in the backward series: ${seq.slice(0, 4).map(at).join(', ')}, ?`, at(seq[4]), `The letters go back ${d} each time: ${at(seq[4])}.`);
    },
    (r) => {
      const s = int(r, 0, 3);
      const groups = [0, 1, 2, 3].map((k) => at(s + 6 * k) + at(s + 6 * k + 2) + at(s + 6 * k + 4));
      if (s + 22 > 25) throw new Error('past Z');
      return mcq(r, { q: `Fill in the blank: ${groups.slice(0, 3).join(', ')}, ___`, correct: groups[3], wrong: [at(s + 17) + at(s + 19) + at(s + 21), at(s + 18) + at(s + 21) + at(s + 23), at(s + 18) + at(s + 19) + at(s + 22)], ex: `Each group skips one letter (+2), and the next group starts 6 letters later: ${groups[3]}.` });
    },
    (r) => {
      const s = int(r, 0, 6);
      const seq = [s];
      for (let k = 1; k < 6; k++) seq.push(seq[k - 1] + (k % 2 ? 1 : 3));
      return letterMcq(r, `What letter continues the pattern: ${seq.slice(0, 5).map(at).join(', ')}, ?`, at(seq[5]), `The steps alternate +1 and +3, so the next step is +${5 % 2 ? 1 : 3}: ${at(seq[5])}.`);
    },
  ],

  'odd-one-out': [
    (r) => {
      const primes = shuffle(r, [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]).slice(0, 3);
      const odd = pick(r, [21, 27, 33, 39, 49, 51, 57]);
      return mcq(r, { q: `Which of these numbers is not prime: ${shuffle(r, [...primes, odd]).join(', ')}?`, correct: String(odd), wrong: primes.map(String), ex: `${odd} is not prime (${odd} = ${[3, 7].find((p) => odd % p === 0)} × ${odd / [3, 7].find((p) => odd % p === 0)}); the others are prime.` });
    },
    (r) => {
      const sq = shuffle(r, [16, 25, 36, 49, 64, 81, 100, 121, 144]).slice(0, 3);
      const odd = pick(r, [48, 50, 63, 80, 99, 120]);
      return mcq(r, { q: `Pick the number that is not a perfect square: ${shuffle(r, [...sq, odd]).join(', ')}`, correct: String(odd), wrong: sq.map(String), ex: `${sq.join(', ')} are perfect squares; ${odd} is not.` });
    },
    (r) => {
      const k = pick(r, [6, 7, 8, 9, 11, 13]);
      const ms = shuffle(r, [2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).map((x) => x * k);
      const odd = k * int(r, 3, 9) + int(r, 1, k - 1);
      return mcq(r, { q: `Which number is not a multiple of ${k}: ${shuffle(r, [...ms, odd]).join(', ')}?`, correct: String(odd), wrong: ms.map(String), ex: `${ms.join(', ')} are multiples of ${k}; ${odd} leaves a remainder of ${odd % k}.` });
    },
    (r) => {
      const ns = shuffle(r, [3, 4, 5, 6, 7, 8, 9, 11, 12]).slice(0, 4);
      const pairs = ns.map((n) => [n, n * n]);
      const wi = int(r, 0, 3);
      pairs[wi][1] += pick(r, [1, -1, 2]);
      const fmt = ([a, b]) => `(${a}, ${b})`;
      return mcq(r, { q: `Find the odd pair: ${pairs.map(fmt).join(', ')}`, correct: fmt(pairs[wi]), wrong: pairs.filter((_, i) => i !== wi).map(fmt), ex: `In every other pair the second number is the square of the first; ${fmt(pairs[wi])} breaks the rule (${pairs[wi][0]}² = ${pairs[wi][0] ** 2}).` });
    },
    (r) => {
      const [group, odd, why] = pick(r, [
        [['apple', 'mango', 'banana', 'grape'], 'potato', 'is a vegetable; the rest are fruits'],
        [['mars', 'venus', 'jupiter', 'saturn'], 'moon', 'is a satellite; the rest are planets'],
        [['violin', 'guitar', 'sitar', 'veena'], 'flute', 'is a wind instrument; the rest are string instruments'],
        [['cricket', 'hockey', 'football', 'tennis'], 'chess', 'is an indoor board game; the rest are field or court sports'],
        [['iron', 'copper', 'silver', 'zinc'], 'plastic', 'is not a metal'],
        [['rose', 'lily', 'lotus', 'jasmine'], 'neem', 'is a tree; the rest are flowers'],
        [['python', 'java', 'kotlin', 'swift'], 'linux', 'is an operating system; the rest are programming languages'],
        [['kilometre', 'metre', 'centimetre', 'millimetre'], 'kilogram', 'measures mass; the rest measure length'],
      ]);
      const three = shuffle(r, group).slice(0, 3);
      return mcq(r, { q: `Which word does not belong with the others: ${shuffle(r, [...three, odd]).join(', ')}?`, correct: odd, wrong: three, ex: `${odd[0].toUpperCase() + odd.slice(1)} ${why}.` });
    },
    (r) => {
      const starts = shuffle(r, [0, 3, 6, 9, 12, 15]).slice(0, 4);
      const groups = starts.map((s) => at(s) + at(s + 2) + at(s + 4));
      const wi = int(r, 0, 3);
      groups[wi] = at(starts[wi]) + at(starts[wi] + 2) + at(starts[wi] + 5);
      return mcq(r, { q: `Which letter group is different: ${groups.join(', ')}?`, correct: groups[wi], wrong: groups.filter((_, i) => i !== wi), ex: `The others skip one letter each time (+2, +2); ${groups[wi]} jumps +2 then +3.` });
    },
    (r) => {
      const cubes = shuffle(r, [8, 27, 64, 125, 216, 343, 512]).slice(0, 3);
      const odd = pick(r, [36, 81, 100, 144, 200, 400]);
      return mcq(r, { q: `Which of these is not a perfect cube: ${shuffle(r, [...cubes, odd]).join(', ')}?`, correct: String(odd), wrong: cubes.map(String), ex: `${cubes.join(', ')} are cubes; ${odd} is not.` });
    },
    (r) => {
      const odds = shuffle(r, [13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]).slice(0, 3);
      const even = pick(r, [14, 22, 26, 28, 34, 38]);
      return mcq(r, { q: `Which number does not fit with the rest: ${shuffle(r, [...odds, even]).join(', ')}?`, correct: String(even), wrong: odds.map(String), ex: `${even} is even; the others are odd.` });
    },
    (r) => {
      const N = pick(r, [24, 36, 48, 60, 72, 84, 90]);
      const fs = [];
      for (let k = 2; k < N; k++) if (N % k === 0) fs.push(k);
      const three = shuffle(r, fs).slice(0, 3);
      let odd = int(r, 5, N - 1);
      while (N % odd === 0) odd += 1;
      return mcq(r, { q: `Which of these is not a factor of ${N}: ${shuffle(r, [...three, odd]).join(', ')}?`, correct: String(odd), wrong: three.map(String), ex: `${three.join(', ')} divide ${N} exactly; ${odd} does not.` });
    },
  ],

  analogies: [
    (r) => {
      const [a, b, c, d, w] = pick(r, [
        ['doctor', 'hospital', 'teacher', 'school', ['court', 'office', 'factory']],
        ['bird', 'nest', 'bee', 'hive', ['den', 'stable', 'burrow']],
        ['pen', 'write', 'knife', 'cut', ['cook', 'sharpen', 'eat']],
        ['eye', 'see', 'ear', 'hear', ['speak', 'smell', 'touch']],
        ['cow', 'calf', 'dog', 'puppy', ['kitten', 'cub', 'foal']],
        ['author', 'book', 'composer', 'song', ['painting', 'stage', 'poem']],
        ['water', 'thirst', 'food', 'hunger', ['taste', 'appetite', 'meal']],
        ['carpenter', 'wood', 'tailor', 'cloth', ['needle', 'shop', 'thread']],
        ['india', 'rupee', 'japan', 'yen', ['dollar', 'won', 'euro']],
        ['hot', 'cold', 'tall', 'short', ['high', 'long', 'thin']],
        ['petal', 'flower', 'page', 'book', ['library', 'word', 'paper']],
        ['lion', 'roar', 'snake', 'hiss', ['bark', 'howl', 'chirp']],
        ['thermometer', 'temperature', 'barometer', 'pressure', ['rainfall', 'humidity', 'speed']],
        ['pilot', 'aeroplane', 'driver', 'car', ['road', 'licence', 'engine']],
      ]);
      return mcq(r, { q: `${a[0].toUpperCase() + a.slice(1)} is to ${b} as ${c} is to ?`, correct: d, wrong: w, ex: `The relation of ${a} to ${b} is the same as ${c} to ${d}.` });
    },
    (r) => {
      const a = int(r, 2, 6);
      const b = int(r, 2, 9);
      return numMcq(r, { q: `As ${a} is to ${a ** 3}, so ${b} is to ?`, ans: b ** 3, ex: `${a ** 3} is the cube of ${a}, so the answer is ${b}³ = ${b ** 3}.` });
    },
    (r) => {
      const s = int(r, 0, 15);
      const g = pick(r, [2, 3]);
      const t = int(r, 0, 18);
      const pair = (x) => at(x) + at(x + 1);
      return mcq(r, { q: `Letter analogy: ${pair(s)} : ${pair(s + g)} :: ${pair(t)} : ?`, correct: pair(t + g), wrong: [pair(t + g + 1), pair(t + g - 1), at(t + g) + at(t + g + 2)], ex: `Each letter moves ${g} places forward: ${pair(t)} → ${pair(t + g)}.` });
    },
    (r) => {
      const a = int(r, 3, 12);
      const k = pick(r, [2, 3, 4]);
      const b = int(r, 3, 12);
      return numMcq(r, { q: `Complete the number analogy: ${a} : ${a * k + 1} :: ${b} : ?`, ans: b * k + 1, ex: `${a} × ${k} + 1 = ${a * k + 1}, so ${b} × ${k} + 1 = ${b * k + 1}.` });
    },
    (r) => {
      const w = pick(r, ['CAT', 'DOG', 'SUN', 'PEN', 'BOX', 'MAP']);
      const v = pick(r, ['ARM', 'LEG', 'TOP', 'BAT', 'HEN', 'CUP'].filter((x) => x !== w));
      const rev = (x) => x.split('').reverse().join('');
      return mcq(r, { q: `If ${w} is related to ${rev(w)}, then ${v} is related to ?`, correct: rev(v), wrong: [v, v[1] + v[0] + v[2], v[0] + v[2] + v[1]], ex: `The letters are written in reverse order: ${v} → ${rev(v)}.` });
    },
  ],

  calendars: [
    (r) => {
      const d = int(r, 0, 6);
      return dayMcq(r, `In a non-leap year, 1 January is a ${DAYS[d]}. What day of the week is 1 March?`, (d + 59) % 7, `January has 31 days and February 28, so 1 March is 59 days later: 59 mod 7 = 3, so ${DAYS[(d + 59) % 7]}.`);
    },
    (r) => {
      const [n, odd] = pick(r, [[100, 5], [200, 3], [300, 1], [400, 0]]);
      return numMcq(r, { q: `How many odd days are there in ${n} years?`, ans: odd, near: [0, 1, 2, 3, 4, 5, 6].filter((x) => x !== odd), ex: `100 years have 5 odd days, 200 have 10 → 3, 300 have 15 → 1, and 400 have 0 (20 + 1 → 21 → 0).` });
    },
    (r) => {
      const leapY = pick(r, [1996, 2000, 2004, 2008, 2012, 2016, 2020, 2024]);
      const non = shuffle(r, [1900, 2100, 2002, 2010, 2018, 1998, 2022, 2026]).slice(0, 3);
      return mcq(r, { q: `Which of these is a leap year: ${shuffle(r, [leapY, ...non]).join(', ')}?`, correct: String(leapY), wrong: non.map(String), ex: `${leapY} is divisible by 4${leapY % 100 === 0 ? ' and by 400' : ''}. Century years like 1900 and 2100 are leap years only if divisible by 400.` });
    },
    (r) => {
      const y = int(r, 1950, 2030);
      const m = int(r, 0, 11);
      const d = int(r, 1, 28);
      return dayMcq(r, `What day of the week was ${d} ${MONTHS[m]} ${y}?`, dow(y, m, d), `Counting odd days from a known date (or using a calendar), ${d} ${MONTHS[m]} ${y} was a ${DAYS[dow(y, m, d)]}.`);
    },
    (r) => {
      const d = int(r, 0, 6);
      const n = int(r, 10, 200);
      return dayMcq(r, `Today is ${DAYS[d]}. What day of the week was it ${n} days ago?`, (((d - n) % 7) + 7) % 7, `${n} days = ${Math.floor(n / 7)} weeks and ${n % 7} days, so go back ${n % 7} days from ${DAYS[d]}: ${DAYS[(((d - n) % 7) + 7) % 7]}.`);
    },
    (r) => {
      const y = int(r, 2001, 2030);
      let z = y + 1;
      while (!(dow(z, 0, 1) === dow(y, 0, 1) && isLeap(z) === isLeap(y))) z++;
      return numMcq(r, { q: `In which year will the calendar of ${y} next be repeated exactly?`, ans: z, near: [y + 4, y + 6, y + 7, y + 11, y + 28].filter((x) => x !== z), ex: `The year must start on the same weekday and have the same number of days (${isLeap(y) ? 'leap' : 'non-leap'}). The first such year after ${y} is ${z}.` });
    },
    (r) => {
      const m = int(r, 1, 11);
      const d = int(r, 1, 28);
      const days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const ans = days.slice(0, m).reduce((a, b) => a + b, 0) + d;
      return numMcq(r, { q: `In a leap year, how many days are there from 1 January to ${d} ${MONTHS[m]}, counting both days?`, ans, ex: `Full months before ${MONTHS[m]}: ${days.slice(0, m).reduce((a, b) => a + b, 0)} days (February has 29), plus ${d} = ${ans}.` });
    },
    (r) => {
      const d = int(r, 0, 6);
      const a = int(r, 1, 9);
      const b = a + 7 * int(r, 1, 3) + int(r, 0, 6);
      return dayMcq(r, `The ${a}${a === 1 ? 'st' : a === 2 ? 'nd' : a === 3 ? 'rd' : 'th'} of a month is a ${DAYS[d]}. What day of the week is the ${b}th of the same month?`, (d + b - a) % 7, `${b} − ${a} = ${b - a} days later; ${b - a} mod 7 = ${(b - a) % 7}, so ${DAYS[(d + b - a) % 7]}.`);
    },
    (r) => {
      const len = pick(r, [28, 29, 30, 31]);
      const d = int(r, 0, 6);
      const count = Array.from({ length: len }, (_, i) => (d + i) % 7).filter((x) => x === 0).length;
      return numMcq(r, { q: `A ${len}-day month begins on a ${DAYS[d]}. How many Sundays does it have?`, ans: count, near: [4, 5, 3, 6].filter((x) => x !== count), ex: `The first ${len - 28} day${len - 28 === 1 ? '' : 's'} of the week repeat a fifth time${len === 28 ? ' (none here)' : ''}; counting gives ${count} Sundays.` });
    },
  ],

  'alphabet-test': [
    (r) => {
      const k = int(r, 2, 20);
      return letterMcq(r, `Which letter is ${k}th from the right end of the English alphabet?`, at(26 - k), `From the right, the kth letter is at position 27 − k = ${27 - k}: ${at(26 - k)}.`);
    },
    (r) => {
      const a = int(r, 10, 22);
      const b = int(r, 2, 8);
      return letterMcq(r, `Which letter is ${b}th to the left of the ${a}th letter from the left of the alphabet?`, at(a - b - 1), `The ${a}th letter is ${at(a - 1)}; ${b} to its left is position ${a - b}: ${at(a - b - 1)}.`);
    },
    (r) => {
      const x = int(r, 0, 15);
      const y = x + int(r, 3, 10);
      return numMcq(r, { q: `How many letters are there between ${at(x)} and ${at(y)} in the English alphabet?`, ans: y - x - 1, near: [y - x, y - x + 1, y - x - 2], ex: `${at(x)} is ${x + 1} and ${at(y)} is ${y + 1}; letters strictly between = ${y + 1} − ${x + 1} − 1 = ${y - x - 1}.` });
    },
    (r) => {
      const k = int(r, 3, 20);
      return letterMcq(r, `If the alphabet is written in reverse order, which letter will be ${k}th from the left?`, at(26 - k), `Reversed, the kth letter from the left is the kth from the right of the normal alphabet: ${at(26 - k)}.`);
    },
    (r) => {
      const words = shuffle(r, pick(r, [['market', 'marble', 'margin', 'marine', 'marker'], ['planet', 'plant', 'plasma', 'platform', 'plate'], ['stream', 'street', 'stress', 'strict', 'string'], ['candle', 'canvas', 'cannon', 'canopy', 'canteen']])).slice(0, 4);
      const sorted = [...words].sort();
      return mcq(r, { q: `If these words are arranged in dictionary order, which comes third: ${words.join(', ')}?`, correct: sorted[2], wrong: words.filter((w) => w !== sorted[2]), ex: `In dictionary order: ${sorted.join(', ')}. The third is ${sorted[2]}.` });
    },
    (r) => {
      const w = pick(r, ['PLACEMENT', 'INTERVIEW', 'COMPUTER', 'KEYBOARD', 'NOTEBOOK', 'TRAINING', 'MOBILE']);
      const n = w.split('').filter((c) => pos(c) <= 13).length;
      return numMcq(r, { q: `How many letters of the word ${w} are in the first half of the alphabet (A to M)?`, ans: n, near: [n + 1, Math.max(0, n - 1), n + 2, w.length - n].filter((x) => x !== n), ex: `Letters from A to M in ${w}: ${w.split('').filter((c) => pos(c) <= 13).join(', ') || 'none'}, so ${n}.` });
    },
    (r) => {
      const a = int(r, 0, 12);
      const b = a + 2 * int(r, 2, 6);
      return letterMcq(r, `Which letter is exactly midway between ${at(a)} and ${at(b)} in the alphabet?`, at((a + b) / 2), `${at(a)} = ${a + 1} and ${at(b)} = ${b + 1}; the middle position is ${(a + b) / 2 + 1}: ${at((a + b) / 2)}.`);
    },
    (r) => {
      const k = int(r, 3, 12);
      return letterMcq(r, `If every odd-numbered letter of the alphabet (A, C, E, …) is removed, which letter is ${k}th in what remains?`, at(2 * k - 1), `What remains is B, D, F, …, so the kth letter is at position 2k = ${2 * k}: ${at(2 * k - 1)}.`);
    },
    (r) => {
      const x = int(r, 0, 25);
      return numMcq(r, { q: `What is the position of the letter ${at(x)} counted from the right end of the alphabet?`, ans: 26 - x, near: [27 - x, 25 - x, x + 1].filter((v) => v !== 26 - x && v > 0), ex: `Position from the left is ${x + 1}, so from the right it is 27 − ${x + 1} = ${26 - x}.` });
    },
    (r) => {
      const x = int(r, 0, 25);
      return letterMcq(r, `In the alphabet paired from both ends (A with Z, B with Y, …), which letter is paired with ${at(x)}?`, at(25 - x), `The partner of the letter at position p is at 27 − p: 27 − ${x + 1} = ${26 - x}, which is ${at(25 - x)}.`);
    },
  ],
};

/** Logical arithmetic: quick everyday reasoning with numbers (a topic of its own). */
const LOGIC = [
  (r) => {
    const k = int(r, 3, 8);
    const each = int(r, 5, 40);
    const m = int(r, 2, 15);
    return numMcq(r, { q: `If ${k} pens cost ₹${k * each}, how much do ${m} pens cost?`, ans: m * each, f: (v) => `₹${v}`, ex: `Cost of one pen = ${k * each} ÷ ${k} = ₹${each}. Cost of ${m} pens = ${m} × ${each} = ₹${m * each}.` });
  },
  (r) => {
    const x = int(r, 4, 60);
    const k = int(r, 3, 20);
    return numMcq(r, { q: `A number is doubled and ${k} is added, giving ${2 * x + k}. What is the number?`, ans: x, ex: `(${2 * x + k} − ${k}) ÷ 2 = ${x}.` });
  },
  (r) => {
    const cows = int(r, 3, 20);
    const hens = int(r, 3, 30);
    return numMcq(r, { q: `A farm has hens and cows with ${cows + hens} heads and ${4 * cows + 2 * hens} legs in all. How many cows are there?`, ans: cows, ex: `Suppose all ${cows + hens} animals were hens: ${cows + hens} × 2 = ${2 * (cows + hens)} legs. The real total is ${4 * cows + 2 * hens}, so there are ${4 * cows + 2 * hens} − ${2 * (cows + hens)} = ${2 * cows} extra legs. Each cow has 2 more legs than a hen, so cows = ${2 * cows} ÷ 2 = ${cows}.` });
  },
  (r) => {
    const k = int(r, 5, 25);
    return numMcq(r, { q: `Ravi is ${k}th from the left and ${k}th from the right in a row of students. How many students are in the row?`, ans: 2 * k - 1, ex: `Total = ${k} + ${k} − 1 = ${2 * k - 1} (Ravi is counted twice).` });
  },
  (r) => {
    const x = int(r, 10, 90);
    return numMcq(r, { q: `The sum of three consecutive numbers is ${3 * x + 3}. What is the largest of them?`, ans: x + 2, ex: `They are n, n + 1, n + 2 with 3n + 3 = ${3 * x + 3}, so n = ${x} and the largest is ${x + 2}.` });
  },
  (r) => {
    const t = int(r, 2, 20);
    const n = t + int(r, 2, 20);
    return numMcq(r, { q: `A wallet has ${n} notes of ₹10 and ₹20 worth ₹${10 * n + 10 * t} in total. How many ₹20 notes are there?`, ans: t, ex: `Suppose all ${n} notes were ₹10: ${n} × 10 = ₹${10 * n}. The real total is ₹${10 * n + 10 * t}, which is ₹${10 * n + 10 * t} − ₹${10 * n} = ₹${10 * t} more. Each ₹20 note adds ₹10 more than a ₹10 note, so ₹20 notes = ${10 * t} ÷ 10 = ${t}.` });
  },
  (r) => {
    const h = pick(r, [2, 3, 4, 5, 6]);
    const [a, b] = pick(r, [[3, 4], [2, 5], [3, 5], [4, 7], [5, 6]]);
    return numMcq(r, { q: `The product of two numbers is ${a * b * h * h} and their HCF is ${h}. What is their LCM?`, ans: a * b * h, ex: `HCF × LCM = product, so LCM = ${a * b * h * h}/${h} = ${a * b * h}.` });
  },
  (r) => {
    const p = pick(r, [2, 3, 4, 5]);
    const n = int(r, 4, 20);
    return numMcq(r, { q: `A rope ${p * n} m long is cut into pieces of ${p} m each. How many cuts are needed?`, ans: n - 1, ex: `${p * n}/${p} = ${n} pieces need ${n - 1} cuts.` });
  },
  (r) => {
    const N = int(r, 20, 400);
    const d = Math.min(N, 9) + Math.max(0, Math.min(N, 99) - 9) * 2 + Math.max(0, N - 99) * 3;
    return numMcq(r, { q: `How many digits are used to number the pages of a book from 1 to ${N}?`, ans: d, ex: `${['Pages 1–' + Math.min(N, 9) + ': ' + Math.min(N, 9) + ' pages × 1 digit = ' + Math.min(N, 9) + ' digits', N > 9 ? 'pages 10–' + Math.min(N, 99) + ': ' + (Math.min(N, 99) - 9) + ' pages × 2 digits = ' + (Math.min(N, 99) - 9) * 2 + ' digits' : '', N > 99 ? 'pages 100–' + N + ': ' + (N - 99) + ' pages × 3 digits = ' + (N - 99) * 3 + ' digits' : ''].filter(Boolean).join('; ')}. Total = ${d} digits.` });
  },
  (r) => {
    const d = pick(r, [4, 5, 8, 10, 12]);
    const n = int(r, 5, 40);
    return numMcq(r, { q: `Trees are planted every ${d} m along one side of a ${d * n} m road, including both ends. How many trees are planted?`, ans: n + 1, ex: `Number of gaps = road length ÷ spacing = ${d * n} ÷ ${d} = ${n}. With a tree at both ends there is one more tree than gaps: ${n} + 1 = ${n + 1} trees.` });
  },
  (r) => {
    const x = int(r, 2, 30);
    const k = pick(r, [2, 3, 4, 5]);
    return numMcq(r, { q: `When 3 is added to a number and the sum is multiplied by ${k}, the result is ${(x + 3) * k}. What is the number?`, ans: x, ex: `${(x + 3) * k} ÷ ${k} − 3 = ${x}.` });
  },
  (r) => {
    const b = int(r, 10, 40);
    const k = int(r, 2, 12);
    return numMcq(r, { q: `A is ${k} years older than B, and their ages add up to ${2 * b + k}. How old is A?`, ans: b + k, ex: `B = (${2 * b + k} − ${k})/2 = ${b}, so A = ${b + k}.` });
  },
];
export const logicalArithmetic = (r) => LOGIC[Math.floor(r() * LOGIC.length)](r);
