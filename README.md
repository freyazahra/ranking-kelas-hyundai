This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Tim Pengajar dan Wall of Memories

Section Tim Pengajar dan Wall of Memories tersedia di halaman admin dan siswa. Tim Pengajar memakai kartu flip yang dapat digunakan dengan klik, Enter, atau Space. Wall of Memories membaca field `memories` secara real-time dari dokumen kelas yang sama dengan daftar siswa.

### Setup Firebase

1. Buat atau pilih proyek di Firebase Console, lalu aktifkan **Firestore Database**.
2. Isi variabel Firebase Web yang dipakai `lib/firebase.js` di `.env.local`: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, dan `NEXT_PUBLIC_FIREBASE_APP_ID`.
3. Hubungkan Firebase CLI ke proyek yang sama dan deploy Firestore rules:

	```bash
	firebase login
	firebase use --add
	firebase deploy --only firestore:rules
	```

4. Jalankan ulang aplikasi setelah mengubah `.env.local`. Tombol tambah/hapus foto muncul otomatis di dashboard admin; dashboard siswa hanya menampilkan galeri.

Foto disimpan sebagai array objek `{ id, title, imageUrl, date, description }` pada field `memories` di `classes/xpulp_lagoa`. Admin memasukkan URL gambar langsung. Penambahan dan penghapusan memakai `setDoc` dengan merge; semua halaman menerima perubahan real-time melalui `onSnapshot`.

Daftar nama 31 siswa didefinisikan di `lib/classroom.ts` dan disimpan pada `classes/xpulp_lagoa`. Saat admin membuka dashboard, roster Firestore dengan versi lama dimigrasikan ke daftar nama terbaru dengan mempertahankan poin yang sudah tersimpan.

> Catatan keamanan: rules `classes` mengikuti pola akses aplikasi yang sekarang (baca/tulis publik) agar konsisten dengan pengelolaan poin. Batasi akses rules sebelum memakai data sensitif di produksi.

### Mengubah data tim

Edit array `team` di `public/js/team.js`. Setiap objek memakai field `nama`, `fakultas`, `jurusan`, dan `foto`. Simpan foto di `public/assets/team/`, lalu isi `foto` dengan path relatif seperti `../assets/team/nama-pengajar.jpg`. Foto kosong atau gagal dimuat otomatis digantikan ilustrasi Minion.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
