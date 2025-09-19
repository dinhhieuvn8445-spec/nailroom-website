const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'nailroom_db',
    password: 'postgres',
    port: 5432,
});

async function createAdminAccount() {
    try {
        // Create users table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if admin account already exists
        const existingAdmin = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            ['dinhhieuvn84']
        );

        if (existingAdmin.rows.length > 0) {
            console.log('✅ Tài khoản admin dinhhieuvn84 đã tồn tại');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('123', 10);

        // Create admin account
        await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
            ['dinhhieuvn84', 'dinhhieuvn84@nailroom.vn', hashedPassword, 'admin']
        );

        console.log('✅ Đã tạo thành công tài khoản admin:');
        console.log('   Username: dinhhieuvn84');
        console.log('   Password: 123');
        console.log('   Role: admin');

    } catch (error) {
        console.error('❌ Lỗi khi tạo tài khoản admin:', error);
    } finally {
        await pool.end();
    }
}

createAdminAccount();