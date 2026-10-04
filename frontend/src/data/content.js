// Update this file when the owner provides verified business details.
export const salon = {
  phone: '', whatsapp: '', instagram: '', mapsUrl: '', location: '',
  hours: '', email: '',
};

const image = (name) => `/images/${name}`;

export const categories = [
  { title: 'الشعر', subtitle: 'عناية وإطلالات تليق بكِ', number: '01', image: image('salon-hair-styling.jpg') },
  { title: 'المكياج', subtitle: 'تفاصيل تبرز جمالكِ', number: '02', image: image('makeup-red-lip.jpg') },
  { title: 'العناية', subtitle: 'لحظات من العناية الخاصة', number: '03', image: image('hair-color-treatment.jpg') },
  { title: 'الحواجب', subtitle: 'لمسة متوازنة لإطلالتكِ', number: '04', image: image('makeup-editorial-closeup.jpg') },
  { title: 'المناسبات', subtitle: 'استعدّي لكل لحظة مميزة', number: '05', image: image('beauty-editorial-portrait.jpg') },
  { title: 'العروس VIP', subtitle: 'تجربة خاصة ليومكِ الأجمل', number: '06', image: image('bridal-full-look.jpg') },
];

export const portfolio = [
  { src: image('bridal-full-look.jpg'), title: 'إطلالة العروس', tag: 'العروس' },
  { src: image('salon-hair-styling.jpg'), title: 'تفاصيل تصفيف الشعر', tag: 'الشعر' },
  { src: image('hero-beauty-portrait.png'), title: 'جمال بتفاصيل ناعمة', tag: 'المكياج' },
  { src: image('beauty-editorial-portrait.jpg'), title: 'إطلالة للمناسبات', tag: 'المناسبات' },
  { src: image('makeup-red-lip.jpg'), title: 'لمسة مكياج جريئة', tag: 'المكياج' },
  { src: image('hair-color-treatment.jpg'), title: 'تحضير تفاصيل العناية', tag: 'العناية' },
  { src: image('bridal-veil-editorial.png'), title: 'لحظة العروس', tag: 'العروس' },
  { src: image('bridal-portrait.jpg'), title: 'أناقة يوم الزفاف', tag: 'العروس' },
  { src: image('stylist-hair-tools.jpg'), title: 'فن تصفيف الشعر', tag: 'الشعر' },
  { src: image('makeup-editorial-closeup.jpg'), title: 'إطلالة متكاملة', tag: 'المكياج' },
];
