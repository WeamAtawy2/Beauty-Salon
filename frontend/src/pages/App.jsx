import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Lightbox from '../components/Lightbox.jsx';
import PortfolioGallery from '../components/PortfolioGallery.jsx';
import ServicesEditorial from '../components/ServicesEditorial.jsx';
import Icon from '../components/Icon.jsx';
import { portfolio, salon } from '../data/content.js';
import BookingPage, { BookingSection } from './BookingPage.jsx';

function HomePage() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  useEffect(() => {
    const targets = [...document.querySelectorAll('.hero, .intro-section, .villa-section, .services-section, .bridal-section, .work-section, .team-teaser, .booking-section, .site-footer')];
    targets.forEach((element) => element.classList.add('scroll-reveal', 'reveal-pending'));
    if (!('IntersectionObserver' in window)) {
      targets.forEach((element) => element.classList.remove('reveal-pending'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('reveal-in');
      entry.target.classList.remove('reveal-pending');
      observer.unobserve(entry.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    targets.forEach((element) => observer.observe(element));

    let frame = 0;
    const parallaxImages = [...document.querySelectorAll('.parallax-image')];
    const updateParallax = () => {
      frame = 0;
      parallaxImages.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const shift = Math.max(-14, Math.min(14, (window.innerHeight / 2 - (rect.top + rect.height / 2)) * 0.025));
        element.style.setProperty('--parallax-y', `${shift}px`);
      });
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(updateParallax); };
    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener('scroll', onScroll); if (frame) window.cancelAnimationFrame(frame); };
  }, []);
  return <>
    <main>
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-art"><img className="hero-art-image parallax-image" src="/images/hero-beauty-portrait.png" alt="إطلالة مكياج أنيقة من BEAUTY SALON" /></div>
        <div className="hero-content"><span className="hero-kicker"><Icon name="sparkle" size={16} /> BEAUTY SALON · HAIR & BEAUTY</span><h1 id="hero-title">جمالكِ...<br /><em>بتفاصيل مختلفة</em></h1><p>صالون تجميل لإطلالة تعبّر عنكِ</p><div className="hero-actions"><a href="#booking" className="button button-gold">احجزي موعدكِ الآن <Icon name="arrow" /></a><a href="#about" className="hero-secondary">اكتشفي الصالون <span>↓</span></a></div></div>
      </section>

      <section className="intro-section wrap" id="about"><div className="intro-number">01 <span>—</span> THE EXPERIENCE</div><div className="intro-copy"><span className="eyebrow">مرحباً بكِ في عالمنا</span><h2>مساحة تخصّكِ،<br /><em>وجمالٌ يعبّر عنكِ.</em></h2><p>تجربة تجميل متكاملة صُممت لتمنحكِ وقتاً خاصاً واهتماماً يليق بكِ. من تفاصيل إطلالتكِ اليومية إلى الاستعداد ليومكِ الأجمل، كل لحظة تبدأ بالإنصات لما تحبين.</p><a href="#services" className="text-link">تعرّفي على خدماتنا <Icon name="arrow" /></a></div><div className="intro-photo"><img className="parallax-image" src="/images/beauty-editorial-portrait.jpg" alt="إطلالة جمالية بتفاصيل ناعمة" /><span className="photo-stamp">BEAUTY<br />IN DETAIL</span></div></section>

      <section className="villa-section" id="villa"><div className="villa-photo"><img className="parallax-image" src="/images/salon-hair-styling.jpg" alt="خبيرة تصفيف شعر تعمل على إطلالة زبونة" /><div className="villa-photo-note"><span className="villa-index">BEAUTY SALON · 02</span><span>عناية هادئة<br />وتفاصيل مدروسة</span><small>من أجواء جلسات التجميل</small></div></div><div className="villa-copy"><span className="eyebrow">تجربة الصالون</span><h2>وقتكِ الخاص،<br /><em>بكلّ تفاصيله.</em></h2><p>مساحة تستقبلكِ باهتمام شخصي وأجواء هادئة. نعتني بتفاصيل إطلالتكِ على مهل، لتكون تجربتكِ جميلة من أول لحظة.</p><div className="villa-detail"><span>01</span><span>اهتمام شخصي بتفاصيلكِ</span></div><div className="villa-detail"><span>02</span><span>عناية وإطلالات متكاملة</span></div><div className="villa-detail"><span>03</span><span>استعداد مميز ليوم العروس</span></div><a className="text-link" href="#contact">تواصلي معنا <Icon name="arrow" /></a></div></section>

      <ServicesEditorial />

      <section id="bridal" className="bridal-section"><div className="bridal-image"><img className="parallax-image" src="/images/bridal-veil-editorial.png" alt="عروس بإطلالة فستان وطرحة أنيقة" /></div><div className="bridal-copy"><span className="bridal-kicker"><Icon name="sparkle" size={16} /> BEAUTY SALON · BRIDAL</span><span className="eyebrow">ليومٍ لا يشبه سواه</span><h2>عروس<br /><em>بكلّ تفاصيلها.</em></h2><p>استعداد العروس يبدأ من لحظات التحضير الأولى. مكياج وشعر ولمسات أخيرة؛ وقتكِ ومساحتكِ الخاصة ليومكِ الأجمل.</p><ul><li>تحضير متكامل لإطلالة يوم الزفاف</li><li>عناية بتفاصيل المكياج والشعر</li><li>تجربة تُرتّب بما يناسب يومكِ</li></ul><a className="button button-outline-light" href="#booking">احجزي موعد العروس <Icon name="arrow" /></a></div><span className="bridal-watermark">B</span></section>

      <section id="work" className="work-section"><div className="work-shell wrap"><div className="work-heading" dir="rtl"><div><span className="eyebrow">من أعمالنا · BEAUTY SALON</span><h2>جمالٌ يُروى<br /><em>بالتفاصيل.</em></h2><p>كلّ إطلالة تحمل حكاية، وكلّ تفصيلة تبدأ بكِ.</p></div><span className="work-heading-mark" dir="ltr">THE<br />LOOKBOOK <i>✳</i></span></div><PortfolioGallery items={portfolio} onOpen={setSelectedIndex} /><a className="work-follow" href={salon.instagram || '#contact'}>{salon.instagram ? 'تابعينا على إنستغرام' : 'اكتشفي المزيد من عالمنا'} <Icon name="arrow" size={17} /></a></div></section>

      <section id="team" className="team-teaser"><div className="wrap team-teaser-inner"><div><span className="eyebrow">فريق BEAUTY SALON</span><h2>اهتمامٌ يبدأ<br /><em>بالإنصات إليكِ.</em></h2></div><div><p>نجهّز هذا الركن لصور وأسماء واختصاصات فريق الصالون، لتتعرفي على من سيشارككِ تفاصيل إطلالتكِ.</p><span className="team-note">تُضاف تفاصيل الفريق عند توفرها.</span></div></div></section>
      <BookingSection />
    </main>
    <Lightbox items={portfolio} index={selectedIndex} onSelect={setSelectedIndex} close={() => setSelectedIndex(null)} />
  </>;
}

export default function App() {
  const location = useLocation();
  return <><Header overHero={location.pathname === '/'} isHome={location.pathname === '/'} /><Routes><Route path="/" element={<HomePage />} /><Route path="/book" element={<BookingPage />} /><Route path="*" element={<HomePage />} /></Routes><Footer /></>;
}
