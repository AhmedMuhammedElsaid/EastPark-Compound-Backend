import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const db = new PrismaClient();

async function main() {
    const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@eastpark.app';
    const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123456';
    const name = process.env.SEED_ADMIN_NAME ?? 'EastPark Admin';

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`Admin already exists: ${email}`);
        return;
    }

    const passwordHash = await argon2.hash(password);

    const admin = await db.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: Role.ADMIN,
            isVerified: true,
        },
    });

    console.log(`✓ Admin created: ${admin.email} (id: ${admin.id})`);
    console.log(`  Password: ${password}`);
    console.log(`  Change this password after first login!`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => db.$disconnect());
