import type { Project, ProjectCategory } from './types'

/**
 * Project catalogue. To add a project: drop its images into /public/projects/
 * and append an entry here — the gallery, filters and viewer pick it up automatically.
 *
 * Screenshots were captured from the actual builds of each project.
 * Private repositories intentionally have no `sourceUrl`.
 */
export const projects: Project[] = [
  {
    id: 'uab-shipping',
    title: { en: 'UAB Shipping', ar: 'أم البحار للشحن' },
    description: {
      en: 'Flutter customer app for a Libyan freight company: sea and air orders, live map tracking and FCM push updates.',
      ar: 'تطبيق Flutter لعملاء شركة شحن ليبية: طلبات شحن بحري وجوي، وتتبّع على خريطة مباشرة، وإشعارات فورية عبر FCM.',
    },
    details: {
      en: 'A bilingual (Arabic-first) Flutter app for Um Albehar Shipping. Customers create freight orders from China, the UAE and Turkey to Libya, follow each shipment on a live map, estimate shipping costs and receive push notifications at every status change. Built with clean architecture per feature, Riverpod state, go_router navigation, dio networking and an encrypted Hive cache, with light and dark themes and a user-adjustable type scale.',
      ar: 'تطبيق Flutter ثنائي اللغة (العربية أولًا) لشركة أم البحار للشحن. ينشئ العملاء طلبات الشحن من الصين والإمارات وتركيا إلى ليبيا ويتابعون كل شحنة على خريطة مباشرة، ويقدّرون تكلفة الشحن، ويستلمون إشعارات عند كل تغيّر في الحالة. مبني بمعمارية نظيفة لكل ميزة، وإدارة حالة Riverpod، وتنقّل go_router، وشبكة dio، وذاكرة Hive مشفّرة، مع وضعين فاتح وداكن وحجم خط قابل للتعديل.',
    },
    category: 'mobile',
    technologies: ['Flutter', 'Riverpod', 'go_router', 'dio', 'Hive', 'flutter_map', 'Firebase Messaging'],
    coverImage: '/projects/uab-home.jpg',
    coverOrientation: 'portrait',
    galleryImages: [
      '/projects/uab-home.jpg',
      '/projects/uab-create-order.jpg',
      '/projects/uab-order-sent.jpg',
      '/projects/uab-order-details.jpg',
      '/projects/uab-pricing.jpg',
      '/projects/uab-track.jpg',
      '/projects/uab-live-map.jpg',
    ],
    screens: { kind: 'phones', front: '/projects/uab-home.jpg', back: '/projects/uab-live-map.jpg' },
    year: 2026,
    featured: true,
    visibility: 'public',
  },
  {
    id: 'travelyuk',
    title: { en: 'Travelyuk', ar: 'ترافليوك' },
    description: {
      en: 'React 19 + PHP/MySQL travel-agency platform: trips, flights, hotels and visas, a role-based staff dashboard and runtime white-label theming.',
      ar: 'منصة وكالة سفر بـ React 19 و PHP/MySQL: رحلات وطيران وفنادق وتأشيرات، ولوحة موظفين بصلاحيات، وتخصيص للهوية أثناء التشغيل.',
    },
    details: {
      en: 'A full travel-agency web app and its backend. Customers book agency-run group trips (request, approval, payment) or reserve flights, hotel rooms and visas through a cart-and-hold flow, then manage bookings, refunds and visa applications. Staff get a permissions-aware dashboard, support chat and runtime white-label branding. Fully bilingual with RTL and light/dark themes. The frontend is React 19 with react-router; the API is a PHP/MySQL service I built alongside it.',
      ar: 'تطبيق ويب متكامل لوكالة سفر مع نظامه الخلفي. يحجز العملاء رحلات جماعية تديرها الوكالة (طلب، موافقة، دفع) أو يحجزون الطيران والفنادق والتأشيرات عبر سلة وحجز مؤقت، ثم يديرون حجوزاتهم واسترداداتهم وطلبات التأشيرة. يحصل الموظفون على لوحة تحكم بصلاحيات دقيقة ودردشة دعم وتخصيص للهوية أثناء التشغيل. ثنائي اللغة بالكامل مع RTL ووضعين فاتح وداكن. الواجهة بـ React 19 و react-router، والواجهة البرمجية خدمة PHP/MySQL بنيتها معه.',
    },
    category: 'web',
    technologies: ['React', 'Vite', 'React Router', 'PHP', 'MySQL', 'Playwright'],
    coverImage: '/projects/travelyuk-cover.webp',
    coverOrientation: 'landscape',
    galleryImages: ['/projects/travelyuk-cover.webp', '/projects/travelyuk-mobile.webp'],
    screens: { kind: 'web', desktop: '/projects/travelyuk-cover.webp', phone: '/projects/travelyuk-mobile.webp' },
    year: 2026,
    featured: true,
    visibility: 'public',
  },
  {
    id: 'meezan',
    title: { en: 'Meezan', ar: 'ميزان' },
    description: {
      en: 'Arabic-first personal management app in React and TypeScript: money, meals, workouts, goals and habits synced in realtime via Firestore.',
      ar: 'تطبيق إدارة شخصية عربي أولًا بـ React و TypeScript: المال والوجبات والتمارين والأهداف والعادات بمزامنة لحظية عبر Firestore.',
    },
    details: {
      en: 'A personal management web app combining personal finance, food and nutrition tracking, gym sessions, goals, tasks, habit programs and body measurements. Built with React, TypeScript and Tailwind on Firebase Authentication and Cloud Firestore, with realtime subscriptions, per-user data namespacing, integer money units and transactional writes.',
      ar: 'تطبيق ويب للإدارة الشخصية يجمع بين المالية الشخصية وتتبّع الطعام والتغذية وجلسات التمرين والأهداف والمهام وبرامج العادات وقياسات الجسم. مبني بـ React و TypeScript و Tailwind فوق Firebase Authentication و Cloud Firestore، مع اشتراكات لحظية وفصل بيانات كل مستخدم ووحدات مالية صحيحة وعمليات كتابة ضمن معاملات.',
    },
    category: 'web',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase Auth', 'Cloud Firestore'],
    coverImage: '/projects/meezan-mobile.webp',
    coverOrientation: 'portrait',
    galleryImages: ['/projects/meezan-mobile.webp', '/projects/meezan-cover.webp'],
    screens: { kind: 'web', desktop: '/projects/meezan-cover.webp', phone: '/projects/meezan-mobile.webp' },
    year: 2026,
    featured: false,
    visibility: 'public',
  },
  {
    id: 'jabal-al-hadeed',
    title: { en: 'Jabal Al Hadeed', ar: 'جبل الحديد' },
    description: {
      en: 'Bilingual site for a Tripoli power-tools and building-materials supplier: React, CSS Modules over design tokens, MVC, no UI framework.',
      ar: 'موقع ثنائي اللغة لمورّد عدد كهربائية ومواد بناء في طرابلس: React و CSS Modules فوق رموز التصميم، بنمط MVC ودون إطار واجهات.',
    },
    details: {
      en: 'A fast, bilingual (English / Arabic) marketing site with product ranges, brands, FAQ and a contact form. Laid out as MVC with one-way dependencies, plain CSS Modules over a design-token layer, responsive images with low-quality placeholders, and no UI framework.',
      ar: 'موقع تعريفي سريع ثنائي اللغة (إنجليزي / عربي) يعرض فئات المنتجات والعلامات والأسئلة الشائعة ونموذج تواصل. مبني بنمط MVC بتبعيات أحادية الاتجاه، و CSS Modules فوق طبقة من رموز التصميم، وصور متجاوبة مع صور مصغّرة مؤقتة، ودون أي إطار واجهات.',
    },
    category: 'web',
    technologies: ['React 19', 'Vite', 'CSS Modules', 'PHP'],
    coverImage: '/projects/jabal-cover.webp',
    coverOrientation: 'landscape',
    galleryImages: ['/projects/jabal-cover.webp', '/projects/jabal-mobile.webp'],
    screens: { kind: 'web', desktop: '/projects/jabal-cover.webp', phone: '/projects/jabal-mobile.webp' },
    liveUrl: 'https://jabal.tools',
    sourceUrl: 'https://github.com/moadnasser/jabal',
    year: 2026,
    featured: true,
    visibility: 'public',
  },
  {
    id: 'lati-report-studio',
    title: { en: 'LATI Report Studio', ar: 'استوديو التقارير — LATI' },
    description: {
      en: 'Local-first Next.js tool: parses a training-course folder and exports attendance, grades and certificates as PowerPoint and PDF, fully client-side.',
      ar: 'أداة Next.js تعمل محليًا: تحلّل مجلد الدورة التدريبية وتصدّر الحضور والدرجات والشهادات إلى PowerPoint و PDF بالكامل داخل المتصفح.',
    },
    details: {
      en: 'A local-first Next.js tool for the Libyan Academy of Telecommunications and Informatics. It reads a course folder (spreadsheets, attendance sheets, photos, certificates), walks the user through a five-step flow and exports, for each company, a PowerPoint built on the academy template and a PDF with that company\'s certificates merged in — entirely in the browser, with nothing sent to a server.',
      ar: 'أداة Next.js تعمل محليًا للأكاديمية الليبية للاتصالات والمعلوماتية. تقرأ مجلد الدورة (جداول البيانات وكشوف الحضور والصور والشهادات)، وترافق المستخدم في خمس خطوات، ثم تصدّر لكل شركة عرض PowerPoint مبنيًا على قالب الأكاديمية وملف PDF مدمجًا معه شهادات الشركة — كل ذلك داخل المتصفح دون إرسال أي بيانات إلى خادم.',
    },
    category: 'web',
    technologies: ['Next.js', 'TypeScript', 'Radix UI', 'ExcelJS', 'pptxgenjs', 'pdf-lib'],
    coverImage: '/projects/lati-mobile.webp',
    coverOrientation: 'portrait',
    galleryImages: ['/projects/lati-mobile.webp', '/projects/lati-cover.webp'],
    screens: { kind: 'web', desktop: '/projects/lati-cover.webp', phone: '/projects/lati-mobile.webp' },
    year: 2026,
    featured: false,
    visibility: 'public',
  },
]

export const visibleProjects = projects.filter((p) => p.visibility === 'public')

/** Categories in display order; the gallery only renders those with at least one project. */
export const categoryOrder: ProjectCategory[] = ['web', 'mobile', 'backend', 'uiux', 'other']
