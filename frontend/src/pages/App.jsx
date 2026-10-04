import React, { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Lightbox from '../components/Lightbox.jsx';
import PortfolioStack from '../components/PortfolioStack.jsx';
import Icon from '../components/Icon.jsx';
import { categories, portfolio, salon } from '../data/content.js';
import BookingPage, { BookingSection } from './BookingPage.jsx';

function HomePage() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  return <>
    <main>
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-art"><img className="hero-art-image" src="/images/bana-villa-main-background.jpeg" alt="صورة BANA VILLA الأصلية" /></div>
        <div className="hero-content"><span className="hero-kicker"><Icon name="sparkle" size={16} /> BANA VILLA · BEAUTY HOUSE</span><h1 id="hero-title">جمالكِ...<br /><em>بتفاصيل مختلفة</em></h1><p>مساحة خاصة للجمال والعروس</p><div className="hero-actions"><a href="#booking" className="button button-gold">احجزي موعدكِ الآن <Icon name="arrow" /></a><a href="#about" className="hero-secondary">اكتشفي BANA VILLA <span>↓</span></a></div></div>
      </section>

      <section className="intro-section wrap" id="about"><div className="intro-number">01 <span>—</span> THE EXPERIENCE</div><div className="intro-copy"><span className="eyebrow">مرحباً بكِ في عالمنا</span><h2>مساحة تخصّكِ،<br /><em>وجمالٌ يعبّر عنكِ.</em></h2><p>BANA VILLA تجربة جمال متكاملة صُممت لتمنحكِ وقتاً خاصاً، واهتماماً يليق بكِ. من تفاصيل إطلالتكِ اليومية إلى الاستعداد ليومكِ الأجمل، كل لحظة تبدأ بالإنصات لما تحبين.</p><a href="#services" className="text-link">تعرّفي على خدماتنا <Icon name="arrow" /></a></div><div className="intro-photo"><img src={portfolio[2].src} alt="تفاصيل إطلالة من أعمال BANA VILLA" /><span className="photo-stamp">BEAUTY<br />WITHIN</span></div></section>

      <section className="villa-section" id="villa"><div className="villa-photo"><div className="villa-photo-note"><span className="villa-index">BANA VILLA · 02</span><span>مكانٌ يليق<br />بلحظاتكِ الخاصة</span><small>صور الفيلا الحقيقية تُضاف هنا</small></div></div><div className="villa-copy"><span className="eyebrow">اكتشفي الفيلا</span><h2>لكلّ تفصيلٍ<br /><em>مساحته الخاصة.</em></h2><p>أجواء هادئة واهتمام شخصي يرافقان تجربتكِ من البداية. ننتظر صور المكان الأصلية لنعرّفكِ على الفيلا كما هي، بتفاصيلها الحقيقية.</p><div className="villa-detail"><span>01</span><span>خصوصية واهتمام شخصي</span></div><div className="villa-detail"><span>02</span><span>تجربة جمال على مهل</span></div><div className="villa-detail"><span>03</span><span>استعداد مميز ليوم العروس</span></div><a className="text-link" href="#contact">تواصلي معنا <Icon name="arrow" /></a></div></section>

      <section id="services" className="services-section wrap"><SectionHeading eyebrow="ما نحبّ أن نقدّمه" title="مساحتكِ للجمال" description="اختاري ما يناسبكِ، ودعينا نعتني ببقيّة التفاصيل." /><div className="services-grid">{categories.map((item) => <article className="service-tile" key={item.number}><span className="service-no">{item.number}</span><h3>{item.title}</h3><p>{item.subtitle}</p><a href="#booking" aria-label={`احجزي ${item.title}`}><Icon name="arrow" /></a></article>)}</div><p className="service-note">تفاصيل الخدمات والأسعار تُضاف فور استلام القائمة الرسمية من BANA VILLA.</p></section>

      <section id="bridal" className="bridal-section"><div className="bridal-image"><img src={portfolio[5].src} alt="إطلالة عروس من أعمال BANA VILLA" /></div><div className="bridal-copy"><span className="bridal-kicker"><Icon name="sparkle" size={16} /> BANA VILLA EXCLUSIVE</span><span className="eyebrow">ليومٍ لا يشبه سواه</span><h2>عروس<br /><em>بكلّ تفاصيلها.</em></h2><p>تجربة العروس VIP تبدأ من لحظات التحضير الأولى. مكياج، شعر، ارتداء الفستان والتقاط الصور؛ وقتكِ ومساحتكِ الخاصة ليومكِ الأجمل.</p><ul><li>خصوصية ومساحة مخصصة للعروس</li><li>تحضير متكامل من الإطلالة حتى التصوير</li><li>تجربة تُرتّب لتفاصيل يومكِ</li></ul><a className="button button-outline-light" href="#booking">احجزي تجربة العروس VIP <Icon name="arrow" /></a></div><span className="bridal-watermark">B</span></section>

      <section id="work" className="work-section wrap"><div className="work-header"><SectionHeading eyebrow="من أعمالنا" title="أعمالنا" description="مجموعة من إطلالاتنا التي شاركنا فرحتها." /><a className="text-link work-follow" href={salon.instagram || '#contact'}>{salon.instagram ? 'تابعينا على إنستغرام' : 'ترقّبي المزيد من أعمالنا'} <Icon name="arrow" /></a></div><PortfolioStack items={portfolio} onOpen={setSelectedIndex} /></section>

      <section id="team" className="team-teaser"><div className="wrap team-teaser-inner"><div><span className="eyebrow">فريق BANA VILLA</span><h2>اهتمامٌ يبدأ<br /><em>بالإنصات إليكِ.</em></h2></div><div><p>نجهّز هذا الركن لصور وأسماء واختصاصات فريق BANA VILLA الحقيقية، لتتعرفي على من سيشارككِ تفاصيل إطلالتكِ.</p><span className="team-note">صور الفريق وتفاصيله تُضاف عند تزويدنا بها.</span></div></div></section>
      <BookingSection />
    </main>
    <Lightbox items={portfolio} index={selectedIndex} onSelect={setSelectedIndex} close={() => setSelectedIndex(null)} />
  </>;
}

export default function App() {
  const location = useLocation();
  return <><Header overHero={location.pathname === '/'} isHome={location.pathname === '/'} /><Routes><Route path="/" element={<HomePage />} /><Route path="/book" element={<BookingPage />} /><Route path="*" element={<HomePage />} /></Routes><Footer /></>;
}
