import React from 'react';
import { Link } from 'react-router-dom';
import { salon } from '../data/content.js';
import Icon from './Icon.jsx';

export default function Footer() {
  return <footer id="contact" className="site-footer"><div className="footer-main wrap">
    <div className="footer-brand"><Link to="/" className="brand"><span className="brand-name">BEAUTY<small>SALON</small></span></Link><p>مساحة للجمال، ووقتٌ خاصّ بكِ.</p></div>
    <div className="footer-links"><h3>روابط سريعة</h3><a href="/#services">الخدمات</a><a href="/#bridal">العروس VIP</a><a href="/#booking">الحجوزات</a><a href="/#work">أعمالنا</a></div>
    <div className="footer-links"><h3>يسعدنا تواصلكِ</h3><p>{salon.location || 'أضيفي موقع الصالون هنا'}</p>{salon.phone && <a href={`tel:${salon.phone}`}><Icon name="phone" size={15} /> {salon.phone}</a>}{salon.whatsapp && <a href={`https://wa.me/${salon.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">واتساب</a>}{salon.instagram && <a href={salon.instagram} target="_blank" rel="noreferrer"><Icon name="instagram" size={15} /> إنستغرام</a>}</div>
    <div className="footer-cta"><span className="eyebrow">وقتكِ الخاص يبدأ هنا</span><Link to="/book" className="text-link">احجزي موعدكِ <Icon name="arrow" /></Link><span className="muted">ساعات العمل تُحدّث قريباً</span></div>
  </div><div className="footer-bottom wrap"><span>© {new Date().getFullYear()} BEAUTY SALON</span><span>صُمّمت بعناية للجمال الذي يشبهكِ</span></div></footer>;
}
