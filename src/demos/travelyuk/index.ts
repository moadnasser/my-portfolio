import type { DemoDefinition } from '../kit/types'
import App from './App'

const demo: DemoDefinition = {
  frame: 'browser',
  windowLabel: 'Travelyuk · demo',
  intro: {
    en: 'A travel agency platform with two products. Request a group trip and approve it yourself as staff, or reserve flights, hotels and visas on a live hold timer.',
    ar: 'منصة وكالة سفر بمنتجين. اطلب رحلة جماعية ووافق عليها بنفسك بصفة موظف، أو احجز الطيران والفنادق والتأشيرات بمؤقت حجز حي.',
  },
  tasks: [
    { id: 'request', label: { en: 'Request seats on a group trip', ar: 'اطلب مقاعد في رحلة جماعية' } },
    { id: 'approve', label: { en: 'Switch to Staff and approve the request', ar: 'انتقل إلى عرض الموظف ووافق على الطلب' } },
    { id: 'hold', label: { en: 'Reserve a cart and start the 15-minute hold', ar: 'احجز سلة وابدأ مؤقت الحجز 15 دقيقة' } },
    { id: 'pay', label: { en: 'Pay with the test gateway', ar: 'ادفع عبر بوابة الدفع التجريبية' } },
    { id: 'cancel', label: { en: 'Cancel a booking and see the refund rules', ar: 'ألغِ حجزًا واطّلع على قواعد الاسترداد' } },
  ],
  App,
}

export default demo
