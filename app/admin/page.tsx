'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CLASS_DOCUMENT, createDefaultStudents, normalizeStudents, rankStudents, type Student } from '@/lib/classroom';
import { Podium } from '@/components/classroom-ui';

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>(createDefaultStudents);
  const [error, setError] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
      router.push('/');
      return;
    }

    const classRef = doc(db, CLASS_DOCUMENT.collection, CLASS_DOCUMENT.id);
    return onSnapshot(classRef, (snapshot) => {
      setStudents(snapshot.exists() ? normalizeStudents(snapshot.data().students) : createDefaultStudents());
      setError('');
      setIsAuthorized(true);
    }, () => {
      setError('Data kelas gagal dimuat. Periksa koneksi Firebase.');
      setIsAuthorized(true);
    });
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    router.push('/');
  };

  const saveStudents = async (updated: Student[]) => {
    setStudents(updated);
    try {
      await setDoc(doc(db, CLASS_DOCUMENT.collection, CLASS_DOCUMENT.id), { students: updated }, { merge: true });
      setError('');
    } catch {
      setError('Perubahan gagal disimpan. Coba lagi.');
    }
  };

  const ranked = rankStudents(students);
  const changePoints = (index: number, delta: number) => saveStudents(students.map((student, studentIndex) => studentIndex === index ? { ...student, p: Math.max(0, student.p + delta) } : student));
  const changeName = (index: number) => {
    const name = window.prompt('Masukkan nama baru untuk siswa ini:', students[index].n)?.trim();
    if (name) void saveStudents(students.map((student, studentIndex) => studentIndex === index ? { ...student, n: name } : student));
  };

  if (!isAuthorized) return null;

  return (
    <main className="min-h-screen bg-amber-50 p-4 pb-16 font-sans text-slate-800">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-black text-amber-500">ADMIN DASHBOARD</h1>
        <p className="text-sm font-extrabold">Hyundai Jump School Batch 3 · Kelas X SMKS YPUL Lagoa</p>
        <button onClick={handleLogout} className="mt-2 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-red-600">Keluar (Logout)</button>
      </header>
      {error && <p role="alert" className="mx-auto max-w-xl rounded-xl bg-red-100 p-3 text-center text-sm font-bold text-red-700">{error}</p>}
      <Podium students={ranked} />
      <section className="mx-auto max-w-xl">
        <h2 className="mb-3 text-center text-xl font-black">Kelola Poin & Nama Peserta</h2>
        <div className="space-y-2">
          {ranked.map((student) => (
            <div key={student.originalIndex} className="flex items-center justify-between gap-2 rounded-2xl border-2 border-amber-200 bg-white p-3 shadow-sm">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-black">{student.rank}</div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-black text-blue-900">{student.n.charAt(0).toUpperCase()}</div>
                <div className="min-w-0 text-left"><span className="block truncate text-sm font-bold">{student.n}</span><button onClick={() => changeName(student.originalIndex)} className="mt-0.5 rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-blue-900 hover:bg-amber-200">✏️ Ganti Nama</button></div>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <div className="flex gap-1"><button aria-label={`Kurangi poin ${student.n}`} onClick={() => changePoints(student.originalIndex, -1)} className="h-8 w-8 rounded-lg bg-red-500 font-black text-white hover:bg-red-600">−</button><button aria-label={`Tambah poin ${student.n}`} onClick={() => changePoints(student.originalIndex, 1)} className="h-8 w-8 rounded-lg bg-blue-600 font-black text-white hover:bg-blue-700">+</button></div>
                <span className="min-w-8 text-right text-lg font-black text-blue-600">{student.p}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
