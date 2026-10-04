import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

const links = [['الرئيسية', 'top'], ['عن الصالون', 'about'], ['الصالون', 'villa'], ['الخدمات', 'services'], ['أعمالنا', 'work'], ['فريقنا', 'team'], ['العروس', 'bridal'], ['تواصل معنا', 'contact']];
export default function Header({ overHero = false, isHome = false }) {
  const [open, setOpen] = useState(false);
  return <header className={`site-header${overHero ? ' over-hero' : ''}`}><div className="header-inner">
    <Link className="brand" to="/" onClick={() => setOpen(false)} aria-label="BEAUTY SALON الرئيسية"><span className="brand-name">BEAUTY<small>SALON</small></span></Link>
    <nav className={open ? 'main-nav is-open' : 'main-nav'} aria-label="التنقل الرئيسي">
      {links.map(([name, target]) => <a key={name} href={`${isHome ? '' : '/'}#${target}`} onClick={() => setOpen(false)}>{name}</a>)}
      <a className="nav-book-mobile" href={`${isHome ? '' : '/'}#booking`} onClick={() => setOpen(false)}>احجزي موعدكِ <Icon name="arrow" /></a>
    </nav>
    <a className="button button-dark header-book" href={`${isHome ? '' : '/'}#booking`}>احجزي موعدكِ <Icon name="arrow" /></a>
    <button className="menu-toggle" aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={open} onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} size={23} /></button>
  </div></header>;
}
