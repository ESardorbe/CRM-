# CRM — O'quv Markaz Loyihasi

NestJS (backend) + React/Vite (frontend) asosidagi o'quv markaz CRM tizimi.
O'qituvchilar dars materiallari yuklaydi, talabalar online darslarga qatnashadi.

## Loyiha Tuzilmasi

```
crm-nestjs/
├── backend/          # NestJS API (port 4001)
│   └── src/
│       ├── auth/         # JWT auth, Google OAuth, role management
│       ├── course/        # Guruhlar (kurslar)
│       ├── student/       # Talabalar
│       ├── teacher/       # O'qituvchilar
│       ├── attendance/    # Davomat
│       ├── statistics/    # To'lovlar, statistika
│       └── direction/     # Yo'nalishlar
└── frontend/         # React + Vite (port 5173)
    └── src/
        ├── pages/         # Admin, Student, Teacher panellari
        ├── api/           # Axios so'rovlar
        └── context/       # Auth, Lang context
```

## Stack

- **Backend:** NestJS, TypeORM, PostgreSQL, JWT, Nodemailer, Swagger
- **Frontend:** React, TypeScript, Vite, Axios, TailwindCSS, React Router
- **Infra:** Docker Compose (PostgreSQL)

## Buyruqlar

```bash
# Backend
cd backend && npm run start:dev    # port 4001
# Frontend
cd frontend && npm run dev         # port 5173
# Database
docker compose up -d               # PostgreSQL port 5432
# Swagger
open http://localhost:4001/api
```

## Muhim Sozlamalar

- `backend/.env` — barcha environment o'zgaruvchilar shu yerda
- Frontend proxy: `/api` → `http://localhost:4001` (vite.config.ts orqali)
- `synchronize: true` faqat dev rejimida ishlaydi

---

## ⚠️ Mavjud Muammolar va Tuzatish Kerak Bo'lgan Joylar

### KRITIK — Xavfsizlik

**[SEC-1] .env faylidagi zaif secretlar**
- Fayl: `backend/.env`
- `JWT_SECRET_KEY='texnosardor'` — juda zaif, taxmin qilish oson
- `SUPERADMIN_PASSWORD=y` — bir harflik parol
- `.env` `.gitignore`da yo'q, real credentials oshkor
- Tuzatish: JWT secret kamida 32 belgili random string bo'lishi kerak

**[SEC-2] Token localStorage'da — XSS zaiflik**
- Fayl: `frontend/src/context/AuthContext.tsx` (29-30-qatorlar)
- `localStorage.setItem('accessToken', ...)` — XSS hujumida o'g'irlanadi
- Tuzatish: `httpOnly` cookie ishlatish kerak

**[SEC-3] Rate limiting yo'q**
- Fayl: `backend/src/auth/auth.controller.ts` — `/auth/login` endpoint
- Brute-force hujumiga ochiq, sekundiga cheksiz urinish mumkin
- Tuzatish: `@nestjs/throttler` o'rnatish va `ThrottlerGuard` qo'shish

**[SEC-4] `synchronize: true` production uchun xavfli**
- Fayl: `backend/src/app.module.ts` (28-qator)
- Restart'da ma'lumotlar yo'qolishi mumkin
- Tuzatish: `synchronize: process.env.NODE_ENV !== 'production'`

### MUHIM — Funksional Xatolar

**[BUG-1] Refresh token mexanizmi yo'q**
- Fayl: `frontend/src/api/axios.ts` (12-15-qatorlar)
- 401 xatoda token refresh qilmaydi, to'g'ridan-to'g'ri login sahifasiga yo'naltiradi
- Foydalanuvchi har 1 soatda tizimdan chiqarib yuboriladi

**[BUG-2] Attendance bulk save atomik emas**
- Fayl: `backend/src/attendance/attendance.service.ts` — `saveBulk()` metodi
- `for` loop ichida delete+save — o'rtada xato bo'lsa ma'lumotlar buziladi
- Tuzatish: `this.repo.manager.transaction(...)` ichiga o'rash

**[BUG-3] Guruh kodi race condition**
- Fayl: `backend/src/course/course.service.ts` — `generateNextCode()` metodi
- Bir vaqtda 2 ta so'rov kelsa ikkalasi ham bir xil kodni oladi (G-001, G-001)
- Tuzatish: PostgreSQL sequence yoki database-level lock ishlatish

**[BUG-4] Frontend route guard mantiq xatosi**
- Fayl: `frontend/src/App.tsx` — `UserRoute` komponenti
- Student yoki teacher `/welcome`ga kirsa `/dashboard`ga, u yer yana o'z paneliga yuboradi (ikki marta redirect)
- Tuzatish: `UserRoute`da `student` va `teacher` rollarini ham handle qilish

**[BUG-5] Kurs sanasi noto'g'ri tur**
- Fayl: `backend/src/course/entities/course.entity.ts` (37-40-qatorlar)
- `startDate: string` va `endDate: string` — Date bo'lishi kerak
- Sana bo'yicha filter va sort ishlamaydi

### KOD SIFATI

**[CODE-1] `as any` ning haddan ziyod ishlatilishi**
- Fayllar: `course.service.ts`, `attendance.service.ts`, `statistics.service.ts`
- TypeScript type xavfsizligini yo'q qiladi
- Misol: `newCourse.teacher = { id: teacherId } as any`

**[CODE-2] `verifyCode` ikki maqsad uchun bir maydon**
- Fayl: `backend/src/auth/entities/user.entity.ts`
- Email tasdiqlash va parolni tiklash uchun bir xil `verifyCode` maydoni ishlatiladi
- Bir jarayon boshqasini bekor qiladi

**[CODE-3] Route guard kodi takrorlanishi**
- Fayl: `frontend/src/App.tsx`
- `ProtectedRoute`, `UserRoute`, `StudentRoute`, `TeacherRoute` — hammasi bir xil loading spinner kodi
- Bitta universal `RoleGuard` komponenti bilan almashtirish kerak

**[CODE-4] Global exception filter yo'q**
- Backend xatolar standartlashtirilmagan, ba'zida stack trace ketishi mumkin
- `backend/src/filters/http-exception.filter.ts` yaratish kerak

**[CODE-5] MailService ConfigService ishlatmaydi**
- Fayl: `backend/src/auth/mail.service.ts`
- `process.env.MAIL_USER` to'g'ridan-to'g'ri o'qiydi, `ConfigService` inject qilish kerak

---

## 🚀 Qo'shilishi Kerak Bo'lgan Modullar (O'quv Markaz Uchun)

### 1. Dars Materiallari (USTUVOR)
O'qituvchilar PDF, video, rasm yuklay olishi kerak.

```
backend/src/materials/
├── material.entity.ts     # id, title, fileUrl, fileType, course, uploadedBy, createdAt
├── material.service.ts    # upload, findByCourse, delete
├── material.controller.ts # POST /materials/upload, GET /materials?courseId=
└── material.module.ts
```

Kerakli paketlar:
```bash
cd backend && npm install @nestjs/platform-express multer @types/multer
npm install @aws-sdk/client-s3  # yoki MinIO uchun minio
```

### 2. Dars Jadvali (Lesson Schedule)
Hozir `schedule: string[]` — bu yetarli emas.

```
backend/src/lesson/
├── lesson.entity.ts    # id, course, title, dayOfWeek, startTime, endTime, isOnline, meetingLink
├── lesson.service.ts
└── lesson.controller.ts
```

### 3. Uy Vazifasi / Topshiriqlar

```
backend/src/assignment/
├── assignment.entity.ts  # id, title, dueDate, course, attachments[]
├── submission.entity.ts  # id, student, assignment, grade, files[], submittedAt
├── assignment.service.ts
└── assignment.controller.ts
```

### 4. Baho Tizimi

```
backend/src/grade/
├── grade.entity.ts  # id, student, course, score, maxScore, gradeType, gradedBy
└── ...
```

### 5. Bildirishnomalar (WebSocket)

```bash
cd backend && npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

```
backend/src/notifications/
├── notifications.gateway.ts   # WebSocket gateway
├── notifications.service.ts
└── notifications.module.ts
```

### 6. Online Dars Integratsiyasi
Tavsiya: Jitsi Meet (bepul, open source, o'z serveringizda)

```
backend/src/meeting/
├── meeting.service.ts   # Jitsi room yaratish, JWT token generatsiya
└── meeting.controller.ts # POST /meetings/create, GET /meetings/:courseId
```

---

## Ma'lumotlar Bazasi Entity Munosabatlari

```
User (1) ──── (1) Teacher
User (1) ──── (1) Student
Teacher (1) ── (N) Course
Course (M) ─── (N) Student      [course_students jadval]
Course (1) ──── (N) AttendanceRecord
Student (1) ─── (N) AttendanceRecord
Direction (1) ── (N) Course
Direction (1) ── (N) Teacher
Course (1) ──── (N) Payment
Student (1) ─── (N) Payment
Course (1) ──── (N) StudentMovement
Student (1) ─── (N) StudentMovement
```

## Rollar Tizimi

| Rol | Huquqlar |
|-----|----------|
| `superadmin` | Hammasi + foydalanuvchi o'chirish |
| `admin` | Barcha CRUD, foydalanuvchi rolini o'zgartirish |
| `teacher` | O'z kurslari, davomat, materiallar |
| `student` | O'z kurslari, davomat ko'rish |
| `user` | Faqat Welcome sahifa (rol tayinlanmagan) |
| `moderator` | (hozir cheklangan huquqlar) |

## API Endpointlar

```
POST   /auth/register
POST   /auth/login
POST   /auth/verify-email
POST   /auth/reset-password
POST   /auth/update-password
POST   /auth/logout                    [JWT]
GET    /auth/profile                   [JWT]
PUT    /auth/profile                   [JWT]
GET    /auth/all-users                 [Admin+]
GET    /auth/users/role/:role          [Admin+]
PUT    /auth/users/:id/role            [Admin+]
DELETE /auth/users/:id                 [SuperAdmin]
POST   /auth/register-with-role        [Admin+]
GET    /auth/google
GET    /auth/google/callback

GET    /courses                        [JWT]
POST   /courses                        [Admin+]
GET    /courses/:id                    [JWT]
PUT    /courses/:id                    [Admin+]
DELETE /courses/:id                    [Admin+]
POST   /courses/:id/students           [Admin+]
DELETE /courses/:courseId/students/:studentId [Admin+]

GET    /students                       [Admin+]
POST   /students                       [Admin+]
GET    /students/:id                   [JWT]
PUT    /students/:id                   [Admin+]
DELETE /students/:id                   [Admin+]

GET    /teachers                       [Admin+]
POST   /teachers                       [Admin+]
GET    /teachers/:id                   [JWT]
PUT    /teachers/:id                   [Admin+]
DELETE /teachers/:id                   [Admin+]

POST   /attendance/bulk                [JWT]
GET    /attendance                     [JWT]
GET    /attendance/student/:id         [JWT]

GET    /statistics/payments            [Admin+]
POST   /statistics/payments            [Admin+]
PUT    /statistics/payments/:id        [Admin+]
DELETE /statistics/payments/:id        [Admin+]
GET    /statistics/movements           [Admin+]
POST   /statistics/movements           [Admin+]
GET    /statistics/monthly-report      [Admin+]
GET    /statistics/monthly-registrations [Admin+]

GET    /directions                     [JWT]
POST   /directions                     [Admin+]
PUT    /directions/:id                 [Admin+]
DELETE /directions/:id                 [Admin+]
```
