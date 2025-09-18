const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 12001;

// Database connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'nailroom_db',
    password: 'postgres',
    port: 5432,
});

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'nailroom-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static('.'));

// API Routes

// Register endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, fullName, phone } = req.body;
        
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc' 
            });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tên đăng nhập hoặc email đã tồn tại' 
            });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, role, full_name, phone, created_at',
            [username, email, passwordHash, fullName || null, phone || null, 'user']
        );

        const newUser = result.rows[0];
        
        // Set session
        req.session.userId = newUser.id;
        req.session.username = newUser.username;
        req.session.role = newUser.role;

        res.json({
            success: true,
            message: 'Đăng ký thành công',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                fullName: newUser.full_name,
                phone: newUser.phone
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server, vui lòng thử lại sau' 
        });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng nhập tên đăng nhập và mật khẩu' 
            });
        }

        // Find user
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
            });
        }

        const user = result.rows[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
            });
        }

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.full_name,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server, vui lòng thử lại sau' 
        });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Lỗi khi đăng xuất' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Đăng xuất thành công' 
        });
    });
});

// Get current user profile
app.get('/api/profile', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ 
            success: false, 
            message: 'Chưa đăng nhập' 
        });
    }

    res.json({
        success: true,
        user: {
            id: req.session.userId,
            username: req.session.username,
            role: req.session.role
        }
    });
});

// Check authentication status
app.get('/api/auth-status', async (req, res) => {
    if (!req.session.userId) {
        return res.json({ 
            authenticated: false 
        });
    }

    try {
        const result = await pool.query(
            'SELECT id, username, email, role, full_name, phone FROM users WHERE id = $1',
            [req.session.userId]
        );

        if (result.rows.length === 0) {
            req.session.destroy();
            return res.json({ 
                authenticated: false 
            });
        }

        const user = result.rows[0];
        res.json({
            authenticated: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.full_name,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('Auth status error:', error);
        res.status(500).json({ 
            authenticated: false,
            error: 'Server error' 
        });
    }
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(/.*\.html$/, (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the website at: http://localhost:${PORT}`);
});

// Initialize admin account
async function createAdminAccount() {
    try {
        // Check if admin account already exists
        const existingAdmin = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            ['dinhhieuvn84']
        );

        if (existingAdmin.rows.length === 0) {
            // Create admin account
            const passwordHash = await bcrypt.hash('123', 10);
            
            await pool.query(
                'INSERT INTO users (username, email, password_hash, role, full_name) VALUES ($1, $2, $3, $4, $5)',
                ['dinhhieuvn84', 'admin@nailroom.vn', passwordHash, 'admin', 'Administrator']
            );
            
            console.log('✅ Admin account created successfully!');
            console.log('Username: dinhhieuvn84');
            console.log('Password: 123');
        } else {
            console.log('✅ Admin account already exists');
        }
    } catch (error) {
        console.error('Error creating admin account:', error);
    }
}

// Create admin account on startup
createAdminAccount();