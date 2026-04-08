import {
  PrismaClient,
  Role,
  OrderStatus,
  PaymentMethod,
  FeedbackStatus,
  NotificationType,
  ElectionVisibilityMode,
  ShopCategory,
  AnnouncementCategory,
  FeedbackCategory,
} from '@prisma/client';
import * as argon2 from 'argon2';

const db = new PrismaClient();

// ── Seed data ─────────────────────────────────────────────────────────────────

const ADMIN = {
  name: 'EastPark Admin',
  email: process.env.SEED_ADMIN_EMAIL ?? 'admin@eastpark.app',
  password: process.env.SEED_ADMIN_PASSWORD ?? 'HelloWorld#1234@',
  unitNumber: 'ADMIN-01',
};

const RESIDENTS = [
  { name: 'Ahmed Hassan', email: 'ahmed@eastpark.app', phone: '+201001234567', unitNumber: 'A-101' },
  { name: 'Sara Mohamed', email: 'sara@eastpark.app',  phone: '+201009876543', unitNumber: 'B-205' },
  { name: 'Omar Khaled',  email: 'omar@eastpark.app',  phone: '+201112345678', unitNumber: 'C-310' },
  { name: 'Nour Ibrahim', email: 'nour@eastpark.app',  phone: '+201234567890', unitNumber: 'A-402' },
];

const MERCHANTS = [
  { name: 'Youssef Bakr', email: 'youssef@eastpark.app', phone: '+201556789012', unitNumber: 'MERCHANT-01' },
  { name: 'Mona Samir',   email: 'mona@eastpark.app',    phone: '+201023456789', unitNumber: 'MERCHANT-02' },
];

const SHOPS = [
  {
    merchantEmail: 'youssef@eastpark.app',
    name: 'EastPark Café',
    nameAr: 'كافيه إيست بارك',
    description: 'Specialty coffee and freshly baked pastries',
    descriptionAr: 'قهوة مختصة ومعجنات طازجة',
    category: 'CAFE_AND_FOOD' as ShopCategory,
    isOpen: true,
    phone: '+201556789012',
    deliveryTime: 25,
    workingHours: {
      mon: { open: '08:00', close: '22:00', closed: false },
      tue: { open: '08:00', close: '22:00', closed: false },
      wed: { open: '08:00', close: '22:00', closed: false },
      thu: { open: '08:00', close: '22:00', closed: false },
      fri: { open: '10:00', close: '23:00', closed: false },
      sat: { open: '10:00', close: '23:00', closed: false },
      sun: { open: '08:00', close: '20:00', closed: false },
    },
    photos: [
      { url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800', order: 0 },
      { url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',    order: 1 },
    ],
    products: [
      { name: 'Espresso',      nameAr: 'إسبريسو',        price: 35, imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400' },
      { name: 'Cappuccino',    nameAr: 'كابتشينو',       price: 55, imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400' },
      { name: 'Croissant',     nameAr: 'كرواسان',        price: 45, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
      { name: 'Avocado Toast', nameAr: 'توست الأفوكادو', price: 85, imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400' },
    ],
  },
  {
    merchantEmail: 'mona@eastpark.app',
    name: 'Fresh Market',
    nameAr: 'السوق الطازج',
    description: 'Premium groceries and organic produce',
    descriptionAr: 'بقالة فاخرة ومنتجات عضوية',
    category: 'GROCERY' as ShopCategory,
    isOpen: true,
    phone: '+201023456789',
    deliveryTime: 38,
    workingHours: {
      mon: { open: '08:00', close: '22:00', closed: false },
      tue: { open: '08:00', close: '22:00', closed: false },
      wed: { open: '08:00', close: '22:00', closed: false },
      thu: { open: '08:00', close: '22:00', closed: false },
      fri: { open: '10:00', close: '23:00', closed: false },
      sat: { open: '10:00', close: '23:00', closed: false },
      sun: { open: '08:00', close: '20:00', closed: false },
    },
    photos: [
      { url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800', order: 0 },
    ],
    products: [
      { name: 'Organic Milk 1L', nameAr: 'حليب عضوي 1 لتر',  price: 28, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
      { name: 'Sourdough Bread', nameAr: 'خبز العجين المخمر', price: 60, imageUrl: 'https://images.unsplash.com/photo-1585478259715-4d3c2b724064?w=400' },
      { name: 'Greek Yogurt',    nameAr: 'زبادي يوناني',      price: 32, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400' },
    ],
  },
];

const ORDERS = [
  {
    residentEmail: 'ahmed@eastpark.app',
    shopName: 'EastPark Café',
    status: 'DELIVERED' as OrderStatus,
    paymentMethod: 'CASH' as PaymentMethod,
    isPaid: false,
    notes: 'Please ring the bell',
    items: [
      { productName: 'Espresso',  quantity: 1 },
      { productName: 'Croissant', quantity: 1 },
    ],
  },
  {
    residentEmail: 'sara@eastpark.app',
    shopName: 'EastPark Café',
    status: 'PREPARING' as OrderStatus,
    paymentMethod: 'CASH' as PaymentMethod,
    isPaid: false,
    notes: null,
    items: [{ productName: 'Cappuccino', quantity: 1 }],
  },
  {
    residentEmail: 'omar@eastpark.app',
    shopName: 'Fresh Market',
    status: 'PLACED' as OrderStatus,
    paymentMethod: 'CASH' as PaymentMethod,
    isPaid: false,
    notes: null,
    items: [
      { productName: 'Organic Milk 1L', quantity: 2 },
      { productName: 'Greek Yogurt',    quantity: 1 },
    ],
  },
];

const REVIEWS = [
  { residentEmail: 'ahmed@eastpark.app', shopName: 'EastPark Café', rating: 5, comment: 'Best coffee in the compound! The cappuccino is perfect.' },
  { residentEmail: 'sara@eastpark.app',  shopName: 'EastPark Café', rating: 4, comment: 'Great atmosphere, quick delivery.' },
];

const ANNOUNCEMENTS = [
  {
    title: 'Pool Maintenance Schedule',
    titleAr: 'جدول صيانة حمام السباحة',
    body: 'The swimming pool will be closed for maintenance from April 10–12. We apologize for the inconvenience.',
    bodyAr: 'سيتم إغلاق حمام السباحة للصيانة من 10 إلى 12 أبريل. نعتذر عن الإزعاج.',
    category: 'MAINTENANCE' as AnnouncementCategory,
    publishedAt: '2026-04-01T00:00:00.000Z',
    comment: 'Thank you for letting us know!',
  },
  {
    title: 'Welcome to EastPark Spring Festival!',
    titleAr: 'أهلاً بكم في مهرجان الربيع بإيست بارك!',
    body: 'Join us on April 20th for our annual spring festival. Live music, food stalls, and activities for the whole family.',
    bodyAr: 'انضم إلينا في 20 أبريل للاحتفال بمهرجاننا السنوي للربيع. موسيقى حية، أجنحة طعام، وأنشطة للعائلة بأكملها.',
    category: 'EVENT' as AnnouncementCategory,
    publishedAt: '2026-04-02T00:00:00.000Z',
    comment: "Can't wait for this!",
  },
  {
    title: 'New Security Protocol',
    titleAr: 'بروتوكول أمني جديد',
    body: 'Starting next week, all visitors must register at the main gate. Please ensure your guests have valid ID.',
    bodyAr: 'ابتداءً من الأسبوع القادم، يجب على جميع الزوار التسجيل عند البوابة الرئيسية.',
    category: 'GENERAL' as AnnouncementCategory,
    publishedAt: '2026-04-03T00:00:00.000Z',
    comment: 'Good to know, thanks.',
  },
];

const REPORTS = [
  {
    title: 'Q1 2026 Compound Financial Report',
    titleAr: 'التقرير المالي للمجمع - الربع الأول 2026',
    pdfUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/sample.pdf',
    publishedAt: '2026-04-01T00:00:00.000Z',
  },
];

const POLL = {
  question: 'Which facility upgrade should we prioritize?',
  questionAr: 'أي تحسين للمرافق يجب أن نعطيه الأولوية؟',
  expiresAt: '2026-05-01T00:00:00.000Z',
  options: [
    { label: 'Gym expansion',      labelAr: 'توسعة الصالة الرياضية' },
    { label: 'Kids play area',     labelAr: 'منطقة ألعاب الأطفال'   },
    { label: 'Co-working space',   labelAr: 'مساحة عمل مشتركة'      },
    { label: 'Additional parking', labelAr: 'مواقف سيارات إضافية'   },
  ],
  votes: [
    { residentEmail: 'ahmed@eastpark.app', optionLabel: 'Gym expansion'  },
    { residentEmail: 'sara@eastpark.app',  optionLabel: 'Kids play area' },
  ],
};

const ELECTION = {
  title: 'Residents Council 2026 Election',
  titleAr: 'انتخابات مجلس السكان 2026',
  description: 'Vote for your compound council representatives for the year 2026.',
  expiresAt: '2026-05-15T00:00:00.000Z',
  visibilityMode: 'SEALED_UNTIL_DEADLINE' as ElectionVisibilityMode,
  candidates: [
    { name: 'Karim Nasser',   nameAr: 'كريم ناصر',  statement: 'I will focus on improving security and green spaces.',           statementAr: 'سأركز على تحسين الأمن والمساحات الخضراء.'        },
    { name: 'Layla Farouk',   nameAr: 'ليلى فاروق', statement: 'My priority is community events and resident engagement.',        statementAr: 'أولويتي الفعاليات المجتمعية وتفاعل السكان.'       },
    { name: 'Hassan Mahmoud', nameAr: 'حسن محمود',  statement: 'I will work on reducing service fees and improving maintenance.', statementAr: 'سأعمل على تخفيض رسوم الخدمات وتحسين الصيانة.'     },
  ],
  votes: [
    { residentEmail: 'ahmed@eastpark.app', candidateName: 'Karim Nasser' },
  ],
};

const FEEDBACK = [
  {
    residentEmail: 'ahmed@eastpark.app',
    category: 'MAINTENANCE' as FeedbackCategory,
    body: 'The elevator in Building A has been making strange noises for the past week.',
    isAnonymous: false,
    status: 'IN_PROGRESS' as FeedbackStatus,
    reply: 'Thank you for reporting. Our maintenance team will inspect the elevator tomorrow.',
  },
  {
    residentEmail: 'sara@eastpark.app',
    category: 'CLEANLINESS' as FeedbackCategory,
    body: 'The common area on floor 3 of Building B needs more frequent cleaning.',
    isAnonymous: true,
    status: 'SUBMITTED' as FeedbackStatus,
    reply: null,
  },
  {
    residentEmail: 'omar@eastpark.app',
    category: 'SUGGESTION' as FeedbackCategory,
    body: 'Can we add a bicycle storage area near the main gate?',
    isAnonymous: false,
    status: 'ACKNOWLEDGED' as FeedbackStatus,
    reply: null,
  },
];

const NOTIFICATIONS = [
  {
    residentEmail: 'ahmed@eastpark.app',
    type: 'ORDER_UPDATE' as NotificationType,
    title: 'Order Delivered',
    titleAr: 'تم توصيل طلبك',
    body: 'Your order from EastPark Café has been delivered.',
    bodyAr: 'تم توصيل طلبك من كافيه إيست بارك.',
    isRead: true,
  },
  {
    residentEmail: 'ahmed@eastpark.app',
    type: 'ANNOUNCEMENT' as NotificationType,
    title: 'New Announcement',
    titleAr: 'إعلان جديد',
    body: 'Pool maintenance scheduled for April 10–12.',
    bodyAr: 'تمت جدولة صيانة حمام السباحة في الفترة من 10 إلى 12 أبريل.',
    isRead: false,
  },
  {
    residentEmail: 'sara@eastpark.app',
    type: 'POLL' as NotificationType,
    title: 'New Poll Available',
    titleAr: 'استطلاع رأي جديد',
    body: 'Vote on the facility upgrade priority.',
    bodyAr: 'صوّت على أولوية تحسين المرافق.',
    isRead: false,
  },
];

const SAVED_SHOPS = [
  { residentEmail: 'ahmed@eastpark.app', shopName: 'EastPark Café' },
];

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...\n');

  const sharedHash = await argon2.hash(ADMIN.password);

  // ── Admin ──────────────────────────────────────────────────────────────────
  let admin = await db.user.findUnique({ where: { email: ADMIN.email } });
  if (!admin) {
    admin = await db.user.create({
      data: {
        name: process.env.SEED_ADMIN_NAME ?? ADMIN.name,
        email: ADMIN.email,
        passwordHash: await argon2.hash(ADMIN.password),
        role: Role.ADMIN,
        isVerified: true,
        unitNumber: ADMIN.unitNumber,
      },
    });
    console.log(`✓ Admin: ${admin.email}`);
  } else {
    console.log(`· Admin already exists: ${admin.email}`);
  }

  // ── Residents ──────────────────────────────────────────────────────────────
  const residentMap = new Map<string, { id: string; unitNumber: string | null }>();
  for (const r of RESIDENTS) {
    let user = await db.user.findUnique({ where: { email: r.email } });
    if (!user) {
      user = await db.user.create({
        data: { name: r.name, email: r.email, phone: r.phone, unitNumber: r.unitNumber, passwordHash: sharedHash, role: Role.RESIDENT, isVerified: true },
      });
      console.log(`✓ Resident: ${user.email}`);
    }
    residentMap.set(r.email, user);
  }

  // ── Merchants ──────────────────────────────────────────────────────────────
  const merchantMap = new Map<string, { id: string }>();
  for (const m of MERCHANTS) {
    let user = await db.user.findUnique({ where: { email: m.email } });
    if (!user) {
      user = await db.user.create({
        data: { name: m.name, email: m.email, phone: m.phone, unitNumber: m.unitNumber, passwordHash: sharedHash, role: Role.MERCHANT, isVerified: true },
      });
      console.log(`✓ Merchant: ${user.email}`);
    }
    merchantMap.set(m.email, user);
  }

  // ── Shops + Photos + Products ──────────────────────────────────────────────
  const shopMap = new Map<string, { id: string }>();
  const productMap = new Map<string, { id: string; price: number; name: string; nameAr: string }>();

  for (const s of SHOPS) {
    const merchant = merchantMap.get(s.merchantEmail)!;
    let shop = await db.shop.findFirst({ where: { merchantId: merchant.id } });
    if (!shop) {
      shop = await db.shop.create({
        data: {
          name: s.name,
          nameAr: s.nameAr,
          description: s.description,
          descriptionAr: s.descriptionAr,
          category: s.category,
          workingHours: s.workingHours,
          isOpen: s.isOpen,
          phone: s.phone,
          deliveryTime: s.deliveryTime,
          merchantId: merchant.id,
          photos: { create: s.photos },
        },
      });
      console.log(`✓ Shop: ${shop.name}`);
    }
    shopMap.set(s.name, shop);

    for (const p of s.products) {
      let product = await db.product.findFirst({ where: { shopId: shop.id, name: p.name } });
      if (!product) {
        product = await db.product.create({ data: { ...p, shopId: shop.id } });
      }
      productMap.set(`${s.name}::${p.name}`, product);
    }
    console.log(`✓ ${s.products.length} products for ${s.name}`);
  }

  // ── Orders ─────────────────────────────────────────────────────────────────
  for (const o of ORDERS) {
    const resident = residentMap.get(o.residentEmail)!;
    const shop = shopMap.get(o.shopName)!;
    const existing = await db.order.findFirst({ where: { residentId: resident.id, shopId: shop.id, status: o.status } });
    if (existing) continue;

    const items = o.items.map((item) => {
      const product = productMap.get(`${o.shopName}::${item.productName}`)!;
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        productNameSnapshot: product.name,
        productNameArSnapshot: product.nameAr,
      };
    });

    const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    await db.order.create({
      data: {
        residentId: resident.id,
        shopId: shop.id,
        status: o.status,
        totalAmount,
        deliveryUnit: resident.unitNumber!,
        paymentMethod: o.paymentMethod,
        isPaid: o.isPaid,
        notes: o.notes ?? undefined,
        items: { create: items },
      },
    });
  }
  console.log(`✓ ${ORDERS.length} orders created`);

  // ── Reviews ────────────────────────────────────────────────────────────────
  for (const r of REVIEWS) {
    const resident = residentMap.get(r.residentEmail)!;
    const shop = shopMap.get(r.shopName)!;
    await db.review.upsert({
      where: { userId_shopId: { userId: resident.id, shopId: shop.id } },
      create: { userId: resident.id, shopId: shop.id, rating: r.rating, comment: r.comment },
      update: {},
    });
  }
  console.log(`✓ ${REVIEWS.length} reviews created`);

  // ── Announcements + Comments ───────────────────────────────────────────────
  const firstResident = residentMap.get(RESIDENTS[0].email)!;
  for (const a of ANNOUNCEMENTS) {
    let ann = await db.announcement.findFirst({ where: { title: a.title } });
    if (!ann) {
      ann = await db.announcement.create({
        data: {
          title: a.title,
          titleAr: a.titleAr,
          body: a.body,
          bodyAr: a.bodyAr,
          category: a.category,
          publishedAt: new Date(a.publishedAt),
        },
      });
      if (a.comment) {
        await db.comment.create({ data: { body: a.comment, userId: firstResident.id, announcementId: ann.id } });
      }
    }
  }
  console.log(`✓ ${ANNOUNCEMENTS.length} announcements + comments created`);

  // ── Reports ────────────────────────────────────────────────────────────────
  for (const r of REPORTS) {
    const existing = await db.report.findFirst({ where: { title: r.title } });
    if (!existing) {
      await db.report.create({ data: { ...r, publishedAt: new Date(r.publishedAt) } });
    }
  }
  console.log(`✓ ${REPORTS.length} report(s) created`);

  // ── Poll + Options + Votes ─────────────────────────────────────────────────
  let poll = await db.poll.findFirst({ where: { question: POLL.question } });
  if (!poll) {
    const created = await db.poll.create({
      data: {
        question: POLL.question,
        questionAr: POLL.questionAr,
        expiresAt: new Date(POLL.expiresAt),
        options: { create: POLL.options },
      },
      include: { options: true },
    });
    poll = created;
    const optionMap = new Map(created.options.map((o) => [o.label, o.id]));
    for (const v of POLL.votes) {
      const resident = residentMap.get(v.residentEmail)!;
      const optionId = optionMap.get(v.optionLabel)!;
      await db.vote.upsert({
        where: { userId_pollId: { userId: resident.id, pollId: poll.id } },
        create: { userId: resident.id, pollId: poll.id, optionId },
        update: {},
      });
    }
    console.log(`✓ Poll + ${POLL.options.length} options + ${POLL.votes.length} votes created`);
  }

  // ── Election + Candidates + Votes ──────────────────────────────────────────
  let election = await db.election.findFirst({ where: { title: ELECTION.title } });
  if (!election) {
    const created = await db.election.create({
      data: {
        title: ELECTION.title,
        titleAr: ELECTION.titleAr,
        description: ELECTION.description,
        expiresAt: new Date(ELECTION.expiresAt),
        resultsOpen: false,
        visibilityMode: ELECTION.visibilityMode,
        candidates: { create: ELECTION.candidates },
      },
      include: { candidates: true },
    });
    election = created;
    const candidateMap = new Map(created.candidates.map((c) => [c.name, c.id]));
    for (const v of ELECTION.votes) {
      const resident = residentMap.get(v.residentEmail)!;
      const candidateId = candidateMap.get(v.candidateName)!;
      await db.electionVote.upsert({
        where: { userId_electionId: { userId: resident.id, electionId: election.id } },
        create: { userId: resident.id, electionId: election.id, candidateId },
        update: {},
      });
    }
    console.log(`✓ Election + ${ELECTION.candidates.length} candidates + ${ELECTION.votes.length} vote(s) created`);
  }

  // ── Feedback + Replies ─────────────────────────────────────────────────────
  for (const f of FEEDBACK) {
    const resident = residentMap.get(f.residentEmail)!;
    const existing = await db.feedback.findFirst({ where: { userId: resident.id, category: f.category } });
    if (!existing) {
      const fb = await db.feedback.create({
        data: {
          userId: resident.id,
          category: f.category,
          body: f.body,
          isAnonymous: f.isAnonymous,
          status: f.status,
          attachments: [],
        },
      });
      if (f.reply) {
        await db.feedbackReply.create({ data: { feedbackId: fb.id, authorId: admin.id, body: f.reply } });
      }
    }
  }
  console.log(`✓ ${FEEDBACK.length} feedback submissions created`);

  // ── Notifications ──────────────────────────────────────────────────────────
  const existingNotifs = await db.notification.count();
  if (existingNotifs === 0) {
    for (const n of NOTIFICATIONS) {
      const resident = residentMap.get(n.residentEmail)!;
      await db.notification.create({
        data: {
          userId: resident.id,
          type: n.type,
          title: n.title,
          titleAr: n.titleAr,
          body: n.body,
          bodyAr: n.bodyAr,
          isRead: n.isRead,
        },
      });
    }
    console.log(`✓ ${NOTIFICATIONS.length} notifications created`);
  }

  // ── Notification Preferences ───────────────────────────────────────────────
  const allUsers = [admin, ...residentMap.values(), ...merchantMap.values()];
  const notifTypes = Object.values(NotificationType);
  for (const user of allUsers) {
    for (const type of notifTypes) {
      await db.notificationPreference.upsert({
        where: { userId_type: { userId: user.id, type } },
        create: { userId: user.id, type, enabled: true },
        update: {},
      });
    }
  }
  console.log('✓ Notification preferences set for all users');

  // ── Saved Shops ────────────────────────────────────────────────────────────
  for (const ss of SAVED_SHOPS) {
    const resident = residentMap.get(ss.residentEmail)!;
    const shop = shopMap.get(ss.shopName)!;
    await db.savedShop.upsert({
      where: { userId_shopId: { userId: resident.id, shopId: shop.id } },
      create: { userId: resident.id, shopId: shop.id },
      update: {},
    });
  }
  console.log(`✓ ${SAVED_SHOPS.length} saved shop(s) created`);

  console.log('\n✅ Seed complete!\n');
  console.log('Test credentials (all share the same password):');
  console.log(`  Password:  ${ADMIN.password}`);
  console.log(`  Admin:     ${ADMIN.email}`);
  console.log(`  Residents: ${RESIDENTS.map(r => r.email).join(', ')}`);
  console.log(`  Merchants: ${MERCHANTS.map(m => m.email).join(', ')}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
