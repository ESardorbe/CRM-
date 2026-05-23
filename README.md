# CRM NestJS

O'quv markazlari uchun CRM panel. Project monorepo ko'rinishida tuzilgan: backend NestJS bilan REST API beradi, frontend esa React + Vite orqali admin, teacher va student panellarini ko'rsatadi.

## Mundarija

- [Imkoniyatlar](#imkoniyatlar)
- [Texnologiyalar](#texnologiyalar)
- [Project tuzilmasi](#project-tuzilmasi)
- [Rollar](#rollar)
- [Talablar](#talablar)
- [O'rnatish](#ornatish)
- [Environment sozlamalari](#environment-sozlamalari)
- [Ishga tushirish](#ishga-tushirish)
- [API endpointlar](#api-endpointlar)
- [Foydali scriptlar](#foydali-scriptlar)
- [Muhim eslatmalar](#muhim-eslatmalar)

## Imkoniyatlar

- JWT asosidagi login/register, email verification va password reset.
- Google OAuth orqali autentifikatsiya.
- Role-based access control: superadmin, admin, moderator, teacher, student va oddiy user.
- Superadmin avtomatik seed qilinadi.
- Student, teacher, direction va course boshqaruvi.
- Course'larga teacher va student biriktirish.
- Davomatni bulk saqlash va filterlash.
- To'lovlar, student harakati va dashboard statistikasi.
- Admin, teacher va student uchun alohida frontend panellar.
- O'zbek va rus tillari uchun frontend tarjima konteksti.
- Swagger API dokumentatsiyasi.
- PostgreSQL uchun Docker Compose konfiguratsiyasi.

## Texnologiyalar

### Backend

- NestJS 11
- TypeScript
- PostgreSQL
- TypeORM
- Passport JWT va Google OAuth
- bcrypt
- Nodemailer
- Swagger
- class-validator / class-transformer

### Frontend

- React 18
- Vite 6
- TypeScript
- React Router
- TanStack Query
- Axios
- Tailwind CSS
- Recharts
- Lucide React

## Project Tuzilmasi

```text
crm-nestjs/
+-- backend/                 # NestJS REST API
|   +-- src/
|   |   +-- auth/            # Auth, JWT, Google OAuth, mail, roles, seed
|   |   +-- attendance/      # Davomat
|   |   +-- course/          # Guruh/kurslar
|   |   +-- direction/       # Yo'nalishlar
|   |   +-- statistics/      # Dashboard, payment, student movement
|   |   +-- student/         # Student profillari
|   |   +-- teacher/         # Teacher profillari
|   |   +-- app.module.ts
|   |   +-- main.ts
|   +-- package.json
+-- frontend/                # React/Vite admin, teacher, student panellari
|   +-- src/
|   |   +-- api/             # Axios API clientlar
|   |   +-- components/      # Layout va UI komponentlar
|   |   +-- context/         # Auth va language context
|   |   +-- i18n/            # Tarjimalar
|   |   +-- pages/           # Sahifalar
|   |   +-- App.tsx          # Route konfiguratsiyasi
|   +-- package.json
+-- docker-compose.yml       # PostgreSQL
+-- package.json             # Monorepo scriptlari
+-- README.md
```

## Rollar

| Role | Tavsif |
| --- | --- |
| `superadmin` | To'liq boshqaruv, user role'larini o'zgartirish va user yaratish huquqi. |
| `admin` | CRM ma'lumotlarini boshqarish: student, teacher, course, payment, direction. |
| `moderator` | Statistik va ayrim operatsion ma'lumotlarni ko'rish/boshqarish. |
| `teacher` | O'z guruhlari, studentlari va davomat bilan ishlash. |
| `student` | O'z guruhlari, davomat va profilini ko'rish. |
| `user` | Ro'yxatdan o'tgan, hali rol biriktirilmagan foydalanuvchi. |

## Talablar

- Node.js 20 yoki undan yuqori versiya tavsiya qilinadi.
- npm
- Docker va Docker Compose
- PostgreSQL, agar Docker ishlatilmasa

## O'rnatish

Repository root papkasida:

```bash
npm install
npm run install:all
```

`npm install` root scriptlar uchun kerak. `npm run install:all` esa backend va frontend dependency'larini o'rnatadi.

## Environment Sozlamalari

Backend uchun `backend/.env` fayl yarating:

```env
PORT=4001

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=crm_db

JWT_SECRET_KEY=change_me_to_a_long_secret
FRONTEND_URL=http://localhost:5173

SUPERADMIN_EMAIL=superadmin@crm.uz
SUPERADMIN_PASSWORD=SuperAdmin123!

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4001/auth/google/callback

MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

`PORT=4001` muhim: frontend Vite proxy `/api` requestlarini `http://localhost:4001` ga yuboradi.

## Ishga Tushirish

### 1. PostgreSQL'ni ishga tushirish

```bash
docker compose up -d
```

Docker Compose quyidagi default bazani yaratadi:

| Parametr | Qiymat |
| --- | --- |
| Host | `localhost` |
| Port | `5432` |
| Database | `crm_db` |
| Username | `postgres` |
| Password | `postgres` |

### 2. Backend va frontend'ni birga ishga tushirish

```bash
npm run dev
```

### 3. Alohida ishga tushirish

Backend:

```bash
cd backend
npm run start:dev
```

Frontend:

```bash
cd frontend
npm run dev
```

### URL'lar

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4001`
- Swagger: `http://localhost:4001/api`

## API Endpointlar

Backend'da Swagger yoqilgan. To'liq va interaktiv hujjat:

```text
http://localhost:4001/api
```

Asosiy endpoint guruhlari:

| Modul | Endpointlar |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/verify-email`, `POST /auth/reset-password`, `POST /auth/update-password`, `GET /auth/profile`, `PUT /auth/profile`, `GET /auth/google` |
| Users | `GET /auth/all-users`, `GET /auth/users/role/:role`, `PUT /auth/users/:id/role`, `DELETE /auth/users/:id`, `POST /auth/register-with-role` |
| Students | `POST /students`, `GET /students`, `GET /students/:id`, `GET /students/user/:userId`, `PATCH /students/me`, `PUT /students/:id`, `PATCH /students/:id`, `DELETE /students/:id` |
| Teachers | `POST /teachers`, `GET /teachers`, `GET /teachers/:id`, `GET /teachers/user/:userId`, `PATCH /teachers/me`, `PUT /teachers/:id`, `DELETE /teachers/:id` |
| Courses | `POST /courses`, `GET /courses`, `GET /courses/:id`, `PUT /courses/:id`, `DELETE /courses/:id`, `GET /courses/teacher/:teacherId`, `GET /courses/student/:studentId` |
| Course members | `POST /courses/:id/students`, `DELETE /courses/:id/students/:studentId`, `POST /students/:id/courses/:courseId`, `DELETE /students/:id/courses/:courseId`, `POST /teachers/:id/courses/:courseId`, `DELETE /teachers/:id/courses/:courseId` |
| Directions | `GET /directions`, `GET /directions/:id`, `POST /directions`, `PUT /directions/:id`, `DELETE /directions/:id` |
| Attendance | `POST /attendance/bulk`, `GET /attendance` |
| Statistics | `GET /statistics/dashboard`, `GET /statistics/monthly-report`, `POST /statistics/payments`, `GET /statistics/payments`, `GET /statistics/payments/:id`, `PUT /statistics/payments/:id`, `DELETE /statistics/payments/:id`, `POST /statistics/student-movements`, `GET /statistics/student-movements` |

Protected endpointlarda `Authorization` header kerak:

```http
Authorization: Bearer <accessToken>
```

## Frontend Route'lar

| Panel | Route'lar |
| --- | --- |
| Public | `/login`, `/register`, `/auth/callback` |
| Admin | `/dashboard`, `/students`, `/directions`, `/groups`, `/payments`, `/attendance`, `/requests`, `/profile`, `/users`, `/teachers` |
| User | `/welcome` |
| Student | `/student/dashboard`, `/student/groups`, `/student/attendance`, `/student/profile` |
| Teacher | `/teacher/dashboard`, `/teacher/groups`, `/teacher/attendance`, `/teacher/profile` |

## Foydali Scriptlar

Root:

```bash
npm run dev          # backend va frontend birga
npm run dev:backend  # faqat backend
npm run dev:frontend # faqat frontend
npm run install:all  # backend va frontend dependency'lari
npm run build        # backend va frontend build
```

Backend:

```bash
npm run start:dev
npm run build
npm run start:prod
npm run lint
npm run test
npm run test:cov
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
```

## Database

TypeORM `synchronize: true` bilan sozlangan. Development paytida entity'lar bo'yicha table'lar avtomatik yaratiladi. Production muhitda migration ishlatish va `synchronize` qiymatini o'chirish tavsiya qilinadi.

Asosiy entity'lar:

- `User`
- `Student`
- `Teacher`
- `Course`
- `Direction`
- `AttendanceRecord`
- `Payment`
- `StudentMovement`

## Superadmin

Backend ishga tushganda `SeedService` superadmin user'ni avtomatik yaratadi, agar u hali mavjud bo'lmasa.

Default login:

```text
Email: superadmin@crm.uz
Password: SuperAdmin123!
```

Bu qiymatlarni `backend/.env` orqali almashtirish mumkin:

```env
SUPERADMIN_EMAIL=your-email@example.com
SUPERADMIN_PASSWORD=your-strong-password
```

## Muhim Eslatmalar

- `backend/.env` git'ga qo'shilmaydi, chunki `.gitignore` ichida environment fayllar ignore qilingan.
- Frontend API client `baseURL: '/api'` ishlatadi; Vite proxy uni backendga yo'naltiradi.
- Backend CORS `http://localhost:5173` va `http://localhost:3001` uchun ochilgan.
- JWT token frontendda `localStorage` ichida `accessToken` nomi bilan saqlanadi.
- Email verification va password reset ishlashi uchun `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` sozlanishi kerak.
- Google login ishlashi uchun Google OAuth credential'lari to'ldirilishi kerak.

## Troubleshooting

### Frontend login/API request ishlamayapti

Backend porti `4001` ekanini tekshiring. Frontend proxy aynan shu portga sozlangan.

### Database ulanmadi

Docker container ishlayotganini tekshiring:

```bash
docker compose ps
```

Yoki `backend/.env` ichidagi `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` qiymatlarini tekshiring.

### Swagger ochilmayapti

Backend ishga tushganini va `PORT` qiymatini tekshiring:

```text
http://localhost:4001/api
```

## Build

Production build:

```bash
npm run build
```

Backend output: `backend/dist`

Frontend output: `frontend/dist`
