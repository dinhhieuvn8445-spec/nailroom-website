const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'nailroom_db',
    password: 'postgres',
    port: 5432,
});

async function addSampleServices() {
    try {
        // Check if services already exist
        const existingServices = await pool.query('SELECT COUNT(*) FROM services');
        
        if (parseInt(existingServices.rows[0].count) > 0) {
            console.log('✅ Services already exist');
            return;
        }

        // Add sample services
        const services = [
            {
                name: 'Nail Art Cơ Bản',
                description: 'Dịch vụ nail art cơ bản với các mẫu đơn giản, phù hợp cho người mới bắt đầu',
                price: 150000,
                image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400'
            },
            {
                name: 'Nail Art Cao Cấp',
                description: 'Dịch vụ nail art cao cấp với các mẫu phức tạp, đính đá, vẽ tay',
                price: 300000,
                image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400'
            },
            {
                name: 'Gel Polish',
                description: 'Sơn gel bền màu, giữ được 2-3 tuần, nhiều màu sắc lựa chọn',
                price: 200000,
                image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400'
            },
            {
                name: 'Manicure + Pedicure',
                description: 'Combo chăm sóc móng tay và móng chân hoàn chỉnh',
                price: 250000,
                image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'
            },
            {
                name: 'Nail Extension',
                description: 'Nối móng bằng gel hoặc acrylic, tạo độ dài và hình dáng mong muốn',
                price: 400000,
                image: 'https://images.unsplash.com/photo-1599948128020-9a44d19b5884?w=400'
            },
            {
                name: 'Nail Repair',
                description: 'Sửa chữa móng bị gãy, nứt, phục hồi móng tự nhiên',
                price: 100000,
                image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400'
            }
        ];

        for (const service of services) {
            await pool.query(
                'INSERT INTO services (name, description, price, image) VALUES ($1, $2, $3, $4)',
                [service.name, service.description, service.price, service.image]
            );
        }

        console.log('✅ Sample services added successfully!');
        console.log(`Added ${services.length} services to database`);

    } catch (error) {
        console.error('❌ Error adding sample services:', error);
    } finally {
        await pool.end();
    }
}

addSampleServices();