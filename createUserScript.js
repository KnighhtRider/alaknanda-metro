import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.users.create({
    data: {
      username: "admin",
      password: "alaknanda123" // hash later
    }
  });

  console.log("User created:", user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
