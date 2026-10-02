'use client';

import type { RankedStudent, Student } from '@/lib/classroom';

export function GenderBadge({ gender }: { gender: Student['g'] | undefined }) {
  if (!gender) return <span className="text-xs font-semibold text-slate-500">Gender belum diatur</span>;

  const isFemale = gender === 'Perempuan';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-extrabold ${isFemale ? 'text-pink-700' : 'text-blue-700'}`}>
      <span aria-hidden="true">{isFemale ? '♀' : '♂'}</span>
      {gender}
    </span>
  );
}

export function Minion() {
  return (
    <svg className="podium-minion" viewBox="0 0 100 150" aria-hidden="true">
      <g className="podium-arm podium-arm-left">
        <rect x="2" y="62" width="20" height="9" rx="4.5" fill="#f7d33f" stroke="#c99a00" strokeWidth="2" transform="rotate(-30 22 66)" />
      </g>
      <g className="podium-arm podium-arm-right">
        <rect x="78" y="62" width="20" height="9" rx="4.5" fill="#f7d33f" stroke="#c99a00" strokeWidth="2" transform="rotate(30 78 66)" />
      </g>
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

export function Spotlights() {
  return (
    <div className="hero-spotlights" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

export function Podium({ students }: { students: RankedStudent[] }) {
  const topThree = students.slice(0, 3);
  const heightByRank: Record<number, number> = { 1: 245, 2: 170, 3: 130 };
  const podiumEntries = [
    topThree[1],
    topThree[0],
    topThree[2],
  ].filter((student): student is RankedStudent => Boolean(student))
    .map((student) => ({ student, height: heightByRank[student.rank] ?? 130 }));

  return (
    <section className="podium-stage relative left-1/2 my-2 flex w-screen -translate-x-1/2 items-end justify-center px-2 pt-3" aria-label="Podium tiga teratas">
      <div className="podium-inner mx-auto flex w-full max-w-[640px] items-end justify-center gap-1.5 sm:gap-2">
        {podiumEntries.map(({ student, height }) => (
          <div key={student.originalIndex} className="flex max-w-[200px] flex-1 flex-col items-center">
            <Minion />
            <div className="my-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-xs font-black text-blue-900 shadow">{student.n.charAt(0).toUpperCase()}</div>
            <div className="mt-0.5 w-full break-words text-center text-[clamp(12px,3vw,15px)] font-black" title={student.n}>{student.n}</div>
            {student.g && <GenderBadge gender={student.g} />}
            <div className="my-0.5 rounded-full bg-amber-300 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-900">{student.p} poin</div>
            <div className="podium-block flex w-full justify-center rounded-t-xl bg-gradient-to-b from-amber-300 to-yellow-600 pt-1 text-4xl font-black text-blue-900 shadow-[inset_0_-6px_0_rgba(0,0,0,0.08)] transition-[height] duration-500 ease-out" style={{ height: `min(${height}px, 28svh)` }}>{student.rank}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
