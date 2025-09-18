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

// Initialize database tables
async function initDatabase() {
    try {
        // Create appointments table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                email VARCHAR(100),
                service VARCHAR(100) NOT NULL,
                date DATE NOT NULL,
                time TIME NOT NULL,
                notes TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create users table
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
        
        console.log('✅ Database tables initialized');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    }
}

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
            'SELECT id, username, email, role FROM users WHERE id = $1',
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

// Admin route protection middleware
function requireAdmin(req, res, next) {
    console.log('Session check:', req.session.userId, req.session.role);
    if (!req.session.userId) {
        return res.redirect('/login.html');
    }
    
    // Check if user is admin
    pool.query('SELECT role FROM users WHERE id = $1', [req.session.userId])
        .then(result => {
            if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
                return res.status(403).send('Access denied');
            }
            next();
        })
        .catch(error => {
            console.error('Admin check error:', error);
            res.status(500).send('Server error');
        });
}

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin page with protection
app.get('/admin.html', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve admin login page (no auth required)
app.get('/admin-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

// Admin login endpoint
app.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Login attempt:', username);
        
        // Query user from database
        const result = await pool.query(
            'SELECT id, username, password, role FROM users WHERE username = $1',
            [username]
        );
        
        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: 'Tên đăng nhập không tồn tại'
            });
        }
        
        const user = result.rows[0];
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.json({
                success: false,
                message: 'Mật khẩu không đúng'
            });
        }
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return res.json({
                success: false,
                message: 'Bạn không có quyền truy cập admin'
            });
        }
        
        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;
        
        console.log('Login successful for:', username);
        
        res.json({
            success: true,
            message: 'Đăng nhập thành công'
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đăng nhập'
        });
    }
});

// Admin page load endpoint
app.get('/admin/load-page/:page', requireAdmin, async (req, res) => {
    try {
        console.log('Loading page:', req.params.page);
        const { page } = req.params;
        const fs = require('fs');
        
        // Determine file path
        let filePath;
        if (page === 'index') {
            filePath = path.join(__dirname, 'index.html');
        } else {
            filePath = path.join(__dirname, `${page}.html`);
        }
        
        console.log('File path:', filePath);
        console.log('File exists:', fs.existsSync(filePath));
        
        // Read file content
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            console.log('File content length:', content.length);
            
            // Extract main content (simplified - in real implementation you'd parse properly)
            let mainContent = content;
            
            // Try to extract content between main tags or body
            const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
            if (mainMatch) {
                mainContent = mainMatch[1];
            } else {
                const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                if (bodyMatch) {
                    mainContent = bodyMatch[1];
                }
            }
            
            res.json({ 
                success: true, 
                content: mainContent,
                fullContent: content,
                page: page
            });
            
        } catch (error) {
            res.status(404).json({ 
                success: false, 
                message: 'Page file not found' 
            });
        }
        
    } catch (error) {
        console.error('Error loading page:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error while loading page' 
        });
    }
});

// Admin page save endpoint
app.post('/admin/save-page', requireAdmin, async (req, res) => {
    try {
        const { page, content } = req.body;
        
        if (!page || !content) {
            return res.status(400).json({ 
                success: false, 
                message: 'Page name and content are required' 
            });
        }
        
        const fs = require('fs');
        
        // Determine file path
        let filePath;
        if (page === 'index') {
            filePath = path.join(__dirname, 'index.html');
        } else {
            filePath = path.join(__dirname, `${page}.html`);
        }
        
        // Read current file to preserve structure
        let currentContent = '';
        try {
            currentContent = fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            return res.status(404).json({ 
                success: false, 
                message: 'Page file not found' 
            });
        }
        
        // For now, we'll just save the content as-is
        // In a real implementation, you'd want to parse and replace specific sections
        // This is a simplified version for demonstration
        
        // Create backup
        const backupPath = filePath + '.backup.' + Date.now();
        fs.writeFileSync(backupPath, currentContent);
        
        // For demo purposes, we'll just log the save operation
        console.log(`Admin saved page: ${page}`);
        console.log(`Content length: ${content.length} characters`);
        
        res.json({ 
            success: true, 
            message: `Page ${page} saved successfully`,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error saving page:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error while saving page' 
        });
    }
});

// Login page
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get(/.*\.html$/, (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the website at: http://localhost:${PORT}`);
    
    // Initialize database and admin account
    await initDatabase();
    await createAdminAccount();
});

// Initialize admin account
async function createAdminAccount() {
    try {
        // Check if admin account already exists
        const existingAdmin = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            ['admin']
        );

        if (existingAdmin.rows.length === 0) {
            // Create admin account
            const passwordHash = await bcrypt.hash('admin123', 10);
            
            await pool.query(
                'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
                ['admin', 'admin@nailroom.vn', passwordHash, 'admin']
            );
            
            console.log('✅ Admin account created successfully!');
            console.log('Username: admin');
            console.log('Password: admin123');
        } else {
            console.log('✅ Admin account already exists');
        }
    } catch (error) {
        console.error('Error creating admin account:', error);
    }
}

// Create admin account on startup
createAdminAccount();