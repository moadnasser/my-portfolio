import type { DemoDefinition } from '../kit/types'
import App from './App'

const demo: DemoDefinition = {
  frame: 'browser',
  windowLabel: 'Meezan · demo',
  intro: {
    en: 'An Arabic-first personal manager for money, fitness and daily life. Log spending, watch budgets react and keep your gym streak alive.',
    ar: 'مدير شخصي عربي أولًا للمال واللياقة والحياة اليومية. سجّل مصروفاتك، وراقب تفاعل الميزانيات، وحافظ على تتابع حضورك للصالة.',
  },
  tasks: [
    { id: 'expense', label: { en: 'Log an expense (Arabic digits work too)', ar: 'سجّل مصروفًا (الأرقام العربية تعمل أيضًا)' } },
    { id: 'budget', label: { en: 'Push a budget past its 80% warning level', ar: 'تجاوز بميزانية حد التنبيه 80٪' } },
    { id: 'gym', label: { en: 'Mark today at the gym and grow your streak', ar: 'سجّل حضورك اليوم للصالة وزِد التتابع' } },
    { id: 'todo', label: { en: 'Complete a task', ar: 'أكمل مهمة' } },
  ],
  App,
}

export default demo
