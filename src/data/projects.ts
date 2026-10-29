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
      en: 'Customer app for a Libyan freight company: create and track sea and air orders, manage a wallet and get push updates.',
      ar: 'تطبيق العملاء لشركة شحن ليبية: إنشاء طلبات الشحن البحري والجوي وتتبّعها، وإدارة المحفظة، واستلام الإشعارات.',
    },
    details: {
      en: 'A bilingual (Arabic-first) Flutter app for Um Albehar Shipping. Customers create and follow freight orders from China, the UAE and Turkey to Libya, top up a wallet, estimate shipping costs and receive push notifications at every status change. Built with clean architecture per feature, Riverpod state, go_router navigation, dio networking and an encrypted Hive cache, with light and dark themes and a user-adjustable type scale.',
      ar: 'تطبيق Flutter ثنائي اللغة (العربية أولًا) لشركة أم البحار للشحن. ينشئ العملاء طلبات الشحن من الصين والإمارات وتركيا إلى ليبيا ويتابعونها، ويشحنون المحفظة، ويقدّرون تكلفة الشحن، ويستلمون إشعارات عند كل تغيّر في الحالة. مبني بمعمارية نظيفة لكل ميزة، وإدارة حالة Riverpod، وتنقّل go_router، وشبكة dio، وذاكرة Hive مشفّرة، مع وضعين فاتح وداكن وحجم خط قابل للتعديل.',
    },
    category: 'mobile',
    technologies: ['Flutter', 'Riverpod', 'go_router', 'dio', 'Hive', 'Firebase Messaging'],
    coverImage: '/projects/uab-cover.webp',
    coverOrientation: 'landscape',
    galleryImages: ['/projects/uab-cover.webp'],
    year: 2026,
    featured: true,
    visibility: 'public',
  },
  {
    id: 'pizza-delivery',
    title: { en: 'Pizza Delivery', ar: 'توصيل البيتزا' },
    description: {
      en: 'Offline-first pizza ordering app with categories, cart, favourites and order history stored locally in SQLite.',
      ar: 'تطبيق طلب بيتزا يعمل دون اتصال مع تصنيفات وسلة ومفضلة وسجل طلبات محفوظ محليًا في SQLite.',
    },
    details: {
      en: 'A Flutter ordering app built offline-first: the menu, cart, favourites and order history all persist in SQLite through sqflite. Clean architecture with feature-based folders, Riverpod for state and go_router for navigation.',
      ar: 'تطبيق طلبات بـ Flutter مبني ليعمل دون اتصال: القائمة والسلة والمفضلة وسجل الطلبات كلها محفوظة في SQLite عبر sqflite. معمارية نظيفة بمجلدات لكل ميزة، وRiverpod لإدارة الحالة، وgo_router للتنقّل.',
    },
    category: 'mobile',
    technologies: ['Flutter', 'Riverpod', 'go_router', 'sqflite'],
    coverImage: '/projects/pizza-cover.webp',
    coverOrientation: 'portrait',
    galleryImages: ['/projects/pizza-cover.webp'],
    year: 2026,
    featured: false,
    visibility: 'public',
  },
  {
    id: 'travelyuk',
    title: { en: 'Travelyuk', ar: 'ترافل يوك' },
    description: {
      en: 'Travel agency platform: group trips, flights, hotels and visas with a customer area, staff dashboard and white-label theming.',
      ar: 'منصة وكالة سفر: رحلات جماعية وطيران وفنادق وتأشيرات مع منطقة للعملاء ولوحة للموظفين وتخصيص كامل للهوية.',
    },
    details: {
      en: 'A full travel-agency web app and its backend. Customers book agency-run group trips (request, approval, payment) or reserve flights, hotel rooms and visas through a cart-and-hold flow, then manage bookings, refunds and visa applications. Staff get a permissions-aware dashboard, support chat and runtime white-label branding. Fully bilingual with RTL and light/dark themes. The frontend is React 19 with react-router; the API is a PHP/MySQL service I built alongside it.',
      ar: 'تطبيق ويب متكامل لوكالة سفر مع نظامه الخلفي. يحجز العملاء رحلات جماعية تديرها الوكالة (طلب، موافقة، دفع) أو يحجزون الطيران والفنادق والتأشيرات عبر سلة وحجز مؤقت، ثم يديرون حجوزاتهم واسترداداتهم وطلبات التأشيرة. يحصل الموظفون على لوحة تحكم بصلاحيات دقيقة ودردشة دعم وتخصيص للهوية أثناء التشغيل. ثنائي اللغة بالكامل مع RTL ووضعين فاتح وداكن. الواجهة بـ React 19 وreact-router، والواجهة البرمجية خدمة PHP/MySQL بنيتها معه.',
    },
    category: 'web',
    technologies: ['React', 'Vite', 'React Router', 'PHP', 'MySQL', 'Playwright'],
    coverImage: '/projects/travelyuk-cover.webp',
    coverOrientation: 'landscape',
    galleryImages: ['/projects/travelyuk-cover.webp', '/projects/travelyuk-mobile.webp'],
    year: 2026,
    featured: true,
    visibility: 'public',
  },
  {
    id: 'meezan',
    title: { en: 'Meezan', ar: 'ميزان' },
    description: {
      en: 'Arabic-first personal management app: money, meals, workouts, goals and habits on a realtime Firestore backend.',
      ar: 'تطبيق إدارة شخصية عربي أولًا: المال والوجبات والتمارين والأهداف والعادات على قاعدة Firestore لحظية.',
    },
    details: {
      en: 'A personal management web app combining personal finance, food and nutrition tracking, gym sessions, goals, tasks, habit programs and body measurements. Built with React, TypeScript and Tailwind on Firebase Authentication and Cloud Firestore, with realtime subscriptions, per-user data namespacing, integer money units and transactional writes.',
      ar: 'تطبيق ويب للإدارة الشخصية يجمع بين المالية الشخصية وتتبّع الطعام والتغذية وجلسات التمرين والأهداف والمهام وبرامج العادات وقياسات الجسم. مبني بـ React وTypeScript وTailwind فوق Firebase Authentication وCloud Firestore، مع اشتراكات لحظية وفصل بيانات كل مستخدم ووحدات مالية صحيحة وعمليات كتابة ضمن معاملات.',
    },
    category: 'web',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase Auth', 'Cloud Firestore'],
    coverImage: '/projects/meezan-mobile.webp',
    coverOrientation: 'portrait',
    galleryImages: ['/projects/meezan-mobile.webp', '/projects/meezan-cover.webp'],
    year: 2026,
    featured: false,
    visibility: 'public',
  },
  {
    id: 'jabal-al-hadeed',
    title: { en: 'Jabal Al Hadeed', ar: 'جبل الحديد' },
    description: {
      en: 'Bilingual marketing site for a Tripoli power-tools and building-materials supplier, built with React and CSS Modules.',
      ar: 'موقع تعريفي ثنائي اللغة لمورّد عدد كهربائية ومواد بناء في طرابلس، مبني بـ React وCSS Modules.',
    },
    details: {
      en: 'A fast, bilingual (English / Arabic) marketing site with product ranges, brands, FAQ and a contact form. Laid out as MVC with one-way dependencies, plain CSS Modules over a design-token layer, responsive images with low-quality placeholders, and no UI framework.',
      ar: 'موقع تعريفي سريع ثنائي اللغة (إنجليزي / عربي) يعرض فئات المنتجات والعلامات والأسئلة الشائعة ونموذج تواصل. مبني بنمط MVC بتبعيات أحادية الاتجاه، وCSS Modules فوق طبقة من رموز التصميم، وصور متجاوبة مع صور مصغّرة مؤقتة، ودون أي إطار واجهات.',
    },
    category: 'web',
    technologies: ['React 19', 'Vite', 'CSS Modules', 'PHP'],
    coverImage: '/projects/jabal-cover.webp',
    coverOrientation: 'landscape',
    galleryImages: ['/projects/jabal-cover.webp', '/projects/jabal-mobile.webp'],
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
      en: 'Drop a training-course folder and get the final report: attendance, grades and certificates compiled into Word, PowerPoint and PDF.',
      ar: 'أفلت مجلد الدورة التدريبية واستلم التقرير الختامي: الحضور والدرجات والشهادات مجمّعة في Word وPowerPoint وPDF.',
    },
    details: {
      en: 'A local-first Next.js tool for the Libyan Academy of Telecommunications and Informatics. It reads a course folder (spreadsheets, attendance sheets, photos, certificates), walks the user through a five-step flow and exports a per-company PDF, a PowerPoint built on the academy template and a Word report — entirely in the browser, with nothing sent to a server.',
      ar: 'أداة Next.js تعمل محليًا للأكاديمية الليبية للاتصالات والمعلوماتية. تقرأ مجلد الدورة (جداول البيانات وكشوف الحضور والصور والشهادات)، وترافق المستخدم في خمس خطوات، ثم تصدّر ملف PDF لكل شركة وعرض PowerPoint مبنيًا على قالب الأكاديمية وتقرير Word — كل ذلك داخل المتصفح دون إرسال أي بيانات إلى خادم.',
    },
    category: 'web',
    technologies: ['Next.js', 'TypeScript', 'Radix UI', 'ExcelJS', 'pptxgenjs', 'docx', 'pdf-lib'],
    coverImage: '/projects/lati-mobile.webp',
    coverOrientation: 'portrait',
    galleryImages: ['/projects/lati-mobile.webp', '/projects/lati-cover.webp'],
    year: 2026,
    featured: false,
    visibility: 'public',
  },
]

export const visibleProjects = projects.filter((p) => p.visibility === 'public')

/** Categories in display order; the gallery only renders those with at least one project. */
export const categoryOrder: ProjectCategory[] = ['web', 'mobile', 'backend', 'uiux', 'other']
