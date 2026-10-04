// Update this file when the owner provides verified business details.
export const salon = {
  phone: '', whatsapp: '', instagram: '', mapsUrl: '', location: '',
  hours: '', email: '',
};

export const categories = [
  { title: 'الشعر', subtitle: 'عناية وإطلالات تليق بكِ', number: '01' },
  { title: 'المكياج', subtitle: 'تفاصيل تبرز جمالكِ', number: '02' },
  { title: 'العناية', subtitle: 'لحظات من العناية الخاصة', number: '03' },
  { title: 'الحواجب', subtitle: 'لمسة متوازنة لإطلالتكِ', number: '04' },
  { title: 'المناسبات', subtitle: 'استعدّي لكل لحظة مميزة', number: '05' },
  { title: 'العروس VIP', subtitle: 'تجربة خاصة ليومكِ الأجمل', number: '06' },
];

const image = (name) => `/images/${name}`;
export const portfolio = [
  { src: image('WhatsApp Image 2026-10-04 at 8.36.09 PM.jpeg'), title: 'تفاصيل يوم العروس', tag: 'العروس' },
  { src: image('WhatsApp Image 2026-10-04 at 8.36.24 PM.jpeg'), title: 'إطلالة للمناسبات', tag: 'المناسبات' },
  { src: image('WhatsApp Image 2026-10-04 at 8.36.36 PM.jpeg'), title: 'مكياج بإطلالة ناعمة', tag: 'المكياج' },
  { src: image('WhatsApp Image 2026-10-04 at 8.36.48 PM.jpeg'), title: 'إطلالة متكاملة', tag: 'المكياج' },
  { src: image('WhatsApp Image 2026-10-04 at 8.37.01 PM.jpeg'), title: 'جمال العروس', tag: 'العروس' },
  { src: image('WhatsApp Image 2026-10-04 at 8.37.11 PM.jpeg'), title: 'لمسات يوم الزفاف', tag: 'العروس' },
  { src: image('WhatsApp Image 2026-10-04 at 8.37.26 PM.jpeg'), title: 'أناقة العروس', tag: 'العروس' },
];
