const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'nailroom_db',
    password: '',
    port: 5432,
});

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Delete existing admin user
        await pool.query('DELETE FROM users WHERE username = $1', ['admin']);
        
        // Create new admin user
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            ['admin', 'admin@nailroom.com', hashedPassword, 'Administrator', 'admin']
        );
        
        console.log('Admin user created successfully with ID:', result.rows[0].id);
        console.log('Username: admin');
        console.log('Password: admin123');
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await pool.end();
    }
}

createAdmin();