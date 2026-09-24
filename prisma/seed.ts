import 'dotenv/config';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sampleDeclaration = {
  id: randomUUID(),
  cert_number: '១២០៩០៦០៥- ៤៥៧៥',
  location: 'រាជធានីភ្នំពេញ ខណ្ឌពោធិ៍សែនជ័យ សង្កាត់ចោមចៅទី១ ភូមិត្រពាំងថ្លឹង១',
  seller: JSON.stringify({
    husband: {
      idNumber: '010352372(02)/20.05.2025',
      name: 'ឈូ ស៊ីសេង',
      dob: '22.02.1973',
      birthPlace: 'ឃុំឫស្សីស្រុក ស្រុកស្រីសន្ធរ ខេត្តកំពង់ចាម',
      nationality: 'ខ្មែរ',
      status: 'មានប្រពន្ធ',
      fatherName: 'ឈូ ម៉េងហោ',
      motherName: 'ហម ហៃឡេង',
      address: 'ផ្ទះលេខ១២E ផ្លូវ១៩៣ ភូមិ៤ សង្កាត់ទួលស្វាយព្រៃទី១ ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ',
    },
    wife: {
      idNumber: '011017556(01)/20.05.2025',
      name: 'លាង ធាវី',
      dob: '06.01.1980',
      birthPlace: 'សង្កាត់ផ្សារចាស់ ក្រុងភ្នំពេញ',
      nationality: 'ខ្មែរ',
      status: 'មានប្ដី',
      fatherName: 'លាង ឆេង',
      motherName: 'សៀម ហ៊ាង',
      address: 'ផ្ទះលេខ១២E ផ្លូវ១៩៣ ភូមិ៤ សង្កាត់ទួលស្វាយព្រៃទី១ ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ',
    },
  }),
  buyer: JSON.stringify({
    husband: {
      idNumber: '010992381(01)/15.03.2024',
      name: 'សុខ សំណាង',
      dob: '15.08.1982',
      birthPlace: 'រាជធានីភ្នំពេញ',
      nationality: 'ខ្មែរ',
      status: 'មានប្រពន្ធ',
      fatherName: 'សុខ គង់',
      motherName: 'គឹម សុផល',
      address: 'ផ្ទះលេខ៤៥ ផ្លូវ២៧១ សង្កាត់បឹងទំពុន ខណ្ឌមានជ័យ រាជធានីភ្នំពេញ',
    },
    wife: {
      idNumber: '010884912(01)/15.03.2024',
      name: 'ម៉ម ចិន្តា',
      dob: '10.11.1986',
      birthPlace: 'ខេត្តកណ្តាល',
      nationality: 'ខ្មែរ',
      status: 'មានប្ដី',
      fatherName: 'ម៉ម ថុល',
      motherName: 'អ៊ុំ សារ៉េត',
      address: 'ផ្ទះលេខ៤៥ ផ្លូវ២៧១ សង្កាត់បឹងទំពុន ខណ្ឌមានជ័យ រាជធានីភ្នំពេញ',
    },
  }),
  husband: JSON.stringify({
    idNumber: '010352372(02)/20.05.2025',
    name: 'ឈូ ស៊ីសេង',
    dob: '22.02.1973',
    birthPlace: 'ឃុំឫស្សីស្រុក ស្រុកស្រីសន្ធរ ខេត្តកំពង់ចាម',
    nationality: 'ខ្មែរ',
    status: 'មានប្រពន្ធ',
    fatherName: 'ឈូ ម៉េងហោ',
    motherName: 'ហម ហៃឡេង',
    address: 'ផ្ទះលេខ១២E ផ្លូវ១៩៣ ភូមិ៤ សង្កាត់ទួលស្វាយព្រៃទី១ ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ',
  }),
  wife: JSON.stringify({
    idNumber: '011017556(01)/20.05.2025',
    name: 'លាង ធាវី',
    dob: '06.01.1980',
    birthPlace: 'សង្កាត់ផ្សារចាស់ ក្រុងភ្នំពេញ',
    nationality: 'ខ្មែរ',
    status: 'មានប្ដី',
    fatherName: 'លាង ឆេង',
    motherName: 'សៀម ហ៊ាង',
    address: 'ផ្ទះលេខ១២E ផ្លូវ១៩៣ ភូមិ៤ សង្កាត់ទួលស្វាយព្រៃទី១ ខណ្ឌបឹងកេងកង រាជធានីភ្នំពេញ',
  }),
  joint: JSON.stringify({
    propertyType: 'ទ្រព្យសម្បត្តិរួម (ទ្រព្យសម្បត្តិប្រពន្ធ)',
    area: '១៥៧ m²',
    landUse: 'សាងសង់',
    usageNature: 'ឯកជន',
    possessionSource: 'ទិញ',
    date: '2005',
    charter: '',
    entity: '',
    officeAddress: '',
    repName: '',
    repRole: '',
  }),
};

async function main() {
  const { rows } = await pool.query('SELECT COUNT(*) FROM declarations');
  const count = parseInt(rows[0].count, 10);

  if (count === 0) {
    await pool.query(
      `INSERT INTO declarations (id, cert_number, location, seller, buyer, husband, wife, joint, created_at, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb, NOW(), NOW())`,
      [
        sampleDeclaration.id,
        sampleDeclaration.cert_number,
        sampleDeclaration.location,
        sampleDeclaration.seller,
        sampleDeclaration.buyer,
        sampleDeclaration.husband,
        sampleDeclaration.wife,
        sampleDeclaration.joint,
      ],
    );
    console.log('✅ Seeded 1 sample declaration into Neon PostgreSQL.');
  } else {
    console.log(`ℹ️ ${count} declaration(s) already in database.`);
  }

  // ─── Seed Roles & Permissions ───────────────────────────────────────────────
  const permissions = [
    'READ_USERS',
    'WRITE_USERS',
    'DELETE_USERS',
    'READ_DECLARATIONS',
    'WRITE_DECLARATIONS',
    'DELETE_DECLARATIONS',
  ];

  for (const perm of permissions) {
    await pool.query(
      `INSERT INTO permissions (id, name) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
      [randomUUID(), perm],
    );
  }

  const roles = [
    {
      name: 'SUPER_ADMIN',
      permissions: [
        'READ_USERS',
        'WRITE_USERS',
        'DELETE_USERS',
        'READ_DECLARATIONS',
        'WRITE_DECLARATIONS',
        'DELETE_DECLARATIONS',
      ],
    },
    {
      name: 'ADMIN',
      permissions: [
        'READ_USERS',
        'WRITE_USERS',
        'READ_DECLARATIONS',
        'WRITE_DECLARATIONS',
        'DELETE_DECLARATIONS',
      ],
    },
    {
      name: 'MODERATOR',
      permissions: ['READ_USERS', 'READ_DECLARATIONS', 'WRITE_DECLARATIONS'],
    },
    {
      name: 'VIEWER',
      permissions: ['READ_DECLARATIONS'],
    },
  ];

  for (const r of roles) {
    const res = await pool.query(
      `INSERT INTO roles (id, name) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [randomUUID(), r.name],
    );
    const roleId = res.rows[0].id;

    for (const permName of r.permissions) {
      const pRes = await pool.query(`SELECT id FROM permissions WHERE name = $1`, [permName]);
      if (pRes.rows[0]) {
        await pool.query(
          `INSERT INTO roles_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [roleId, pRes.rows[0].id],
        );
      }
    }
  }

  // ─── Seed Default Super Admin User ──────────────────────────────────────────
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash('Password123!', 12);
  const adminEmail = 'admin@example.com';

  const userRes = await pool.query(
    `INSERT INTO users (id, email, password_hash, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id`,
    [randomUUID(), adminEmail, passwordHash],
  );
  const adminUserId = userRes.rows[0].id;

  const superAdminRole = await pool.query(`SELECT id FROM roles WHERE name = 'SUPER_ADMIN'`);
  if (superAdminRole.rows[0]) {
    await pool.query(
      `INSERT INTO users_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [adminUserId, superAdminRole.rows[0].id],
    );
  }

  console.log('✅ Seeded RBAC roles, permissions, and default admin (admin@example.com / Password123!)');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => pool.end());

