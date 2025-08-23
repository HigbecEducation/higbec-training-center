const { Pool } = require('pg');
const bcryptjs = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function seedAdmin() {
  const client = await pool.connect();
  
  try {
    console.log('🔗 Connected to PostgreSQL database');

    // Initialize tables first
    await initializeTables(client);

    // Check if admin already exists
    const existingAdmin = await client.query(
      'SELECT * FROM admins WHERE email = $1',
      ['admin@higbec.com']
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email: admin@higbec.com');
      console.log('🔐 Password: admin123456');
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcryptjs.hash('admin123456', saltRounds);

    // Create admin user
    const result = await client.query(
      `INSERT INTO admins (username, email, password, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      ['admin', 'admin@higbec.com', hashedPassword, 'superadmin', true]
    );

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@higbec.com');
    console.log('🔐 Password: admin123456');
    console.log('👤 Username: admin');
    console.log('🎭 Role: superadmin');
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  } finally {
    client.release();
    await pool.end();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

async function initializeTables(client) {
  try {
    // Create admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create project_registrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_registrations (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        college_name VARCHAR(255) NOT NULL,
        branch VARCHAR(255) NOT NULL,
        semester VARCHAR(50) NOT NULL,
        batch_type VARCHAR(50) NOT NULL CHECK (batch_type IN ('M.Tech', 'B.Tech', 'M.Sc.', 'B.Sc.', 'Polytechnic', 'MCA', 'Diploma')),
        registration_type VARCHAR(50) NOT NULL CHECK (registration_type IN ('Individual Project', 'Group Project')),
        project_title VARCHAR(500) NOT NULL,
        group_members JSONB DEFAULT '[]',
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_registrations_email ON project_registrations(email);
      CREATE INDEX IF NOT EXISTS idx_registrations_status ON project_registrations(status);
      CREATE INDEX IF NOT EXISTS idx_registrations_batch_type ON project_registrations(batch_type);
      CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON project_registrations(created_at);
      CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
      CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
    `);

    // Create trigger function for updating updated_at timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers
    await client.query(`
      DROP TRIGGER IF EXISTS update_registrations_updated_at ON project_registrations;
      CREATE TRIGGER update_registrations_updated_at
        BEFORE UPDATE ON project_registrations
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
      CREATE TRIGGER update_admins_updated_at
        BEFORE UPDATE ON admins
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing tables:', error);
    throw error;
  }
}

// Run the seeder
seedAdmin();