export interface Student {
  n: string;
  p: number;
  g: 'Laki-laki' | 'Perempuan';
}

export interface MemoryPhoto {
  id: string;
  title: string;
  imageUrl: string;
  date: string;
  description: string;
}

export const CLASS_DOCUMENT = {
  collection: 'classes',
  id: 'xpulp_lagoa',
} as const;

export const CLASS_SIZE = 31;
export const CLASS_ROSTER_VERSION = 2;
const STUDENTS_BACKUP_KEY = 'ranking-kelas-hyundai:students';

export interface StudentsBackup {
  students: Student[];
  pendingSync: boolean;
}

export const INITIAL_STUDENTS: Student[] = [
  { n: "Adifaatih Phalgunabisaca", p: 0, g: "Laki-laki" },
  { n: "Aditya Gemilang", p: 0, g: "Laki-laki" },
  { n: "Afgan Haafidh", p: 0, g: "Laki-laki" },
  { n: "Agiesta Naura", p: 0, g: "Perempuan" },
  { n: "Aira Al", p: 0, g: "Perempuan" },
  { n: "Bunga Julia", p: 0, g: "Perempuan" },
  { n: "Densy Saputri", p: 0, g: "Perempuan" },
  { n: "Dimas Kurniawan", p: 0, g: "Laki-laki" },
  { n: "Jihan Syafira", p: 0, g: "Perempuan" },
  { n: "Layla Septriansyah", p: 0, g: "Perempuan" },
  { n: "Lestari Aryanti", p: 0, g: "Perempuan" },
  { n: "Mayla Anggilia", p: 0, g: "Perempuan" },
  { n: "Muhamad Alfhil", p: 0, g: "Laki-laki" },
  { n: "Muhamad Wahyudin", p: 0, g: "Laki-laki" },
  { n: "Muhammad Al", p: 0, g: "Laki-laki" },
  { n: "Muhammad Farel", p: 0, g: "Laki-laki" },
  { n: "Nadilah", p: 0, g: "Perempuan" },
  { n: "Nayla Audia", p: 0, g: "Perempuan" },
  { n: "Nazwa Cahya", p: 0, g: "Perempuan" },
  { n: "Nurmala Aprilianti", p: 0, g: "Perempuan" },
  { n: "Olivia Febriyana", p: 0, g: "Perempuan" },
  { n: "Queensya Mahardika", p: 0, g: "Perempuan" },
  { n: "Rafly Aditya", p: 0, g: "Laki-laki" },
  { n: "Revandi Arroyan", p: 0, g: "Laki-laki" },
  { n: "Rezza Aryo", p: 0, g: "Laki-laki" },
  { n: "Rizma Aainurrahmah", p: 0, g: "Perempuan" },
  { n: "Siva Tri", p: 0, g: "Perempuan" },
  { n: "Tiara Sukmayanti", p: 0, g: "Perempuan" },
  { n: "Wahyu Saputra", p: 0, g: "Laki-laki" },
  { n: "Yunita Azhar", p: 0, g: "Perempuan" },
  { n: "Zahra Natasya", p: 0, g: "Perempuan" }
];

export function createDefaultStudents(): Student[] {
  return INITIAL_STUDENTS.map((s) => ({ ...s }));
}

export function loadStudentsBackup(): StudentsBackup | null {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STUDENTS_BACKUP_KEY) ?? 'null');
    if (!stored || typeof stored !== 'object') return null;
    const backup = stored as Record<string, unknown>;
    if (!Array.isArray(backup.students)) return null;
    return {
      students: normalizeStudents(backup.students),
      pendingSync: backup.pendingSync === true,
    };
  } catch {
    return null;
  }
}

export function saveStudentsBackup(students: Student[], pendingSync: boolean): boolean {
  try {
    localStorage.setItem(STUDENTS_BACKUP_KEY, JSON.stringify({ students, pendingSync }));
    return true;
  } catch {
    return false;
  }
}

export function normalizeStudents(rawList: unknown): Student[] {
  if (!Array.isArray(rawList)) return createDefaultStudents();
  const defaults = createDefaultStudents();
  return defaults.map((defaultStudent, index) => {
    const item = rawList[index];
    if (item && typeof item === 'object') {
      const name = 'n' in item && typeof item.n === 'string' ? item.n : defaultStudent.n;
      const points = 'p' in item && typeof item.p === 'number' && !isNaN(item.p) ? item.p : defaultStudent.p;
      const gender = 'g' in item && (item.g === 'Laki-laki' || item.g === 'Perempuan') ? item.g : defaultStudent.g;
      return { n: name, p: Math.max(0, points), g: gender };
    }
    return defaultStudent;
  });
}

export function migrateStudentsToInitialRoster(rawList: unknown): Student[] {
  const storedStudents = normalizeStudents(rawList);
  return createDefaultStudents().map((initialStudent, index) => ({
    ...initialStudent,
    p: storedStudents[index]?.p ?? initialStudent.p,
  }));
}

export interface RankedStudent extends Student {
  originalIndex: number;
  rank: number;
}

export function rankStudents(students: Student[]): RankedStudent[] {
  const mapped = students.map((s, index) => ({ ...s, originalIndex: index }));
  mapped.sort((a, b) => {
    if (b.p !== a.p) return b.p - a.p;
    return a.n.localeCompare(b.n);
  });

  let currentRank = 1;
  return mapped.map((student, idx, arr) => {
    if (idx > 0 && student.p < arr[idx - 1].p) {
      currentRank = idx + 1;
    }
    return { ...student, rank: currentRank };
  });
}