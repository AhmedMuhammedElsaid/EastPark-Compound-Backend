import { PrismaClient, Role, OrderStatus, PaymentMethod, FeedbackStatus, NotificationType, ElectionVisibilityMode, ShopCategory, AnnouncementCategory, FeedbackCategory } from '@prisma/client';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

const db = new PrismaClient();
const sample = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample.json'), 'utf-8'));

async function main() {
  console.log('🌱 Seeding database from sample.json...\n');

  const hash = await argon2.hash(sample.admin.password);

  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? sample.admin.email;
  let admin = await db.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await db.user.create({
      data: {
        name: process.env.SEED_ADMIN_NAME ?? sample.admin.name,
        email: adminEmail,
        passwordHash: await argon2.hash(process.env.SEED_ADMIN_PASSWORD ?? sample.admin.password),
        role: Role.ADMIN,
        isVerified: true,
        unitNumber: sample.admin.unitNumber,
      },
    });
    console.log(`✓ Admin: ${admin.email}`);
  } else {
    console.log(`· Admin already exists: ${admin.email}`);
  }

  // ── Residents ──────────────────────────────────────────────────────────────
  const residentMap = new Map<string, Awaited<ReturnType<typeof db.user.create>>>();
  for (const r of sample.residents) {
    let user = await db.user.findUnique({ where: { email: r.email } });
    if (!user) {
      user = await db.user.create({
        data: { name: r.name, email: r.email, phone: r.phone, unitNumber: r.unitNumber, passwordHash: hash, role: Role.RESIDENT, isVerified: true },
      });
      console.log(`✓ Resident: ${user.email}`);
    }
    residentMap.set(r.email, user);
  }

  // ── Merchants ──────────────────────────────────────────────────────────────
  const merchantMap = new Map<string, Awaited<ReturnType<typeof db.user.create>>>();
  for (const m of sample.merchants) {
    let user = await db.user.findUnique({ where: { email: m.email } });
    if (!user) {
      user = await db.user.create({
        data: { name: m.name, email: m.email, phone: m.phone, unitNumber: m.unitNumber, passwordHash: hash, role: Role.MERCHANT, isVerified: true },
      });
      console.log(`✓ Merchant: ${user.email}`);
    }
    merchantMap.set(m.email, user);
  }

  // ── Shops + Photos + Products ──────────────────────────────────────────────
  const shopMap = new Map<string, Awaited<ReturnType<typeof db.shop.create>>>();
  const productMap = new Map<string, Awaited<ReturnType<typeof db.product.create>>>();

  for (const s of sample.shops) {
    const merchant = merchantMap.get(s.merchantEmail)!;
    let shop = await db.shop.findFirst({ where: { merchantId: merchant.id } });
    if (!shop) {
      shop = await db.shop.create({
        data: {
          name: s.name,
          nameAr: s.nameAr,
          description: s.description,
          descriptionAr: s.descriptionAr,
          category: s.category as ShopCategory,
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
  for (const o of sample.orders) {
    const resident = residentMap.get(o.residentEmail)!;
    const shop = shopMap.get(o.shopName)!;
    const existing = await db.order.findFirst({ where: { residentId: resident.id, shopId: shop.id, status: o.status as OrderStatus } });
    if (existing) continue;

    const items = o.items.map((item: { productName: string; quantity: number }) => {
      const product = productMap.get(`${o.shopName}::${item.productName}`)!;
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        productNameSnapshot: product.name,
        productNameArSnapshot: product.nameAr,
      };
    });

    const totalAmount = items.reduce(
      (sum: number, i: { unitPrice: number; quantity: number }) => sum + i.unitPrice * i.quantity,
      0,
    );

    await db.order.create({
      data: {
        residentId: resident.id,
        shopId: shop.id,
        status: o.status as OrderStatus,
        totalAmount,
        deliveryUnit: resident.unitNumber!,
        paymentMethod: o.paymentMethod as PaymentMethod,
        isPaid: o.isPaid,
        notes: o.notes ?? undefined,
        items: { create: items },
      },
    });
  }
  console.log(`✓ ${sample.orders.length} orders created`);

  // ── Reviews ────────────────────────────────────────────────────────────────
  for (const r of sample.reviews) {
    const resident = residentMap.get(r.residentEmail)!;
    const shop = shopMap.get(r.shopName)!;
    await db.review.upsert({
      where: { userId_shopId: { userId: resident.id, shopId: shop.id } },
      create: { userId: resident.id, shopId: shop.id, rating: r.rating, comment: r.comment },
      update: {},
    });
  }
  console.log(`✓ ${sample.reviews.length} reviews created`);

  // ── Announcements + Comments ───────────────────────────────────────────────
  const firstResident = residentMap.get(sample.residents[0].email)!;
  for (const a of sample.announcements) {
    let ann = await db.announcement.findFirst({ where: { title: a.title } });
    if (!ann) {
      ann = await db.announcement.create({
        data: {
          title: a.title,
          titleAr: a.titleAr,
          body: a.body,
          bodyAr: a.bodyAr,
          category: a.category as AnnouncementCategory,
          publishedAt: new Date(a.publishedAt),
        },
      });
      if (a.comment) {
        await db.comment.create({ data: { body: a.comment, userId: firstResident.id, announcementId: ann.id } });
      }
    }
  }
  console.log(`✓ ${sample.announcements.length} announcements + comments created`);

  // ── Reports ────────────────────────────────────────────────────────────────
  for (const r of sample.reports) {
    const existing = await db.report.findFirst({ where: { title: r.title } });
    if (!existing) {
      await db.report.create({ data: { ...r, publishedAt: new Date(r.publishedAt) } });
    }
  }
  console.log(`✓ ${sample.reports.length} report(s) created`);

  // ── Poll + Options + Votes ─────────────────────────────────────────────────
  const p = sample.poll;
  let poll = await db.poll.findFirst({ where: { question: p.question } });
  if (!poll) {
    poll = await db.poll.create({
      data: {
        question: p.question,
        questionAr: p.questionAr,
        expiresAt: new Date(p.expiresAt),
        options: { create: p.options },
      },
      include: { options: true },
    });
    const optionMap = new Map(poll.options.map((o: { label: string; id: string }) => [o.label, o.id]));
    for (const v of p.votes) {
      const resident = residentMap.get(v.residentEmail)!;
      const optionId = optionMap.get(v.optionLabel)!;
      await db.vote.upsert({
        where: { userId_pollId: { userId: resident.id, pollId: poll.id } },
        create: { userId: resident.id, pollId: poll.id, optionId },
        update: {},
      });
    }
    console.log(`✓ Poll + ${p.options.length} options + ${p.votes.length} votes created`);
  }

  // ── Election + Candidates + Votes ──────────────────────────────────────────
  const e = sample.election;
  let election = await db.election.findFirst({ where: { title: e.title } });
  if (!election) {
    election = await db.election.create({
      data: {
        title: e.title,
        titleAr: e.titleAr,
        description: e.description,
        expiresAt: new Date(e.expiresAt),
        resultsOpen: false,
        visibilityMode: e.visibilityMode as ElectionVisibilityMode,
        candidates: { create: e.candidates },
      },
      include: { candidates: true },
    });
    const candidateMap = new Map(election.candidates.map((c: { name: string; id: string }) => [c.name, c.id]));
    for (const v of e.votes) {
      const resident = residentMap.get(v.residentEmail)!;
      const candidateId = candidateMap.get(v.candidateName)!;
      await db.electionVote.upsert({
        where: { userId_electionId: { userId: resident.id, electionId: election.id } },
        create: { userId: resident.id, electionId: election.id, candidateId },
        update: {},
      });
    }
    console.log(`✓ Election + ${e.candidates.length} candidates + ${e.votes.length} vote(s) created`);
  }

  // ── Feedback + Replies ─────────────────────────────────────────────────────
  for (const f of sample.feedback) {
    const resident = residentMap.get(f.residentEmail)!;
    const existing = await db.feedback.findFirst({ where: { userId: resident.id, category: f.category as FeedbackCategory } });
    if (!existing) {
      const fb = await db.feedback.create({
        data: {
          userId: resident.id,
          category: f.category as FeedbackCategory,
          body: f.body,
          isAnonymous: f.isAnonymous,
          status: f.status as FeedbackStatus,
          attachments: [],
        },
      });
      if (f.reply) {
        await db.feedbackReply.create({ data: { feedbackId: fb.id, authorId: admin.id, body: f.reply } });
      }
    }
  }
  console.log(`✓ ${sample.feedback.length} feedback submissions created`);

  // ── Notifications ──────────────────────────────────────────────────────────
  const existingNotifs = await db.notification.count();
  if (existingNotifs === 0) {
    for (const n of sample.notifications) {
      const resident = residentMap.get(n.residentEmail)!;
      await db.notification.create({
        data: {
          userId: resident.id,
          type: n.type as NotificationType,
          title: n.title,
          titleAr: n.titleAr,
          body: n.body,
          bodyAr: n.bodyAr,
          isRead: n.isRead,
        },
      });
    }
    console.log(`✓ ${sample.notifications.length} notifications created`);
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
  for (const ss of sample.savedShops) {
    const resident = residentMap.get(ss.residentEmail)!;
    const shop = shopMap.get(ss.shopName)!;
    await db.savedShop.upsert({
      where: { userId_shopId: { userId: resident.id, shopId: shop.id } },
      create: { userId: resident.id, shopId: shop.id },
      update: {},
    });
  }
  console.log(`✓ ${sample.savedShops.length} saved shop(s) created`);

  console.log('\n✅ Seed complete!\n');
  console.log('Test credentials (all share the same password):');
  console.log(`  Password:  ${sample.admin.password}`);
  console.log(`  Admin:     ${adminEmail}`);
  console.log(`  Residents: ${sample.residents.map((r: { email: string }) => r.email).join(', ')}`);
  console.log(`  Merchants: ${sample.merchants.map((m: { email: string }) => m.email).join(', ')}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
