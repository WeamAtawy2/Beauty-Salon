# BANA VILLA public website

Arabic, responsive React/Vite website with an Express REST API and PostgreSQL booking database. The supplied WhatsApp photos are used as portfolio and bridal work. The archive did not include villa/interior photos, a logo, official service list or prices, staff details, phone number, location or social links, so the site leaves those details clearly marked/configurable rather than making them up.

## Run locally

1. Install Node.js 20+ and PostgreSQL 14+.
2. Run `npm install`.
3. Create a PostgreSQL database, copy `.env.example` to `.env`, and set `DATABASE_URL`.
4. Apply `backend/database/schema.sql` to that database.
5. Add the salon's verified services, staff, staff-to-service assignments, staff shifts (`staff_hours`), and villa opening hours to the database. Keep prices `NULL` until the owner provides them. Do not add appointment slots manually; they are calculated from current business hours and staff availability.
6. Run `npm run dev`. The React site is at `http://localhost:5173`; Express API is at `http://localhost:4000`.

Without a configured database, the API returns `503` and booking is explicitly shown as being set up. It does not generate sample availability.

## API

- `GET /api/services` returns active services and configured prices.
- `GET /api/availability?serviceId=…&date=YYYY-MM-DD&type=salon|vip` returns starts only where an active specialist assigned to that service is on shift and free. VIP slots also check existing VIP floor reservations.
- `POST /api/bookings` validates the request, re-checks availability in a transaction, locks and assigns a qualified free specialist, checks VIP floor conflicts, and creates a confirmed appointment. A per-date advisory lock prevents concurrent requests from double booking.
- `GET /api/health` reports API/database setup state.

## Owner-managed content

- Update verified salon contact links and location in `frontend/src/data/content.js`.
- Add or change services/prices and opening hours in PostgreSQL; the booking page reads these through the API.
- Replace/update portfolio photos under `public/images` and their captions in `frontend/src/data/content.js`.
- Extend deposits/payments and authorized management endpoints as the salon system integration is defined. Keep this API connected to an online database, never to a salon computer's local SQLite file.

Booking and calendar data are not seeded with examples. Service duration, price and business hours must be filled from the salon's approved information before real customer bookings are enabled.
