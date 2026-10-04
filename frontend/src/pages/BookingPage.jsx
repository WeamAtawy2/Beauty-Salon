import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { createBooking, getAvailability, getServices } from '../services/api.js';

const initialForm = { type: 'salon', serviceId: '', date: '', time: '', name: '', phone: '', email: '', notes: '' };
const today = new Date();
const todayText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

function BookingContent({ compact = false }) {
  const [form, setForm] = useState(initialForm);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  useEffect(() => { getServices().then((data) => setServices(data.services || [])).catch((e) => setError(e.message)).finally(() => setLoadingServices(false)); }, []);
  useEffect(() => {
    if (!form.serviceId || !form.date) { setSlots([]); return; }
    setLoadingSlots(true); setError('');
    getAvailability(form.serviceId, form.date, form.type).then((data) => setSlots(data.slots || [])).catch((e) => { setSlots([]); setError(e.message); }).finally(() => setLoadingSlots(false));
  }, [form.serviceId, form.date, form.type]);
  const change = (key, value) => setForm((old) => ({ ...old, [key]: value, ...(key === 'date' ? { time: '' } : {}) }));
  const submit = async (e) => { e.preventDefault(); setError(''); try { const result = await createBooking(form); setSuccess(result.booking); } catch (err) { setError(err.message); } };
  const formPanel = <div className="booking-form-wrap">{success ? <div className="booking-success"><span className="success-mark">✓</span><span className="eyebrow">BEAUTY SALON · CONFIRMED</span><h2>تم تأكيد حجزكِ</h2><p>يسعدنا اختياركِ BEAUTY SALON يا {success.customerName}.</p><div className="confirmation-grid"><span>رقم الحجز</span><strong>{success.bookingNumber}</strong><span>الخدمة</span><strong>{success.serviceName}</strong><span>التاريخ</span><strong>{success.date}</strong><span>الوقت</span><strong>{success.time}</strong><span>نوع الحجز</span><strong>{success.type === 'vip' ? 'العروس VIP' : 'الصالون'}</strong></div>{compact ? <button type="button" className="text-link reset-booking" onClick={() => { setSuccess(null); setForm(initialForm); }}>حجز موعد آخر <Icon name="arrow" /></button> : <Link to="/" className="text-link">العودة للرئيسية <Icon name="arrow" /></Link>}</div> : <form className="booking-form" onSubmit={submit}>
    <div className="form-heading"><span>01 — 03</span><h2>اختاري تجربتكِ</h2></div>
    <fieldset><legend>نوع الحجز</legend><div className="choice-row"><label className={form.type === 'salon' ? 'choice selected' : 'choice'}><input type="radio" name={compact ? 'booking-type-home' : 'booking-type-page'} value="salon" checked={form.type === 'salon'} onChange={() => change('type', 'salon')} /><span className="choice-dot" />خدمات الصالون</label><label className={form.type === 'vip' ? 'choice selected' : 'choice'}><input type="radio" name={compact ? 'booking-type-home' : 'booking-type-page'} value="vip" checked={form.type === 'vip'} onChange={() => change('type', 'vip')} /><span className="choice-dot" />العروس VIP</label></div></fieldset>
    <div className="field"><label htmlFor={compact ? 'home-service' : 'page-service'}>الخدمة</label><select id={compact ? 'home-service' : 'page-service'} required value={form.serviceId} onChange={(e) => change('serviceId', e.target.value)}><option value="">{loadingServices ? 'جارٍ تحميل الخدمات…' : services.length ? 'اختاري الخدمة المناسبة' : 'الخدمات ستُتاح قريباً'}</option>{services.filter((s) => form.type !== 'vip' || s.category?.toLowerCase().includes('vip') || s.category?.includes('عروس')).map((s) => <option key={s.id} value={s.id}>{s.name}{s.price != null ? ` — ${s.price} ${s.currency || ''}` : ''}</option>)}</select>{!loadingServices && services.length === 0 && <small className="field-help">ستظهر الخدمات والأسعار الرسمية بعد ربط بيانات BEAUTY SALON.</small>}</div>
    <div className="field"><label htmlFor={compact ? 'home-date' : 'page-date'}>التاريخ</label><input id={compact ? 'home-date' : 'page-date'} type="date" min={todayText} required value={form.date} disabled={!form.serviceId} onChange={(e) => change('date', e.target.value)} /></div>
    {form.date && <div className="field"><label>الأوقات المتاحة</label>{loadingSlots ? <p className="slot-message">جارٍ التحقق من المواعيد…</p> : slots.length ? <div className="slot-grid">{slots.map((slot) => <button key={slot.time} type="button" className={form.time === slot.time ? 'slot selected' : 'slot'} onClick={() => change('time', slot.time)}>{slot.label || slot.time}</button>)}</div> : <p className="slot-message">لا توجد أوقات متاحة لهذا اليوم. جرّبي تاريخاً آخر.</p>}</div>}
    <div className="form-heading personal-heading"><span>02 — 03</span><h2>معلومات التواصل</h2></div>
    <div className="field"><label htmlFor={compact ? 'home-name' : 'page-name'}>الاسم الكامل</label><input id={compact ? 'home-name' : 'page-name'} autoComplete="name" required minLength="2" value={form.name} onChange={(e) => change('name', e.target.value)} placeholder="اكتبي اسمكِ هنا" /></div>
    <div className="field-row"><div className="field"><label htmlFor={compact ? 'home-phone' : 'page-phone'}>رقم الهاتف</label><input id={compact ? 'home-phone' : 'page-phone'} type="tel" autoComplete="tel" required minLength="7" value={form.phone} onChange={(e) => change('phone', e.target.value)} placeholder="05x xxx xxxx" /></div><div className="field"><label htmlFor={compact ? 'home-email' : 'page-email'}>البريد الإلكتروني <span>اختياري</span></label><input id={compact ? 'home-email' : 'page-email'} type="email" autoComplete="email" value={form.email} onChange={(e) => change('email', e.target.value)} placeholder="name@example.com" /></div></div>
    <div className="field"><label htmlFor={compact ? 'home-notes' : 'page-notes'}>ملاحظات <span>اختياري</span></label><textarea id={compact ? 'home-notes' : 'page-notes'} rows="3" value={form.notes} onChange={(e) => change('notes', e.target.value)} placeholder="هل هناك تفاصيل تحبين أن نعرفها؟" /></div>
    {error && <div className="form-error" role="alert">{error}</div>}
    <button className="button button-dark submit-booking" type="submit" disabled={!form.serviceId || !form.date || !form.time || loadingSlots}>تأكيد الحجز <Icon name="arrow" /></button><p className="booking-privacy">بإرسال هذا النموذج، ستُحفظ معلوماتكِ لإدارة حجزكِ فقط.</p>
  </form>}</div>;
  const aside = <aside className="booking-aside"><span className="eyebrow">BEAUTY SALON · BOOKING</span><h2>تجربة جمال<br /><em>على موعدٍ معكِ.</em></h2><p>اختاري الخدمة والوقت المتاح، وسنؤكد حجزكِ فوراً.</p><div className="booking-aside-note"><Icon name="sparkle" size={18} /><span>المواعيد المعروضة متصلة مباشرةً بتوفّر الصالون والفريق.</span></div><div className="booking-step"><span>01</span> الخدمة والموعد</div><div className="booking-step"><span>02</span> معلوماتكِ</div><div className="booking-step"><span>03</span> تأكيد الحجز</div></aside>;

  if (compact) return <section id="booking" className="booking-section"><div className="wrap"><SectionHeading eyebrow="وقتكِ الخاص يبدأ هنا" title="احجزي موعدكِ" description="اختاري تجربتكِ والوقت المتاح، وسنعتني ببقيّة التفاصيل." /><div className="booking-layout embedded">{aside}{formPanel}</div></div></section>;
  return <main className="booking-page"><div className="booking-top"><Link to="/#top" className="back-link"><Icon name="arrow" /> العودة للرئيسية</Link><span className="eyebrow">وقتكِ الخاص يبدأ هنا</span><h1>احجزي موعدكِ</h1><p>أخبرينا بما تحبين، وسنرتّب لكِ موعداً يناسبكِ.</p></div><div className="booking-layout wrap">{aside}{formPanel}</div></main>;
}

export function BookingSection() { return <BookingContent compact />; }
export default function BookingPage() { return <BookingContent />; }
