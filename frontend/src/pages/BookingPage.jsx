import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { createBooking, getAvailability, getServices } from '../services/api.js';

const initialForm = { type: 'salon', serviceId: '', date: '', time: '', name: '', phone: '', email: '', notes: '' };
const bookingSteps = ['اختاري الخدمة', 'حددي التاريخ', 'اختاري الوقت', 'معلوماتكِ', 'تأكيد تجربتكِ'];
const today = new Date();
const todayText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

function BookingContent({ compact = false }) {
  const [form, setForm] = useState(initialForm);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [step, setStep] = useState(0);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    getServices()
      .then((data) => setServices(data.services || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoadingServices(false));
  }, []);

  useEffect(() => {
    if (!form.serviceId || !form.date) {
      setSlots([]);
      return;
    }

    let current = true;
    setLoadingSlots(true);
    setError('');
    getAvailability(form.serviceId, form.date, form.type)
      .then((data) => { if (current) setSlots(data.slots || []); })
      .catch((requestError) => {
        if (!current) return;
        setSlots([]);
        setError(requestError.message);
      })
      .finally(() => { if (current) setLoadingSlots(false); });

    return () => { current = false; };
  }, [form.serviceId, form.date, form.type]);

  const change = (key, value) => setForm((old) => ({
    ...old,
    [key]: value,
    ...(key === 'date' ? { time: '' } : {}),
    ...(key === 'type' ? { serviceId: '', date: '', time: '' } : {}),
  }));

  const emailIsValid = !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const detailsAreValid = () => form.name.trim().length >= 2 && form.phone.trim().length >= 7 && emailIsValid;
  const canContinue = step === 0 ? Boolean(form.serviceId)
    : step === 1 ? Boolean(form.date)
      : step === 2 ? !loadingSlots && slots.some((slot) => slot.time === form.time)
        : step === 3 ? detailsAreValid()
          : false;

  const submit = async (event) => {
    event.preventDefault();
    if (step !== 4) return;
    setError('');
    try {
      const result = await createBooking(form);
      setSuccess(result.booking);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const bookingTypeId = compact ? 'home-booking-type' : 'page-booking-type';
  const serviceId = compact ? 'home-service' : 'page-service';
  const dateId = compact ? 'home-date' : 'page-date';
  const nameId = compact ? 'home-name' : 'page-name';
  const phoneId = compact ? 'home-phone' : 'page-phone';
  const emailId = compact ? 'home-email' : 'page-email';
  const notesId = compact ? 'home-notes' : 'page-notes';

  const formPanel = <div className="booking-form-wrap">
    {success ? <div className="booking-success">
      <span className="success-mark">✓</span>
      <span className="eyebrow">BEAUTY SALON · CONFIRMED</span>
      <h2>تم تأكيد حجزكِ</h2>
      <p>يسعدنا اختياركِ BEAUTY SALON يا {success.customerName}.</p>
      <div className="confirmation-grid"><span>رقم الحجز</span><strong>{success.bookingNumber}</strong><span>الخدمة</span><strong>{success.serviceName}</strong><span>التاريخ</span><strong>{success.date}</strong><span>الوقت</span><strong>{success.time}</strong><span>نوع الحجز</span><strong>{success.type === 'vip' ? 'العروس VIP' : 'الصالون'}</strong></div>
      {compact
        ? <button type="button" className="text-link reset-booking" onClick={() => { setSuccess(null); setForm(initialForm); setStep(0); }}>حجز موعد آخر <Icon name="arrow" /></button>
        : <Link to="/" className="text-link">العودة للرئيسية <Icon name="arrow" /></Link>}
    </div> : <form className="booking-form" onSubmit={submit}>
      <ol className="booking-progress" aria-label="خطوات الحجز">
        {bookingSteps.map((label, index) => <li className={index === step ? 'is-current' : index < step ? 'is-complete' : ''} key={label}>
          {index < step
            ? <button type="button" onClick={() => { setError(''); setStep(index); }} aria-label={`العودة إلى الخطوة ${index + 1}: ${label}`}><span className="booking-progress-number">✓</span><span>{label}</span></button>
            : <span aria-current={index === step ? 'step' : undefined}><span className="booking-progress-number">{String(index + 1).padStart(2, '0')}</span><span>{label}</span></span>}
        </li>)}
      </ol>

      {step === 0 && <section className="booking-stage" aria-labelledby="booking-stage-title">
        <div className="form-heading"><span>STEP 01 — 05</span><h2 id="booking-stage-title">اختاري تجربتكِ</h2></div>
        <fieldset><legend>نوع الحجز</legend><div className="choice-row">
          <label className={form.type === 'salon' ? 'choice selected' : 'choice'}><input type="radio" name={bookingTypeId} value="salon" checked={form.type === 'salon'} onChange={() => change('type', 'salon')} /><span className="choice-dot" />خدمات الصالون</label>
          <label className={form.type === 'vip' ? 'choice selected' : 'choice'}><input type="radio" name={bookingTypeId} value="vip" checked={form.type === 'vip'} onChange={() => change('type', 'vip')} /><span className="choice-dot" />العروس VIP</label>
        </div></fieldset>
        <div className="field"><label htmlFor={serviceId}>الخدمة</label><select id={serviceId} required value={form.serviceId} onChange={(event) => change('serviceId', event.target.value)}>
          <option value="">{loadingServices ? 'جارٍ تحميل الخدمات…' : services.length ? 'اختاري الخدمة المناسبة' : 'الخدمات ستُتاح قريباً'}</option>
          {services.filter((service) => form.type !== 'vip' || service.category?.toLowerCase().includes('vip') || service.category?.includes('عروس')).map((service) => <option key={service.id} value={service.id}>{service.name}{service.price != null ? ` — ${service.price} ${service.currency || ''}` : ''}</option>)}
        </select>{!loadingServices && services.length === 0 && <small className="field-help">ستظهر الخدمات والأسعار الرسمية بعد ربط بيانات BEAUTY SALON.</small>}</div>
      </section>}

      {step === 1 && <section className="booking-stage" aria-labelledby="booking-stage-title">
        <div className="form-heading"><span>STEP 02 — 05</span><h2 id="booking-stage-title">اختاري اليوم الذي يناسبكِ</h2></div>
        <div className="field"><label htmlFor={dateId}>التاريخ</label><input id={dateId} type="date" min={todayText} required value={form.date} disabled={!form.serviceId} onChange={(event) => change('date', event.target.value)} /></div>
      </section>}

      {step === 2 && <section className="booking-stage" aria-labelledby="booking-stage-title">
        <div className="form-heading"><span>STEP 03 — 05</span><h2 id="booking-stage-title">موعدكِ المفضّل</h2></div>
        <div className="field"><span className="booking-field-label">الأوقات المتاحة</span>
          {loadingSlots ? <p className="slot-message" role="status">جارٍ التحقق من المواعيد…</p>
            : slots.length ? <div className="slot-grid">{slots.map((slot) => <button key={slot.time} type="button" className={form.time === slot.time ? 'slot selected' : 'slot'} aria-pressed={form.time === slot.time} onClick={() => change('time', slot.time)}>{slot.label || slot.time}</button>)}</div>
              : <p className="slot-message">لا توجد أوقات متاحة لهذا اليوم. عودي لاختيار تاريخٍ آخر.</p>}
        </div>
      </section>}

      {step === 3 && <section className="booking-stage" aria-labelledby="booking-stage-title">
        <div className="form-heading"><span>STEP 04 — 05</span><h2 id="booking-stage-title">كيف نتواصل معكِ؟</h2></div>
        <div className="field"><label htmlFor={nameId}>الاسم الكامل</label><input id={nameId} autoComplete="name" required minLength="2" value={form.name} onChange={(event) => change('name', event.target.value)} placeholder="اكتبي اسمكِ هنا" /></div>
        <div className="field-row">
          <div className="field"><label htmlFor={phoneId}>رقم الهاتف</label><input id={phoneId} type="tel" autoComplete="tel" required minLength="7" value={form.phone} onChange={(event) => change('phone', event.target.value)} placeholder="05x xxx xxxx" /></div>
          <div className="field"><label htmlFor={emailId}>البريد الإلكتروني <span>اختياري</span></label><input id={emailId} type="email" autoComplete="email" aria-invalid={!emailIsValid} value={form.email} onChange={(event) => change('email', event.target.value)} placeholder="name@example.com" />{!emailIsValid && <small className="field-help">أدخلي بريداً إلكترونياً صالحاً، أو اتركيه فارغاً.</small>}</div>
        </div>
        <div className="field"><label htmlFor={notesId}>ملاحظات <span>اختياري</span></label><textarea id={notesId} rows="3" value={form.notes} onChange={(event) => change('notes', event.target.value)} placeholder="هل هناك تفاصيل تحبين أن نعرفها؟" /></div>
      </section>}

      {step === 4 && <section className="booking-stage" aria-labelledby="booking-stage-title">
        <div className="form-heading"><span>STEP 05 — 05</span><h2 id="booking-stage-title">تأكّدي من تفاصيل تجربتكِ</h2></div>
        <dl className="booking-review">
          <div><dt>نوع التجربة</dt><dd>{form.type === 'vip' ? 'العروس VIP' : 'خدمات الصالون'}</dd></div>
          <div><dt>الخدمة</dt><dd>{services.find((service) => service.id === form.serviceId)?.name}</dd></div>
          <div><dt>التاريخ</dt><dd>{form.date}</dd></div>
          <div><dt>الوقت</dt><dd>{slots.find((slot) => slot.time === form.time)?.label || form.time}</dd></div>
          <div><dt>الاسم</dt><dd>{form.name}</dd></div>
          <div><dt>رقم الهاتف</dt><dd>{form.phone}</dd></div>
        </dl>
        <p className="booking-privacy">بإرسال هذا النموذج، ستُحفظ معلوماتكِ لإدارة حجزكِ فقط.</p>
      </section>}

      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="booking-stage-controls">
        {step > 0 && <button className="booking-back" type="button" onClick={() => { setError(''); setStep((current) => current - 1); }}><Icon name="arrow" /> الخطوة السابقة</button>}
        {step < bookingSteps.length - 1
          ? <button className="button button-dark submit-booking" type="button" disabled={!canContinue} onClick={() => { setError(''); setStep((current) => current + 1); }}>متابعة <Icon name="arrow" /></button>
          : <button className="button button-dark submit-booking" type="submit">تأكيد الحجز <Icon name="arrow" /></button>}
      </div>
    </form>}
  </div>;

  const aside = <aside className="booking-aside">
    <span className="eyebrow">BEAUTY SALON · BOOKING</span>
    <h2>تجربة جمال<br /><em>على موعدٍ معكِ.</em></h2>
    <p>اختاري الخدمة والوقت المتاح، وسنؤكد حجزكِ فوراً.</p>
    <div className="booking-aside-note"><Icon name="sparkle" size={18} /><span>المواعيد المعروضة متصلة مباشرةً بتوفّر الصالون والفريق.</span></div>
    <div className="booking-step"><span>01</span> اختاري الخدمة</div>
    <div className="booking-step"><span>02</span> حددي التاريخ</div>
    <div className="booking-step"><span>03</span> اختاري الوقت</div>
    <div className="booking-step"><span>04</span> معلوماتكِ</div>
    <div className="booking-step"><span>05</span> تأكيد تجربتكِ</div>
  </aside>;

  if (compact) return <section id="booking" className="booking-section"><div className="wrap"><SectionHeading eyebrow="وقتكِ الخاص يبدأ هنا" title="احجزي موعدكِ" description="اختاري تجربتكِ والوقت المتاح، وسنعتني ببقيّة التفاصيل." /><div className="booking-layout embedded">{aside}{formPanel}</div></div></section>;
  return <main className="booking-page"><div className="booking-top"><Link to="/#top" className="back-link"><Icon name="arrow" /> العودة للرئيسية</Link><span className="eyebrow">وقتكِ الخاص يبدأ هنا</span><h1>احجزي موعدكِ</h1><p>أخبرينا بما تحبين، وسنرتّب لكِ موعداً يناسبكِ.</p></div><div className="booking-layout wrap">{aside}{formPanel}</div></main>;
}

export function BookingSection() { return <BookingContent compact />; }
export default function BookingPage() { return <BookingContent />; }
