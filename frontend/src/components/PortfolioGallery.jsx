import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

export default function PortfolioGallery({ items, onOpen }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryRef = useRef(null);
  const activeItem = items[activeIndex];

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return undefined;

    let revealObserver;
    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        gallery.classList.add('lookbook-visible');
        revealObserver.disconnect();
      }, { threshold: 0.16 });
      revealObserver.observe(gallery);
    } else {
      gallery.classList.add('lookbook-visible');
    }

    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      const bounds = gallery.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      const shift = Math.max(-8, Math.min(8, (window.innerHeight / 2 - (bounds.top + bounds.height / 2)) * 0.012));
      gallery.querySelector('.lookbook-image-card img')?.style.setProperty('--lookbook-parallax', `${shift}px`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };
    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      revealObserver?.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const showImage = (index) => setActiveIndex(index);

  return <div className="lookbook" ref={galleryRef}>
    <div className="lookbook-feature">
      <button className="lookbook-image-card" type="button" onClick={() => onOpen(activeIndex)} aria-label={`عرض الصورة بالحجم الكامل: ${activeItem.title}`}>
        <img
          key={activeItem.src}
          src={activeItem.src}
          alt={activeItem.title}
          style={{ objectPosition: activeItem.objectPosition || 'center' }}
        />
        <span className="lookbook-image-index" dir="ltr">{String(activeIndex + 1).padStart(2, '0')} <i>/</i> {String(items.length).padStart(2, '0')}</span>
        <span className="lookbook-image-hint">اكتشفي الإطلالة <Icon name="arrow" size={16} /></span>
      </button>

      <div className="lookbook-story" dir="rtl">
        <span className="lookbook-overline"><i /> BEAUTY SALON · PORTFOLIO</span>
        <div className="lookbook-story-main" aria-live="polite">
          <span className="lookbook-story-index" dir="ltr">{String(activeIndex + 1).padStart(2, '0')}</span>
          <small>{activeItem.tag}</small>
          <h3 key={activeItem.title}>{activeItem.title}</h3>
          <p>لكلّ إطلالة حكاية، ولكلّ تفصيلة لمستها الخاصة. لحظات من الجمال صُنعت بعناية في BEAUTY SALON.</p>
        </div>
        <div className="lookbook-story-foot">
          <span>جمالٌ يُروى بالتفاصيل</span>
          <span className="lookbook-rule" />
          <button type="button" onClick={() => onOpen(activeIndex)} aria-label={`تكبير ${activeItem.title}`}><Icon name="arrow" size={18} /></button>
        </div>
      </div>
    </div>

    <div className="lookbook-index">
      <div className="lookbook-index-heading" dir="rtl">
        <span>مختارات من أعمالنا</span>
        <span className="lookbook-index-note" dir="ltr">SELECT A LOOK <i>—</i> {String(items.length).padStart(2, '0')} FRAMES</span>
      </div>
      <div className="lookbook-rail" role="group" aria-label="اختاري إطلالة لعرضها">
        {items.map((item, index) => <button
          className={`lookbook-thumb${index === activeIndex ? ' is-active' : ''}`}
          type="button"
          key={item.src}
          onClick={() => showImage(index)}
          aria-pressed={index === activeIndex}
          aria-label={`عرض ${item.title}`}
        >
          <span className="lookbook-thumb-image"><img src={item.src} alt="" loading="lazy" /></span>
          <span className="lookbook-thumb-label" dir="rtl"><i dir="ltr">{String(index + 1).padStart(2, '0')}</i>{item.tag}</span>
        </button>)}
      </div>
    </div>
  </div>;
}
