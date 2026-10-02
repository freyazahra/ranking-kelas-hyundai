'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CLASS_DOCUMENT, CLASS_ROSTER_VERSION, createDefaultStudents, loadStudentsBackup, normalizeStudents, rankStudents, saveStudentsBackup, type Student } from '@/lib/classroom';
import { GenderBadge, Podium, Spotlights } from '@/components/classroom-ui';
import { ExtraSections } from '@/components/extra-sections';

export default function StudentPage() {
  const [students, setStudents] = useState<Student[]>(createDefaultStudents);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isStudent = sessionStorage.getItem('isStudentLoggedIn') === 'true';
    const isAdmin = sessionStorage.getItem('isAdminLoggedIn') === 'true';

    if (!isStudent && !isAdmin) {
      router.replace('/');
      return;
    }
    setIsAuthorized(true);

    const initialBackup = loadStudentsBackup();
    if (initialBackup) {
      setStudents(initialBackup.students);
      setLoading(false);
      if (initialBackup.pendingSync) {
        setError('Menampilkan perubahan yang tersimpan di browser admin; sinkronisasi cloud masih tertunda.');
      }
    }

    const classRef = doc(db, CLASS_DOCUMENT.collection, CLASS_DOCUMENT.id);
    return onSnapshot(classRef, async (snapshot) => {
      const backup = loadStudentsBackup();
      if (backup?.pendingSync) {
        setStudents(backup.students);
        setError('Menampilkan salinan lokal. Admin perlu menyinkronkan perubahan ini ke Firebase.');
        setLoading(false);
        return;
      }

      if (snapshot.exists()) {
        const remoteStudents = normalizeStudents(snapshot.data().students);
        setStudents(remoteStudents);
        saveStudentsBackup(remoteStudents, false);
        setError('');
      } else {
        if (backup) {
          setStudents(backup.students);
          setError('Dokumen Firebase belum tersedia. Menampilkan salinan di browser ini.');
          setLoading(false);
          return;
        }

        const defaults = createDefaultStudents();
        setStudents(defaults);
        saveStudentsBackup(defaults, true);
        try {
          await setDoc(classRef, { students: defaults, rosterVersion: CLASS_ROSTER_VERSION }, { merge: true });
          saveStudentsBackup(defaults, false);
          setError('');
        } catch (initializationError) {
          const details = initializationError instanceof Error ? initializationError.message : 'Kesalahan tidak diketahui';
          setError(`Data tersimpan di browser ini, tetapi gagal diinisialisasi ke Firebase: ${details}`);
        }
      }
      setLoading(false);
    }, (snapshotError) => {
      const backup = loadStudentsBackup();
      setError(backup
        ? `Menggunakan salinan di browser ini. Firebase gagal dimuat: ${snapshotError.message}`
        : `Data kelas gagal dimuat: ${snapshotError.message}`);
      setLoading(false);
    });
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('isStudentLoggedIn');
    sessionStorage.removeItem('isAdminLoggedIn');
    router.replace('/');
  };

  const ranked = rankStudents(students);

  if (!isAuthorized) return null;

  if (loading) {
    return (
      <main className="min-h-screen bg-amber-50 flex items-center justify-center font-black text-blue-900 text-xl">
        Sabar ya bestie, lagi nyiapin data nih... 🍌
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff2b0] flex flex-col justify-between font-sans text-slate-800">
      {/* Header */}
      <header className="dashboard-header sticky top-0 z-50 flex w-full items-center justify-between gap-2 border-b-2 border-blue-900 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-3 py-2.5 shadow-md sm:px-6">
        <div className="flex items-center gap-2 font-black text-blue-950 text-sm md:text-lg">
          <span>🏆</span>
          <span>Leaderboard Kelas X</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="rounded-full border border-amber-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-800 shadow-xs sm:px-3 sm:text-sm">
            Siswa · <span className="text-teal-600">Murid</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="rounded-full bg-blue-900 px-3 py-2 text-xs font-bold text-white shadow transition hover:bg-blue-800 sm:px-4 sm:text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-3 pb-12 sm:px-4">
        <div className="dashboard-hero">
        <Spotlights />
        <div className="dashboard-title my-5 text-center sm:my-6">
          <h1 className="text-[clamp(34px,6.3vw,64px)] font-black leading-[1.05] text-[#f7d33f]"
            style={{ textShadow: '4px 4px 1px #2a4a9e' }}>
            LEADERBOARD 2026 
          </h1>
          <p className="mt-1 text-[clamp(14px,3.6vw,20px)] font-black text-[#1b1b2f]">
            Hyundai Jump School Batch 3
          </p>
          <p className="mt-0.5 text-[13px] font-medium text-slate-600">
            Kelas X SMKS YPUL Lagoa
          </p>
        </div>

        {error && <p role="alert" className="mx-auto max-w-xl rounded-xl bg-red-100 p-3 text-center text-sm font-bold text-red-700 mb-4">{error}</p>}
        
        <Podium students={ranked} />

        <a href="#ranking-list" className="scroll-cue mx-auto -mt-1 mb-5 flex w-fit items-center gap-2 text-sm font-extrabold text-blue-900 transition hover:text-blue-700">
          Geser ke bawah untuk lihat ranking <span className="animate-bounce text-lg" aria-hidden="true">↓</span>
        </a>
        </div>

        <section id="ranking-list" className="mx-auto mt-2 max-w-2xl scroll-mt-20">
          <h2 className="mb-4 text-center text-xl font-black text-blue-950">Semua Peserta & Poin</h2>
          <div className="space-y-2.5">
            {ranked.map((student) => (
              <div key={student.originalIndex} className="flex items-center justify-between gap-3 rounded-[14px] border-2 border-[#f0e2a0] bg-gradient-to-r from-[#fffbe6] to-white p-2.5 shadow-sm transition-shadow hover:shadow-md sm:p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-blue-950">{student.rank}</div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-blue-950 border border-amber-200">{student.n.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0">
                    <span className="block truncate font-bold text-slate-800">{student.n}</span>
                    <GenderBadge gender={student.g} />
                  </div>
                </div>
                <span className="shrink-0 text-lg font-black text-[#2a4a9e]">{student.p} poin</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <ExtraSections />

      {/* Footer */}
      <footer className="w-full bg-[#2b4c9f] text-white py-6 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner">
        <div className="flex items-center gap-3.5">
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center hover:bg-white/10 transition shadow-md"
            aria-label="Instagram"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </a>
          <span className="text-sm font-bold tracking-wide">Silahturahmi ke IG kita!</span>
        </div>

        <div className="text-xs text-blue-100/80 font-medium text-center md:text-right space-y-0.5">
          <p>Hyundai Jump School Batch 3 · Kelas X SMKS YPUL Lagoa</p>
          <p>© 2026 Program Mengajar Hyundai Jump School</p>
        </div>
      </footer>
    </div>
  );
}