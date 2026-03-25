import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'addfgh177@gmail.com';
  const password = 'KararAdmin2024!'; // Change this in Railway after first login
  const name = 'Karar';

  // Check if admin already exists
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists:', email);
    return;
  }

  // Create admin
  const hashedPassword = await bcrypt.hash(password, 12);
  const admin = await prisma.admin.create({
    data: { email, password: hashedPassword, name },
  });

  console.log('Admin created successfully!');
  console.log('Email:', admin.email);
  console.log('Password: KararAdmin2024!');
  console.log('\n⚠️  IMPORTANT: Change your password after first login!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
