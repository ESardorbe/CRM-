// Seed script: adds test directions, teachers, groups and 50 students
// Run: node seed-data.mjs
const BASE = 'http://localhost:4001';

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

// ─── login ────────────────────────────────────────────────────────────────────
const login = await req('POST', '/auth/login', { email: 'superadmin@crm.uz', password: 'y' });
const token = login.accessToken;
if (!token) { console.error('Login failed:', login); process.exit(1); }
console.log('✓ Logged in');

// ─── directions ───────────────────────────────────────────────────────────────
const directionDefs = [
  { name: "Matematika",     dayType: "odd",   startTime: "09:00", endTime: "11:00", description: "Algebra va geometriya" },
  { name: "Ingliz tili",    dayType: "even",  startTime: "10:00", endTime: "12:00", description: "General English kursi" },
  { name: "Informatika",    dayType: "odd",   startTime: "14:00", endTime: "16:00", description: "Dasturlash asoslari" },
  { name: "Fizika",         dayType: "even",  startTime: "09:00", endTime: "11:00", description: "Umumiy fizika" },
  { name: "Kimyo",          dayType: "daily", startTime: "11:00", endTime: "12:00", description: "Anorganik kimyo" },
];

const directions = [];
for (const d of directionDefs) {
  const result = await req('POST', '/directions', d, token);
  if (result.id) { directions.push(result); console.log(`✓ Direction: ${result.name}`); }
  else console.warn('  Direction skip/exists:', result?.message ?? result);
}

// if directions already exist, fetch them
if (directions.length === 0) {
  const all = await req('GET', '/directions?limit=20', null, token);
  directions.push(...(all.data ?? []));
  console.log(`  Using ${directions.length} existing directions`);
}

// ─── teachers ─────────────────────────────────────────────────────────────────
const teacherDefs = [
  { firstName: "Alisher",   lastName: "Karimov",   email: "a.karimov@crm.uz",   phone: "+998901001001", directionIdx: 0 },
  { firstName: "Nodira",    lastName: "Toshmatova", email: "n.toshmatova@crm.uz", phone: "+998901001002", directionIdx: 1 },
  { firstName: "Bobur",     lastName: "Yusupov",    email: "b.yusupov@crm.uz",   phone: "+998901001003", directionIdx: 2 },
  { firstName: "Malika",    lastName: "Xolmatova",  email: "m.xolmatova@crm.uz", phone: "+998901001004", directionIdx: 3 },
  { firstName: "Jamshid",   lastName: "Ergashev",   email: "j.ergashev@crm.uz",  phone: "+998901001005", directionIdx: 4 },
  { firstName: "Zulfiya",   lastName: "Raximova",   email: "z.raximova@crm.uz",  phone: "+998901001006", directionIdx: 0 },
];

const teachers = [];
for (const t of teacherDefs) {
  const result = await req('POST', '/teachers', {
    firstName: t.firstName,
    lastName:  t.lastName,
    email:     t.email,
    phone:     t.phone,
    password:  'teacher123',
    directionId: directions[t.directionIdx]?.id,
  }, token);
  if (result.id) { teachers.push(result); console.log(`✓ Teacher: ${t.firstName} ${t.lastName}`); }
  else console.warn('  Teacher skip/exists:', result?.message ?? result);
}

if (teachers.length === 0) {
  const all = await req('GET', '/teachers?limit=20', null, token);
  teachers.push(...(all.data ?? []));
  console.log(`  Using ${teachers.length} existing teachers`);
}

// ─── groups (courses) ─────────────────────────────────────────────────────────
const groupDefs = [
  { title: "Matematika A",   directionIdx: 0, teacherIdx: 0, capacity: 15 },
  { title: "Ingliz tili A",  directionIdx: 1, teacherIdx: 1, capacity: 12 },
  { title: "Informatika A",  directionIdx: 2, teacherIdx: 2, capacity: 10 },
  { title: "Fizika A",       directionIdx: 3, teacherIdx: 3, capacity: 12 },
  { title: "Kimyo A",        directionIdx: 4, teacherIdx: 4, capacity: 10 },
  { title: "Matematika B",   directionIdx: 0, teacherIdx: 5, capacity: 15 },
];

const groups = [];
for (const g of groupDefs) {
  const dir = directions[g.directionIdx];
  const days = { odd: ['Dushanba', 'Chorshanba', 'Juma'], even: ['Seshanba', 'Payshanba', 'Shanba'], daily: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma'] };
  const schedule = (days[dir?.dayType] ?? []).map(d => `${d} ${dir?.startTime}-${dir?.endTime}`);
  const code = dir ? `${dir.name.replace(/\s+/g,'').substring(0,3).toUpperCase()}-${100 + groups.length}` : undefined;
  const result = await req('POST', '/courses', {
    title:       g.title,
    code,
    directionId: dir?.id,
    teacherId:   teachers[g.teacherIdx]?.id,
    capacity:    g.capacity,
    schedule,
  }, token);
  if (result.id) { groups.push(result); console.log(`✓ Group: ${g.title}`); }
  else console.warn('  Group error:', result?.message ?? result);
}

if (groups.length === 0) {
  const all = await req('GET', '/courses?limit=20', null, token);
  groups.push(...(all.data ?? []));
  console.log(`  Using ${groups.length} existing groups`);
}

// ─── students (50 ta) ─────────────────────────────────────────────────────────
const firstNames = ['Sardor','Jasur','Umid','Dilnoza','Malika','Bobur','Murod','Kamola','Sanjar','Zulfiya',
                    'Sherzod','Nilufar','Firdavs','Sabohat','Jahongir','Lola','Otabek','Nargiza','Doniyor','Feruza',
                    'Mirzo','Gulnora','Temur','Shahnoza','Ibrohim','Madina','Nodir','Barno','Akbar','Mohira',
                    'Saidakbar','Dilorom','Ulugbek','Nafisa','Ravshan','Maftuna','Hamza','Ozoda','Bekzod','Yulduz',
                    'Shuhrat','Laylo','Farrux','Iroda','Asliddin','Gavhar','Rustam','Muazzam','Laziz','Hulkar'];
const lastNames  = ['Karimov','Toshmatov','Yusupov','Mirzayev','Xolmatov','Ergashev','Raximov','Nazarov','Qodirov','Sultonov'];
const parentNames = ['Akbar ota','Sardor ota','Ulugbek ota','Bobur ota','Mirzo ota'];

let created = 0;
for (let i = 0; i < 50; i++) {
  const fn  = firstNames[i];
  const ln  = lastNames[i % lastNames.length];
  const grp = groups[i % groups.length];
  const email = `student${i + 1}@crm.uz`;
  const result = await req('POST', '/students', {
    firstName:   fn,
    lastName:    ln,
    email,
    phone:       `+99890${String(2000000 + i).padStart(7,'0')}`,
    password:    'student123',
    parentName:  parentNames[i % parentNames.length],
    parentPhone: `+99890${String(3000000 + i).padStart(7,'0')}`,
    courseId:    grp?.id,
  }, token);
  if (result.id) { created++; process.stdout.write(`\r  Students created: ${created}/50`); }
  else process.stdout.write(`\n  Error for ${fn}: ${result?.message ?? JSON.stringify(result)}\n`);
}

console.log(`\n✓ Done! ${created} students created`);
console.log(`\nSummary:`);
console.log(`  Directions: ${directions.length}`);
console.log(`  Teachers:   ${teachers.length}`);
console.log(`  Groups:     ${groups.length}`);
console.log(`  Students:   ${created}`);
