'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CLASS_DOCUMENT, CLASS_SIZE, createDefaultStudents, loadStudentsBackup, normalizeStudents, rankStudents, saveStudentsBackup, type Student } from '@/lib/classroom';
import { GenderBadge, Podium, Spotlights } from '@/components/classroom-ui';

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>(createDefaultStudents);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
      router.replace('/');
      return;
    }
    setIsAuthorized(true);

    const initialBackup = loadStudentsBackup();
    if (initialBackup) {
      setStudents(initialBackup.students);
      setLoading(false);
      if (initialBackup.pendingSync) {
        setError('Memulihkan perubahan lokal dan mencoba menyinkronkannya ke Firebase...');
      }
    }

    const classRef = doc(db, CLASS_DOCUMENT.collection, CLASS_DOCUMENT.id);
    return onSnapshot(classRef, async (snapshot) => {
      const backup = loadStudentsBackup();
      if (backup?.pendingSync) {
        setStudents(backup.students);
        setLoading(false);
        try {
          await setDoc(classRef, { students: backup.students }, { merge: true });
          saveStudentsBackup(backup.students, false);
          setError('');
          setSaveStatus('saved');
        } catch (syncError) {
          const details = syncError instanceof Error ? syncError.message : 'Kesalahan tidak diketahui';
          setError(`Perubahan masih tersimpan di browser ini, tetapi gagal disinkronkan ke Firebase: ${details}`);
        }
        return;
      }

      if (snapshot.exists()) {
        const storedStudents = snapshot.data().students;
        const remoteStudents = normalizeStudents(storedStudents);
        setStudents(remoteStudents);
        saveStudentsBackup(remoteStudents, false);
        setError('');
        if (!Array.isArray(storedStudents) || storedStudents.length !== CLASS_SIZE) {
          setSaveStatus('saving');
          try {
            await setDoc(classRef, { students: remoteStudents }, { merge: true });
            saveStudentsBackup(remoteStudents, false);
            setSaveStatus('saved');
          } catch (migrationError) {
            const details = migrationError instanceof Error ? migrationError.message : 'Kesalahan tidak diketahui';
            saveStudentsBackup(remoteStudents, true);
            setSaveStatus('idle');
            setError(`Pemangkasan data lama di Firebase gagal: ${details}`);
          }
        }
      } else {
        const defaults = backup?.students ?? createDefaultStudents();
        setStudents(defaults);
        setLoading(false);
        const backupSaved = saveStudentsBackup(defaults, true);
        try {
          await setDoc(classRef, { students: defaults }, { merge: true });
          saveStudentsBackup(defaults, false);
          setError('');
        } catch (initializationError) {
          const details = initializationError instanceof Error ? initializationError.message : 'Kesalahan tidak diketahui';
          setError(backupSaved
            ? `Data tersimpan di browser ini, tetapi gagal diinisialisasi ke Firebase: ${details}`
            : `Data kelas gagal diinisialisasi di Firebase: ${details}`);
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

  useEffect(() => {
    if (saveStatus !== 'saved') return;
    const timeoutId = window.setTimeout(() => setSaveStatus('idle'), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [saveStatus]);

  const handleLogout = () => {
    if (saveStatus === 'saving') return;
    sessionStorage.removeItem('isAdminLoggedIn');
    sessionStorage.removeItem('isStudentLoggedIn');
    router.replace('/');
  };

  const saveStudents = async (updated: Student[]) => {
    setSaveStatus('saving');
    setError('');
    const backupSaved = saveStudentsBackup(updated, true);
    setStudents(updated);
    try {
      await setDoc(doc(db, CLASS_DOCUMENT.collection, CLASS_DOCUMENT.id), { students: updated }, { merge: true });
      saveStudentsBackup(updated, false);
      setSaveStatus('saved');
    } catch (saveError) {
      const details = saveError instanceof Error ? saveError.message : 'Kesalahan tidak diketahui';
      setError(backupSaved
        ? `Perubahan tersimpan di browser ini, tetapi gagal disinkronkan ke Firebase: ${details}`
        : `Perubahan TIDAK tersimpan: Firebase menolak penyimpanan dan backup lokal gagal: ${details}`);
      setSaveStatus('idle');
    }
  };

  const ranked = rankStudents(students);
  const changePoints = (index: number, delta: number) => saveStudents(students.map((student, studentIndex) => studentIndex === index ? { ...student, p: Math.max(0, student.p + delta) } : student));
  const changeGender = (index: number, gender: Student['gender']) => saveStudents(students.map((student, studentIndex) => {
    if (studentIndex !== index) return student;
    const updated = { ...student };
    if (gender) updated.gender = gender;
    else delete updated.gender;
    return updated;
  }));
  const changeName = (index: number) => {
    const name = window.prompt('Masukkan nama baru untuk siswa ini:', students[index].n)?.trim();
    if (name) void saveStudents(students.map((student, studentIndex) => studentIndex === index ? { ...student, n: name } : student));
  };

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
            freya · <span className="text-blue-600">Admin</span>
          </div>
          <button 
            onClick={handleLogout} 
            disabled={saveStatus === 'saving'}
            className="rounded-full bg-blue-900 px-3 py-2 text-xs font-bold text-white shadow transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60 sm:px-4 sm:text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {saveStatus === 'saved' && (
        <div role="status" aria-live="polite" className="fixed right-4 top-20 z-[100] flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-800 shadow-lg">
          <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">✓</span>
          Berhasil tersimpan ke database
        </div>
      )}

      {/* Konten Utama */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-3 pb-12 sm:px-4">
        <div className="dashboard-hero">
        <Spotlights />
        <div className="dashboard-title my-5 text-center sm:my-6">
          <h1
            className="text-[clamp(34px,6.3vw,64px)] font-black leading-[1.05] text-[#f7d33f]"
            style={{ textShadow: '3px 3px 1px #2a4a9e' }}
          >
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
          <h2 className="mb-4 text-center text-xl font-black text-blue-950">Kelola Poin & Nama Peserta <span className="text-base text-blue-700">({students.length} dari {CLASS_SIZE} siswa)</span></h2>
          {saveStatus === 'saving' && (
            <p role="status" className="mb-3 text-center text-sm font-bold text-blue-900">
              Menyimpan perubahan ke Firebase...
            </p>
          )}
          <div className="space-y-2.5">
            {ranked.map((student) => (
              <div key={student.originalIndex} className="flex items-center justify-between gap-2 rounded-[14px] border-2 border-[#f0e2a0] bg-gradient-to-r from-[#fffbe6] to-white p-2.5 shadow-sm transition-shadow hover:shadow-md sm:p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-blue-950">{student.rank}</div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-blue-950 border border-amber-200">{student.n.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 text-left">
                    <span className="block truncate text-sm font-bold text-slate-800">{student.n}</span>
                    <div className="mt-1.5 flex flex-col items-start gap-2.5">
                      <GenderBadge gender={student.gender} />
                      <div className="flex flex-wrap items-center gap-2">
                        <button disabled={saveStatus === 'saving'} onClick={() => changeName(student.originalIndex)} className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-bold text-blue-900 transition hover:bg-amber-100 disabled:cursor-wait disabled:opacity-50">✏️ Ubah Panggilan</button>
                        <select
                          aria-label={`Gender ${student.n}`}
                          value={student.gender ?? ''}
                          disabled={saveStatus === 'saving'}
                          onChange={(event) => changeGender(student.originalIndex, event.target.value === 'male' || event.target.value === 'female' ? event.target.value : undefined)}
                          className="rounded-md border border-amber-300 bg-white px-2 py-1 text-[11px] font-bold text-blue-900 disabled:opacity-50"
                        >
                          <option value="">Pilih gender</option>
                          <option value="male">♂ Laki-laki</option>
                          <option value="female">♀ Perempuan</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <div className="flex gap-1">
                    <button disabled={saveStatus === 'saving'} aria-label={`Kurangi poin ${student.n}`} onClick={() => changePoints(student.originalIndex, -1)} className="h-8 w-8 rounded-lg bg-red-500 font-black text-white transition hover:bg-red-600 disabled:cursor-wait disabled:opacity-50">−</button>
                    <button disabled={saveStatus === 'saving'} aria-label={`Tambah poin ${student.n}`} onClick={() => changePoints(student.originalIndex, 1)} className="h-8 w-8 rounded-lg bg-blue-600 font-black text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-50">+</button>
                  </div>
                  <span className="min-w-8 text-right text-lg font-black text-[#2a4a9e]">{student.p}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

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