-- Database schema cho hệ thống quản trị nội dung Nailroom Website

-- Bảng pages: Quản lý tất cả các trang
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    meta_description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng sections: Quản lý các section trong mỗi trang
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(200),
    type VARCHAR(50) NOT NULL, -- hero, about, services, gallery, testimonials, etc.
    position INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng content: Nội dung chi tiết của từng section
CREATE TABLE IF NOT EXISTS content (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- text, image, video, slider, etc.
    title VARCHAR(200),
    content TEXT,
    image_url TEXT,
    link_url TEXT,
    position INTEGER DEFAULT 0,
    metadata JSONB, -- Lưu thêm thông tin như alt text, caption, etc.
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng services: Quản lý dịch vụ
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_from INTEGER,
    price_to INTEGER,
    currency VARCHAR(10) DEFAULT 'VND',
    image_url TEXT,
    category VARCHAR(50), -- nail, mi, long-may, spa
    features JSONB, -- Danh sách tính năng
    duration INTEGER, -- Thời gian thực hiện (phút)
    position INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng gallery: Quản lý thư viện ảnh
CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    description TEXT,
    image_url TEXT NOT NULL,
    category VARCHAR(50), -- nail-art, mi, long-may, store
    tags JSONB, -- Tags để tìm kiếm
    position INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng testimonials: Quản lý đánh giá khách hàng
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_title VARCHAR(100), -- Ca sĩ, Diễn viên, etc.
    customer_location VARCHAR(100),
    customer_avatar TEXT,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    position INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng celebrities: Quản lý khách hàng nổi tiếng
CREATE TABLE IF NOT EXISTS celebrities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100), -- Ca sĩ, Diễn viên, etc.
    avatar_url TEXT,
    description TEXT,
    position INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng stores: Quản lý hệ thống cửa hàng
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    working_hours VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    image_url TEXT,
    position INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng site_settings: Cài đặt chung của website
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    type VARCHAR(50) DEFAULT 'text', -- text, number, boolean, json, image
    description TEXT,
    group_name VARCHAR(50), -- general, contact, social, seo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng navigation: Quản lý menu điều hướng
CREATE TABLE IF NOT EXISTS navigation (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(200) NOT NULL,
    parent_id INTEGER REFERENCES navigation(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    target VARCHAR(20) DEFAULT '_self', -- _self, _blank
    icon VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng blog_posts: Quản lý bài viết blog
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    author VARCHAR(100),
    category VARCHAR(50),
    tags JSONB,
    meta_title VARCHAR(200),
    meta_description TEXT,
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dữ liệu mẫu cho pages
INSERT INTO pages (name, title, slug, meta_description) VALUES
('home', 'Trang chủ - Nailroom', 'index', 'Nailroom - Hệ thống nail Hàn Quốc hàng đầu tại Việt Nam'),
('about', 'Giới thiệu - Nailroom', 'gioi-thieu', 'Tìm hiểu về Nailroom - Thương hiệu làm đẹp uy tín'),
('services', 'Dịch vụ - Nailroom', 'dich-vu', 'Các dịch vụ nail, mi, lông mày chuyên nghiệp'),
('gallery', 'Thư viện ảnh - Nailroom', 'gallery', 'Bộ sưu tập nail art đẹp nhất'),
('academy', 'Học viện - Nailroom', 'hoc-vien', 'Học viện đào tạo MH The Beauty Lab'),
('contact', 'Liên hệ - Nailroom', 'lien-he', 'Thông tin liên hệ và hệ thống cửa hàng'),
('stores', 'Hệ thống cửa hàng', 'he-thong-cua-hang', 'Hệ thống 15 cửa hàng trên toàn quốc'),
('franchise', 'Nhượng quyền', 'franchise', 'Cơ hội nhượng quyền kinh doanh'),
('cooperation', 'Hợp tác', 'hop-tac', 'Cơ hội hợp tác kinh doanh'),
('blog', 'Blog', 'blog', 'Tin tức và bài viết về làm đẹp')
ON CONFLICT (slug) DO NOTHING;

-- Insert dữ liệu mẫu cho site_settings
INSERT INTO site_settings (key, value, type, description, group_name) VALUES
('site_title', 'Nailroom - You Love It, We Nail It!', 'text', 'Tiêu đề website', 'general'),
('site_description', 'Hệ thống nail Hàn Quốc hàng đầu tại Việt Nam', 'text', 'Mô tả website', 'general'),
('site_logo', 'https://nailroom.vn/wp-content/uploads/2023/11/Mit_s-House-Logo-52.png', 'image', 'Logo website', 'general'),
('contact_phone', '1900 1234', 'text', 'Số điện thoại liên hệ', 'contact'),
('contact_email', 'info@nailroom.vn', 'text', 'Email liên hệ', 'contact'),
('contact_address', '123 Nguyễn Trãi, Q.1, TP.HCM', 'text', 'Địa chỉ liên hệ', 'contact'),
('facebook_url', 'https://www.facebook.com/nailroom.official', 'text', 'Facebook URL', 'social'),
('instagram_url', 'https://www.instagram.com/nailroom_official', 'text', 'Instagram URL', 'social'),
('working_hours', '9:00 - 21:00 (Hàng ngày)', 'text', 'Giờ làm việc', 'contact')
ON CONFLICT (key) DO NOTHING;

-- Tạo indexes để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_sections_page_id ON sections(page_id);
CREATE INDEX IF NOT EXISTS idx_content_section_id ON content(section_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);