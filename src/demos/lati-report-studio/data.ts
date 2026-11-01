import type { Localized } from '../../data/types'

/**
 * Sample course for the LATI Report Studio demo. Names are generic placeholders and the
 * companies are invented. Rules follow the real app: attendance counts present and late,
 * total = attendance (20) + participation (30) + post-exam (50); the pre-exam is shown but not counted.
 */
export type Mark = 'P' | 'L' | 'E' | 'A'

export interface Trainee {
  id: string
  name: Localized
  company: 'a' | 'b'
  sessions: Mark[]
  pre: number
  participation: number
  post: number
}

export const companies: Record<'a' | 'b', Localized> = {
  a: { en: 'Example Telecom Co.', ar: 'شركة المثال للاتصالات' },
  b: { en: 'Sample Bank', ar: 'مصرف العيّنة' },
}

export const trainees: Trainee[] = [
  { id: 'T1024', name: { en: 'Ahmed Ali', ar: 'أحمد علي' }, company: 'a', sessions: ['P', 'P', 'P', 'L', 'P'], pre: 21, participation: 27, post: 44 },
  { id: 'T2048', name: { en: 'Salem Mohammed', ar: 'سالم محمد' }, company: 'a', sessions: ['P', 'P', 'E', 'P', 'P'], pre: 18, participation: 24, post: 39 },
  { id: 'T3051', name: { en: 'Fatima Ibrahim', ar: 'فاطمة إبراهيم' }, company: 'a', sessions: ['P', 'P', 'P', 'P', 'P'], pre: 26, participation: 29, post: 47 },
  { id: 'T3077', name: { en: 'Khaled Youssef', ar: 'خالد يوسف' }, company: 'a', sessions: ['P', 'A', 'P', 'P', 'L'], pre: 15, participation: 20, post: 33 },
  { id: 'T4102', name: { en: 'Maryam Hassan', ar: 'مريم حسن' }, company: 'b', sessions: ['P', 'P', 'P', 'P', 'L'], pre: 24, participation: 28, post: 45 },
  { id: 'T4119', name: { en: 'Omar Salem', ar: 'عمر سالم' }, company: 'b', sessions: ['L', 'P', 'P', 'A', 'P'], pre: 19, participation: 23, post: 38 },
  { id: 'T4130', name: { en: 'Huda Abdullah', ar: 'هدى عبدالله' }, company: 'b', sessions: ['P', 'P', 'P', 'P', 'P'], pre: 28, participation: 30, post: 48 },
]

export function scores(t: Trainee) {
  const attended = t.sessions.filter((s) => s === 'P' || s === 'L').length
  const pct = Math.round((attended / t.sessions.length) * 100)
  const attendance = Math.round((pct / 100) * 20)
  return { pct, attendance, total: attendance + t.participation + t.post }
}

/** Survey averages on the 5–1 scale, grouped like the real questionnaire. */
export const survey: { key: 'program' | 'logistics' | 'trainer'; avg: number }[] = [
  { key: 'program', avg: 4.5 },
  { key: 'logistics', avg: 4.1 },
  { key: 'trainer', avg: 4.7 },
]

export interface FolderFile {
  path: string
  kind: 'grades' | 'attendance' | 'survey' | 'content' | 'photos' | 'certificates'
}

export const sampleFolder: FolderFile[] = [
  { path: 'TraineesCourse.xlsx', kind: 'grades' },
  { path: 'Attendance.xlsx', kind: 'attendance' },
  { path: 'TraineeCourseRate.xlsx', kind: 'survey' },
  { path: 'محاور الدورة.txt', kind: 'content' },
  { path: 'صور/ (6)', kind: 'photos' },
  { path: 'شهادات/ (7 PDF)', kind: 'certificates' },
]

export const defaults = {
  title: { en: 'Information Security Fundamentals', ar: 'أساسيات أمن المعلومات' },
  trainer: { en: 'Demo Trainer', ar: 'مدرّب تجريبي' },
  objectives: {
    en: 'Understand the core principles of information security.\nRecognise common threats and how to respond.\nApply basic protection practices at work.',
    ar: 'فهم المبادئ الأساسية لأمن المعلومات.\nالتعرّف على التهديدات الشائعة وطرق التعامل معها.\nتطبيق ممارسات الحماية الأساسية في بيئة العمل.',
  },
  axes: {
    en: 'Confidentiality, integrity and availability\nPasswords and access control\nPhishing and social engineering\nIncident reporting',
    ar: 'السرية والسلامة والإتاحة\nكلمات المرور والتحكم في الوصول\nالتصيّد والهندسة الاجتماعية\nالإبلاغ عن الحوادث',
  },
}
