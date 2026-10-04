import React, { useEffect, useRef, useState } from 'react';

export default function PortfolioStack({ items, onOpen }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [leaving, setLeaving] = useState(null);
  const pointerStart = useRef(null);
  const suppressClick = useRef(false);
  const animationTimer = useRef(null);
  const locked = useRef(false);

  useEffect(() => () => window.clearTimeout(animationTimer.current), []);

  const move = (direction) => {
    if (locked.current || items.length < 2) return;
    locked.current = true;
    setLeaving({ item: items[activeIndex], direction });
    setActiveIndex((current) => (current + direction + items.length) % items.length);
    animationTimer.current = window.setTimeout(() => {
      setLeaving(null);
      locked.current = false;
    }, 420);
  };

  const onPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event) => {
    if (!pointerStart.current) return;
    const deltaX = event.clientX - pointerStart.current.x;
    const deltaY = event.clientY - pointerStart.current.y;
    pointerStart.current = null;
    if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      suppressClick.current = true;
      move(deltaX < 0 ? 1 : -1);
      window.setTimeout(() => { suppressClick.current = false; }, 80);
    }
  };

  const activeItem = items[activeIndex];
  const visibleCards = Array.from({ length: Math.min(3, items.length - 1) }, (_, layer) => {
    const offset = layer + 1;
    const styles = [null, ['15px', '17px', '.96', '.82'], ['30px', '34px', '.92', '.64'], ['45px', '51px', '.88', '.46']][offset];
    return { item: items[(activeIndex + offset) % items.length], offset, styles };
  }).reverse();

  return <div className="portfolio-carousel" aria-label="معرض أعمال BANA VILLA">
    <div className="stack-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { pointerStart.current = null; }}>
      {visibleCards.map(({ item, offset, styles }) => <div className={`stack-card stack-card-behind stack-depth-${offset}`} key={`${item.src}-${offset}`} style={{ '--stack-x': styles[0], '--stack-y': styles[1], '--stack-scale': styles[2], '--stack-opacity': styles[3] }} aria-hidden="true">
        <img src={item.src} alt="" draggable="false" />
      </div>)}
      {leaving && <div className={`stack-card stack-card-leaving ${leaving.direction > 0 ? 'leaving-next' : 'leaving-previous'}`} aria-hidden="true"><img src={leaving.item.src} alt="" draggable="false" /></div>}
      <button className="stack-card stack-card-front" key={activeItem.src} type="button" onClick={() => { if (!suppressClick.current) onOpen(activeIndex); }} aria-label={`فتح الصورة: ${activeItem.title}`}>
        <img src={activeItem.src} alt={activeItem.title} draggable="false" />
        <span className="stack-card-caption"><small>{activeItem.tag}</small><strong>{activeItem.title}</strong></span>
      </button>
    </div>
    <div className="stack-controls" dir="ltr">
      <button type="button" className="stack-arrow" onClick={() => move(-1)} aria-label="الصورة السابقة">←</button>
      <span className="stack-counter"><strong>{String(activeIndex + 1).padStart(2, '0')}</strong><i>/</i>{String(items.length).padStart(2, '0')}</span>
      <button type="button" className="stack-arrow" onClick={() => move(1)} aria-label="الصورة التالية">→</button>
    </div>
  </div>;
}
