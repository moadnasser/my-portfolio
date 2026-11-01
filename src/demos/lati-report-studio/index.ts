import type { DemoDefinition } from '../kit/types'
import App from './App'

const demo: DemoDefinition = {
  frame: 'browser',
  windowLabel: 'LATI Report Studio · demo',
  intro: {
    en: 'Turns a training-course folder into a finished report for every company. Load a sample course, edit it and watch the printed pages update.',
    ar: 'يحوّل مجلد الدورة التدريبية إلى تقرير جاهز لكل شركة. حمّل دورة تجريبية، وعدّلها، وشاهد الصفحات المطبوعة تتحدّث.',
  },
  tasks: [
    { id: 'edit', label: { en: 'Rename the course', ar: 'غيّر اسم الدورة' } },
    { id: 'folder', label: { en: 'Drop in the sample course folder', ar: 'أفلت مجلد الدورة التجريبي' } },
    { id: 'review', label: { en: 'Review the pages for the second company', ar: 'راجع صفحات الشركة الثانية' } },
    { id: 'export', label: { en: 'Export the reports', ar: 'صدّر التقارير' } },
  ],
  App,
}

export default demo
