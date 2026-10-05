import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import SectionHeading from './SectionHeading.jsx';
import { categories } from '../data/content.js';
import { getServices } from '../services/api.js';

function serviceImage(service, index) {
  const category = `${service.category || ''} ${service.name || ''}`.toLowerCase();
  if (/bridal|bride|عروس|زفاف|vip/.test(category)) return '/images/bridal-full-look.jpg';
  if (/make.?up|مكياج/.test(category)) return '/images/makeup-red-lip.jpg';
  if (/hair|شعر|تسريح|صبغ|لون/.test(category)) return /صبغ|لون|color|dye/.test(category) ? '/images/hair-color-treatment.jpg' : '/images/salon-hair-styling.jpg';
  if (/brow|حاجب|حواجب/.test(category)) return '/images/makeup-editorial-closeup.jpg';
  if (/skin|facial|بشرة|عناية/.test(category)) return '/images/beauty-editorial-portrait.jpg';
  return categories[index % categories.length].image;
}

function formatPrice(service) {
  if (service.price === null || service.price === undefined || service.price === '') return '';
  return `${service.price} ${service.currency || 'ILS'}`;
}

export default function ServicesEditorial() {
  const [services, setServices] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const gridRef = useRef(null);
  useEffect(() => {
    getServices().then(({ services: records = [] }) => setServices(records)).catch((error) => {
      setLoadError(error.message);
      setServices([]);
    }).finally(() => setLoaded(true));
  }, []);

  const entries = services.length ? services.map((service, index) => ({
    title: service.name,
    category: service.category,
    description: service.description,
    price: formatPrice(service),
    image: serviceImage(service, index),
    key: service.id || `${service.name}-${index}`,
  })) : categories.map((item) => ({
    title: item.title,
    category: item.number,
    description: item.subtitle,
    image: item.image,
    key: item.number,
  }));

  useEffect(() => {
    const cards = [...(gridRef.current?.querySelectorAll('.service-editorial') || [])];
    if (!('IntersectionObserver' in window)) {
      cards.forEach((card) => card.classList.add('service-editorial-visible'));
      return undefined;
    }
    cards.forEach((card) => card.classList.add('service-editorial-pending'));
    const observer = new IntersectionObserver((changes) => changes.forEach((change) => {
      if (!change.isIntersecting) return;
      change.target.classList.add('service-editorial-visible');
      change.target.classList.remove('service-editorial-pending');
      observer.unobserve(change.target);
    }), { threshold: 0.14, rootMargin: '0px 0px -4% 0px' });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [services]);

  return <section id="services" className="services-section wrap scroll-reveal">
    <SectionHeading eyebrow="عناية تليق بكِ" title="تجربتكِ، على طريقتكِ" description="من تفاصيل الشعر والمكياج إلى استعدادات يومكِ الأجمل، اختاري ما يشبهكِ." />
    <div className="services-editorial" ref={gridRef}>
      {entries.map((item, index) => <article className={`service-editorial service-editorial-${index % 6 + 1}`} key={item.key}>
        <a href="#booking" className="service-editorial-image" aria-label={`احجزي ${item.title}`}>
          <img src={item.image} alt={item.title} loading={index > 1 ? 'lazy' : 'eager'} />
          <span className="service-editorial-index">{String(index + 1).padStart(2, '0')}</span>
          {item.price && <span className="service-editorial-price">{item.price}</span>}
        </a>
        <div className="service-editorial-copy">
          <span className="service-editorial-category">{item.category}</span>
          <h3>{item.title}</h3>
          {item.description && <p>{item.description}</p>}
          <a className="service-editorial-link" href="#booking">اختاري موعدكِ <Icon name="arrow" size={15} /></a>
        </div>
      </article>)}
    </div>
    {loaded && services.length === 0 && <p className="service-note" role={loadError ? 'alert' : undefined}>{loadError || 'ستظهر الخدمات والأسعار المعتمدة هنا عند تحديث قائمة الصالون، ويمكنكِ متابعة الحجز لاستعراض الأوقات المتاحة.'}</p>}
  </section>;
}
