import type { Profile } from './types'

/**
 * Personal details. Everything here is rendered verbatim, so keep it accurate.
 *
 * - `email` is taken from the author email used in this machine's project commits.
 * - `cvFile`: drop a PDF into /public/cv/ (e.g. "/cv/moad-almshirem-cv.pdf") and set the path.
 * - `photo`: drop a square portrait into /public/ (e.g. "/profile.jpg") and set the path.
 * - `whatsapp`: add a full international number to enable the WhatsApp button.
 * - Add LinkedIn / Dribbble entries to `socials` once you have the URLs.
 */
export const profile: Profile = {
  name: { en: 'Moad Almshirem', ar: 'معاذ المشيرم' },
  role: { en: 'Software Engineer', ar: 'مهندس برمجيات' },
  email: 'moadnasseral@gmail.com',
  cvFile: null,
  photo: null,
  whatsapp: null,
  socials: [{ id: 'github', label: 'GitHub', url: 'https://github.com/moadnasser' }],
}
