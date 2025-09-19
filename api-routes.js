// Additional API routes for CMS functionality

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.userId && req.session.role === 'admin') {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
}

module.exports = function(app, pool) {
    
    // Auth routes (alternative endpoints)
    app.get('/api/auth/check', (req, res) => {
        if (req.session && req.session.userId) {
            res.json({ 
                authenticated: true, 
                user: { 
                    id: req.session.userId,
                    username: req.session.username,
                    role: req.session.role
                }
            });
        } else {
            res.json({ authenticated: false });
        }
    });

    app.post('/api/auth/logout', (req, res) => {
        req.session.destroy();
        res.json({ success: true });
    });

    // Pages API
    app.get('/api/pages', async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM pages ORDER BY name'
            );
            res.json({ success: true, pages: result.rows });
        } catch (error) {
            console.error('Error fetching pages:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.get('/api/pages/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'SELECT * FROM pages WHERE id = $1',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Page not found' });
            }
            
            res.json({ success: true, page: result.rows[0] });
        } catch (error) {
            console.error('Error fetching page:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.put('/api/pages/:id', requireAuth, async (req, res) => {
        try {
            const { id } = req.params;
            const { title, slug, meta_description, status } = req.body;
            
            const result = await pool.query(
                'UPDATE pages SET title = $1, slug = $2, meta_description = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
                [title, slug, meta_description, status, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Page not found' });
            }
            
            res.json({ success: true, page: result.rows[0] });
        } catch (error) {
            console.error('Error updating page:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Sections API
    app.get('/api/pages/:pageId/sections', async (req, res) => {
        try {
            const { pageId } = req.params;
            const result = await pool.query(
                'SELECT * FROM sections WHERE page_id = $1 ORDER BY position',
                [pageId]
            );
            res.json({ success: true, sections: result.rows });
        } catch (error) {
            console.error('Error fetching sections:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.post('/api/pages/:pageId/sections', requireAuth, async (req, res) => {
        try {
            const { pageId } = req.params;
            const { name, title, type, position } = req.body;
            
            const result = await pool.query(
                'INSERT INTO sections (page_id, name, title, type, position) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [pageId, name, title, type, position || 0]
            );
            
            res.json({ success: true, section: result.rows[0] });
        } catch (error) {
            console.error('Error creating section:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.put('/api/sections/:id', requireAuth, async (req, res) => {
        try {
            const { id } = req.params;
            const { name, title, type, position, status } = req.body;
            
            const result = await pool.query(
                'UPDATE sections SET name = $1, title = $2, type = $3, position = $4, status = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
                [name, title, type, position, status, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Section not found' });
            }
            
            res.json({ success: true, section: result.rows[0] });
        } catch (error) {
            console.error('Error updating section:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.delete('/api/sections/:id', requireAuth, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'DELETE FROM sections WHERE id = $1 RETURNING *',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Section not found' });
            }
            
            res.json({ success: true, message: 'Section deleted' });
        } catch (error) {
            console.error('Error deleting section:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Content API
    app.get('/api/sections/:sectionId/content', async (req, res) => {
        try {
            const { sectionId } = req.params;
            const result = await pool.query(
                'SELECT * FROM content WHERE section_id = $1 ORDER BY position',
                [sectionId]
            );
            res.json({ success: true, content: result.rows });
        } catch (error) {
            console.error('Error fetching content:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.post('/api/sections/:sectionId/content', requireAuth, async (req, res) => {
        try {
            const { sectionId } = req.params;
            const { type, title, content, image_url, link_url, position, metadata } = req.body;
            
            const result = await pool.query(
                'INSERT INTO content (section_id, type, title, content, image_url, link_url, position, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
                [sectionId, type, title, content, image_url, link_url, position || 0, JSON.stringify(metadata || {})]
            );
            
            res.json({ success: true, content: result.rows[0] });
        } catch (error) {
            console.error('Error creating content:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.put('/api/content/:id', requireAuth, async (req, res) => {
        try {
            const { id } = req.params;
            const { type, title, content, image_url, link_url, position, metadata, status } = req.body;
            
            const result = await pool.query(
                'UPDATE content SET type = $1, title = $2, content = $3, image_url = $4, link_url = $5, position = $6, metadata = $7, status = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *',
                [type, title, content, image_url, link_url, position, JSON.stringify(metadata || {}), status, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Content not found' });
            }
            
            res.json({ success: true, content: result.rows[0] });
        } catch (error) {
            console.error('Error updating content:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.delete('/api/content/:id', requireAuth, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'DELETE FROM content WHERE id = $1 RETURNING *',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Content not found' });
            }
            
            res.json({ success: true, message: 'Content deleted' });
        } catch (error) {
            console.error('Error deleting content:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Services API
    app.get('/api/services', async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM services WHERE status = $1 ORDER BY position',
                ['active']
            );
            res.json({ success: true, services: result.rows });
        } catch (error) {
            console.error('Error fetching services:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.get('/api/services/:id', requireAuth, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Service not found' });
            }
            
            const service = result.rows[0];
            // Parse features JSON if it exists
            if (service.features) {
                try {
                    service.features = JSON.parse(service.features);
                } catch (e) {
                    service.features = [];
                }
            }
            
            res.json({ success: true, service });
        } catch (error) {
            console.error('Error fetching service:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.post('/api/services', requireAuth, async (req, res) => {
        try {
            const { name, description, price_from, price_to, currency, image_url, category, features, duration, position } = req.body;
            
            const result = await pool.query(
                'INSERT INTO services (name, description, price_from, price_to, currency, image_url, category, features, duration, position) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
                [name, description, price_from, price_to, currency || 'VND', image_url, category, JSON.stringify(features || []), duration, position || 0]
            );
            
            res.json({ success: true, service: result.rows[0] });
        } catch (error) {
            console.error('Error creating service:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.put('/api/services/:id', requireAuth, async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, price_from, price_to, currency, image_url, category, features, duration, position, status } = req.body;
            
            const result = await pool.query(
                'UPDATE services SET name = $1, description = $2, price_from = $3, price_to = $4, currency = $5, image_url = $6, category = $7, features = $8, duration = $9, position = $10, status = $11, updated_at = CURRENT_TIMESTAMP WHERE id = $12 RETURNING *',
                [name, description, price_from, price_to, currency, image_url, category, JSON.stringify(features || []), duration, position, status, id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Service not found' });
            }
            
            res.json({ success: true, service: result.rows[0] });
        } catch (error) {
            console.error('Error updating service:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.delete('/api/services/:id', requireAuth, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'DELETE FROM services WHERE id = $1 RETURNING *',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Service not found' });
            }
            
            res.json({ success: true, message: 'Service deleted' });
        } catch (error) {
            console.error('Error deleting service:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Site Settings API
    app.get('/api/settings', async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM site_settings ORDER BY group_name, key'
            );
            res.json({ success: true, settings: result.rows });
        } catch (error) {
            console.error('Error fetching settings:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.put('/api/settings/:key', requireAuth, async (req, res) => {
        try {
            const { key } = req.params;
            const { value } = req.body;
            
            const result = await pool.query(
                'UPDATE site_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2 RETURNING *',
                [value, key]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Setting not found' });
            }
            
            res.json({ success: true, setting: result.rows[0] });
        } catch (error) {
            console.error('Error updating setting:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Gallery API
    app.get('/api/gallery', async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM gallery WHERE status = $1 ORDER BY position',
                ['active']
            );
            res.json({ success: true, gallery: result.rows });
        } catch (error) {
            console.error('Error fetching gallery:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.post('/api/gallery', requireAuth, async (req, res) => {
        try {
            const { title, description, image_url, category, tags, position } = req.body;
            
            const result = await pool.query(
                'INSERT INTO gallery (title, description, image_url, category, tags, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [title, description, image_url, category, JSON.stringify(tags || []), position || 0]
            );
            
            res.json({ success: true, gallery: result.rows[0] });
        } catch (error) {
            console.error('Error creating gallery item:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Testimonials API
    app.get('/api/testimonials', async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM testimonials WHERE status = $1 ORDER BY position',
                ['active']
            );
            res.json({ success: true, testimonials: result.rows });
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.post('/api/testimonials', requireAuth, async (req, res) => {
        try {
            const { customer_name, customer_title, customer_location, customer_avatar, content, rating, position } = req.body;
            
            const result = await pool.query(
                'INSERT INTO testimonials (customer_name, customer_title, customer_location, customer_avatar, content, rating, position) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [customer_name, customer_title, customer_location, customer_avatar, content, rating || 5, position || 0]
            );
            
            res.json({ success: true, testimonial: result.rows[0] });
        } catch (error) {
            console.error('Error creating testimonial:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Celebrities API
    app.get('/api/celebrities', async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM celebrities WHERE status = $1 ORDER BY position',
                ['active']
            );
            res.json({ success: true, celebrities: result.rows });
        } catch (error) {
            console.error('Error fetching celebrities:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.post('/api/celebrities', requireAuth, async (req, res) => {
        try {
            const { name, title, avatar_url, description, position } = req.body;
            
            const result = await pool.query(
                'INSERT INTO celebrities (name, title, avatar_url, description, position) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [name, title, avatar_url, description, position || 0]
            );
            
            res.json({ success: true, celebrity: result.rows[0] });
        } catch (error) {
            console.error('Error creating celebrity:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Stores API
    app.get('/api/stores', async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM stores WHERE status = $1 ORDER BY position',
                ['active']
            );
            res.json({ success: true, stores: result.rows });
        } catch (error) {
            console.error('Error fetching stores:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.post('/api/stores', requireAuth, async (req, res) => {
        try {
            const { name, address, phone, email, working_hours, latitude, longitude, image_url, position } = req.body;
            
            const result = await pool.query(
                'INSERT INTO stores (name, address, phone, email, working_hours, latitude, longitude, image_url, position) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
                [name, address, phone, email, working_hours, latitude, longitude, image_url, position || 0]
            );
            
            res.json({ success: true, store: result.rows[0] });
        } catch (error) {
            console.error('Error creating store:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Navigation API
    app.get('/api/navigation', async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM navigation WHERE status = $1 ORDER BY position',
                ['active']
            );
            res.json({ success: true, navigation: result.rows });
        } catch (error) {
            console.error('Error fetching navigation:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Blog Posts API
    app.get('/api/blog-posts', async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM blog_posts WHERE status = $1 ORDER BY published_at DESC',
                ['published']
            );
            res.json({ success: true, posts: result.rows });
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    app.post('/api/blog-posts', requireAuth, async (req, res) => {
        try {
            const { title, slug, excerpt, content, featured_image, author, category, tags, meta_title, meta_description, status } = req.body;
            
            const result = await pool.query(
                'INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, author, category, tags, meta_title, meta_description, status, published_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
                [title, slug, excerpt, content, featured_image, author, category, JSON.stringify(tags || []), meta_title, meta_description, status || 'draft', status === 'published' ? new Date() : null]
            );
            
            res.json({ success: true, post: result.rows[0] });
        } catch (error) {
            console.error('Error creating blog post:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });
};