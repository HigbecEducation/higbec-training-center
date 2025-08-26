// lib/postgresql.js - Updated to include payment_screenshot_file_name column

// import { Pool } from "pg";

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl:
//     process.env.NODE_ENV === "production"
//       ? { rejectUnauthorized: false }
//       : false,
// });

import { Pool } from "pg";

// Use individual connection parameters instead of DATABASE_URL
// This matches the working configuration from your admin creation script
const SUPABASE_CONFIG = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  // Additional pool configuration
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
  max: 10, // Increase for production
};

const pool = new Pool(SUPABASE_CONFIG);

// Connection event handlers
pool.on("connect", () => {
  console.log("Connected to Supabase PostgreSQL");
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err);
});

// Initialize database tables
export async function initializeDatabase() {
  try {
    const client = await pool.connect();

    try {
      // Create project_registrations table with updated schema
      await client.query(`
        CREATE TABLE IF NOT EXISTS project_registrations (
          id SERIAL PRIMARY KEY,
          project_id VARCHAR(50) UNIQUE NOT NULL DEFAULT 'PROJ-' || LPAD(nextval('project_registrations_id_seq')::text, 6, '0'),
          full_name VARCHAR(255) NOT NULL,
          phone_number VARCHAR(20) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          college_name VARCHAR(255) NOT NULL,
          branch VARCHAR(255) NOT NULL,
          semester VARCHAR(50) NOT NULL,
          batch_type VARCHAR(50) NOT NULL CHECK (batch_type IN ('M.Tech', 'B.Tech', 'M.Sc.', 'B.Sc.', 'Polytechnic', 'MCA', 'Diploma')),
          registration_type VARCHAR(50) NOT NULL CHECK (registration_type IN ('Individual Project', 'Group Project')),
          project_title TEXT NOT NULL,
          group_members JSONB DEFAULT '[]'::jsonb,
          payment_screenshot_path TEXT, -- Full Supabase URL
          payment_screenshot_file_name TEXT, -- Filename for deletion
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_project_registrations_email 
        ON project_registrations(email);
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_project_registrations_status 
        ON project_registrations(status);
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_project_registrations_created_at 
        ON project_registrations(created_at);
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_project_registrations_project_id 
        ON project_registrations(project_id);
      `);

      // Create updated_at trigger
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

      await client.query(`
        DROP TRIGGER IF EXISTS update_project_registrations_updated_at ON project_registrations;
        CREATE TRIGGER update_project_registrations_updated_at 
          BEFORE UPDATE ON project_registrations 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);

      // Create admins table
      await client.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE,
          role VARCHAR(50) DEFAULT 'admin',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      console.log("Database initialized successfully");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Project Registration Model
export const ProjectRegistrationModel = {
  // Create a new registration
  async create(data) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        INSERT INTO project_registrations (
          full_name, phone_number, email, college_name, branch, semester,
          batch_type, registration_type, project_title, group_members,
          payment_screenshot_path, payment_screenshot_file_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `,
        [
          data.fullName,
          data.phoneNumber,
          data.email,
          data.collegeName,
          data.branch,
          data.semester,
          data.batchType,
          data.registrationType,
          data.projectTitle,
          JSON.stringify(data.groupMembers || []),
          data.paymentScreenshotPath || null,
          data.paymentScreenshotFileName || null,
        ]
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Find registration by email
  async findByEmail(email) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM project_registrations WHERE email = $1",
        [email.toLowerCase()]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  // Find registration by ID
  async findById(id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM project_registrations WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  // Find registrations with filters and pagination
  async findWithFilters(filters = {}) {
    const client = await pool.connect();
    try {
      let query = `
        SELECT * FROM project_registrations 
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      // Add search filter
      if (filters.search) {
        paramCount++;
        query += ` AND (
          full_name ILIKE $${paramCount} OR 
          email ILIKE $${paramCount} OR 
          project_title ILIKE $${paramCount} OR
          college_name ILIKE $${paramCount}
        )`;
        params.push(`%${filters.search}%`);
      }

      // Add status filter
      if (filters.status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push(filters.status);
      }

      // Add batch type filter
      if (filters.batchType) {
        paramCount++;
        query += ` AND batch_type = $${paramCount}`;
        params.push(filters.batchType);
      }

      // Add registration type filter
      if (filters.registrationType) {
        paramCount++;
        query += ` AND registration_type = $${paramCount}`;
        params.push(filters.registrationType);
      }

      // Add ordering
      query += ` ORDER BY created_at DESC`;

      // Add pagination
      if (filters.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }

      if (filters.offset) {
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        params.push(filters.offset);
      }

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Count registrations with filters
  async countWithFilters(filters = {}) {
    const client = await pool.connect();
    try {
      let query = `
        SELECT COUNT(*) as count FROM project_registrations 
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      // Add search filter
      if (filters.search) {
        paramCount++;
        query += ` AND (
          full_name ILIKE $${paramCount} OR 
          email ILIKE $${paramCount} OR 
          project_title ILIKE $${paramCount} OR
          college_name ILIKE $${paramCount}
        )`;
        params.push(`%${filters.search}%`);
      }

      // Add status filter
      if (filters.status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push(filters.status);
      }

      // Add batch type filter
      if (filters.batchType) {
        paramCount++;
        query += ` AND batch_type = $${paramCount}`;
        params.push(filters.batchType);
      }

      // Add registration type filter
      if (filters.registrationType) {
        paramCount++;
        query += ` AND registration_type = $${paramCount}`;
        params.push(filters.registrationType);
      }

      const result = await client.query(query, params);
      return parseInt(result.rows[0].count);
    } finally {
      client.release();
    }
  },

  // Update registration status
  async updateStatus(id, status) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "UPDATE project_registrations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
        [status, id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  // Delete registration
  async delete(id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "DELETE FROM project_registrations WHERE id = $1 RETURNING *",
        [id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  // Get statistics
  async getStats() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'approved') as approved,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected
        FROM project_registrations
      `);
      return result.rows[0];
    } finally {
      client.release();
    }
  },
};

// Admin User Model
export class AdminModel {
  static async findByEmail(email) {
    const client = await pool.connect();
    try {
      console.log("77777777777777777777777777777777777777");
      console.log(email);
      const result = await client.query(
        "SELECT * FROM admins WHERE email = $1 AND is_active = true",
        [email]
      );
      const results = await client.query(
        "SELECT email FROM admins WHERE is_active = true"
      );
      const emails = results.rows.map((row) => row.email);
      console.log(emails);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async create(data) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO admins (username, email, password, role, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          data.username,
          data.email,
          data.password,
          data.role || "admin",
          data.isActive !== false,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findByUsernameOrEmail(username, email) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM admins WHERE username = $1 OR email = $2",
        [username, email]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

// Close pool connection
export async function closeDatabase() {
  await pool.end();
}

// Export pool for direct queries if needed
export { pool };
