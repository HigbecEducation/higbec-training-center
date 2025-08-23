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
  const client = await pool.connect();

  try {
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

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_registrations_email ON project_registrations(email);
      CREATE INDEX IF NOT EXISTS idx_registrations_status ON project_registrations(status);
      CREATE INDEX IF NOT EXISTS idx_registrations_batch_type ON project_registrations(batch_type);
      CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON project_registrations(created_at);
      CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
      CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
    `);

    // Create trigger for updating updated_at timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

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

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }
}

export { pool };

// Database helper functions
export class ProjectRegistrationModel {
  static async create(data) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO project_registrations 
         (full_name, phone_number, email, college_name, branch, semester, batch_type, registration_type, project_title, group_members)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
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
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findByEmail(email) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM project_registrations WHERE email = $1",
        [email]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM project_registrations WHERE id = $1",
        [id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async updateById(id, data) {
    const client = await pool.connect();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(data[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(id);
      const result = await client.query(
        `UPDATE project_registrations SET ${fields.join(
          ", "
        )} WHERE id = $${paramCount} RETURNING *`,
        values
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async deleteById(id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "DELETE FROM project_registrations WHERE id = $1 RETURNING *",
        [id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async findWithFilters(filters = {}) {
    const client = await pool.connect();
    try {
      let query = "SELECT * FROM project_registrations";
      const conditions = [];
      const values = [];
      let paramCount = 1;

      if (filters.search) {
        conditions.push(`(
          full_name ILIKE $${paramCount} OR 
          email ILIKE $${paramCount} OR 
          project_title ILIKE $${paramCount} OR 
          college_name ILIKE $${paramCount}
        )`);
        values.push(`%${filters.search}%`);
        paramCount++;
      }

      if (filters.status) {
        conditions.push(`status = $${paramCount}`);
        values.push(filters.status);
        paramCount++;
      }

      if (filters.batchType) {
        conditions.push(`batch_type = $${paramCount}`);
        values.push(filters.batchType);
        paramCount++;
      }

      if (filters.registrationType) {
        conditions.push(`registration_type = $${paramCount}`);
        values.push(filters.registrationType);
        paramCount++;
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY created_at DESC";

      if (filters.limit) {
        query += ` LIMIT $${paramCount}`;
        values.push(filters.limit);
        paramCount++;
      }

      if (filters.offset) {
        query += ` OFFSET $${paramCount}`;
        values.push(filters.offset);
        paramCount++;
      }

      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async countWithFilters(filters = {}) {
    const client = await pool.connect();
    try {
      let query = "SELECT COUNT(*) FROM project_registrations";
      const conditions = [];
      const values = [];
      let paramCount = 1;

      if (filters.search) {
        conditions.push(`(
          full_name ILIKE $${paramCount} OR 
          email ILIKE $${paramCount} OR 
          project_title ILIKE $${paramCount} OR 
          college_name ILIKE $${paramCount}
        )`);
        values.push(`%${filters.search}%`);
        paramCount++;
      }

      if (filters.status) {
        conditions.push(`status = $${paramCount}`);
        values.push(filters.status);
        paramCount++;
      }

      if (filters.batchType) {
        conditions.push(`batch_type = $${paramCount}`);
        values.push(filters.batchType);
        paramCount++;
      }

      if (filters.registrationType) {
        conditions.push(`registration_type = $${paramCount}`);
        values.push(filters.registrationType);
        paramCount++;
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      const result = await client.query(query, values);
      return parseInt(result.rows[0].count);
    } finally {
      client.release();
    }
  }

  static async getStats() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
        FROM project_registrations
      `);
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

export class AdminModel {
  static async findByEmail(email) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM admins WHERE email = $1 AND is_active = true",
        [email]
      );
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
