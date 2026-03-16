import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

function usage() {
  console.error("Usage: npm run user:create -- <email> <password> <role> [name]");
  console.error("Roles: admin | editor | viewer");
}

async function main() {
  const [emailArg, passwordArg, roleArg, ...nameArgs] = process.argv.slice(2);

  if (!emailArg || !passwordArg || !roleArg) {
    usage();
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const password = passwordArg.trim();
  const role = roleArg.trim().toLowerCase();
  const name = nameArgs.join(" ").trim() || null;

  if (!["admin", "editor", "viewer"].includes(role)) {
    usage();
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      isActive: true,
      passwordHash
    },
    create: {
      name,
      email,
      role,
      isActive: true,
      passwordHash
    }
  });

  console.log(`User ready: ${user.email} (${user.role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
