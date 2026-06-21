const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    include: { studentProfile: true },
    orderBy: { firebaseUid: 'desc' },
    take: 5
  });
  console.log("Recent Students:");
  users.forEach(u => {
    console.log(`- ${u.email}: facultyId=${u.studentProfile?.facultyId}`);
  });

  const challenges = await prisma.challenge.findMany({
    include: { faculties: true },
    take: 5
  });
  console.log("\nRecent Challenges:");
  challenges.forEach(c => {
    console.log(`- ${c.title}: isPrivate=${c.isPrivate}, faculties=${c.faculties.map(f=>f.name).join(',')}`);
  });
}
check().finally(() => prisma.$disconnect());
