import type { DemoDefinition } from '../kit/types'
import App from './App'

const demo: DemoDefinition = {
  frame: 'phone',
  intro: {
    en: 'The customer app for a Libyan freight company. Estimate a shipment, place an order and follow it on the live map with push updates.',
    ar: 'تطبيق العملاء لشركة شحن ليبية. قدّر تكلفة شحنة، وأنشئ طلبًا، وتابعه على الخريطة المباشرة مع الإشعارات.',
  },
  tasks: [
    { id: 'estimate', label: { en: 'Estimate a shipment in the calculator', ar: 'قدّر تكلفة شحنة في الحاسبة' } },
    { id: 'order', label: { en: 'Create a shipping order', ar: 'أنشئ طلب شحن' } },
    { id: 'track', label: { en: 'Get a push update when it starts shipping', ar: 'استلم إشعارًا عند بدء شحن الطلب' } },
    { id: 'map', label: { en: 'Follow a shipment on the live map', ar: 'تابع شحنة على الخريطة المباشرة' } },
  ],
  App,
}

export default demo
