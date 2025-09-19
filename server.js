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
        
        // Create website_content table for managing website content
        await pool.query(`
            CREATE TABLE IF NOT EXISTS website_content (
                id SERIAL PRIMARY KEY,
                section VARCHAR(50) NOT NULL,
                content_key VARCHAR(100) NOT NULL,
                content_value TEXT,
                content_type VARCHAR(20) DEFAULT 'text',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(section, content_key)
            )
        `);
        
        // Create menu_items table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS menu_items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                url VARCHAR(255) NOT NULL,
                position INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create sliders table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sliders (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255),
                subtitle TEXT,
                description TEXT,
                image_url VARCHAR(255),
                button_text VARCHAR(100),
                button_url VARCHAR(255),
                position INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create gallery_items table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS gallery_items (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255),
                description TEXT,
                image_url VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                position INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create celebrities table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS celebrities (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                profession VARCHAR(255),
                image_url VARCHAR(255),
                position INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create testimonials table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS testimonials (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                customer_name VARCHAR(255) NOT NULL,
                customer_location VARCHAR(255),
                customer_image VARCHAR(255),
                position INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create store_locations table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS store_locations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                address TEXT NOT NULL,
                phone VARCHAR(50),
                working_hours VARCHAR(255),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert default website content if not exists
        await pool.query(`
            INSERT INTO website_content (section, content_key, content_value, content_type) 
            VALUES 
                -- Header Section
                ('header', 'logo_text', 'NAIL ROOM', 'text'),
                ('header', 'logo_image', 'https://nailroom.vn/wp-content/uploads/2023/11/Mit_s-House-Logo-52.png', 'image'),
                ('header', 'phone', '1900 1234', 'text'),
                ('header', 'email', 'info@nailroom.vn', 'text'),
                ('header', 'facebook_url', 'https://www.facebook.com/nailroom.official', 'text'),
                ('header', 'instagram_url', 'https://www.instagram.com/nailroom_official', 'text'),
                ('header', 'app_store_url', 'https://apps.apple.com/vn/app/nailroom/id1234567890', 'text'),
                ('header', 'google_play_url', 'https://play.google.com/store/apps/details?id=com.nailroom.app', 'text'),
                
                -- Hero Section
                ('hero', 'title', 'NAIL ROOM', 'text'),
                ('hero', 'slogan', 'You Love It, We Nail It!', 'text'),
                ('hero', 'korean_text', '네일룸', 'text'),
                ('hero', 'background_image', 'https://nailroom.vn/wp-content/uploads/bfi_thumb/Cover-odou4k6zt1b7c8hi14o5t9gbrcgbb5tymcd3a41lii.png', 'image'),
                
                -- Instagram Section
                ('instagram', 'title', 'NAILROOM INSTAGRAM', 'text'),
                
                -- Celebrities Section
                ('celebrities', 'title', 'KHÁCH HÀNG CỦA NAILROOM', 'text'),
                
                -- Testimonials Section
                ('testimonials', 'title', 'CẢM NHẬN VỀ NAILROOM', 'text'),
                
                -- About Section
                ('about', 'quote', 'You Love It. We Nail It!', 'text'),
                ('about', 'title', 'VỚI NAIL ROOM "AI CŨNG CÓ THỂ TRỞ NÊN ĐẸP HƠN"', 'text'),
                ('about', 'description1', 'Xuất phát là một hệ thống Nail Hàn Quốc, Nail Room luôn đặt trọn vẹn trái tim & tâm huyết vào việc làm đẹp cho các nàng.', 'text'),
                ('about', 'description2', 'Bởi thế, slogan của Naill Room là "Ai cũng có thể trở nên đẹp hơn". Đến với Nail Room và ra về như những phụ nữ xinh đẹp hơn, hạnh phúc hơn là điều chúng mình hướng tới.', 'text'),
                ('about', 'description3', 'Hãy ghé chơi với chúng mình để cảm nhận niềm vui từ việc yêu chiều bản thân nhé!', 'text'),
                ('about', 'image', 'https://nailroom.vn/wp-content/uploads/2019/09/Untitled-5.jpg', 'image'),
                ('about', 'button1_text', 'GIỚI THIỆU', 'text'),
                ('about', 'button1_url', '/gioi-thieu.html', 'text'),
                ('about', 'button2_text', 'HỆ THỐNG NAILROOM', 'text'),
                ('about', 'button2_url', '/he-thong-cua-hang.html', 'text'),
                
                -- Services Section
                ('services', 'title', 'DỊCH VỤ NAILROOM', 'text'),
                
                -- Academy Section
                ('academy', 'title', 'HỌC VIỆN MH THE BEAUTY LAB', 'text'),
                ('academy', 'description', 'Học viện đào tạo MH THE BEAUTY LAB là học viện Nail, Mi, Spa, Phun thêu chính thức của NAIL ROOM – Hệ thống nail Hàn Quốc hàng đầu tại Việt Nam hiện nay.', 'text'),
                ('academy', 'image', 'https://nailroom.vn/wp-content/uploads/2019/09/H%E1%BB%8Dc-vi%E1%BB%87n-NR.png', 'image'),
                
                -- Store Locations Section
                ('stores', 'title', 'Hệ thống Nailroom Stores', 'text'),
                ('stores', 'subtitle', '15 cơ sở trên toàn quốc', 'text'),
                
                -- CTA Section
                ('cta', 'title', 'Đặt lịch liền tay', 'text'),
                ('cta', 'subtitle', 'HƯỞNG NGAY ƯU ĐÃI', 'text'),
                ('cta', 'button_text', 'Đặt lịch ngay', 'text'),
                ('cta', 'phone_number', '1900066811', 'text'),
                
                -- Footer Section
                ('footer', 'logo_image', 'https://nailroom.vn/wp-content/uploads/2023/11/Mit_s-House-Logo-52.png', 'image'),
                ('footer', 'description', 'Nailroom - Thương hiệu làm đẹp hàng đầu với 7 năm kinh nghiệm và 15 cơ sở trên toàn quốc. Chúng tôi cam kết mang đến dịch vụ chất lượng cao với đội ngũ chuyên nghiệp.', 'text'),
                ('footer', 'facebook_url', 'https://www.facebook.com/nailroom.official', 'text'),
                ('footer', 'instagram_url', 'https://www.instagram.com/nailroom_official', 'text'),
                ('footer', 'address', '123 Nguyễn Trãi, Q.1, TP.HCM', 'text'),
                ('footer', 'phone', '1900 1234 (miễn phí)', 'text'),
                ('footer', 'email', 'info@nailroom.vn', 'text'),
                ('footer', 'working_hours', '9:00 - 21:00 (Hàng ngày)', 'text'),
                ('footer', 'copyright', '© 2024 Nailroom. All rights reserved.', 'text'),
                ('footer', 'app_store_url', 'https://apps.apple.com/vn/app/nailroom/id1234567890', 'text'),
                ('footer', 'google_play_url', 'https://play.google.com/store/apps/details?id=com.nailroom.app', 'text'),
                
                -- SEO Settings
                ('seo', 'meta_title', 'NAILROOM - Hệ thống làm đẹp chuyên nghiệp', 'text'),
                ('seo', 'meta_description', 'Dịch vụ làm nail, nối mi, điêu khắc chân mày chuyên nghiệp tại NAILROOM. Đặt lịch ngay!', 'text'),
                ('seo', 'meta_keywords', 'nail, nối mi, làm đẹp, spa, salon', 'text')
            ON CONFLICT (section, content_key) DO NOTHING
        `);

        // Insert default celebrities
        const celebrityCheck = await pool.query('SELECT COUNT(*) FROM celebrities');
        if (parseInt(celebrityCheck.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO celebrities (name, profession, image_url, position) 
                VALUES 
                    ('Tóc Tiên', 'Ca sĩ', 'https://nailroom.vn/wp-content/uploads/2019/09/KOLs_1.png', 1),
                    ('Angela Phương Trinh', 'Diễn viên', 'https://nailroom.vn/wp-content/uploads/2019/09/KOLs_2.png', 2),
                    ('Nga Wendy', 'Hot girl', 'https://nailroom.vn/wp-content/uploads/2019/09/KOLs_3.png', 3),
                    ('MLee', 'Ca sĩ', 'https://nailroom.vn/wp-content/uploads/2019/09/KOLs_4.png', 4),
                    ('Liz', 'Ca sĩ', 'https://nailroom.vn/wp-content/uploads/2019/09/KOLs_5.png', 5),
                    ('Khả Ngân', 'Hot girl', 'https://nailroom.vn/wp-content/uploads/2019/09/KOLs_6.png', 6),
                    ('Huyền My', 'Á hậu', 'https://nailroom.vn/wp-content/uploads/2019/09/KOLs_7.png', 7),
                    ('Huyền Lizzie', 'Diễn viên', 'https://nailroom.vn/wp-content/uploads/2019/09/KOLs_8.png', 8),
                    ('Hoàng Ku', 'Stylist', 'https://nailroom.vn/wp-content/uploads/2019/09/KOLs_9.png', 9),
                    ('Hiền Hồ', 'Ca sĩ', 'https://nailroom.vn/wp-content/uploads/2019/09/KOLs_10.png', 10),
                    ('Đan Lê', 'Diễn viên', 'https://nailroom.vn/wp-content/uploads/2019/09/KOLs_11.png', 11),
                    ('Bích Phương', 'Ca sĩ', 'https://nailroom.vn/wp-content/uploads/2019/09/KOLs_12.png', 12),
                    ('An Japan', 'Hot girl', 'https://nailroom.vn/wp-content/uploads/2019/09/KOLs_13.png', 13),
                    ('Ngọc Thảo', 'Diễn viên', 'https://nailroom.vn/wp-content/uploads/2019/09/KOLs_14.png', 14)
            `);
        }

        // Insert default testimonials
        const testimonialCheck = await pool.query('SELECT COUNT(*) FROM testimonials');
        if (parseInt(testimonialCheck.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO testimonials (content, customer_name, customer_location, customer_image, position) 
                VALUES 
                    ('Làm nail tại Nail Room max xinh mà còn bền kinh khủng. Mình làm một bộ móng mà chơi dài mấy tháng liền, nhân viên lại dễ thương, cute nữa, mãi yêu Nail Room.', 'Hương Nhi', 'Hà Nội', 'https://nailroom.vn/wp-content/uploads/bfi_thumb/Feedback1-odlxxa2a5gqsejbilvtqr9ym41jzdcxzaayl03v6co.png', 1),
                    ('パステル紫ネイル?△ 予想外に三角の飾りが大きいけど、色味は可愛いしなんと言ってもネイル代が安いからまあいっか！って感じ?♥️', 'Kana Umemura', 'Nhật Bản', 'https://nailroom.vn/wp-content/uploads/bfi_thumb/Feedback4-odlxxcvspyundd7f5f1mgr8zw7630g96aox1fxqzu0.png', 2),
                    ('Trung thành với duy nhất 1 brand làm nail thui nhé 😍. Chưa thấy ở đâu ổn hơn Nail Room luôn đó. Chính xác là giá cả và chất lượng đi đôi với nhau 😍. Nhân viên còn đáng iu hết sức. Định là sơn trơn thôi mà lần nào cũng phải đính tí lấp lánh ánh bình minh mới chịu được 😂 À mi ở đây cũng rất hợp style siêu tự nhiên, siêu đáng yêu của mình. Hỉ ❤️', 'Diệp Anh', 'Đà Nẵng', 'https://nailroom.vn/wp-content/uploads/bfi_thumb/Feedback3-odlxxbxyj4td1r8sawmzw9hjatapsr5fyk9jynse08.png', 3),
                    ('The best nail salon I had in Danang City. Full service include nail service, eyelash extension, facial, and hair wash.', 'Kim Jeong', 'Hàn Quốc', 'https://nailroom.vn/wp-content/uploads/bfi_thumb/Feedback5-odlxx94fympi2xcvrdf46s75inom5nu8y6b3itwkiw.png', 4),
                    ('Mình làm móng 3 lần ở NAIL ROOM đều làm với chị Trúc và đều làm đúng một bộ ombre + marble. Tiệm đẹp, nhân viên nhẹ nhàng, dễ thương, đi đúng giờ hay gặp người nổi tiếng =)))))', 'Vũ Thảo', 'Hà Nội', 'https://nailroom.vn/wp-content/uploads/bfi_thumb/Feedback2-odlxxb04cas2q5a5ge8dbrq2pffcl21pmfm2hdts6g.png', 5)
            `);
        }

        // Insert default store locations
        const storeCheck = await pool.query('SELECT COUNT(*) FROM store_locations');
        if (parseInt(storeCheck.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO store_locations (name, address, phone, working_hours) 
                VALUES 
                    ('Nailroom Nguyễn Trãi', '123 Nguyễn Trãi, Q.1, TP.HCM', '028 3123 4567', '9:00 - 21:00 (Hàng ngày)'),
                    ('Nailroom Lê Văn Sỹ', '456 Lê Văn Sỹ, Q.3, TP.HCM', '028 3234 5678', '9:00 - 21:00 (Hàng ngày)'),
                    ('Nailroom Cầu Giấy', '789 Cầu Giấy, Hà Nội', '024 3345 6789', '9:00 - 21:00 (Hàng ngày)'),
                    ('Nailroom Đà Nẵng', '321 Trần Phú, Đà Nẵng', '0236 3456 789', '9:00 - 21:00 (Hàng ngày)'),
                    ('Nailroom Cần Thơ', '654 Nguyễn Văn Cừ, Cần Thơ', '0292 3567 890', '9:00 - 21:00 (Hàng ngày)'),
                    ('Nailroom Biên Hòa', '987 Võ Thị Sáu, Biên Hòa', '0251 3678 901', '9:00 - 21:00 (Hàng ngày)')
            `);
        }

        // Insert default menu items
        const menuCheck = await pool.query('SELECT COUNT(*) FROM menu_items');
        if (parseInt(menuCheck.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO menu_items (name, url, position) 
                VALUES 
                    ('Trang chủ', '/', 1),
                    ('Giới thiệu', '/gioi-thieu.html', 2),
                    ('Dịch vụ', '/dich-vu.html', 3),
                    ('Thư viện', '/gallery.html', 4),
                    ('Blog', '/blog.html', 5),
                    ('Liên hệ', '/lien-he.html', 6),
                    ('Đặt lịch', '/dat-lich.html', 7)
            `);
        }
        
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

// Website Content Management API Endpoints

// Get website content by section
app.get('/api/content/:section', async (req, res) => {
    try {
        const { section } = req.params;
        
        const result = await pool.query(
            'SELECT content_key, content_value, content_type FROM website_content WHERE section = $1',
            [section]
        );
        
        const content = {};
        result.rows.forEach(row => {
            content[row.content_key] = {
                value: row.content_value,
                type: row.content_type
            };
        });
        
        res.json({ success: true, content });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy nội dung' });
    }
});

// Update website content
app.post('/api/content/:section', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { section } = req.params;
        const contentData = req.body;
        
        // Update each content item
        for (const [key, value] of Object.entries(contentData)) {
            await pool.query(`
                INSERT INTO website_content (section, content_key, content_value, updated_at) 
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                ON CONFLICT (section, content_key) 
                DO UPDATE SET content_value = $3, updated_at = CURRENT_TIMESTAMP
            `, [section, key, value]);
        }
        
        res.json({ success: true, message: 'Đã cập nhật nội dung thành công' });
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật nội dung' });
    }
});

// Get all services
app.get('/api/services', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM services ORDER BY created_at DESC');
        res.json({ success: true, services: result.rows });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách dịch vụ' });
    }
});

// Add new service
app.post('/api/services', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { name, description, price, image } = req.body;
        
        if (!name || !price) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền tên và giá dịch vụ' });
        }
        
        const result = await pool.query(
            'INSERT INTO services (name, description, price, image) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, parseFloat(price), image || null]
        );
        
        res.json({ success: true, service: result.rows[0], message: 'Đã thêm dịch vụ thành công' });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi thêm dịch vụ' });
    }
});

// Update service
app.put('/api/services/:id', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { id } = req.params;
        const { name, description, price, image } = req.body;
        
        const result = await pool.query(
            'UPDATE services SET name = $1, description = $2, price = $3, image = $4 WHERE id = $5 RETURNING *',
            [name, description, parseFloat(price), image, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ' });
        }
        
        res.json({ success: true, service: result.rows[0], message: 'Đã cập nhật dịch vụ thành công' });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật dịch vụ' });
    }
});

// Delete service
app.delete('/api/services/:id', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy dịch vụ' });
        }
        
        res.json({ success: true, message: 'Đã xóa dịch vụ thành công' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa dịch vụ' });
    }
});

// Menu Management APIs
// Get all menu items
app.get('/api/menu', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM menu_items ORDER BY position ASC');
        res.json({ success: true, menu: result.rows });
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách menu' });
    }
});

// Add new menu item
app.post('/api/menu', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { name, url, position } = req.body;
        
        if (!name || !url) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền tên và đường dẫn menu' });
        }
        
        const result = await pool.query(
            'INSERT INTO menu_items (name, url, position) VALUES ($1, $2, $3) RETURNING *',
            [name, url, position || 0]
        );
        
        res.json({ success: true, menu: result.rows[0], message: 'Đã thêm menu thành công' });
    } catch (error) {
        console.error('Error adding menu:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi thêm menu' });
    }
});

// Update menu item
app.put('/api/menu/:id', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { id } = req.params;
        const { name, url, position, is_active } = req.body;
        
        const result = await pool.query(
            'UPDATE menu_items SET name = $1, url = $2, position = $3, is_active = $4 WHERE id = $5 RETURNING *',
            [name, url, position, is_active, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy menu' });
        }
        
        res.json({ success: true, menu: result.rows[0], message: 'Đã cập nhật menu thành công' });
    } catch (error) {
        console.error('Error updating menu:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật menu' });
    }
});

// Delete menu item
app.delete('/api/menu/:id', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM menu_items WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy menu' });
        }
        
        res.json({ success: true, message: 'Đã xóa menu thành công' });
    } catch (error) {
        console.error('Error deleting menu:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa menu' });
    }
});

// Gallery Management APIs
// Get all gallery items
app.get('/api/gallery', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM gallery_items WHERE is_active = true ORDER BY position ASC');
        res.json({ success: true, gallery: result.rows });
    } catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy thư viện ảnh' });
    }
});

// Add new gallery item
app.post('/api/gallery', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { title, description, image_url, category, position } = req.body;
        
        if (!image_url) {
            return res.status(400).json({ success: false, message: 'Vui lòng tải lên hình ảnh' });
        }
        
        const result = await pool.query(
            'INSERT INTO gallery_items (title, description, image_url, category, position) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, image_url, category, position || 0]
        );
        
        res.json({ success: true, gallery: result.rows[0], message: 'Đã thêm ảnh thành công' });
    } catch (error) {
        console.error('Error adding gallery item:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi thêm ảnh' });
    }
});

// Delete gallery item
app.delete('/api/gallery/:id', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM gallery_items WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy ảnh' });
        }
        
        res.json({ success: true, message: 'Đã xóa ảnh thành công' });
    } catch (error) {
        console.error('Error deleting gallery item:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa ảnh' });
    }
});

// Celebrities Management APIs
// Get all celebrities
app.get('/api/celebrities', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM celebrities WHERE is_active = true ORDER BY position ASC');
        res.json({ success: true, celebrities: result.rows });
    } catch (error) {
        console.error('Error fetching celebrities:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách celebrities' });
    }
});

// Add new celebrity
app.post('/api/celebrities', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { name, profession, image_url, position } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền tên celebrity' });
        }
        
        const result = await pool.query(
            'INSERT INTO celebrities (name, profession, image_url, position) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, profession, image_url, position || 0]
        );
        
        res.json({ success: true, celebrity: result.rows[0], message: 'Đã thêm celebrity thành công' });
    } catch (error) {
        console.error('Error adding celebrity:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi thêm celebrity' });
    }
});

// Delete celebrity
app.delete('/api/celebrities/:id', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM celebrities WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy celebrity' });
        }
        
        res.json({ success: true, message: 'Đã xóa celebrity thành công' });
    } catch (error) {
        console.error('Error deleting celebrity:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa celebrity' });
    }
});

// Testimonials Management APIs
// Get all testimonials
app.get('/api/testimonials', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM testimonials WHERE is_active = true ORDER BY position ASC');
        res.json({ success: true, testimonials: result.rows });
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách testimonials' });
    }
});

// Add new testimonial
app.post('/api/testimonials', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { content, customer_name, customer_location, customer_image, position } = req.body;
        
        if (!content || !customer_name) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền nội dung và tên khách hàng' });
        }
        
        const result = await pool.query(
            'INSERT INTO testimonials (content, customer_name, customer_location, customer_image, position) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [content, customer_name, customer_location, customer_image, position || 0]
        );
        
        res.json({ success: true, testimonial: result.rows[0], message: 'Đã thêm testimonial thành công' });
    } catch (error) {
        console.error('Error adding testimonial:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi thêm testimonial' });
    }
});

// Delete testimonial
app.delete('/api/testimonials/:id', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM testimonials WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy testimonial' });
        }
        
        res.json({ success: true, message: 'Đã xóa testimonial thành công' });
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa testimonial' });
    }
});

// Store Locations Management APIs
// Get all store locations
app.get('/api/stores', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM store_locations WHERE is_active = true ORDER BY id ASC');
        res.json({ success: true, stores: result.rows });
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách cửa hàng' });
    }
});

// Add new store location
app.post('/api/stores', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { name, address, phone, working_hours } = req.body;
        
        if (!name || !address) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền tên và địa chỉ cửa hàng' });
        }
        
        const result = await pool.query(
            'INSERT INTO store_locations (name, address, phone, working_hours) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, address, phone, working_hours]
        );
        
        res.json({ success: true, store: result.rows[0], message: 'Đã thêm cửa hàng thành công' });
    } catch (error) {
        console.error('Error adding store:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi thêm cửa hàng' });
    }
});

// Delete store location
app.delete('/api/stores/:id', async (req, res) => {
    try {
        // Check if user is admin
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM store_locations WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy cửa hàng' });
        }
        
        res.json({ success: true, message: 'Đã xóa cửa hàng thành công' });
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa cửa hàng' });
    }
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