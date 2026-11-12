/**
 * Logical reasoning. Original questions generated from templates; answers are computed
 * (seating puzzles are solved by brute force to make sure exactly one answer fits).
 */
import { int, mcq, numMcq, pick, shuffle, fmtNum } from './lib.mjs';

const NAMES = ['Asha', 'Bilal', 'Chetan', 'Deepa', 'Esha', 'Farhan', 'Gopal', 'Hina', 'Irfan', 'Jaya', 'Kunal', 'Lata', 'Manoj', 'Nida'];
const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MEN = ['Bilal', 'Chetan', 'Farhan', 'Gopal', 'Irfan', 'Kunal', 'Manoj', 'Arjun', 'Ravi', 'Sameer'];
const WOMEN = ['Asha', 'Deepa', 'Esha', 'Hina', 'Jaya', 'Lata', 'Nida', 'Meena', 'Sara', 'Pooja'];
export const ord = (n) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] ?? 'th'}`;
const letter = (i) => L[((i % 26) + 26) % 26];

export const numberSeries = (r) =>
  pick(r, [
    () => {
      const a = int(r, 2, 30), d = int(r, 3, 15);
      const s = Array.from({ length: 6 }, (_, i) => a + i * d);
      return numMcq(r, { q: `Find the next number: ${s.slice(0, 5).join(', ')}, ?`, ans: s[5], near: [s[5] + d, s[5] - 1, s[5] + 2, s[4] + d - 2, s[5] + d / 2 | 0], ex: `Each term increases by ${d}: ${s[4]} + ${d} = ${s[5]}.` });
    },
    () => {
      const a = int(r, 1, 5), k = pick(r, [2, 3]);
      const s = Array.from({ length: 6 }, (_, i) => a * k ** i);
      return numMcq(r, { q: `Find the next number: ${s.slice(0, 5).join(', ')}, ?`, ans: s[5], ex: `Each term is multiplied by ${k}: ${s[4]} × ${k} = ${s[5]}.` });
    },
    () => {
      const st = int(r, 1, 8);
      const s = Array.from({ length: 6 }, (_, i) => (st + i) ** 2);
      return numMcq(r, { q: `Find the next number: ${s.slice(0, 5).join(', ')}, ?`, ans: s[5], ex: `These are squares: ${st}², ${st + 1}², … so the next is ${st + 5}² = ${s[5]}.` });
    },
    () => {
      const a = int(r, 1, 10), d0 = int(r, 1, 4), dd = int(r, 1, 3);
      const s = [a];
      for (let i = 0; i < 5; i++) s.push(s[i] + d0 + i * dd);
      return numMcq(r, { q: `Find the next number: ${s.slice(0, 5).join(', ')}, ?`, ans: s[5], ex: `Differences are ${s.slice(1).map((x, i) => x - s[i]).slice(0, 4).join(', ')}, growing by ${dd}. Next difference ${d0 + 4 * dd}, so ${s[4]} + ${d0 + 4 * dd} = ${s[5]}.` });
    },
    () => {
      const a = int(r, 2, 6);
      const s = [a];
      for (let i = 0; i < 5; i++) s.push(s[i] * 2 + 1);
      return numMcq(r, { q: `Find the next number: ${s.slice(0, 5).join(', ')}, ?`, ans: s[5], ex: `Each term = previous × 2 + 1: ${s[4]} × 2 + 1 = ${s[5]}.` });
    },
    () => {
      const st = int(r, 1, 5);
      const s = Array.from({ length: 6 }, (_, i) => (st + i) ** 3);
      return numMcq(r, { q: `Find the next number: ${s.slice(0, 5).join(', ')}, ?`, ans: s[5], ex: `These are cubes: next is ${st + 5}³ = ${s[5]}.` });
    },
    () => {
      const a = int(r, 10, 40), b = int(r, 2, 6), c = int(r, 2, 5);
      const s = [a, a + b, a + b - c, a + 2 * b - c, a + 2 * b - 2 * c, a + 3 * b - 2 * c];
      return numMcq(r, { q: `Find the next number: ${s.slice(0, 5).join(', ')}, ?`, ans: s[5], ex: `The pattern alternates +${b}, −${c}. Next: ${s[4]} + ${b} = ${s[5]}.` });
    },
  ])();

export const letterSeries = (r) =>
  pick(r, [
    () => {
      const st = int(r, 0, 10), k = int(r, 2, 4);
      const s = Array.from({ length: 6 }, (_, i) => letter(st + i * k));
      return mcq(r, { q: `Find the next letter: ${s.slice(0, 5).join(', ')}, ?`, correct: s[5], wrong: [letter(st + 5 * k + 1), letter(st + 5 * k - 1), letter(st + 5 * k + 2), letter(st + 4 * k + 1)], ex: `Each letter moves ${k} places forward: ${s[4]} + ${k} = ${s[5]}.` });
    },
    () => {
      const st = int(r, 0, 15);
      const s = Array.from({ length: 5 }, (_, i) => letter(st + i) + letter(st + i + 2));
      const ans = letter(st + 5) + letter(st + 7);
      return mcq(r, { q: `Find the next term: ${s.join(', ')}, ?`, correct: ans, wrong: [letter(st + 5) + letter(st + 6), letter(st + 6) + letter(st + 8), letter(st + 4) + letter(st + 7), letter(st + 5) + letter(st + 8)], ex: `First letters go ${s.map((x) => x[0]).join(', ')}…; the second letter is always 2 ahead of the first. Next: ${ans}.` });
    },
    () => {
      const st = int(r, 18, 25);
      const s = Array.from({ length: 6 }, (_, i) => letter(st - i * 2));
      return mcq(r, { q: `Find the next letter: ${s.slice(0, 5).join(', ')}, ?`, correct: s[5], wrong: [letter(st - 9), letter(st - 11), letter(st - 12), letter(st - 8)], ex: `The letters go backwards by 2: ${s[4]} − 2 = ${s[5]}.` });
    },
  ])();

const WORDS = ['PENCIL', 'MARKET', 'SILVER', 'GARDEN', 'BOTTLE', 'CAMERA', 'FOREST', 'WINTER', 'PLANET', 'ORANGE', 'TICKET', 'MOBILE', 'SCHOOL', 'FRIEND', 'BRIDGE', 'CANDLE', 'DOCTOR', 'FLOWER'];
const shiftWord = (w, k) => [...w].map((c) => letter(L.indexOf(c) + k)).join('');

export const codingDecoding = (r) =>
  pick(r, [
    () => {
      const [w1, w2] = shuffle(r, WORDS).slice(0, 2);
      const k = pick(r, [1, 2, 3, -1, -2]);
      const ans = shiftWord(w2, k);
      return mcq(r, { q: `If ${w1} is written as ${shiftWord(w1, k)} in a certain code, how is ${w2} written in that code?`, correct: ans, wrong: [shiftWord(w2, k + 1), shiftWord(w2, k - 1), shiftWord(w2, -k), [...ans].reverse().join('')], ex: `Each letter is shifted ${Math.abs(k)} place${Math.abs(k) > 1 ? 's' : ''} ${k > 0 ? 'forward' : 'backward'}: ${w2} → ${ans}.` });
    },
    () => {
      const [w1, w2] = shuffle(r, WORDS).slice(0, 2);
      const rev = (w) => [...w].reverse().join('');
      const ans = rev(w2);
      return mcq(r, { q: `If ${w1} is coded as ${rev(w1)}, how is ${w2} coded?`, correct: ans, wrong: [shiftWord(w2, 1), rev(shiftWord(w2, 1)), w2.slice(3) + w2.slice(0, 3), rev(w2.slice(0, 3)) + rev(w2.slice(3))], ex: `The word is written in reverse: ${w2} → ${ans}.` });
    },
    () => {
      const words = shuffle(r, ['CAT', 'DOG', 'BAT', 'SUN', 'PEN', 'CUP', 'BOX', 'HAT', 'MAP', 'JAM']).slice(0, 2);
      const val = (w) => [...w].reduce((s, c) => s + L.indexOf(c) + 1, 0);
      return numMcq(r, { q: `If ${words[0]} = ${val(words[0])} (adding letter positions A = 1 … Z = 26), what is ${words[1]}?`, ans: val(words[1]), ex: `${[...words[1]].map((c) => `${c} = ${L.indexOf(c) + 1}`).join(', ')}; total ${val(words[1])}.` });
    },
  ])();

const REL = [
  ['m', 'f', (a, b) => [`${a} is the son of ${b}'s only brother. How is ${a} related to ${b}?`, 'Nephew', ['Son', 'Cousin', 'Brother'], `${b}'s brother's son is ${b}'s nephew.`]],
  ['m', 'f', (a) => [`Pointing to a girl, ${a} says, "Her mother is the only daughter of my mother." How is ${a} related to the girl?`, 'Maternal uncle', ['Father', 'Brother', 'Grandfather'], `The only daughter of ${a}'s mother is ${a}'s sister, who is the girl's mother. So ${a} is her maternal uncle.`]],
  ['m', 'm', (a, b) => [`${a} is the father of ${b}. Chitra is the sister of ${a}. How is Chitra related to ${b}?`, 'Aunt', ['Mother', 'Sister', 'Grandmother'], `The father's sister is an aunt.`]],
  ['f', 'm', (a, b) => [`${a} is ${b}'s sister. ${b} is Kavya's husband. How is ${a} related to Kavya?`, 'Sister-in-law', ['Sister', 'Cousin', 'Mother-in-law'], `The husband's sister is a sister-in-law.`]],
  ['f', 'f', (a) => [`Introducing a man, ${a} says, "His wife is the only daughter of my father." How is ${a} related to the man?`, 'Wife', ['Sister', 'Daughter', 'Mother'], `The only daughter of ${a}'s father is ${a} herself, so she is the man's wife.`]],
  ['m', 'f', (a, b) => [`${a} is the brother of ${b}. ${b} is the daughter of Mohan. Ramesh is Mohan's father. How is ${a} related to Ramesh?`, 'Grandson', ['Son', 'Nephew', 'Great-grandson'], `${a} is Mohan's son, and Mohan is Ramesh's son, so ${a} is Ramesh's grandson.`]],
  ['f', 'f', (a, b) => [`${a} is ${b}'s mother. ${b} is Sunil's wife. How is ${a} related to Sunil?`, 'Mother-in-law', ['Mother', 'Aunt', 'Sister-in-law'], `The wife's mother is a mother-in-law.`]],
  ['m', 'm', (a, b) => [`${a}'s father is the only son of ${b}'s father. ${b} has no brothers or sisters. How is ${b} related to ${a}?`, 'Father', ['Brother', 'Grandfather', 'Uncle'], `${b}'s father's only son is ${b} himself, so ${b} is ${a}'s father.`]],
  ['f', 'f', (a, b) => [`${a} is the mother of ${b}. ${b}'s brother Vinod is married to Rekha. How is Rekha related to ${a}?`, 'Daughter-in-law', ['Daughter', 'Sister', 'Niece'], `Rekha is the wife of ${a}'s son Vinod, so she is ${a}'s daughter-in-law.`]],
  ['m', 'f', (a, b) => [`${a} is ${b}'s husband. ${b}'s father has only one child. How is ${a} related to ${b}'s father?`, 'Son-in-law', ['Son', 'Nephew', 'Brother-in-law'], `${b} is her father's only child, and ${a} is her husband, so ${a} is the father's son-in-law.`]],
  ['f', 'm', (a, b) => [`${a} is the daughter of ${b}'s grandfather's only son. ${b} is a boy. How is ${a} related to ${b}?`, 'Sister', ['Cousin', 'Aunt', 'Niece'], `${b}'s grandfather's only son is ${b}'s father, so ${a} is ${b}'s sister.`]],
];

export const bloodRelations = (r) => {
  const [ga, gb, t] = pick(r, REL);
  const a = pick(r, ga === 'm' ? MEN : WOMEN);
  let b = pick(r, gb === 'm' ? MEN : WOMEN);
  while (b === a) b = pick(r, gb === 'm' ? MEN : WOMEN);
  const [q, correct, wrong, ex] = t(a, b);
  return mcq(r, { q, correct, wrong, ex });
};

const DIRS = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
export const directionSense = (r) => {
  const legs = [];
  let face = 0, x = 0, y = 0; // face: 0=N,1=E,2=S,3=W
  const n = int(r, 3, 4);
  for (let i = 0; i < n; i++) {
    const turn = i === 0 ? 'starts walking North' : pick(r, ['right', 'left']);
    if (i > 0) face = (face + (turn === 'right' ? 1 : 3)) % 4;
    const d = int(r, 1, 8) * 5;
    legs.push([turn, d]);
    x += [0, d, 0, -d][face];
    y += [d, 0, -d, 0][face];
  }
  const dist = Math.hypot(x, y);
  if (!Number.isInteger(dist) || dist === 0) return directionSense(r);
  const sector = x === 0 ? (y > 0 ? 'North' : 'South') : y === 0 ? (x > 0 ? 'East' : 'West') : `${y > 0 ? 'North' : 'South'}-${x > 0 ? 'East' : 'West'}`;
  const [who] = shuffle(r, NAMES);
  const story = legs.map(([t, d], i) => (i === 0 ? `${who} starts walking North and goes ${d} m` : `turns ${t} and walks ${d} m`)).join(', then ');
  const correct = `${dist} m, ${sector}`;
  const opp = { North: 'South', South: 'North', East: 'West', West: 'East', 'North-East': 'South-West', 'South-West': 'North-East', 'North-West': 'South-East', 'South-East': 'North-West' };
  return mcq(r, {
    q: `${story}. How far is ${who} from the starting point, and in which direction?`,
    correct,
    wrong: [`${dist} m, ${opp[sector]}`, `${Math.abs(x) + Math.abs(y)} m, ${sector}`, `${dist + 5} m, ${sector}`, `${dist} m, ${pick(r, DIRS.filter((d) => d !== sector && d !== opp[sector]))}`],
    ex: `Net movement: ${Math.abs(x)} m ${x >= 0 ? 'East' : 'West'} and ${Math.abs(y)} m ${y >= 0 ? 'North' : 'South'}. Straight-line distance = √(${x}² + ${y}²) = ${dist} m towards the ${sector}.`,
  });
};

const NOUNS = [['pens', 'books', 'bags'], ['cats', 'dogs', 'birds'], ['roses', 'flowers', 'plants'], ['cars', 'buses', 'trucks'], ['chairs', 'tables', 'desks'], ['doctors', 'teachers', 'singers'], ['apples', 'fruits', 'seeds'], ['phones', 'laptops', 'tablets']];
const SYL = [
  ['All A are B.', 'All B are C.', 'All A are C.', 'Some C are A.', 'Both I and II follow', 'All A sit inside B, which sits inside C, so both are true.'],
  ['All A are B.', 'Some B are C.', 'Some A are C.', 'Some C are B.', 'Only II follows', 'The C that are B need not be A, so I does not follow; II is the converse of the second statement.'],
  ['Some A are B.', 'All B are C.', 'Some A are C.', 'All C are A.', 'Only I follows', 'The A that are B are also C, so I follows. Nothing says all C are A.'],
  ['All A are B.', 'No B is C.', 'No A is C.', 'Some C are A.', 'Only I follows', 'Every A is a B and no B is a C, so no A is a C; II contradicts I.'],
  ['Some A are B.', 'No B is C.', 'Some A are not C.', 'All A are C.', 'Only I follows', 'The A that are B cannot be C, so some A are not C.'],
  ['No A is B.', 'All B are C.', 'Some C are not A.', 'No A is C.', 'Only I follows', 'Every B is a C and no B is an A, so those C are not A. A and C may still overlap, so II does not follow.'],
  ['All A are B.', 'All A are C.', 'Some B are C.', 'All B are C.', 'Only I follows', 'Every A is both B and C, so some B are C. Not all B need be C.'],
  ['Some A are B.', 'Some B are C.', 'Some A are C.', 'No A is C.', 'Either I or II follows', 'Neither is certain alone, but they are opposites covering every case, so one of them must be true.'],
  ['No A is B.', 'No B is C.', 'No A is C.', 'Some A are C.', 'Either I or II follows', 'Nothing links A and C, but the two conclusions are opposites, so exactly one holds.'],
  ['All A are B.', 'Some C are not B.', 'Some C are not A.', 'All C are A.', 'Only I follows', 'The C outside B are also outside A (since all A are inside B).'],
];
export const syllogisms = (r) => {
  const [a, b, c] = pick(r, NOUNS);
  const [s1, s2, c1, c2, ans, ex] = pick(r, SYL);
  const sub = (t) => t.replace(/\bA\b/g, a).replace(/\bB\b/g, b).replace(/\bC\b/g, c).replace(/^(\w)/, (m) => m.toUpperCase());
  return mcq(r, {
    q: `Statements:\n1. ${sub(s1)}\n2. ${sub(s2)}\n\nConclusions:\nI. ${sub(c1)}\nII. ${sub(c2)}`,
    correct: ans,
    wrong: ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither I nor II follows', 'Either I or II follows'],
    ex: sub(ex),
  });
};

const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};
export const oddOneOut = (r) =>
  pick(r, [
    () => {
      const primes = shuffle(r, [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53]).slice(0, 3);
      const odd = pick(r, [21, 27, 33, 39, 49, 51, 57, 15, 25, 35]);
      return mcq(r, { q: `Find the odd one out: ${shuffle(r, [...primes, odd]).join(', ')}`, correct: String(odd), wrong: primes.map(String), ex: `${odd} is not prime (${odd} is divisible by ${[3, 5, 7].find((p) => odd % p === 0)}); the others are prime.` });
    },
    () => {
      const sq = shuffle(r, [16, 25, 36, 49, 64, 81, 100, 121, 144]).slice(0, 3);
      const odd = pick(r, [24, 32, 45, 50, 60, 72, 90, 99]);
      return mcq(r, { q: `Find the odd one out: ${shuffle(r, [...sq, odd]).join(', ')}`, correct: String(odd), wrong: sq.map(String), ex: `${odd} is not a perfect square; the others are.` });
    },
    () => {
      const k = pick(r, [6, 7, 8, 9]);
      const mult = shuffle(r, [2, 3, 4, 5, 6, 7, 8, 9, 11]).slice(0, 3).map((m) => m * k);
      let odd = k * int(r, 2, 9) + int(r, 1, k - 1);
      return mcq(r, { q: `Find the odd one out: ${shuffle(r, [...mult, odd]).join(', ')}`, correct: String(odd), wrong: mult.map(String), ex: `All except ${odd} are multiples of ${k}.` });
    },
    () => {
      const groups = [
        [['Mercury', 'Venus', 'Mars'], 'Moon', 'The Moon is a satellite; the others are planets.'],
        [['Rose', 'Lily', 'Lotus'], 'Mango', 'Mango is a fruit; the others are flowers.'],
        [['Keyboard', 'Mouse', 'Scanner'], 'Printer', 'A printer is an output device; the others are input devices.'],
        [['Python', 'Java', 'Ruby'], 'Linux', 'Linux is an operating system; the others are programming languages.'],
        [['Square', 'Rectangle', 'Rhombus'], 'Triangle', 'A triangle has three sides; the others have four.'],
        [['Hyderabad', 'Chennai', 'Bengaluru'], 'Telangana', 'Telangana is a state; the others are cities.'],
        [['Litre', 'Millilitre', 'Gallon'], 'Kilogram', 'Kilogram measures mass; the others measure volume.'],
        [['Cobra', 'Python', 'Viper'], 'Crocodile', 'A crocodile is not a snake.'],
      ];
      const [same, odd, ex] = pick(r, groups);
      return mcq(r, { q: `Find the odd one out: ${shuffle(r, [...same, odd]).join(', ')}`, correct: odd, wrong: same, ex });
    },
  ])();

export const analogies = (r) =>
  pick(r, [
    () => {
      const a = int(r, 2, 9), b = int(r, 2, 12);
      return numMcq(r, { q: `${a} : ${a * a} :: ${b} : ?`, ans: b * b, near: [b * b + 1, b * b - 1, b * 3, (b + 1) ** 2, b * b * b], ex: `The second number is the square of the first: ${b}² = ${b * b}.` });
    },
    () => {
      const a = int(r, 2, 6), b = int(r, 2, 8);
      return numMcq(r, { q: `${a} : ${a ** 3} :: ${b} : ?`, ans: b ** 3, near: [b * b, b ** 3 + b, b ** 3 - 1, (b + 1) ** 3], ex: `The second number is the cube of the first: ${b}³ = ${b ** 3}.` });
    },
    () => {
      const a = int(r, 3, 9), b = int(r, 3, 12);
      return numMcq(r, { q: `${a} : ${a * a - 1} :: ${b} : ?`, ans: b * b - 1, near: [b * b, b * b + 1, b * b - 2, (b - 1) ** 2], ex: `Rule: n² − 1. ${b}² − 1 = ${b * b - 1}.` });
    },
    () => {
      const st1 = int(r, 0, 10), st2 = int(r, 11, 20), k = int(r, 1, 3);
      const t = (s) => letter(s) + letter(s + 2) + letter(s + 4);
      const ans = [...t(st2)].map((c) => letter(L.indexOf(c) + k)).join('');
      return mcq(r, { q: `${t(st1)} : ${[...t(st1)].map((c) => letter(L.indexOf(c) + k)).join('')} :: ${t(st2)} : ?`, correct: ans, wrong: [[...t(st2)].map((c) => letter(L.indexOf(c) + k + 1)).join(''), [...ans].reverse().join(''), t(st2 + 1), [...t(st2)].map((c) => letter(L.indexOf(c) - k)).join('')], ex: `Each letter moves ${k} place${k > 1 ? 's' : ''} forward: ${t(st2)} → ${ans}.` });
    },
    () => {
      const pairs = [['Doctor', 'Hospital', 'Teacher', 'School'], ['Pen', 'Write', 'Knife', 'Cut'], ['Bird', 'Nest', 'Bee', 'Hive'], ['Eye', 'See', 'Ear', 'Hear'], ['Water', 'Thirst', 'Food', 'Hunger'], ['Author', 'Book', 'Composer', 'Music'], ['Fish', 'Water', 'Camel', 'Desert'], ['Hour', 'Minute', 'Minute', 'Second']];
      const [a, b, c, d] = pick(r, pairs);
      const others = shuffle(r, pairs.flat().filter((w) => ![a, b, c, d].includes(w)));
      return mcq(r, { q: `${a} : ${b} :: ${c} : ?`, correct: d, wrong: others, ex: `${a} relates to ${b} the same way ${c} relates to ${d}.` });
    },
  ])();

export const clocks = (r) => {
  const h = int(r, 1, 12), m = pick(r, [0, 10, 15, 20, 25, 30, 40, 45, 50]);
  let ang = Math.abs(30 * (h % 12) - 5.5 * m);
  if (ang > 180) ang = 360 - ang;
  if (ang === 0) return clocks(r);
  return numMcq(r, { q: `What is the angle between the hour and minute hands of a clock at ${h}:${String(m).padStart(2, '0')}?`, ans: ang, f: (v) => `${fmtNum(v)}°`, near: [ang + 5, ang - 5, ang + 7.5, 360 - ang, ang + 2.5, Math.abs(30 * h - 6 * m)], ex: `Angle = |30H − 5.5M| = |30 × ${h % 12} − 5.5 × ${m}| = ${fmtNum(Math.abs(30 * (h % 12) - 5.5 * m))}°${Math.abs(30 * (h % 12) - 5.5 * m) > 180 ? `, and 360 − that = ${fmtNum(ang)}°` : ''}.` });
};

const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const calendars = (r) => (r() < 0.4 ? daysAfter(r) : dateDay(r));
const daysAfter = (r) => {
  const start = int(r, 0, 6), n = int(r, 20, 400);
  const ans = DAY[(start + n) % 7];
  return mcq(r, { q: `If today is ${DAY[start]}, what day of the week will it be ${n} days from today?`, correct: ans, wrong: shuffle(r, DAY.filter((x) => x !== ans)), ex: `Days repeat every 7. ${n} = 7 × ${Math.floor(n / 7)} + ${n % 7}, so count ${n % 7} day${n % 7 === 1 ? '' : 's'} forward from ${DAY[start]}: ${ans}.` });
};
const dateDay = (r) => {
  const y = int(r, 2019, 2027);
  const start = new Date(Date.UTC(y, 0, 1));
  const mo = int(r, 1, 11), d = int(r, 1, 28);
  const target = new Date(Date.UTC(y, mo, d));
  const diff = Math.round((target - start) / 86400000);
  const ans = DAY[target.getUTCDay()];
  return mcq(r, {
    q: `If 1 January ${y} was a ${DAY[start.getUTCDay()]}, what day of the week was ${d} ${MON[mo]} ${y}?`,
    correct: ans,
    wrong: shuffle(r, DAY.filter((x) => x !== ans)),
    ex: `${d} ${MON[mo]} is ${diff} days after 1 January. ${diff} mod 7 = ${diff % 7}, so move ${diff % 7} day${diff % 7 === 1 ? '' : 's'} forward from ${DAY[start.getUTCDay()]}: ${ans}.`,
  });
};

export const ranking = (r) =>
  pick(r, [
    () => {
      const l = int(r, 5, 25), rr = int(r, 5, 25);
      const [w] = shuffle(r, NAMES);
      return numMcq(r, { q: `In a row of students, ${w} is ${ord(l)} from the left and ${ord(rr)} from the right. How many students are in the row?`, ans: l + rr - 1, near: [l + rr, l + rr + 1, l + rr - 2, l + rr - 3], ex: `Total = ${l} + ${rr} − 1 = ${l + rr - 1} (${w} is counted twice).` });
    },
    () => {
      const n = int(r, 20, 50), t = int(r, 3, n - 3);
      const [w] = shuffle(r, NAMES);
      return numMcq(r, { q: `${w} ranks ${ord(t)} from the top in a class of ${n}. What is ${w}'s rank from the bottom?`, ans: n - t + 1, near: [n - t, n - t + 2, n - t - 1, t + 1], ex: `Rank from bottom = ${n} − ${t} + 1 = ${n - t + 1}.` });
    },
  ])();

// Linear seating: 5 people in a row facing north; clues are added until exactly one order fits.
function perms(a) {
  if (a.length <= 1) return [a];
  return a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
}
export const seating = (r) => {
  const people = shuffle(r, NAMES).slice(0, 5);
  const truth = shuffle(r, people);
  const pos = (arr, p) => arr.indexOf(p);
  const clueKinds = [
    () => { const [a, b] = shuffle(r, people); return [`${a} sits somewhere to the left of ${b}.`, (o) => pos(o, a) < pos(o, b)]; },
    () => { const i = int(r, 0, 3); const a = truth[i], b = truth[i + 1]; return [`${b} sits immediately to the right of ${a}.`, (o) => pos(o, b) === pos(o, a) + 1]; },
    () => { const a = pick(r, [truth[0], truth[4]]); return [`${a} sits at one of the ends.`, (o) => pos(o, a) === 0 || pos(o, a) === 4]; },
    () => { const i = int(r, 1, 3); return [`${truth[i]} sits between ${truth[i - 1]} and ${truth[i + 1]}.`, (o) => Math.abs(pos(o, truth[i - 1]) - pos(o, truth[i])) === 1 && Math.abs(pos(o, truth[i + 1]) - pos(o, truth[i])) === 1]; },
    () => { const [a, b] = shuffle(r, people); const d = Math.abs(pos(truth, a) - pos(truth, b)) - 1; return [d === 0 ? `${a} and ${b} sit next to each other.` : `Exactly ${d} ${d === 1 ? 'person sits' : 'people sit'} between ${a} and ${b}.`, (o) => Math.abs(pos(o, a) - pos(o, b)) - 1 === d]; },
  ];
  const clues = [];
  let cand = perms(people);
  for (let guard = 0; cand.length > 1 && guard < 60; guard++) {
    const [text, test] = pick(r, clueKinds)();
    if (!test(truth) || clues.some((c) => c[0] === text)) continue;
    const next = cand.filter(test);
    if (next.length < cand.length) {
      clues.push([text, test]);
      cand = next;
    }
  }
  if (cand.length !== 1 || clues.length > 6) return seating(r);
  const ask = pick(r, [[2, 'in the middle'], [0, 'at the extreme left'], [4, 'at the extreme right']]);
  return mcq(r, {
    q: `Five friends, ${[...people].sort().join(', ')}, sit in a row facing north.\n${clues.map(([t]) => `• ${t}`).join('\n')}\n\nWho sits ${ask[1]}?`,
    correct: truth[ask[0]],
    wrong: people.filter((p) => p !== truth[ask[0]]),
    ex: `Only one order fits all the clues: ${truth.join(', ')} (left to right). So ${truth[ask[0]]} sits ${ask[1]}.`,
  });
};

// Inequalities: a chain like A ≥ B > C = D ≤ E. A relation between two letters is definite only
// when every sign between them points the same way.
export const inequalities = (r) => {
  const letters = shuffle(r, ['P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W']).slice(0, 5);
  const signs = Array.from({ length: 4 }, () => pick(r, ['>', '≥', '=', '<', '≤']));
  const chain = letters.map((l, i) => (i < 4 ? `${l} ${signs[i]} ` : l)).join('');
  const rel = (i, j) => {
    const seg = signs.slice(i, j);
    if (seg.every((x) => x === '=')) return 'eq';
    if (seg.every((x) => ['>', '≥', '='].includes(x))) return seg.includes('>') ? 'gt' : 'ge';
    if (seg.every((x) => ['<', '≤', '='].includes(x))) return seg.includes('<') ? 'lt' : 'le';
    return null;
  };
  const holds = (op, rl) => ({ '>': rl === 'gt', '<': rl === 'lt', '=': rl === 'eq', '≥': ['gt', 'ge', 'eq'].includes(rl), '≤': ['lt', 'le', 'eq'].includes(rl) })[op];
  const pair = () => { const a = int(r, 0, 3); return [a, int(r, a + 1, 4)]; };
  const [i, j] = pair();
  const r1 = rel(i, j);
  const opts = ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither I nor II follows', 'Either I or II follows'];
  if ((r1 === 'ge' || r1 === 'le') && r() < 0.5) {
    const g = r1 === 'ge' ? '>' : '<';
    return mcq(r, {
      q: `Statement: ${chain}\n\nConclusions:\nI. ${letters[i]} ${g} ${letters[j]}\nII. ${letters[i]} = ${letters[j]}`,
      correct: 'Either I or II follows',
      wrong: opts,
      ex: `Along the chain ${letters[i]} ${r1 === 'ge' ? '≥' : '≤'} ${letters[j]}. Neither conclusion is certain alone, but one of them must be true, so either I or II follows.`,
    });
  }
  const conc = (a, b) => {
    const rl = rel(a, b);
    const trueOps = ['>', '<', '=', '≥', '≤'].filter((op) => holds(op, rl));
    const op = trueOps.length && r() < 0.6 ? pick(r, trueOps) : pick(r, ['>', '<', '≥', '≤']);
    return [`${letters[a]} ${op} ${letters[b]}`, holds(op, rl)];
  };
  const [t1, ok1] = conc(i, j);
  let [k, l] = pair();
  if (k === i && l === j) [k, l] = k > 0 ? [k - 1, l] : [k, Math.min(4, l + 1) === l ? l - 1 : l + 1];
  if (k === l) [k, l] = [0, 4];
  const [t2, ok2] = conc(Math.min(k, l), Math.max(k, l));
  const ans = ok1 && ok2 ? opts[2] : ok1 ? opts[0] : ok2 ? opts[1] : opts[3];
  return mcq(r, {
    q: `Statement: ${chain}\n\nConclusions:\nI. ${t1}\nII. ${t2}`,
    correct: ans,
    wrong: opts,
    ex: `A relation is certain only if every sign between the two letters points the same way. I is ${ok1 ? 'certain' : 'not certain'}; II is ${ok2 ? 'certain' : 'not certain'}.`,
  });
};

export const alphabetPosition = (r) => {
  const k = int(r, 5, 20), m = int(r, 2, 6);
  const dir = pick(r, ['right', 'left']);
  const base = k - 1;
  const idx = dir === 'right' ? base + m : base - m;
  if (idx < 0 || idx > 25) return alphabetPosition(r);
  return mcq(r, { q: `In the English alphabet, which letter is ${ord(m)} to the ${dir} of the ${ord(k)} letter from the left?`, correct: L[idx], wrong: [L[idx + 1] ?? 'Z', L[idx - 1] ?? 'A', L[base], L[25 - idx]], ex: `The ${ord(k)} letter is ${L[base]}. Moving ${m} to the ${dir} gives ${L[idx]}.` });
};

export const REASONING_TOPICS = [
  ['number-series', 'Number Series', numberSeries, 'Find the next number: arithmetic, geometric, squares, cubes.'],
  ['letter-series', 'Letter Series', letterSeries, 'Alphabet patterns and skips.'],
  ['coding-decoding', 'Coding and Decoding', codingDecoding, 'Letter shifts, reversals and number codes.'],
  ['blood-relations', 'Blood Relations', bloodRelations, 'Family relationships from statements.'],
  ['direction-sense', 'Direction Sense', directionSense, 'Distance and direction after a walk.'],
  ['syllogisms', 'Syllogisms', syllogisms, 'Which conclusions follow from the statements.'],
  ['odd-one-out', 'Odd One Out', oddOneOut, 'Classification of numbers and words.'],
  ['analogies', 'Analogies', analogies, 'Number, letter and word relationships.'],
  ['seating-arrangement', 'Seating Arrangement', seating, 'Linear arrangements from clues.'],
  ['inequalities', 'Inequalities', inequalities, 'Conclusions from coded inequality chains.'],
  ['clocks', 'Clocks', clocks, 'Angle between the hands.'],
  ['calendars', 'Calendars', calendars, 'Day of the week for a date.'],
  ['ranking-order', 'Ranking and Order', ranking, 'Positions from the left, right, top and bottom.'],
  ['alphabet-test', 'Alphabet Test', alphabetPosition, 'Letter positions in the alphabet.'],
];
