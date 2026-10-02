// Data placeholder; ganti foto dengan file di public/assets/team/.
export const team = [
  { nama: 'Nama Lengkap 1', fakultas: 'Fakultas Ilmu Komputer', jurusan: 'Jurusan 1', foto: '' },
  { nama: 'Nama Lengkap 2', fakultas: 'Fakultas Ilmu Komputer', jurusan: 'Jurusan 2', foto: '' },
  { nama: 'Nama Lengkap 3', fakultas: 'Fakultas Ilmu Komputer', jurusan: 'Jurusan 3', foto: '' },
  { nama: 'Nama Lengkap 4', fakultas: 'Fakultas Ilmu Komputer', jurusan: 'Jurusan 4', foto: '' },
  { nama: 'Nama Lengkap 5', fakultas: 'Fakultas Ilmu Komputer', jurusan: 'Jurusan 5', foto: '' },
];

const minion = `<svg viewBox="0 0 100 150" role="img" aria-label="Ilustrasi Minion" class="team-minion"><g fill="#f7d33f" stroke="#c99a00" stroke-width="2"><rect x="2" y="62" width="20" height="9" rx="4.5" transform="rotate(-30 22 66)"/><rect x="78" y="62" width="20" height="9" rx="4.5" transform="rotate(30 78 66)"/><rect x="20" y="8" width="60" height="118" rx="30"/></g><path d="M20 92h60v14q0 20-30 20t-30-20z" fill="#3b63c4"/><rect x="38" y="82" width="24" height="22" fill="#3b63c4"/><rect x="20" y="36" width="60" height="9" fill="#333"/><circle cx="50" cy="40" r="17" fill="#ccd" stroke="#99a" stroke-width="4"/><circle cx="50" cy="40" r="11" fill="#fff"/><circle cx="52" cy="41" r="5" fill="#6b4423"/><circle cx="53" cy="41" r="2.4"/><path d="M36 68q14 16 28 0z" fill="#5a2a1a" stroke="#333" stroke-width="2"/><g fill="#333"><rect x="33" y="124" width="12" height="12" rx="4"/><rect x="55" y="124" width="12" height="12" rx="4"/></g></svg>`;

function mountTeamSections() {
  document.querySelectorAll('[data-team-grid]').forEach((grid) => {
    if (grid.dataset.mounted === 'true') return;
    grid.dataset.mounted = 'true';

    team.forEach((person) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'team-flip-card';
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', `${person.nama}, tap untuk melihat profil`);

      const inner = document.createElement('span');
      inner.className = 'team-flip-inner';
      const front = document.createElement('span');
      front.className = 'team-face team-front';
      front.innerHTML = minion;
      if (person.foto) {
        const image = document.createElement('img');
        image.src = person.foto;
        image.alt = `Foto ${person.nama}`;
        image.loading = 'lazy';
        image.className = 'team-photo';
        image.onerror = () => image.remove();
        front.append(image);
      }

      const back = document.createElement('span');
      back.className = 'team-face team-back';
      const name = document.createElement('strong');
      name.textContent = person.nama;
      const faculty = document.createElement('span');
      faculty.textContent = person.fakultas;
      const major = document.createElement('span');
      major.textContent = person.jurusan;
      back.append(name, faculty, major);
      inner.append(front, back);
      button.append(inner);
      button.addEventListener('click', () => {
        const flipped = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(flipped));
        button.classList.toggle('is-flipped', flipped);
        button.setAttribute('aria-label', flipped
          ? `${person.nama}, ${person.fakultas}, ${person.jurusan}`
          : `${person.nama}, tap untuk melihat profil`);
      });
      grid.append(button);
    });
  });
}

window.addEventListener('ranking:mount-sections', mountTeamSections);
mountTeamSections();