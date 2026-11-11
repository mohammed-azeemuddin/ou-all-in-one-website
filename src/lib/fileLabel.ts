// Copied from the app (ou-all-in-one/src/lib/fileLabel.ts). Keep the two in step.
/**
 * Turns messy Drive file names ("Document from moinkhan (3)", "Share _AEC UNIT 4.pdf_",
 * "Gears notes Idrees", "MD part 1 KHIZAR") into neutral labels without uploaders' names:
 * "Unit 4", "Part 3 · 2 marks", "Part 5 · Previous year".
 */
const KINDS: [RegExp, string][] = [
  [/\b(2|two)[\s-]?marks?\b|\b2m\b|\bsaqs?\b|short\s+answers?/i, '2 marks'],
  [/\blaqs?\b|long\s+answers?/i, 'Long answers'],
  [/previous|pyq|old\s+papers?|question\s+papers?/i, 'Previous year'],
  [/\bimp\b|important/i, 'Important questions'],
  [/question\s+bank|\bqb\b/i, 'Question bank'],
  [/text\s*book|\btb\b/i, 'Textbook'],
  [/syllabus/i, 'Syllabus'],
  [/\blab\b|record|viva/i, 'Lab'],
  [/assignment/i, 'Assignment'],
  [/\bppt\b|slides?/i, 'Slides'],
];

function unitOf(name: string): string | null {
  const m = name.match(/\bunit[\s_-]*(\d+|[ivx]+)\b/i);
  if (!m) return null;
  const v = m[1].toLowerCase();
  const roman: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8 };
  return `Unit ${roman[v] ?? Number(v)}`;
}

function kindOf(name: string): string | null {
  for (const [re, label] of KINDS) if (re.test(name)) return label;
  return null;
}

/** Labels for every file in a folder, in the order given (already sorted). */
export function neutralLabels(names: string[]): string[] {
  const used = new Map<string, number>();
  const base = names.map((raw) => {
    const n = raw.replace(/[_.]+/g, ' ');
    const unit = unitOf(n);
    const kind = kindOf(n);
    return unit ? (kind ? `${unit} · ${kind}` : unit) : kind;
  });
  // Count how often each label occurs so duplicates get numbered.
  const totals = new Map<string, number>();
  base.forEach((b) => b && totals.set(b, (totals.get(b) ?? 0) + 1));
  let part = 0;
  return base.map((b) => {
    if (!b) return `Part ${++part}`;
    if ((totals.get(b) ?? 0) < 2) return b;
    const n = (used.get(b) ?? 0) + 1;
    used.set(b, n);
    return `${b} (${n})`;
  });
}

/** Sort key that keeps Unit 1..8 in order, then everything else in Drive's natural order. */
export function unitSortKey(name: string): number {
  const u = unitOf(name.replace(/[_.]+/g, ' '));
  return u ? Number(u.split(' ')[1]) : 99;
}
