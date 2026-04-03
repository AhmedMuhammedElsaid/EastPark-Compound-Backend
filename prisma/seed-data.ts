import 'dotenv/config';
import * as argon2 from 'argon2';
import {
    PrismaClient,
    Role,
    ShopCategory,
    OrderStatus,
    PaymentMethod,
    AnnouncementCategory,
    FeedbackCategory,
    FeedbackStatus,
    NotificationType,
    ElectionVisibilityMode,
} from '@prisma/client';

const db = new PrismaClient();

async function main() {
    const merchantCount = await db.user.count({
        where: { role: Role.MERCHANT },
    });
    if (merchantCount > 0) {
        console.log('Already seeded — skipping.');
        return;
    }

    const admin = await db.user.findFirstOrThrow({
        where: { role: Role.ADMIN },
    });

    const mp = await argon2.hash('Merchant#1234@');
    const rp = await argon2.hash('Resident#1234@');

    // ── Merchants ──────────────────────────────────────────────────────────────
    const [m1, m2, m3, m4, m5] = await Promise.all([
        db.user.create({
            data: {
                name: 'Youssef Kamal',
                email: 'merchant1@eastpark.app',
                phone: '+201010000001',
                passwordHash: mp,
                role: Role.MERCHANT,
                isVerified: true,
            },
        }),
        db.user.create({
            data: {
                name: 'Nadia Hassan',
                email: 'merchant2@eastpark.app',
                phone: '+201010000002',
                passwordHash: mp,
                role: Role.MERCHANT,
                isVerified: true,
            },
        }),
        db.user.create({
            data: {
                name: 'Khaled Samir',
                email: 'merchant3@eastpark.app',
                phone: '+201010000003',
                passwordHash: mp,
                role: Role.MERCHANT,
                isVerified: true,
            },
        }),
        db.user.create({
            data: {
                name: 'Amira Fathy',
                email: 'merchant4@eastpark.app',
                phone: '+201010000004',
                passwordHash: mp,
                role: Role.MERCHANT,
                isVerified: true,
            },
        }),
        db.user.create({
            data: {
                name: 'Tarek Mansour',
                email: 'merchant5@eastpark.app',
                phone: '+201010000005',
                passwordHash: mp,
                role: Role.MERCHANT,
                isVerified: true,
            },
        }),
    ]);

    // ── Residents ──────────────────────────────────────────────────────────────
    const [r1, r2, r3, r4, r5] = await Promise.all([
        db.user.create({
            data: {
                name: 'Omar Sherif',
                email: 'resident1@eastpark.app',
                phone: '+201001234001',
                unitNumber: 'A101',
                passwordHash: rp,
                role: Role.RESIDENT,
                isVerified: true,
            },
        }),
        db.user.create({
            data: {
                name: 'Salma Ibrahim',
                email: 'resident2@eastpark.app',
                phone: '+201001234002',
                unitNumber: 'A102',
                passwordHash: rp,
                role: Role.RESIDENT,
                isVerified: true,
            },
        }),
        db.user.create({
            data: {
                name: 'Hassan Ali',
                email: 'resident3@eastpark.app',
                phone: '+201001234003',
                unitNumber: 'B201',
                passwordHash: rp,
                role: Role.RESIDENT,
                isVerified: true,
            },
        }),
        db.user.create({
            data: {
                name: 'Dina Mostafa',
                email: 'resident4@eastpark.app',
                phone: '+201001234004',
                unitNumber: 'B202',
                passwordHash: rp,
                role: Role.RESIDENT,
                isVerified: true,
            },
        }),
        db.user.create({
            data: {
                name: 'Karim Nabil',
                email: 'resident5@eastpark.app',
                phone: '+201001234005',
                unitNumber: 'C301',
                passwordHash: rp,
                role: Role.RESIDENT,
                isVerified: true,
            },
        }),
        db.user.create({
            data: {
                name: 'Karim Nabil',
                email: 'resident5@eastpark.app',
                phone: '+201001234005',
                unitNumber: 'C301',
                passwordHash: rp,
                role: Role.RESIDENT,
                isVerified: true,
            },
        }),
        db.user.create({
            data: {
                name: 'Nourhan',
                email: 'nourhan@eastpark.app',
                phone: '+201001234006',
                unitNumber: 'C302',
                passwordHash: rp,
                role: Role.ADMIN,
                isVerified: true,
            },
        }),
    ]);

    console.log('✓ Users created');

    const wh = {
        mon: { open: '08:00', close: '22:00', closed: false },
        tue: { open: '08:00', close: '22:00', closed: false },
        wed: { open: '08:00', close: '22:00', closed: false },
        thu: { open: '08:00', close: '22:00', closed: false },
        fri: { open: '10:00', close: '23:00', closed: false },
        sat: { open: '10:00', close: '23:00', closed: false },
        sun: { open: '08:00', close: '22:00', closed: false },
    };

    // ── Shops ──────────────────────────────────────────────────────────────────
    const cafe = await db.shop.create({
        data: {
            name: 'The Brew Corner',
            nameAr: 'ركن القهوة',
            description: 'Specialty coffee & fresh pastries',
            descriptionAr: 'قهوة مميزة ومعجنات طازجة',
            category: ShopCategory.CAFE_AND_FOOD,
            workingHours: wh,
            isOpen: true,
            phone: '+201010000001',
            whatsapp: '+201010000001',
            deliveryTime: 25,
            merchantId: m1.id,
        },
    });
    const grocery = await db.shop.create({
        data: {
            name: 'Al Baraka Grocery',
            nameAr: 'بقالة البركة',
            description: 'Daily essentials & fresh produce',
            descriptionAr: 'احتياجات يومية ومنتجات طازجة',
            category: ShopCategory.GROCERY,
            workingHours: wh,
            isOpen: true,
            phone: '+201010000002',
            whatsapp: '+201010000002',
            deliveryTime: 20,
            merchantId: m2.id,
        },
    });
    const butcher = await db.shop.create({
        data: {
            name: 'Al Salam Butcher',
            nameAr: 'جزارة السلام',
            description: 'Fresh halal meat & poultry',
            descriptionAr: 'لحوم ودواجن حلال طازجة',
            category: ShopCategory.BUTCHER,
            workingHours: wh,
            isOpen: true,
            phone: '+201010000003',
            whatsapp: '+201010000003',
            deliveryTime: 30,
            merchantId: m3.id,
        },
    });
    const services = await db.shop.create({
        data: {
            name: 'East Fix Services',
            nameAr: 'خدمات إيست فيكس',
            description: 'Home maintenance & repairs',
            descriptionAr: 'صيانة وإصلاح المنازل',
            category: ShopCategory.SERVICES,
            workingHours: wh,
            isOpen: true,
            phone: '+201010000004',
            whatsapp: '+201010000004',
            deliveryTime: 60,
            merchantId: m4.id,
        },
    });
    const health = await db.shop.create({
        data: {
            name: 'Green Basket',
            nameAr: 'السلة الخضراء',
            description: 'Organic & health foods',
            descriptionAr: 'أغذية عضوية وصحية',
            category: ShopCategory.OTHER,
            workingHours: wh,
            isOpen: true,
            phone: '+201010000005',
            whatsapp: '+201010000005',
            deliveryTime: 35,
            merchantId: m5.id,
        },
    });

    // ── Shop Photos ────────────────────────────────────────────────────────────
    await db.shopPhoto.createMany({
        data: [
            {
                shopId: cafe.id,
                url: 'https://picsum.photos/seed/cafe1/800/600',
                order: 0,
            },
            {
                shopId: cafe.id,
                url: 'https://picsum.photos/seed/cafe2/800/600',
                order: 1,
            },
            {
                shopId: cafe.id,
                url: 'https://picsum.photos/seed/cafe3/800/600',
                order: 2,
            },
            {
                shopId: grocery.id,
                url: 'https://picsum.photos/seed/groc1/800/600',
                order: 0,
            },
            {
                shopId: grocery.id,
                url: 'https://picsum.photos/seed/groc2/800/600',
                order: 1,
            },
            {
                shopId: butcher.id,
                url: 'https://picsum.photos/seed/butch1/800/600',
                order: 0,
            },
            {
                shopId: butcher.id,
                url: 'https://picsum.photos/seed/butch2/800/600',
                order: 1,
            },
            {
                shopId: services.id,
                url: 'https://picsum.photos/seed/svc1/800/600',
                order: 0,
            },
            {
                shopId: health.id,
                url: 'https://picsum.photos/seed/health1/800/600',
                order: 0,
            },
            {
                shopId: health.id,
                url: 'https://picsum.photos/seed/health2/800/600',
                order: 1,
            },
        ],
    });

    console.log('✓ Shops created');

    // ── Products ───────────────────────────────────────────────────────────────
    const [espresso, cappuccino, croissant, latte, cheesecake] =
        await Promise.all([
            db.product.create({
                data: {
                    name: 'Espresso',
                    nameAr: 'إسبريسو',
                    description: 'Double shot espresso',
                    descriptionAr: 'إسبريسو مزدوج',
                    price: 15,
                    imageUrl: 'https://picsum.photos/seed/esp/400/400',
                    shopId: cafe.id,
                },
            }),
            db.product.create({
                data: {
                    name: 'Cappuccino',
                    nameAr: 'كابوتشينو',
                    description: 'Classic cappuccino with foam',
                    descriptionAr: 'كابوتشينو كلاسيكي',
                    price: 25,
                    imageUrl: 'https://picsum.photos/seed/cap/400/400',
                    shopId: cafe.id,
                },
            }),
            db.product.create({
                data: {
                    name: 'Croissant',
                    nameAr: 'كرواسان',
                    description: 'Buttery flaky croissant',
                    descriptionAr: 'كرواسان زبدي',
                    price: 20,
                    imageUrl: 'https://picsum.photos/seed/croi/400/400',
                    shopId: cafe.id,
                },
            }),
            db.product.create({
                data: {
                    name: 'Latte',
                    nameAr: 'لاتيه',
                    description: 'Smooth milk latte',
                    descriptionAr: 'لاتيه بالحليب',
                    price: 28,
                    imageUrl: 'https://picsum.photos/seed/lat/400/400',
                    shopId: cafe.id,
                },
            }),
            db.product.create({
                data: {
                    name: 'Cheesecake Slice',
                    nameAr: 'تشيزكيك',
                    description: 'New York style cheesecake',
                    descriptionAr: 'تشيزكيك على الطريقة الأمريكية',
                    price: 45,
                    imageUrl: 'https://picsum.photos/seed/cake/400/400',
                    shopId: cafe.id,
                },
            }),
        ]);
    const [milk, bread, eggs, rice, oliveoil] = await Promise.all([
        db.product.create({
            data: {
                name: 'Full Cream Milk 1L',
                nameAr: 'حليب كامل الدسم 1 لتر',
                price: 18,
                imageUrl: 'https://picsum.photos/seed/milk/400/400',
                shopId: grocery.id,
            },
        }),
        db.product.create({
            data: {
                name: 'Bread Loaf',
                nameAr: 'رغيف خبز',
                price: 8,
                imageUrl: 'https://picsum.photos/seed/bread/400/400',
                shopId: grocery.id,
            },
        }),
        db.product.create({
            data: {
                name: 'Eggs 12 pcs',
                nameAr: 'بيض 12 حبة',
                price: 55,
                imageUrl: 'https://picsum.photos/seed/eggs/400/400',
                shopId: grocery.id,
            },
        }),
        db.product.create({
            data: {
                name: 'Rice 1kg',
                nameAr: 'أرز 1 كيلو',
                price: 25,
                imageUrl: 'https://picsum.photos/seed/rice/400/400',
                shopId: grocery.id,
            },
        }),
        db.product.create({
            data: {
                name: 'Olive Oil 750ml',
                nameAr: 'زيت زيتون 750 مل',
                price: 120,
                imageUrl: 'https://picsum.photos/seed/oil/400/400',
                shopId: grocery.id,
            },
        }),
    ]);
    const [chicken, beef, lamb, wings] = await Promise.all([
        db.product.create({
            data: {
                name: 'Chicken Breast 1kg',
                nameAr: 'صدر دجاج 1 كيلو',
                price: 95,
                imageUrl: 'https://picsum.photos/seed/chick/400/400',
                shopId: butcher.id,
            },
        }),
        db.product.create({
            data: {
                name: 'Ground Beef 500g',
                nameAr: 'لحم مفروم 500 جم',
                price: 180,
                imageUrl: 'https://picsum.photos/seed/beef/400/400',
                shopId: butcher.id,
            },
        }),
        db.product.create({
            data: {
                name: 'Lamb Chops 1kg',
                nameAr: 'ريش خروف 1 كيلو',
                price: 250,
                imageUrl: 'https://picsum.photos/seed/lamb/400/400',
                shopId: butcher.id,
            },
        }),
        db.product.create({
            data: {
                name: 'Chicken Wings 1kg',
                nameAr: 'أجنحة دجاج 1 كيلو',
                price: 70,
                imageUrl: 'https://picsum.photos/seed/wings/400/400',
                shopId: butcher.id,
            },
        }),
    ]);
    const [acClean, plumbing, electrical, deepClean] = await Promise.all([
        db.product.create({
            data: {
                name: 'AC Cleaning',
                nameAr: 'تنظيف مكيف',
                description: 'Full AC unit cleaning & service',
                descriptionAr: 'تنظيف وصيانة وحدة التكييف',
                price: 350,
                shopId: services.id,
            },
        }),
        db.product.create({
            data: {
                name: 'Plumbing Fix',
                nameAr: 'إصلاح سباكة',
                description: 'Leak detection & repair',
                descriptionAr: 'كشف وإصلاح التسربات',
                price: 200,
                shopId: services.id,
            },
        }),
        db.product.create({
            data: {
                name: 'Electrical Check',
                nameAr: 'فحص كهربائي',
                description: 'Electrical safety inspection',
                descriptionAr: 'فحص أمان كهربائي',
                price: 150,
                shopId: services.id,
            },
        }),
        db.product.create({
            data: {
                name: 'Deep Cleaning',
                nameAr: 'تنظيف شامل',
                description: 'Full apartment deep clean',
                descriptionAr: 'تنظيف شامل للشقة',
                price: 500,
                shopId: services.id,
            },
        }),
    ]);
    const [quinoa, honey, nuts, chia, greentea] = await Promise.all([
        db.product.create({
            data: {
                name: 'Quinoa 500g',
                nameAr: 'كينوا 500 جم',
                price: 85,
                imageUrl: 'https://picsum.photos/seed/quin/400/400',
                shopId: health.id,
            },
        }),
        db.product.create({
            data: {
                name: 'Organic Honey 500g',
                nameAr: 'عسل طبيعي 500 جم',
                price: 120,
                imageUrl: 'https://picsum.photos/seed/honey/400/400',
                shopId: health.id,
            },
        }),
        db.product.create({
            data: {
                name: 'Mixed Nuts 250g',
                nameAr: 'مكسرات مشكلة 250 جم',
                price: 95,
                imageUrl: 'https://picsum.photos/seed/nuts/400/400',
                shopId: health.id,
            },
        }),
        db.product.create({
            data: {
                name: 'Chia Seeds 300g',
                nameAr: 'بذور شيا 300 جم',
                price: 65,
                imageUrl: 'https://picsum.photos/seed/chia/400/400',
                shopId: health.id,
            },
        }),
        db.product.create({
            data: {
                name: 'Green Tea 100 bags',
                nameAr: 'شاي أخضر 100 كيس',
                price: 45,
                imageUrl: 'https://picsum.photos/seed/tea/400/400',
                shopId: health.id,
            },
        }),
    ]);

    console.log('✓ Products created');

    // ── Orders ─────────────────────────────────────────────────────────────────
    const order1 = await db.order.create({
        data: {
            residentId: r1.id,
            shopId: cafe.id,
            status: OrderStatus.DELIVERED,
            totalAmount: 50,
            deliveryUnit: 'A101',
            paymentMethod: PaymentMethod.CASH,
            isPaid: false,
            notes: 'Please knock softly',
            items: {
                create: [
                    {
                        productId: espresso.id,
                        quantity: 2,
                        unitPrice: 15,
                        productNameSnapshot: 'Espresso',
                        productNameArSnapshot: 'إسبريسو',
                    },
                    {
                        productId: croissant.id,
                        quantity: 1,
                        unitPrice: 20,
                        productNameSnapshot: 'Croissant',
                        productNameArSnapshot: 'كرواسان',
                    },
                ],
            },
        },
    });
    const order2 = await db.order.create({
        data: {
            residentId: r2.id,
            shopId: grocery.id,
            status: OrderStatus.PREPARING,
            totalAmount: 70,
            deliveryUnit: 'A102',
            paymentMethod: PaymentMethod.CASH,
            isPaid: false,
            items: {
                create: [
                    {
                        productId: milk.id,
                        quantity: 3,
                        unitPrice: 18,
                        productNameSnapshot: 'Full Cream Milk 1L',
                        productNameArSnapshot: 'حليب كامل الدسم 1 لتر',
                    },
                    {
                        productId: bread.id,
                        quantity: 2,
                        unitPrice: 8,
                        productNameSnapshot: 'Bread Loaf',
                        productNameArSnapshot: 'رغيف خبز',
                    },
                ],
            },
        },
    });
    const order3 = await db.order.create({
        data: {
            residentId: r3.id,
            shopId: butcher.id,
            status: OrderStatus.PLACED,
            totalAmount: 190,
            deliveryUnit: 'B201',
            paymentMethod: PaymentMethod.CASH,
            isPaid: false,
            notes: 'Leave at the door',
            items: {
                create: [
                    {
                        productId: chicken.id,
                        quantity: 2,
                        unitPrice: 95,
                        productNameSnapshot: 'Chicken Breast 1kg',
                        productNameArSnapshot: 'صدر دجاج 1 كيلو',
                    },
                ],
            },
        },
    });
    const order4 = await db.order.create({
        data: {
            residentId: r4.id,
            shopId: cafe.id,
            status: OrderStatus.CONFIRMED,
            totalAmount: 73,
            deliveryUnit: 'B202',
            paymentMethod: PaymentMethod.CASH,
            isPaid: false,
            items: {
                create: [
                    {
                        productId: latte.id,
                        quantity: 1,
                        unitPrice: 28,
                        productNameSnapshot: 'Latte',
                        productNameArSnapshot: 'لاتيه',
                    },
                    {
                        productId: cheesecake.id,
                        quantity: 1,
                        unitPrice: 45,
                        productNameSnapshot: 'Cheesecake Slice',
                        productNameArSnapshot: 'تشيزكيك',
                    },
                ],
            },
        },
    });
    const order5 = await db.order.create({
        data: {
            residentId: r5.id,
            shopId: health.id,
            status: OrderStatus.ON_THE_WAY,
            totalAmount: 250,
            deliveryUnit: 'C301',
            paymentMethod: PaymentMethod.CASH,
            isPaid: false,
            items: {
                create: [
                    {
                        productId: quinoa.id,
                        quantity: 1,
                        unitPrice: 85,
                        productNameSnapshot: 'Quinoa 500g',
                        productNameArSnapshot: 'كينوا 500 جم',
                    },
                    {
                        productId: honey.id,
                        quantity: 1,
                        unitPrice: 120,
                        productNameSnapshot: 'Organic Honey 500g',
                        productNameArSnapshot: 'عسل طبيعي 500 جم',
                    },
                    {
                        productId: nuts.id,
                        quantity: 1,
                        unitPrice: 95,
                        productNameSnapshot: 'Mixed Nuts 250g',
                        productNameArSnapshot: 'مكسرات مشكلة 250 جم',
                    },
                ],
            },
        },
    });

    console.log('✓ Orders created');

    // ── Reviews ────────────────────────────────────────────────────────────────
    await db.review.createMany({
        data: [
            {
                userId: r1.id,
                shopId: cafe.id,
                rating: 5,
                comment:
                    'Amazing coffee and fast delivery! Highly recommended.',
            },
            {
                userId: r2.id,
                shopId: grocery.id,
                rating: 4,
                comment:
                    'Good selection of products, will definitely order again.',
            },
            {
                userId: r3.id,
                shopId: butcher.id,
                rating: 5,
                comment: 'Incredibly fresh meat. Best butcher in the compound!',
            },
            {
                userId: r4.id,
                shopId: cafe.id,
                rating: 4,
                comment: 'Great latte, cheesecake was perfect.',
            },
            {
                userId: r5.id,
                shopId: health.id,
                rating: 5,
                comment:
                    'Love the organic selection. Quinoa and honey are top quality.',
            },
        ],
    });

    // ── Saved Shops ────────────────────────────────────────────────────────────
    await db.savedShop.createMany({
        data: [
            { userId: r1.id, shopId: cafe.id },
            { userId: r1.id, shopId: grocery.id },
            { userId: r2.id, shopId: health.id },
            { userId: r3.id, shopId: butcher.id },
        ],
    });

    console.log('✓ Reviews & saved shops created');

    // ── Announcements ──────────────────────────────────────────────────────────
    const ann1 = await db.announcement.create({
        data: {
            title: 'Welcome to EastPark App!',
            titleAr: 'مرحباً بكم في تطبيق إيست بارك!',
            body: 'We are thrilled to launch the EastPark residential super-app. Order from local shops, stay informed about compound news, participate in polls and elections — all in one place.',
            bodyAr: 'يسعدنا إطلاق تطبيق إيست بارك. اطلب من المتاجر المحلية، وابقَ على اطلاع بأخبار المجمع، وشارك في الاستطلاعات والانتخابات — كل ذلك في مكان واحد.',
            category: AnnouncementCategory.GENERAL,
        },
    });
    const ann2 = await db.announcement.create({
        data: {
            title: 'Eid Al-Fitr Celebration Party',
            titleAr: 'حفل احتفال عيد الفطر المبارك',
            body: 'Join us for a grand Eid celebration at the compound clubhouse on the first day of Eid. Activities for all ages, food stations, and live entertainment. All residents are welcome!',
            bodyAr: 'انضموا إلينا للاحتفال بعيد الفطر المبارك في نادي المجمع في أول أيام العيد. أنشطة لجميع الأعمار ومحطات طعام وترفيه حي. كل السكان مدعوون!',
            category: AnnouncementCategory.EVENT,
        },
    });
    const ann3 = await db.announcement.create({
        data: {
            title: 'Scheduled Water Pump Maintenance',
            titleAr: 'صيانة مجدولة لطلمبة المياه',
            body: 'Water supply will be interrupted on Thursday from 10:00 AM to 2:00 PM for routine pump maintenance. Please store sufficient water. We apologize for any inconvenience.',
            bodyAr: 'سيتم انقطاع المياه يوم الخميس من 10 صباحاً حتى 2 ظهراً لإجراء صيانة دورية للطلمبة. يرجى تخزين الكمية الكافية من الماء. نعتذر عن أي إزعاج.',
            category: AnnouncementCategory.MAINTENANCE,
        },
    });
    const ann4 = await db.announcement.create({
        data: {
            title: 'New Security System Installed',
            titleAr: 'تركيب نظام أمني جديد',
            body: 'We have upgraded the compound security with a state-of-the-art CCTV system covering all entry points, parking areas, and common spaces. Your safety is our priority.',
            bodyAr: 'قمنا بترقية أمن المجمع بنظام كاميرات مراقبة متطور يغطي جميع نقاط الدخول والمواقف والمناطق المشتركة. سلامتكم أولويتنا.',
            category: AnnouncementCategory.NEWS,
        },
    });
    const ann5 = await db.announcement.create({
        data: {
            title: 'Extended Summer Pool Hours',
            titleAr: 'توسيع مواعيد المسبح الصيفية',
            body: 'Great news for residents! The compound pool will now be open from 7:00 AM to 11:00 PM daily throughout the summer season. Enjoy the extended hours with your family!',
            bodyAr: 'أخبار رائعة للسكان! سيكون مسبح المجمع مفتوحاً الآن من 7 صباحاً حتى 11 مساءً يومياً طوال موسم الصيف.',
            category: AnnouncementCategory.PROMOTION,
        },
    });

    // ── Comments ───────────────────────────────────────────────────────────────
    await db.comment.createMany({
        data: [
            {
                body: 'Great news! Looking forward to using the app. This will make compound life so much easier!',
                userId: r1.id,
                announcementId: ann1.id,
            },
            {
                body: 'Finally! A proper app for our compound. Very helpful and well designed.',
                userId: r2.id,
                announcementId: ann1.id,
            },
            {
                body: 'So excited for the Eid celebration! Will bring the whole family.',
                userId: r3.id,
                announcementId: ann2.id,
            },
            {
                body: 'Thanks for the advance notice about the water. Very considerate.',
                userId: r4.id,
                announcementId: ann3.id,
            },
        ],
    });

    // ── Reports ────────────────────────────────────────────────────────────────
    await db.report.createMany({
        data: [
            {
                title: 'Q1 2025 Financial Report',
                titleAr: 'التقرير المالي للربع الأول 2025',
                pdfUrl: 'https://example.com/reports/q1-2025-financial.pdf',
                publishedAt: new Date('2025-04-01'),
            },
            {
                title: 'Annual Maintenance Plan 2025',
                titleAr: 'خطة الصيانة السنوية 2025',
                pdfUrl: 'https://example.com/reports/maintenance-plan-2025.pdf',
                publishedAt: new Date('2025-01-15'),
            },
            {
                title: 'Security Audit Report 2024',
                titleAr: 'تقرير تدقيق الأمن 2024',
                pdfUrl: 'https://example.com/reports/security-audit-2024.pdf',
                publishedAt: new Date('2024-12-31'),
            },
        ],
    });

    console.log('✓ Announcements, comments & reports created');

    // ── Polls ──────────────────────────────────────────────────────────────────
    const poll1 = await db.poll.create({
        data: {
            question: 'What is the best day for compound cleaning?',
            questionAr: 'ما هو أفضل يوم لتنظيف المجمع؟',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            options: {
                create: [
                    { label: 'Friday', labelAr: 'الجمعة' },
                    { label: 'Saturday', labelAr: 'السبت' },
                    { label: 'Sunday', labelAr: 'الأحد' },
                ],
            },
        },
        include: { options: true },
    });
    const poll2 = await db.poll.create({
        data: {
            question: 'What are your preferred pool hours?',
            questionAr: 'ما هي مواعيد المسبح المفضلة لديك؟',
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            options: {
                create: [
                    { label: 'Morning (7AM–12PM)', labelAr: 'الصباح (7ص–12م)' },
                    {
                        label: 'Afternoon (12PM–6PM)',
                        labelAr: 'بعد الظهر (12م–6م)',
                    },
                    { label: 'Evening (6PM–10PM)', labelAr: 'المساء (6م–10م)' },
                ],
            },
        },
        include: { options: true },
    });

    await db.vote.createMany({
        data: [
            { userId: r1.id, pollId: poll1.id, optionId: poll1.options[0]!.id },
            { userId: r2.id, pollId: poll1.id, optionId: poll1.options[1]!.id },
            { userId: r3.id, pollId: poll1.id, optionId: poll1.options[0]!.id },
            { userId: r1.id, pollId: poll2.id, optionId: poll2.options[2]!.id },
            { userId: r2.id, pollId: poll2.id, optionId: poll2.options[0]!.id },
        ],
    });

    console.log('✓ Polls & votes created');

    // ── Election ───────────────────────────────────────────────────────────────
    const election = await db.election.create({
        data: {
            title: 'Residents Committee Election 2025',
            titleAr: 'انتخابات مجلس السكان 2025',
            description:
                'Vote for your representatives on the compound residents committee.',
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            resultsOpen: false,
            visibilityMode: ElectionVisibilityMode.SEALED_UNTIL_DEADLINE,
            candidates: {
                create: [
                    {
                        name: 'Mohamed Hassan',
                        nameAr: 'محمد حسن',
                        statement:
                            'I will work hard to improve compound services and communication.',
                        statementAr:
                            'سأعمل بجد على تحسين خدمات المجمع والتواصل.',
                        photoUrl: 'https://picsum.photos/seed/cand1/200/200',
                    },
                    {
                        name: 'Sara Ahmed',
                        nameAr: 'سارة أحمد',
                        statement:
                            'Committed to transparency, fair decision-making, and resident wellbeing.',
                        statementAr:
                            'ملتزمة بالشفافية واتخاذ القرارات العادلة ورفاهية السكان.',
                        photoUrl: 'https://picsum.photos/seed/cand2/200/200',
                    },
                    {
                        name: 'Khaled Ibrahim',
                        nameAr: 'خالد إبراهيم',
                        statement:
                            'My focus is on security upgrades, maintenance response times, and cleanliness.',
                        statementAr:
                            'تركيزي على تحسين الأمن وأوقات الاستجابة للصيانة والنظافة.',
                        photoUrl: 'https://picsum.photos/seed/cand3/200/200',
                    },
                ],
            },
        },
        include: { candidates: true },
    });

    await db.electionVote.create({
        data: {
            userId: r1.id,
            electionId: election.id,
            candidateId: election.candidates[0]!.id,
        },
    });
    await db.electionVote.create({
        data: {
            userId: r2.id,
            electionId: election.id,
            candidateId: election.candidates[1]!.id,
        },
    });

    console.log('✓ Election & votes created');

    // ── Feedback ───────────────────────────────────────────────────────────────
    const fb1 = await db.feedback.create({
        data: {
            category: FeedbackCategory.MAINTENANCE,
            body: 'The elevator in Building A is making a strange grinding noise. It feels unsafe and needs urgent inspection.',
            isAnonymous: false,
            status: FeedbackStatus.IN_PROGRESS,
            attachments: [],
            userId: r1.id,
        },
    });
    const fb2 = await db.feedback.create({
        data: {
            category: FeedbackCategory.CLEANLINESS,
            body: 'The stairwell on floor 3 in Building B has not been cleaned in over a week. There is visible dust and debris.',
            isAnonymous: true,
            status: FeedbackStatus.SUBMITTED,
            attachments: [],
            userId: r2.id,
        },
    });
    const fb3 = await db.feedback.create({
        data: {
            category: FeedbackCategory.SECURITY,
            body: 'The parking gate was left open all night on Tuesday. Anyone could enter the compound.',
            isAnonymous: false,
            status: FeedbackStatus.RESOLVED,
            attachments: [],
            userId: r3.id,
        },
    });
    const fb4 = await db.feedback.create({
        data: {
            category: FeedbackCategory.NOISE,
            body: 'Loud construction noise starting at 6 AM from unit B305. This is below the allowed hours.',
            isAnonymous: false,
            status: FeedbackStatus.ACKNOWLEDGED,
            attachments: [],
            userId: r4.id,
        },
    });

    await db.feedbackReply.createMany({
        data: [
            {
                body: 'Thank you for reporting this. Our maintenance team has been dispatched and will inspect the elevator tomorrow morning.',
                feedbackId: fb1.id,
                authorId: admin.id,
            },
            {
                body: 'We have reviewed and resolved this issue. The security team has been briefed and the gate protocol has been updated.',
                feedbackId: fb3.id,
                authorId: admin.id,
            },
            {
                body: 'We acknowledge your report about the noise. We have sent a warning notice to the unit in question.',
                feedbackId: fb4.id,
                authorId: admin.id,
            },
        ],
    });

    console.log('✓ Feedback & replies created');

    // ── Notification Preferences ───────────────────────────────────────────────
    const prefTypes = [
        NotificationType.ORDER_UPDATE,
        NotificationType.ANNOUNCEMENT,
        NotificationType.POLL,
        NotificationType.ELECTION,
        NotificationType.FEEDBACK_UPDATE,
    ];
    for (const type of prefTypes) {
        await db.notificationPreference.createMany({
            data: [
                { userId: r1.id, type, enabled: true },
                { userId: r2.id, type, enabled: true },
                { userId: r3.id, type, enabled: true },
            ],
        });
    }

    // ── Notifications ──────────────────────────────────────────────────────────
    await db.notification.createMany({
        data: [
            {
                userId: r1.id,
                type: NotificationType.ORDER_UPDATE,
                title: 'Order Delivered!',
                titleAr: 'تم تسليم طلبك!',
                body: 'Your order from The Brew Corner has been delivered. Enjoy!',
                bodyAr: 'تم تسليم طلبك من ركن القهوة. استمتع!',
                isRead: false,
                data: { orderId: order1.id },
            },
            {
                userId: r2.id,
                type: NotificationType.ANNOUNCEMENT,
                title: 'New Announcement',
                titleAr: 'إعلان جديد',
                body: 'Eid Al-Fitr celebration party details have been posted.',
                bodyAr: 'تم نشر تفاصيل حفل عيد الفطر.',
                isRead: false,
                data: { announcementId: ann2.id },
            },
            {
                userId: r3.id,
                type: NotificationType.ORDER_UPDATE,
                title: 'Order Confirmed',
                titleAr: 'تم تأكيد طلبك',
                body: 'Al Salam Butcher has confirmed your order and is preparing it now.',
                bodyAr: 'قبلت جزارة السلام طلبك وتقوم بتحضيره الآن.',
                isRead: true,
                data: { orderId: order3.id },
            },
            {
                userId: r4.id,
                type: NotificationType.POLL,
                title: 'New Poll Available',
                titleAr: 'استطلاع جديد',
                body: 'Vote on the best day for compound cleaning!',
                bodyAr: 'صوّت على أفضل يوم لتنظيف المجمع!',
                isRead: false,
                data: { pollId: poll1.id },
            },
            {
                userId: r1.id,
                type: NotificationType.FEEDBACK_UPDATE,
                title: 'Feedback Update',
                titleAr: 'تحديث على بلاغك',
                body: 'The admin has responded to your maintenance report about the elevator.',
                bodyAr: 'رد المسؤول على بلاغك المتعلق بالمصعد.',
                isRead: false,
                data: { feedbackId: fb1.id },
            },
        ],
    });

    console.log('✓ Notifications & preferences created');

    // ── Audit Logs ─────────────────────────────────────────────────────────────
    await db.auditLog.createMany({
        data: [
            {
                userId: admin.id,
                action: 'CREATE_ANNOUNCEMENT',
                entity: 'Announcement',
                entityId: ann1.id,
                meta: { category: 'GENERAL' },
            },
            {
                userId: admin.id,
                action: 'CREATE_POLL',
                entity: 'Poll',
                entityId: poll1.id,
                meta: {},
            },
            {
                userId: admin.id,
                action: 'CREATE_ELECTION',
                entity: 'Election',
                entityId: election.id,
                meta: {},
            },
        ],
    });

    console.log('\n✅ Seed complete!');
    console.log(
        `   5 merchants | 5 residents | 5 shops | 22 products | 5 orders`
    );
    console.log(`   5 announcements | 4 comments | 3 reports`);
    console.log(`   2 polls | 1 election with 3 candidates | 4 feedback items`);
    console.log(`   5 notifications | notification preferences set`);
    console.log('\n   Merchant password: Merchant#1234@');
    console.log('   Resident password: Resident#1234@');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => db.$disconnect());
