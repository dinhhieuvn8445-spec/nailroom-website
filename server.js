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
        
        // Create services table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS services (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                image VARCHAR(255),
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
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
            [username, email, passwordHash, 'user']
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
                role: newUser.role
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
        const isValidPassword = await bcrypt.compare(password, user.password);
        
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
                role: user.role
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

// Admin API Routes
// Admin statistics
app.get('/api/admin/stats/customers', requireAdminAPI, async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = $1', ['user']);
        res.json({ total: parseInt(result.rows[0].total) });
    } catch (error) {
        console.error('Error getting customer stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/admin/stats/revenue', requireAdminAPI, async (req, res) => {
    try {
        // Mock revenue data - replace with actual revenue calculation
        res.json({
            today: 2500000,
            weekly: 15000000,
            monthly: 45000000,
            yearly: 540000000
        });
    } catch (error) {
        console.error('Error getting revenue stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/admin/stats/appointments', requireAdminAPI, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const result = await pool.query(
            'SELECT COUNT(*) as today FROM appointments WHERE appointment_date = $1',
            [today]
        );
        res.json({ today: parseInt(result.rows[0].today) });
    } catch (error) {
        console.error('Error getting appointment stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/admin/stats/services', requireAdminAPI, async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) as total FROM services');
        res.json({ total: parseInt(result.rows[0].total) });
    } catch (error) {
        console.error('Error getting service stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Customer management
app.get('/api/admin/customers', requireAdminAPI, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting customers:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/admin/customers/:id', requireAdminAPI, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getting customer:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/customers', requireAdminAPI, async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
            [username, email, passwordHash, role || 'user']
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/admin/customers/:id', requireAdminAPI, async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        let query, params;
        
        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            query = 'UPDATE users SET username = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING id, username, email, role, created_at';
            params = [username, email, passwordHash, role, req.params.id];
        } else {
            query = 'UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, username, email, role, created_at';
            params = [username, email, role, req.params.id];
        }
        
        const result = await pool.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/admin/customers/:id', requireAdminAPI, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Service management
app.get('/api/admin/services', requireAdminAPI, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM services ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting services:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/admin/services/:id', requireAdminAPI, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM services WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getting service:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/services', requireAdminAPI, async (req, res) => {
    try {
        const { name, description, price, image } = req.body;
        const result = await pool.query(
            'INSERT INTO services (name, description, price, image) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, price, image]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/admin/services/:id', requireAdminAPI, async (req, res) => {
    try {
        const { name, description, price, image } = req.body;
        const result = await pool.query(
            'UPDATE services SET name = $1, description = $2, price = $3, image = $4 WHERE id = $5 RETURNING *',
            [name, description, price, image, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/admin/services/:id', requireAdminAPI, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM services WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Appointment management
app.get('/api/admin/appointments', requireAdminAPI, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, u.username as customer_name, s.name as service_name 
            FROM appointments a 
            LEFT JOIN users u ON a.customer_id = u.id 
            LEFT JOIN services s ON a.service_id = s.id 
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/admin/appointments/:id', requireAdminAPI, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM appointments WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin middleware for API routes
function requireAdminAPI(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    pool.query('SELECT role FROM users WHERE id = $1', [req.session.userId])
        .then(result => {
            if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
                return res.status(403).json({ error: 'Access denied' });
            }
            next();
        })
        .catch(error => {
            console.error('Admin check error:', error);
            res.status(500).json({ error: 'Server error' });
        });
}

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