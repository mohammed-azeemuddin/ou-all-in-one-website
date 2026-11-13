/**
 * Compiles and runs every code-output question and checks the real output equals the marked answer.
 * SQL questions are run in SQLite (sqlite3).
 * Needs clang, clang++, javac/java, python3 and sqlite3 locally (it is not run on Netlify).
 *
 *   node scripts/verify-code.mjs            # all languages
 *   node scripts/verify-code.mjs c cpp      # some languages
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { C, CPP } from '../content/placements/tech-c-cpp.mjs';
import { JAVA, PYTHON } from '../content/placements/tech-java-python.mjs';
import { SQL_CHECKS } from '../content/placements/tech-sql.mjs';
import { PROBLEMS } from '../content/placements/coding.mjs';

const BANKS = { c: C, cpp: CPP, java: JAVA, python: PYTHON };
const want = process.argv.slice(2);
const langs = (want.length ? want : [...Object.keys(BANKS), 'sql']).filter((l) => BANKS[l]);
const doSql = !want.length || want.includes('sql');

function run(lang, code, dir) {
  const opts = { cwd: dir, timeout: 20000, stdio: ['ignore', 'pipe', 'pipe'] };
  if (lang === 'c') {
    writeFileSync(join(dir, 'm.c'), code);
    execFileSync('clang', ['-std=c11', '-w', '-o', 'm', 'm.c'], opts);
    return execFileSync('./m', opts).toString();
  }
  if (lang === 'cpp') {
    writeFileSync(join(dir, 'm.cpp'), code);
    execFileSync('clang++', ['-std=c++17', '-w', '-o', 'm', 'm.cpp'], opts);
    return execFileSync('./m', opts).toString();
  }
  if (lang === 'java') {
    const cls = code.match(/public\s+class\s+(\w+)/)?.[1] ?? 'Main';
    writeFileSync(join(dir, `${cls}.java`), code);
    execFileSync('javac', [`${cls}.java`], opts);
    return execFileSync('java', [cls], opts).toString();
  }
  writeFileSync(join(dir, 'm.py'), code);
  return execFileSync('python3', ['-I', 'm.py'], opts).toString();
}

let bad = 0, checked = 0;
for (const lang of langs) {
  for (const row of BANKS[lang]) {
    const [q, code, correct] = row;
    if (!code) continue;
    const dir = mkdtempSync(join(tmpdir(), 'pq-'));
    try {
      const out = run(lang, code, dir).replace(/\s+$/, '');
      checked++;
      if (out !== correct) {
        bad++;
        console.log(`✗ ${lang}: expected "${correct}" got "${out}"\n${code}\n`);
      }
    } catch (e) {
      bad++;
      console.log(`✗ ${lang}: failed to build or run\n${code}\n${e.stderr?.toString() ?? e.message}\n`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
}
if (doSql) {
  for (const { setup, query, correct } of SQL_CHECKS) {
    try {
      const out = execFileSync('sqlite3', ['-batch', '-noheader', '-list', '-separator', ' ', '-nullvalue', 'NULL', ':memory:'], { input: `${setup}\n${query}\n`, timeout: 20000 })
        .toString().trim().split('\n').filter(Boolean).join(', ');
      checked++;
      if (out !== correct) {
        bad++;
        console.log(`✗ sql: expected "${correct}" got "${out}"\n${query}\n`);
      }
    } catch (e) {
      bad++;
      console.log(`✗ sql: failed\n${query}\n${e.stderr?.toString() ?? e.message}\n`);
    }
  }
}
// Coding practice: every published sample must equal what the Python reference solution prints.
if (!want.length || want.includes('coding')) {
  let samples = 0;
  for (const p of PROBLEMS) {
    for (const s of p.samples) {
      try {
        const out = execFileSync('python3', ['-I', '-c', p.solution], { input: `${s.in}\n`, timeout: 20000, stdio: ['pipe', 'pipe', 'pipe'] }).toString().trimEnd();
        samples++;
        if (out !== s.out) {
          bad++;
          console.log(`✗ coding ${p.id}: expected "${s.out}" got "${out}"`);
        }
      } catch (e) {
        bad++;
        console.log(`✗ coding ${p.id}: solution failed\n${e.stderr?.toString() ?? e.message}`);
      }
    }
  }
  console.log(`${PROBLEMS.length} coding problems, ${samples} samples checked`);
}
console.log(`${checked} code questions run, ${bad} wrong`);
process.exit(bad ? 1 : 0);
