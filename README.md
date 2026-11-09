# Mini Shop API — Debugging amaliyoti

Bu kichik internet-do'kon uchun yozilgan **backend REST API**. Loyiha NestJS, TypeScript, PostgreSQL va TypeORM'da yozilgan.

Loyihani "tajribasiz jamoa" yozgan va u **ishlamayapti**: ilova ishga tushmaydi, ishga tushgandan keyin esa ko'p endpointlar quyida tavsiflangan biznes qoidalardan boshqacha ishlaydi. Sizning vazifangiz shu xatolarni (bug) topish, sababini tushunish va tuzatish.

> Loyihada **30 dan ortiq** bug bor. Ular har xil turdagi: ilova ishga tushmasligi, mantiqiy xatolar, async/await, TypeORM, validatsiya, autentifikatsiya va avtorizatsiya, xavfsizlik, HTTP status kodlar, tranzaksiyalar.

---

## 1. Texnologiyalar

| Texnologiya | Versiya |
|---|---|
| Node.js | 20+ (22 tavsiya qilinadi) |
| NestJS | 11 |
| TypeORM | 0.3 |
| PostgreSQL | 16 (Docker orqali) |
| Auth | JWT (passport-jwt), bcrypt |
| Validatsiya | class-validator, class-transformer |

## 2. Loyiha tuzilmasi

```
src/
├── main.ts                  # ilovaning kirish nuqtasi
├── app.module.ts            # root modul, DB va config
├── common/                  # enumlar, filterlar, interfeyslar
├── auth/                    # register, login, JWT strategiya, guardlar
├── users/                   # foydalanuvchilar
├── categories/              # kategoriyalar
├── products/                # mahsulotlar
├── orders/                  # buyurtmalar
└── database/                # seed skript (test ma'lumotlar)
```

## 3. Ishga tushirish

```bash
# 1. PostgreSQL'ni Docker'da ishga tushirish
docker compose up -d

# 2. Muhit o'zgaruvchilari
cp .env.example .env

# 3. Paketlarni o'rnatish
npm install

# 4. Ilovani ishga tushirish (jadvallar avtomatik yaratiladi)
npm run start:dev

# 5. Ilova ishlay boshlagach, boshqa terminalda test ma'lumotlarni yuklash
npm run seed
```

Ilova `http://localhost:3000/api` manzilida ishlashi kerak.

Seed skript quyidagilarni yaratadi:

- Admin: `admin@shop.uz` / `Admin123!`
- 3 ta kategoriya: Smartfonlar, Noutbuklar, Aksessuarlar
- 12 ta mahsulot

> Agar DB'ni noldan boshlamoqchi bo'lsangiz: `docker compose down -v && docker compose up -d`

---

## 4. Biznes qoidalar (ilova QANDAY ishlashi kerak)

Bu bo'lim — **texnik topshiriq**. Ilovaning haqiqiy xatti-harakatini shu qoidalar bilan solishtiring. Har qanday farq — bug.

### 4.1. Umumiy qoidalar

- Barcha endpointlar `/api` prefiksi bilan boshlanadi.
- Himoyalangan endpointlar `Authorization: Bearer <accessToken>` headerini talab qiladi. Token bo'lmasa yoki yaroqsiz bo'lsa — `401`.
- Kerakli rol bo'lmasa — `403`.
- Topilmagan resurs — `404`. Noto'g'ri kiritilgan ma'lumot — `400`. Server ichki xatosi (`500`) **foydalanuvchi xatosi tufayli hech qachon chiqmasligi kerak**.
- DTO'da yo'q ortiqcha maydonlar yuborilsa, so'rov `400` bilan rad etiladi.
- Xato javobi formati:

```json
{
  "statusCode": 400,
  "message": ["price must be a positive number"],
  "path": "/api/products",
  "timestamp": "2026-11-07T10:00:00.000Z"
}
```

Validatsiya xatolarida `message` — **qaysi maydon nima uchun noto'g'ri ekanini ko'rsatuvchi ro'yxat** bo'lishi kerak.

- Foydalanuvchi parol hashi **hech qaysi javobda** qaytmasligi kerak.
- Narxlar (`price`, `unitPrice`, `totalPrice`) JSON'da **son** (number) sifatida qaytadi, string emas, va 2 xonali kasrgacha aniqlikda bo'ladi.

### 4.2. Auth

| Metod | URL | Kim | Tavsif |
|---|---|---|---|
| POST | `/api/auth/register` | Hamma | Ro'yxatdan o'tish |
| POST | `/api/auth/login` | Hamma | Kirish |

**Register** — body: `{ "email", "password" (6–64 belgi), "fullName" }`

- Muvaffaqiyatli: `201`, javob: `{ accessToken, user }`.
- Yangi foydalanuvchining roli **har doim** `user`. Mijoz o'zi rol tanlay olmaydi.
- Email band bo'lsa: `409 Conflict`.

**Login** — body: `{ "email", "password" }`

- Muvaffaqiyatli: `200 OK`, javob: `{ accessToken, user }`.
- Email topilmasa yoki parol noto'g'ri bo'lsa: `401` va bir xil xabar (`Invalid email or password`).
- Token **1 soat** amal qiladi.

### 4.3. Users

| Metod | URL | Kim | Tavsif |
|---|---|---|---|
| GET | `/api/users/me` | Login qilgan | **O'zining** profili |
| GET | `/api/users` | Faqat admin | Barcha foydalanuvchilar |

### 4.4. Categories

| Metod | URL | Kim | Tavsif |
|---|---|---|---|
| GET | `/api/categories` | Hamma | Ro'yxat (nom bo'yicha tartiblangan) |
| GET | `/api/categories/:id` | Hamma | Kategoriya va uning mahsulotlari |
| POST | `/api/categories` | Faqat admin | Yangi kategoriya |

- `slug` nomdan avtomatik yasaladi: kichik harflar, **barcha** bo'shliqlar `-` ga almashtiriladi.
  Masalan: `"Maishiy texnika uchun"` → `"maishiy-texnika-uchun"`.

### 4.5. Products

| Metod | URL | Kim | Tavsif |
|---|---|---|---|
| GET | `/api/products` | Hamma | Ro'yxat, sahifalash va qidiruv bilan |
| GET | `/api/products/:id` | Hamma | Bitta mahsulot (kategoriyasi bilan) |
| POST | `/api/products` | Faqat admin | Yaratish |
| PATCH | `/api/products/:id` | Faqat admin | Qisman yangilash |
| DELETE | `/api/products/:id` | Faqat admin | O'chirish (`204`) |

**GET /api/products** — query parametrlar (hammasi ixtiyoriy):

| Parametr | Default | Tavsif |
|---|---|---|
| `page` | `1` | Sahifa raqami (1 dan boshlanadi) |
| `limit` | `10` | Sahifadagi elementlar soni (1–100) |
| `search` | — | Nom bo'yicha qidiruv (katta-kichik harf farqsiz) |
| `categoryId` | — | Kategoriya bo'yicha filtr |

Javob:

```json
{
  "data": [ { "id": 1, "name": "Galaxy S24", "price": 899.99, "stock": 15, "category": { "...": "..." } } ],
  "meta": { "page": 1, "limit": 10, "total": 12, "totalPages": 2 }
}
```

- `page=1` birinchi elementlardan boshlanadi.
- `totalPages` — barcha elementlarni ko'rsatish uchun kerak bo'lgan sahifalar soni (12 ta element, limit 5 → 3 sahifa).
- `search` har qanday matn bilan xavfsiz ishlashi kerak (masalan `g'ilof`).

**GET /api/products/:id** — mahsulot `category` obyekti bilan qaytadi. Topilmasa `404`.

**POST /api/products** — body:

```json
{ "name": "Galaxy S24", "description": "...", "price": 899.99, "stock": 15, "categoryId": 1 }
```

- `price` — musbat son, ko'pi bilan 2 xonali kasr (masalan `19.99`).
- `stock` — butun son, `>= 0`.

**PATCH /api/products/:id** — istalgan maydonlarning bir qismini yuborish mumkin (masalan faqat `{ "stock": 20 }`).

### 4.6. Orders

| Metod | URL | Kim | Tavsif |
|---|---|---|---|
| POST | `/api/orders` | Login qilgan | Buyurtma berish |
| GET | `/api/orders/my` | Login qilgan | O'zining buyurtmalari |
| GET | `/api/orders/:id` | Login qilgan | O'zining bitta buyurtmasi |
| PATCH | `/api/orders/:id/cancel` | Login qilgan | O'z buyurtmasini bekor qilish |
| GET | `/api/orders` | Faqat admin | Barcha buyurtmalar |
| PATCH | `/api/orders/:id/status` | Faqat admin | Statusni o'zgartirish |

**POST /api/orders** — body:

```json
{ "items": [ { "productId": 9, "quantity": 2 }, { "productId": 10, "quantity": 1 } ] }
```

Qoidalar:

1. `items` bo'sh bo'lmasligi kerak. Har bir `quantity` — butun son, `>= 1`.
2. Mahsulot topilmasa — `404`. Omborda yetarli bo'lmasa — `400`.
3. Buyurtma **"hammasi yoki hech narsa"** tamoyilida yaratiladi: agar bitta item xato bo'lsa, hech qaysi mahsulotning `stock`i o'zgarmaydi va buyurtma yaratilmaydi.
4. Muvaffaqiyatli buyurtmada har bir mahsulot `stock`i `quantity` ga kamayadi.
5. `totalPrice = Σ (price × quantity)`, 2 xonagacha yaxlitlangan (masalan `99.88`).
6. Javobda buyurtma `items` bilan qaytadi va keyinchalik `GET /api/orders/:id` ham shu itemlarni ko'rsatadi.
7. Yangi buyurtma statusi — `pending`.

**GET /api/orders/:id** — foydalanuvchi faqat **o'z** buyurtmasini ko'ra oladi. Boshqa birovning buyurtmasi uchun — `404`.

**PATCH /api/orders/:id/cancel**

- Faqat buyurtma egasi bekor qila oladi (boshqalar uchun `404`).
- Faqat `pending` yoki `paid` statusdagi buyurtma bekor qilinadi. `shipped` yoki `cancelled` uchun — `400`.
- Bekor qilinganda barcha itemlarning `stock`i omborga **to'liq** qaytariladi va status `cancelled` bo'ladi.

**PATCH /api/orders/:id/status** (admin) — body: `{ "status": "pending" | "paid" | "shipped" | "cancelled" }`.

---

## 5. Topshiriq

1. Ilovani ishga tushiring. Birinchi xatolar aynan shu bosqichda chiqadi.
2. Har bir endpointni yuqoridagi qoidalar asosida tekshiring (Postman, Insomnia, `curl` yoki VS Code REST Client).
3. Topilgan har bir bugni tuzating. **Butun modulni qayta yozmang** — minimal va to'g'ri tuzatish qiling.
4. Har bir bug uchun alohida git commit qiling: `fix: login returns 401 for valid password`.
5. `BUGS_REPORT.md` faylini yozing. Har bir bug uchun:

```markdown
### Bug #N — qisqa nom
- **Fayl:** src/.../file.ts
- **Simptom:** nima kuzatildi (so'rov, javob, status kod, log)
- **Sabab:** nima uchun shunday bo'lyapti
- **Tuzatish:** nima o'zgartirildi
- **Qanday tekshirdim:** so'rov va kutilgan javob
```

### Baholash mezonlari

| Mezon | Ulush |
|---|---|
| Topilgan va to'g'ri tuzatilgan buglar soni | 50% |
| Sababni to'g'ri tushuntirish (`BUGS_REPORT.md`) | 25% |
| Tuzatish sifati (minimal, toza, yangi bug qo'shmagan) | 15% |
| Git tarixi (har bir bug — alohida commit) | 10% |

**Bonus:** topilgan buglar uchun e2e yoki unit test yozish; ilovaning qolgan zaif joylarini (production uchun xavfli sozlamalar) topib, ularni tushuntirish.

---

## 6. Debugging bo'yicha maslahatlar

- **Logni o'qing.** Nest xato xabari ko'pincha javobni o'zi aytadi: qaysi modul, qaysi provider, qaysi indeks.
- **Status kodga qarang.** `500` — bu kodda ushlanmagan xato. Terminaldagi stack trace'ni toping.
- **Debugger.** `npm run start:debug` ni ishga tushiring, VS Code'da `Run and Debug` → `Attach to NestJS`. Breakpoint qo'yib, o'zgaruvchilar qiymatini kuzating.
- **SQL'ni ko'ring.** `app.module.ts` dagi TypeORM sozlamalariga vaqtincha `logging: true` qo'shsangiz, har bir SQL so'rov terminalda chiqadi.
- **DB'ni tekshiring.** `docker exec -it mini-shop-postgres psql -U postgres -d mini_shop` → `\dt`, `SELECT * FROM products;`
- **JWT'ni o'qing.** Tokenni [jwt.io](https://jwt.io) da ochib, `iat` va `exp` maydonlariga qarang.
- **Bitta bug — boshqasini yashirishi mumkin.** Bir bugni tuzatgandan keyin, oldin ishlagandek ko'ringan joy buzilib qolsa, bu yangi bug emas — u avval ham bor edi.
- **Ma'lumot tiplari.** `typeof` bilan qiymat turini tekshiring: DB'dan kelgan qiymat siz kutgan turda bo'lmasligi mumkin.
