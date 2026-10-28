// Builds the PRIVATE teacher answer sheet (Word) from the app data + class/answers.ts.
// Output: class/Bend-It-Quest-Answer-Sheet.docx (git-ignored). Run: npm run answer-sheet
import { writeFileSync } from 'node:fs';
import {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, LevelFormat, Packer, PageBreak, PageNumber,
  Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} from 'docx';
import { LEVELS } from '../src/data/levels';
import { STAGES } from '../src/lib/codes';
import { CLASS_CODE } from '../src/data/config';
import type { GameSpec, Task } from '../src/types';
// @ts-ignore private, git-ignored
import { ANSWERS } from '../class/answers';
// @ts-ignore private, git-ignored
import { HOLIDAY_TEST } from '../class/holiday-test';

const GREEN = '1E6B3A';
const p = (text: string, opts: { bold?: boolean; italics?: boolean; color?: string; size?: number } = {}) => new Paragraph({ children: [new TextRun({ text, ...opts })] });
const bullet = (text: string, level = 0) => {
  const open = text.startsWith('OPEN:');
  const runs = open
    ? [new TextRun({ text: 'Open answer: ', bold: true, color: '8A6D00' }), new TextRun(text.slice(5).trim())]
    : [new TextRun(text)];
  return new Paragraph({ numbering: { reference: 'bullets', level }, children: runs, spacing: { after: 40 } });
};
const h = (text: string, heading: (typeof HeadingLevel)[keyof typeof HeadingLevel]) => new Paragraph({ heading, children: [new TextRun(text)] });

const missing: string[] = [];
function taskBlock(t: Task, label: string) {
  const out: Paragraph[] = [
    new Paragraph({
      spacing: { before: 160, after: 60 },
      children: [new TextRun({ text: `${label} · ${t.focus}: `, bold: true, color: GREEN }), new TextRun({ text: t.title.replace('⚡ ', ''), bold: true })],
    }),
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `Task: ${t.prompt}`, italics: true, size: 18, color: '555555' })] }),
  ];
  const a: string[] | undefined = ANSWERS[t.id];
  if (!a) missing.push(t.id);
  (a ?? ['(no answer written)']).forEach((x) => out.push(bullet(x)));
  return out;
}

function gameKey(g: GameSpec): Paragraph[] {
  const out: Paragraph[] = [new Paragraph({ spacing: { before: 160, after: 60 }, children: [new TextRun({ text: `Game key · ${g.title}`, bold: true, color: GREEN })] })];
  switch (g.kind) {
    case 'memory':
      g.pairs.forEach(([w, d]) => out.push(bullet(`${w} = ${d}`)));
      break;
    case 'scramble':
      g.words.forEach((w) => out.push(bullet(`${w.word} (${w.clue})`)));
      break;
    case 'kick':
      g.questions.forEach((q, i) => out.push(bullet(`${i + 1}. ${q.q} → ${String.fromCharCode(65 + q.answer)}) ${q.options[q.answer]}  (${q.why})`)));
      break;
    case 'sort':
      g.bins.forEach((b, bi) => {
        out.push(bullet(`${b}:`));
        g.items.filter((it) => it.bin === bi).forEach((it) => out.push(bullet(it.text, 1)));
      });
      break;
    case 'timeline':
      g.events.forEach((e, i) => out.push(bullet(`${i + 1}. ${e}`)));
      break;
    case 'truefalse':
      g.statements.forEach((s) => out.push(bullet(`${s.t ? 'TRUE' : 'FALSE'}: ${s.s} (${s.why})`)));
      break;
  }
  return out;
}

const W = 9026; // A4 text width (DXA) with 1" margins
function codeTable() {
  const cell = (t: string, head = false) =>
    new TableCell({
      width: { size: W / 2, type: WidthType.DXA },
      shading: head ? { type: ShadingType.CLEAR, fill: 'E8F2EC', color: 'auto' } : undefined,
      children: [new Paragraph({ children: [new TextRun({ text: t, bold: head })] })],
    });
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W / 2, W / 2],
    rows: [
      new TableRow({ children: [cell('What opens', true), cell('Code', true)] }),
      new TableRow({ children: [cell('Chapters 1–5'), cell(`${CLASS_CODE} (same for everyone)`)] }),
      ...STAGES.slice(1).map((st, i) => new TableRow({ children: [cell(st.label), cell(`Code ${i + 2} (personal, see class sheet)`)] })),
    ],
  });
}

const children: (Paragraph | Table)[] = [
  new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun('Bend It Quest: Mega Answer Sheet')] }),
  p('Bend It Like Beckham (Narinder Dhami) · K07 · Teacher copy · CONFIDENTIAL', { color: '555555' }),
  p('Page references: Hodder paperback (2002). "Open answer" = no single correct answer; bullets show what a strong answer includes.', { italics: true, size: 18 }),
  h('Unlock codes', HeadingLevel.HEADING_2),
  codeTable(),
];

for (const l of LEVELS) {
  children.push(new Paragraph({ children: [new PageBreak()] }));
  const num = l.id === 14 ? 'Finale' : l.extra ? 'Extra Time' : `Level ${l.id}`;
  children.push(h(`${num}: ${l.title}`, HeadingLevel.HEADING_1));
  children.push(p(`${l.chapter} · ${l.pages} · Week ${l.week}`, { color: '555555' }));

  children.push(h('Warm-Up (before reading)', HeadingLevel.HEADING_2));
  l.pre.forEach((t, i) => children.push(...taskBlock(t, `W${i + 1}`)));

  children.push(h('Vocab Drill', HeadingLevel.HEADING_2));
  l.vocab.forEach((v) => children.push(bullet(`${v.word} (${v.wordClass}): ${v.meaning}`)));

  children.push(h('Match Play (while reading)', HeadingLevel.HEADING_2));
  l.whilst.forEach((t, i) => children.push(...taskBlock(t, `M${i + 1}`)));

  children.push(h('Cool-Down (after reading)', HeadingLevel.HEADING_2));
  l.post.forEach((t, i) => children.push(...taskBlock(t, `C${i + 1}`)));

  children.push(h('Sprinter Challenge', HeadingLevel.HEADING_2));
  children.push(...taskBlock(l.sprinter, 'S'));

  children.push(h('Game', HeadingLevel.HEADING_2));
  children.push(...gameKey(l.game));
}

// Appendix: holiday reading test (Chapters 1–5)
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h('Appendix: Holiday Reading Test (Chapters 1–5)', HeadingLevel.HEADING_1));
children.push(h('Part A: Multiple choice', HeadingLevel.HEADING_2));
HOLIDAY_TEST.mc.forEach((x: string) => children.push(bullet(x)));
children.push(h('Part B: Correct order', HeadingLevel.HEADING_2));
HOLIDAY_TEST.order.forEach((x: string) => children.push(bullet(x)));
children.push(p('Suggested marking: Part A 15 × 1 point; Part B 1 point per correct position (10). Total 25.', { italics: true }));

const doc = new Document({
  creator: 'Sebastian Ghofranifar',
  title: 'Bend It Quest – Mega Answer Sheet',
  styles: {
    default: { document: { run: { font: 'Calibri', size: 21 } } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', run: { size: 44, bold: true, color: GREEN }, paragraph: { spacing: { after: 120 } } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, color: GREEN }, paragraph: { spacing: { before: 120, after: 60 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GREEN, space: 4 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, color: '222222' }, paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } },
          { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 260 } } } },
        ],
      },
    ],
  },
  sections: [
    {
      properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Bend It Quest · Teacher answer sheet · CONFIDENTIAL', size: 16, color: '888888' })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ size: 16, color: '888888', children: ['© 2026 Sebastian Ghofranifar, GSIS · CC BY 4.0 · Page ', PageNumber.CURRENT] })] })] }) },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  writeFileSync('class/Bend-It-Quest-Answer-Sheet.docx', buf);
  console.log('Written class/Bend-It-Quest-Answer-Sheet.docx');
  if (missing.length) console.log('MISSING ANSWERS:', missing.join(', '));
});
