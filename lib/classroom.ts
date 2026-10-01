export type Student = {
  n: string;
  p: number;
  photo?: string;
};

export type RankedStudent = Student & {
  originalIndex: number;
  rank: number;
};

export const CLASS_SIZE = 32;
export const CLASS_DOCUMENT = { collection: 'classes', id: 'xpulp_lagoa' } as const;
const STUDENTS_BACKUP_KEY = 'ranking-kelas-hyundai:students';

export type StudentsBackup = {
  students: Student[];
  pendingSync: boolean;
};

export function loadStudentsBackup(): StudentsBackup | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STUDENTS_BACKUP_KEY) ?? 'null');
    if (!value || typeof value !== 'object') return null;
    const backup = value as Record<string, unknown>;
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

export function createDefaultStudents(): Student[] {
  return Array.from({ length: CLASS_SIZE }, (_, index) => ({ n: `Siswa ${index + 1}`, p: 0 }));
}

export function normalizeStudents(value: unknown): Student[] {
  if (!Array.isArray(value)) return createDefaultStudents();
  return Array.from({ length: CLASS_SIZE }, (_, index) => {
    const item = value[index];
    if (!item || typeof item !== 'object') return { n: `Siswa ${index + 1}`, p: 0 };
    const record = item as Record<string, unknown>;
    return {
      n: typeof record.n === 'string' && record.n.trim() ? record.n : `Siswa ${index + 1}`,
      p: typeof record.p === 'number' && Number.isFinite(record.p) ? Math.max(0, record.p) : 0,
      ...(typeof record.photo === 'string' ? { photo: record.photo } : {}),
    };
  });
}

export function rankStudents(students: Student[]): RankedStudent[] {
  const ordered = students
    .map((student, originalIndex) => ({ ...student, originalIndex }))
    .sort((a, b) => b.p - a.p || a.originalIndex - b.originalIndex);
  let rank = 1;
  return ordered.map((student, index) => {
    if (index > 0 && student.p < ordered[index - 1].p) rank = index + 1;
    return { ...student, rank };
  });
}
