'use client';

import type { RankedStudent } from '@/lib/classroom';

export function Minion() {
  return (
    <svg className="minion-float" viewBox="0 0 100 150" aria-hidden="true">
      <rect className="minion-arm-left" x="2" y="62" width="20" height="9" rx="4.5" fill="#f7d33f" stroke="#c99a00" strokeWidth="2" />
      <rect className="minion-arm-right" x="78" y="62" width="20" height="9" rx="4.5" fill="#f7d33f" stroke="#c99a00" strokeWidth="2" />
      <rect x="20" y="8" width="60" height="118" rx="30" fill="#f7d33f" stroke="#c99a00" strokeWidth="2" />
      <path d="M20 92h60v14q0 20-30 20t-30-20z" fill="#3b63c4" />
      <rect x="38" y="82" width="24" height="22" fill="#3b63c4" />
      <rect x="20" y="36" width="60" height="9" fill="#333" />
      <circle cx="50" cy="40" r="17" fill="#ccd" stroke="#99a" strokeWidth="4" />
      <circle cx="50" cy="40" r="11" fill="#fff" />
      <circle cx="52" cy="41" r="5" fill="#6b4423" />
      <circle cx="53" cy="41" r="2.4" fill="#000" />
      <path d="M36 68q14 16 28 0z" fill="#5a2a1a" stroke="#333" strokeWidth="2" />
      <g fill="#333"><rect x="33" y="124" width="12" height="12" rx="4" /><rect x="55" y="124" width="12" height="12" rx="4" /></g>
    </svg>
  );
}

export function Podium({ students }: { students: RankedStudent[] }) {
  const topThree = students.slice(0, 3);
  const highest = topThree[0]?.p ?? 0;
  const lowest = topThree[topThree.length - 1]?.p ?? 0;
  const podiumHeight = (points: number) => highest === lowest ? 120 : 80 + Math.round(((points - lowest) / (highest - lowest)) * 70);

  return (
    <section className="mx-auto my-6 flex min-h-[300px] max-w-xl items-end justify-center gap-3 rounded-3xl bg-amber-200/40 p-4" aria-label="Podium tiga teratas">
      {[topThree[1], topThree[0], topThree[2]].filter((student): student is RankedStudent => Boolean(student)).map((student) => (
        <div key={student.originalIndex} className="flex max-w-[120px] flex-1 flex-col items-center">
          <Minion />
          <div className="my-1 flex h-9 w-9 items-center justify-center rounded-full bg-amber-300 text-xs font-black text-blue-900 shadow">{student.n.charAt(0).toUpperCase()}</div>
          <div className="w-full truncate text-center text-xs font-extrabold" title={student.n}>{student.n}</div>
          <div className="my-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-extrabold text-blue-900">{student.p} poin</div>
          <div className="flex w-full justify-center rounded-t-xl bg-amber-500 pt-2 text-xl font-black text-blue-900" style={{ height: `${podiumHeight(student.p)}px` }}>{student.rank}</div>
        </div>
      ))}
    </section>
  );
}
