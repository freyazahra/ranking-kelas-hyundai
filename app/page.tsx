'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const MinionSvg = () => (
  <svg className="login-minion" viewBox="0 0 100 150" aria-hidden="true">
    <g className="login-minion-arms">
      <rect x="2" y="62" width="20" height="9" rx="4.5" fill="#f7d33f" stroke="#c99a00" strokeWidth="2" transform="rotate(-30 22 66)"/>
      <rect x="78" y="62" width="20" height="9" rx="4.5" fill="#f7d33f" stroke="#c99a00" strokeWidth="2" transform="rotate(30 78 66)"/>
    </g>
    <rect x="20" y="8" width="60" height="118" rx="30" fill="#f7d33f" stroke="#c99a00" strokeWidth="2"/>
    <path d="M20 92h60v14q0 20-30 20t-30-20z" fill="#3b63c4"/>
    <rect x="38" y="82" width="24" height="22" fill="#3b63c4"/>
    <rect x="20" y="36" width="60" height="9" fill="#333"/>
    <circle cx="50" cy="40" r="17" fill="#ccd" stroke="#99a" strokeWidth="4"/>
    <circle cx="50" cy="40" r="11" fill="#fff"/>
    <circle cx="52" cy="41" r="5" fill="#6b4423"/>
    <circle cx="53" cy="41" r="2.4" fill="#000"/>
    <path d="M36 68q14 16 28 0z" fill="#5a2a1a" stroke="#333" strokeWidth="2"/>
    <g fill="#333">
      <rect x="33" y="124" width="12" height="12" rx="4"/>
      <rect x="55" y="124" width="12" height="12" rx="4"/>
    </g>
  </svg>
);

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'mentorkece' && password === 'kecebong!') {
      router.push('/admin');
    } else if (username === 'muridkece' && password === 'murid123') {
      router.push('/student');
    } else {
      setError('Username atau Password salah! Akses ditolak.');
    }
  };

  return (
    <main className="min-h-screen bg-amber-400 text-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <MinionSvg />
      <h1 className="text-3xl md:text-5xl font-black mt-3 text-blue-900 drop-shadow-md">
        RANKING KELAS
      </h1>
      <p className="font-extrabold text-sm md:text-base mt-1 text-slate-900">
        Hyundai Jump School Batch 3
      </p>
      <p className="text-xs font-semibold opacity-80 mb-6">
        Kelas X SMKS YPUL Lagoa
      </p>

      <form
        onSubmit={handleLogin}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col gap-3.5 border-4 border-amber-300"
      >
        <h2 className="text-lg font-black text-blue-900 mb-1">Silakan Login</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 text-xs font-bold p-2.5 rounded-xl">
            {error}
          </div>
        )}

        <input
          type="text"
          name="username"
          autoComplete="username"
          aria-label="Username"
          placeholder="Masukkan Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-600 text-slate-800 bg-slate-50"
          required
        />

        <input
          type="password"
          name="password"
          autoComplete="current-password"
          aria-label="Password"
          placeholder="Masukkan Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-blue-600 text-slate-800 bg-slate-50"
          required
        />

        <button
          type="submit"
          className="bg-blue-900 text-white font-black text-base py-3.5 rounded-xl shadow-lg hover:bg-blue-800 transition transform active:scale-95 mt-2"
        >
          Masuk Web 🎵
        </button>
      </form>
    </main>
  );
}
