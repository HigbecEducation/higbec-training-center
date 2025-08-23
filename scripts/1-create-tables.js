// scripts/1-create-tables.js
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

async function createTables() {
  const client = await pool.connect();

  try {
    console.log("🏗️  Creating database tables...");

    // Start transaction
    await client.query("BEGIN");

    // Create admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created admins table");

    // Create registrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        college VARCHAR(200) NOT NULL,
        course VARCHAR(100) NOT NULL,
        year VARCHAR(20) NOT NULL,
        project_type VARCHAR(50) NOT NULL,
        project_description TEXT NOT NULL,
        preferred_start_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created registrations table");

    // Create indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
    `);
    console.log("✅ Created database indexes");

    // Create trigger function for updated_at
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
      DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
      CREATE TRIGGER update_admins_updated_at 
        BEFORE UPDATE ON admins 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
      CREATE TRIGGER update_registrations_updated_at 
        BEFORE UPDATE ON registrations 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log("✅ Created update triggers");

    // Commit transaction
    await client.query("COMMIT");

    console.log("🎉 Database tables created successfully!");
    console.log("📊 Ready for data operations");
  } catch (error) {
    // Rollback on error
    await client.query("ROLLBACK");
    console.error("❌ Error creating tables:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute table creation
createTables().catch(console.error);
