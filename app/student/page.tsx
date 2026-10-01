'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CLASS_DOCUMENT, createDefaultStudents, normalizeStudents, rankStudents, type Student } from '@/lib/classroom';
import { Podium } from '@/components/classroom-ui';

export default function StudentPage() {
  const [students, setStudents] = useState<Student[]>(createDefaultStudents);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const classRef = doc(db, CLASS_DOCUMENT.collection, CLASS_DOCUMENT.id);
    return onSnapshot(classRef, (snapshot) => {
      setStudents(snapshot.exists() ? normalizeStudents(snapshot.data().students) : createDefaultStudents());
      setError('');
    }, () => setError('Data kelas gagal dimuat. Periksa koneksi Firebase.'));
  }, []);

  const ranked = rankStudents(students);
  return (
    <main className="min-h-screen bg-amber-50 p-4 pb-16 font-sans text-slate-800">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-black text-amber-500">RANKING KELAS</h1>
        <p className="text-sm font-extrabold">Hyundai Jump School Batch 3 · Kelas X SMKS YPUL Lagoa</p>
        <button onClick={() => router.push('/')} className="mt-2 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-red-600">Keluar (Logout)</button>
      </header>
      {error && <p role="alert" className="mx-auto max-w-xl rounded-xl bg-red-100 p-3 text-center text-sm font-bold text-red-700">{error}</p>}
      <Podium students={ranked} />
      <section className="mx-auto max-w-xl">
        <h2 className="mb-3 text-center text-xl font-black">Semua Peserta</h2>
        <div className="space-y-2">
          {ranked.map((student) => (
            <div key={student.originalIndex} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-amber-200 bg-white p-3 shadow-sm">
              <div className="flex min-w-0 items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-black">{student.rank}</div><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-black text-blue-900">{student.n.charAt(0).toUpperCase()}</div><span className="truncate font-bold">{student.n}</span></div>
              <span className="shrink-0 text-lg font-black text-blue-600">{student.p} poin</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
