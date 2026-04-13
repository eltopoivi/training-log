import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_USER_EMAIL ?? 'ivan@local.test';
  const name = process.env.SEED_USER_NAME ?? 'Ivan';

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name },
  });

  console.log(`Seeded user: ${user.email} (id=${user.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
