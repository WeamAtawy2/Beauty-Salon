import React, { useEffect } from 'react';
import Icon from './Icon.jsx';

export default function Lightbox({ items = [], index, onSelect, close }) {
  const item = index === null ? null : items[index];

  useEffect(() => {
    if (!item) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') onSelect((index + 1) % items.length);
      if (event.key === 'ArrowLeft') onSelect((index - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [item, index, items.length, onSelect, close]);

  if (!item) return null;
  const previous = (event) => { event.stopPropagation(); onSelect((index - 1 + items.length) % items.length); };
  const next = (event) => { event.stopPropagation(); onSelect((index + 1) % items.length); };

  return <div className="lightbox" role="dialog" aria-modal="true" aria-label={item.title} onClick={close}>
    <button className="lightbox-close" aria-label="إغلاق" onClick={close}><Icon name="close" /></button>
    <button className="lightbox-nav lightbox-prev" aria-label="الصورة السابقة" onClick={previous}><span aria-hidden="true">‹</span></button>
    <img src={item.src} alt={item.title} onClick={(event) => event.stopPropagation()} />
    <p>{item.title}<span className="lightbox-counter">{index + 1} / {items.length}</span></p>
    <button className="lightbox-nav lightbox-next" aria-label="الصورة التالية" onClick={next}><span aria-hidden="true">›</span></button>
  </div>;
}
