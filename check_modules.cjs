const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const modules = await prisma.modules.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log("Last 5 modules:");
    modules.forEach(m => {
      console.log(`- ID: ${m.id}, Name: ${m.name}, DriveName: ${m.googleDriveFolderName}, DriveUrl: ${m.googleDriveFolderUrl}`);
    });
  } catch (err) {
    console.error("Diagnostic failed:", err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

check();
