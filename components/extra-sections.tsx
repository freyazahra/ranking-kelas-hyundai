'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CLASS_DOCUMENT, type MemoryPhoto } from '@/lib/classroom';

type ExtraSectionsProps = {
  isAdmin?: boolean;
};

type MemoryForm = Omit<MemoryPhoto, 'id'>;

const emptyForm: MemoryForm = {
  title: '',
  imageUrl: '',
  date: '',
  description: '',
};

function isMemoryPhoto(value: unknown): value is MemoryPhoto {
  if (!value || typeof value !== 'object') return false;
  const photo = value as Record<string, unknown>;
  return typeof photo.id === 'string'
    && typeof photo.title === 'string'
    && typeof photo.imageUrl === 'string'
    && typeof photo.date === 'string'
    && typeof photo.description === 'string';
}

export function ExtraSections({ isAdmin = false }: ExtraSectionsProps) {
  const [memories, setMemories] = useState<MemoryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<MemoryForm>(emptyForm);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.querySelector('link[data-extra-sections-css]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/css/sections.css';
      stylesheet.dataset.extraSectionsCss = 'true';
      document.head.append(stylesheet);
    }

    const scriptPath = '/js/team.js?v=3';
    const loadedScript = document.querySelector<HTMLScriptElement>(`script[data-extra-module="${scriptPath}"]`);
    if (loadedScript?.dataset.loaded === 'true') {
      window.dispatchEvent(new Event('ranking:mount-sections'));
      return;
    }

    const script = loadedScript ?? document.createElement('script');
    if (!loadedScript) {
      script.type = 'module';
      script.src = scriptPath;
      script.dataset.extraModule = scriptPath;
      document.body.append(script);
    }
    const notifyMounted = () => {
      script.dataset.loaded = 'true';
      window.dispatchEvent(new Event('ranking:mount-sections'));
    };
    script.addEventListener('load', notifyMounted, { once: true });
    return () => script.removeEventListener('load', notifyMounted);
  }, []);

  useEffect(() => {
    const classRef = doc(db, CLASS_DOCUMENT.collection, CLASS_DOCUMENT.id);
    return onSnapshot(classRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : {};
      const stored = data.memories;
      setMemories(Array.isArray(stored) ? stored.filter(isMemoryPhoto) : []);
      setError('');
      setLoading(false);
    }, (snapshotError) => {
      setError(`Foto kenangan gagal dimuat dari Firestore: ${snapshotError.message}`);
      setLoading(false);
    });
  }, []);

  function scrollGallery(direction: 'left' | 'right') {
    if (!viewportRef.current) return;
    const scrollAmount = 320;
    viewportRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  async function saveMemories(updated: MemoryPhoto[]) {
    setSaving(true);
    setError('');
    try {
      await setDoc(doc(db, CLASS_DOCUMENT.collection, CLASS_DOCUMENT.id), { memories: updated }, { merge: true });
      setMemories(updated);
      setForm(emptyForm);
    } catch (saveError) {
      const details = saveError instanceof Error ? saveError.message : 'Kesalahan tidak diketahui';
      setError(`Foto gagal disimpan ke Firestore: ${details}`);
    } finally {
      setSaving(false);
    }
  }

  function addMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const photo: MemoryPhoto = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      imageUrl: form.imageUrl.trim(),
      date: form.date.trim(),
      description: form.description.trim(),
    };
    void saveMemories([photo, ...memories]);
  }

  function deleteMemory(id: string) {
    if (!window.confirm('Yakin ingin menghapus foto kenangan ini?')) return;
    void saveMemories(memories.filter((memory) => memory.id !== id));
  }

  return (
    <div className="extra-sections">
      <section className="extra-section" aria-labelledby="team-heading" data-team-section>
        <header className="extra-section-heading">
          <h2 id="team-heading">Tim Pengajar</h2>
          <p>Tap kartu untuk membalik</p>
        </header>
        <div className="team-grid" data-team-grid />
      </section>

      <section className="extra-section" aria-labelledby="memories-heading">
        <header className="extra-section-heading">
          <h2 id="memories-heading">Wall of Memories</h2>
          <p>Potongan cerita dari setiap pertemuan</p>
        </header>

        <div className="memories-shell">
          {loading ? (
            <p className="memory-empty" role="status">Memuat foto kenangan...</p>
          ) : memories.length === 0 ? (
            <p className="memory-empty">Belum ada foto kenangan. Tambahkan URL foto dari dashboard admin.</p>
          ) : (
            <>
              <div className="memory-toolbar">
                <button type="button" className="memory-control" aria-label="Geser foto ke kiri" onClick={() => scrollGallery('left')}>←</button>
                <button type="button" className="memory-control" aria-label="Geser foto ke kanan" onClick={() => scrollGallery('right')}>→</button>
              </div>
              <div
                ref={viewportRef}
                className="memory-viewport"
                role="region"
                aria-label="Galeri foto kenangan"
                tabIndex={0}
                style={{ overflowX: 'auto', scrollSnapType: 'x mandatory', display: 'flex' }}
              >
                <div className="memory-track" style={{ display: 'flex', gap: '1rem', width: 'max-content', transform: 'none' }}>
                  {memories.map((memory) => (
                    <article className="memory-card" key={memory.id} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                      <div className="memory-image-wrap">
                        <Image
                          className="memory-image"
                          src={memory.imageUrl}
                          alt={memory.title}
                          loading="lazy"
                          fill
                          unoptimized
                          sizes="(max-width: 600px) 76vw, 320px"
                          onLoad={(event) => {
                            event.currentTarget.classList.add('is-loaded');
                            event.currentTarget.parentElement?.classList.add('is-loaded');
                          }}
                          onError={(event) => {
                            event.currentTarget.classList.add('is-loaded');
                            event.currentTarget.parentElement?.classList.add('is-loaded');
                          }}
                        />
                      </div>
                      <div className="memory-caption">
                        <strong>{memory.title}</strong>
                        <span>{memory.date}</span>
                        {memory.description && <p>{memory.description}</p>}
                      </div>
                      {isAdmin && (
                        <button className="memory-delete-button" type="button" disabled={saving} onClick={() => deleteMemory(memory.id)}>
                          Hapus foto
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {error && <p className="memory-message" role="alert">{error}</p>}

        {isAdmin && (
          <div className="memory-admin">
            <h3 className="memory-admin-heading">Kelola foto kenangan</h3>
            <form className="memory-form" onSubmit={addMemory}>
              <label>Judul foto<input required maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
              <label>URL gambar<input required type="url" placeholder="https://..." value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} /></label>
              <label>Tanggal / pertemuan<input required placeholder="Pertemuan 3 · 12 Februari 2026" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
              <label className="memory-wide">Cerita singkat<textarea maxLength={500} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
              <button className="memory-primary-button memory-wide" type="submit" disabled={saving}>{saving ? 'Menyimpan ke Firestore...' : 'Tambah foto'}</button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}