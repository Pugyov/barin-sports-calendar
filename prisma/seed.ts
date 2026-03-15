import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const TYPE_TAGS = [
  "Social media post",
  "Website",
  "Team Spotlight",
  "Athlete Spotlight",
  "Campaign",
  "Webinar",
  "Spotlight",
  "Highlight",
  "Report",
  "Roadmap",
  "Production",
  "Other",
  "Case study",
  "Interview",
  "Article",
  "Collaboration",
  "BFU",
  "RG",
  "Badminton"
];

function getSeedUsers() {
  const defaultPassword = "ChangeMe123!";

  return [
    {
      email: (process.env.SEED_ADMIN_EMAIL ?? "admin@local.test").trim().toLowerCase(),
      password: process.env.SEED_ADMIN_PASSWORD ?? defaultPassword,
      role: "admin"
    },
    {
      email: (process.env.SEED_EDITOR_EMAIL ?? "editor@local.test").trim().toLowerCase(),
      password: process.env.SEED_EDITOR_PASSWORD ?? defaultPassword,
      role: "editor"
    },
    {
      email: (process.env.SEED_VIEWER_EMAIL ?? "viewer@local.test").trim().toLowerCase(),
      password: process.env.SEED_VIEWER_PASSWORD ?? defaultPassword,
      role: "viewer"
    }
  ];
}

async function seedTypeTags() {
  for (const name of TYPE_TAGS) {
    await prisma.typeTag.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
}

async function seedUsers() {
  const users = getSeedUsers();

  for (const user of users) {
    const passwordHash = await hash(user.password, 12);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        role: user.role,
        isActive: true,
        passwordHash
      },
      create: {
        email: user.email,
        role: user.role,
        isActive: true,
        passwordHash
      }
    });
  }

  console.log("Seeded users:");
  for (const user of users) {
    console.log(`- ${user.email} (${user.role})`);
  }

  if (!process.env.SEED_ADMIN_PASSWORD && !process.env.SEED_EDITOR_PASSWORD && !process.env.SEED_VIEWER_PASSWORD) {
    console.log("Default password used for seeded accounts: ChangeMe123!");
  }
}

async function main() {
  await seedTypeTags();
  await seedUsers();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
