import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './auth/entities/user.entity';
import { Teacher } from './teacher/entities/teacher.entity';
import { Student } from './student/entities/student.entity';
import { Direction } from './direction/entities/direction.entity';
import { Course } from './course/entities/course.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });

  const userRepo    = app.get<Repository<User>>(getRepositoryToken(User));
  const teacherRepo = app.get<Repository<Teacher>>(getRepositoryToken(Teacher));
  const studentRepo = app.get<Repository<Student>>(getRepositoryToken(Student));
  const dirRepo     = app.get<Repository<Direction>>(getRepositoryToken(Direction));
  const courseRepo  = app.get<Repository<Course>>(getRepositoryToken(Course));

  // ─── Directions ─────────────────────────────────────────────────────────────
  const dirDefs = [
    { name: 'Matematika',  dayType: 'odd',   startTime: '09:00', endTime: '11:00', description: 'Algebra va geometriya' },
    { name: 'Ingliz tili', dayType: 'even',  startTime: '10:00', endTime: '12:00', description: 'General English kursi' },
    { name: 'Informatika', dayType: 'odd',   startTime: '14:00', endTime: '16:00', description: 'Dasturlash asoslari' },
    { name: 'Fizika',      dayType: 'even',  startTime: '09:00', endTime: '11:00', description: 'Umumiy fizika' },
    { name: 'Kimyo',       dayType: 'daily', startTime: '11:00', endTime: '12:00', description: 'Anorganik kimyo' },
  ];

  const directions: Direction[] = [];
  for (const d of dirDefs) {
    const existing = await dirRepo.findOne({ where: { name: d.name } });
    if (existing) { directions.push(existing); console.log(`  Exists: ${d.name}`); continue; }
    const dir = dirRepo.create(d);
    directions.push(await dirRepo.save(dir));
    console.log(`✓ Direction: ${d.name}`);
  }

  // ─── Teachers ────────────────────────────────────────────────────────────────
  const teacherDefs = [
    { firstName: 'Alisher',  lastName: 'Karimov',    email: 'a.karimov@crm.uz',    phone: '+998901001001', dirIdx: 0 },
    { firstName: 'Nodira',   lastName: 'Toshmatova',  email: 'n.toshmatova@crm.uz', phone: '+998901001002', dirIdx: 1 },
    { firstName: 'Bobur',    lastName: 'Yusupov',     email: 'b.yusupov@crm.uz',    phone: '+998901001003', dirIdx: 2 },
    { firstName: 'Malika',   lastName: 'Xolmatova',   email: 'm.xolmatova@crm.uz',  phone: '+998901001004', dirIdx: 3 },
    { firstName: 'Jamshid',  lastName: 'Ergashev',    email: 'j.ergashev@crm.uz',   phone: '+998901001005', dirIdx: 4 },
    { firstName: 'Zulfiya',  lastName: 'Raximova',    email: 'z.raximova@crm.uz',   phone: '+998901001006', dirIdx: 0 },
  ];

  const teachers: Teacher[] = [];
  for (const t of teacherDefs) {
    const existing = await userRepo.findOne({ where: { email: t.email } });
    if (existing) {
      const tch = await teacherRepo.findOne({ where: { user: { id: existing.id } }, relations: ['user'] });
      if (tch) { teachers.push(tch); console.log(`  Exists: ${t.firstName}`); continue; }
    }
    const pw = await bcrypt.hash('teacher123', 10);
    const user = userRepo.create({ firstName: t.firstName, lastName: t.lastName, email: t.email, phone: t.phone, password: pw, role: 'teacher', isVerify: true });
    await userRepo.save(user);
    const tch = teacherRepo.create({ user, teacherId: `TCH${Date.now()}`, hireDate: new Date(), direction: directions[t.dirIdx] as any });
    teachers.push(await teacherRepo.save(tch));
    console.log(`✓ Teacher: ${t.firstName} ${t.lastName}`);
  }

  // ─── Groups (Courses) ────────────────────────────────────────────────────────
  const dayTypeMap: Record<string, string[]> = {
    odd:   ['Dushanba', 'Chorshanba', 'Juma'],
    even:  ['Seshanba', 'Payshanba', 'Shanba'],
    daily: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma'],
  };

  const groupDefs = [
    { title: 'Matematika A',  dirIdx: 0, tIdx: 0, capacity: 15 },
    { title: 'Ingliz tili A', dirIdx: 1, tIdx: 1, capacity: 12 },
    { title: 'Informatika A', dirIdx: 2, tIdx: 2, capacity: 10 },
    { title: 'Fizika A',      dirIdx: 3, tIdx: 3, capacity: 12 },
    { title: 'Kimyo A',       dirIdx: 4, tIdx: 4, capacity: 10 },
    { title: 'Matematika B',  dirIdx: 0, tIdx: 5, capacity: 15 },
  ];

  const groups: Course[] = [];
  for (const g of groupDefs) {
    const existing = await courseRepo.findOne({ where: { title: g.title } });
    if (existing) { groups.push(existing); console.log(`  Exists: ${g.title}`); continue; }
    const dir = directions[g.dirIdx];
    const days = dayTypeMap[dir.dayType] ?? [];
    const schedule = days.map((d) => `${d} ${dir.startTime}-${dir.endTime}`);
    const prefix = dir.name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    const code = `${prefix}-${100 + groups.length}`;
    const course = courseRepo.create({ title: g.title, code, direction: dir as any, teacher: teachers[g.tIdx] as any, capacity: g.capacity, schedule });
    groups.push(await courseRepo.save(course));
    console.log(`✓ Group: ${g.title}`);
  }

  // ─── Students (50) ──────────────────────────────────────────────────────────
  const firstNames = ['Sardor','Jasur','Umid','Dilnoza','Malika','Bobur','Murod','Kamola','Sanjar','Zulfiya',
    'Sherzod','Nilufar','Firdavs','Sabohat','Jahongir','Lola','Otabek','Nargiza','Doniyor','Feruza',
    'Mirzo','Gulnora','Temur','Shahnoza','Ibrohim','Madina','Nodir','Barno','Akbar','Mohira',
    'Saidakbar','Dilorom','Ulugbek','Nafisa','Ravshan','Maftuna','Hamza','Ozoda','Bekzod','Yulduz',
    'Shuhrat','Laylo','Farrux','Iroda','Asliddin','Gavhar','Rustam','Muazzam','Laziz','Hulkar'];
  const lastNames = ['Karimov','Toshmatov','Yusupov','Mirzayev','Xolmatov','Ergashev','Raximov','Nazarov','Qodirov','Sultonov'];
  const parentNames = ['Akbar ota','Sardor ota','Ulugbek ota','Bobur ota','Mirzo ota'];
  const pw = await bcrypt.hash('student123', 10);

  let created = 0;
  for (let i = 0; i < 50; i++) {
    const email = `student${i + 1}@crm.uz`;
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) { process.stdout.write(`\r  Skip existing ${i + 1}/50`); continue; }

    const user = userRepo.create({
      firstName: firstNames[i],
      lastName:  lastNames[i % lastNames.length],
      email,
      phone:     `+99890${String(2000000 + i).padStart(7, '0')}`,
      password:  pw,
      role:      'student',
      isVerify:  true,
    });
    await userRepo.save(user);

    const student = studentRepo.create({
      user,
      parentName:     parentNames[i % parentNames.length],
      parentPhone:    `+99890${String(3000000 + i).padStart(7, '0')}`,
      studentId:      `ST${Date.now()}${i}`,
      enrollmentDate: new Date(),
      courses:        [groups[i % groups.length] as any],
    });
    await studentRepo.save(student);
    created++;
    process.stdout.write(`\r  Students created: ${created}/50`);
  }

  console.log(`\n\n===== Seed complete =====`);
  console.log(`  Directions: ${directions.length}`);
  console.log(`  Teachers:   ${teachers.length}`);
  console.log(`  Groups:     ${groups.length}`);
  console.log(`  Students:   ${created} new`);
  await app.close();
}

seed().catch((e) => { console.error(e); process.exit(1); });
