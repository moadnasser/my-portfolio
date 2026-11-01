import type { Profile } from './types'

/**
 * Personal details. Everything here is rendered verbatim, so keep it accurate.
 *
 * - `email` is taken from the author email used in this machine's project commits.
 * - `cvFile`: drop a PDF into /public/cv/ (e.g. "/cv/moad-almshirem-cv.pdf") and set the path.
 * - `photo`: drop a square portrait into /public/ (e.g. "/profile.jpg") and set the path.
 * - `phone`, `telegram`, `whatsappUsername`: supplied by Moad (2026-10-31).
 * - `whatsapp`: a full international number enables a wa.me link; the username alone is shown with a copy button.
 * - Add LinkedIn / Dribbble entries to `socials` once you have the URLs.
 */
export const profile: Profile = {
  name: { en: 'Moad Almshirem', ar: 'معاذ المشيرم' },
  role: { en: 'Software Engineer', ar: 'مهندس برمجيات' },
  email: 'moadnasseral@gmail.com',
  cvFile: null,
  photo: '/profile.webp',
  phone: { display: '091 505 0777', tel: '+218915050777' },
  whatsapp: null,
  whatsappUsername: '@moadnasser',
  telegram: 'https://t.me/moadalmshirem',
  socials: [
    { id: 'github', label: 'GitHub', url: 'https://github.com/moadnasser' },
    { id: 'telegram', label: 'Telegram', url: 'https://t.me/moadalmshirem' },
  ],
}
