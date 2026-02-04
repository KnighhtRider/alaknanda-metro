import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log("🌱 Seeding database...");

  /* ---------------- CLEAR DATA (OPTIONAL) ---------------- */
  await prisma.stationAudienceMap.deleteMany();
  await prisma.stationTypeMap.deleteMany();
  await prisma.stationProduct.deleteMany();
  await prisma.stationLine.deleteMany();
  await prisma.stationImage.deleteMany();
  await prisma.station.deleteMany();
  await prisma.product.deleteMany();
  await prisma.line.deleteMany();
  // await prisma.stationAudience.deleteMany();
  // await prisma.stationType.deleteMany();
  // await prisma.users.deleteMany();

  /* ---------------- ADMIN USER ---------------- */
  // await prisma.users.create({
  //   data: { username: "admin", password: "alaknanda123" },
  // });

  /* ---------------- MASTER LINES ---------------- */
  const masterLines = [
    { name: "Yellow", color: "#FFD700" },
    { name: "Blue", color: "#0052CC" },
    { name: "Magenta", color: "#E10098" },
    { name: "Red", color: "#D32F2F" },
    { name: "Violet", color: "#673AB7" },
    { name: "Airport Express", color: "#9E9E9E" },
    { name: "Pink", color: "#EC407A" },
  ];

  const lineMap = {};
  for (const l of masterLines) {
    const line = await prisma.line.create({ data: l });
    lineMap[l.name] = line.id;
  }

  /* ---------------- MASTER AUDIENCES ---------------- */
  const audiences = ["Shopping", "Residential", "Business", "Student"];

  const audienceMap= {};
  for (const name of audiences) {
    const a = await prisma.stationAudience.create({ data: { name } });
    audienceMap[name] = a.id;
  }

  /* ---------------- MASTER TYPES ---------------- */
  const types = ["Popular", "High Footfall", "Interchange"];

  const typeMap= {};
  for (const name of types) {
    const t = await prisma.stationType.create({ data: { name } });
    typeMap[name] = t.id;
  }

  /* ---------------- MASTER PRODUCTS ---------------- */
  const masterProducts = [
    { name: "Backlit Panels", defaultRateMonth: 45000, defaultRateDay: 1500 },
    {
      name: "Ambient Lit Panels",
      defaultRateMonth: 60000,
      defaultRateDay: 2000,
    },
    {
      name: "Platform Screen Doors",
      defaultRateMonth: 38000,
      defaultRateDay: 1300,
    },
    {
      name: "Promotional Spaces",
      defaultRateMonth: 38000,
      defaultRateDay: 1400,
    },
    { name: "Digital Screens", defaultRateMonth: 55000, defaultRateDay: 1900 },
    {
      name: "Co-Branding Rights",
      defaultRateMonth: 65000,
      defaultRateDay: 2100,
    },
    { name: "Pillars", defaultRateMonth: 42000, defaultRateDay: 1500 },
  ];

  const productMap = {};
  for (const p of masterProducts) {
    const prod = await prisma.product.create({
      data: {
        ...p,
        thumbnail: "https://dummyimage.com/600x400/cccccc/ffffff",
      },
    });
    productMap[p.name] = prod.id;
  }

  /* ---------------- STATIONS ---------------- */
  const stations = [
    {
      name: "Rajiv Chowk",
      lines: ["Yellow", "Blue"],
      audiences: ["Shopping", "Business", "Student"],
      types: ["Interchange", "High Footfall"],
      footfall: "~5,20,000 riders/day",
      description: "Major interchange station in central Delhi.",
      address: "Connaught Place, New Delhi",
      latitude: 28.6328,
      longitude: 77.2197,
      totalInventory: 100,
      products: [
        { name: "Backlit Panels", units: 22 },
        { name: "Digital Screens", units: 18 },
        { name: "Ambient Lit Panels", units: 15 },
        { name: "Promotional Spaces", units: 20 },
      ],
    },

    {
      name: "Hauz Khas",
      lines: ["Yellow", "Magenta"],
      audiences: ["Student", "Residential", "Business"],
      types: ["Interchange", "Popular"],
      footfall: "~3,50,000 riders/day",
      description: "Interchange near educational and residential zones.",
      address: "Hauz Khas, New Delhi",
      latitude: 28.5494,
      longitude: 77.2067,
      totalInventory: 85,
      products: [
        { name: "Backlit Panels", units: 18 },
        { name: "Digital Screens", units: 12 },
        { name: "Promotional Spaces", units: 14 },
      ],
    },

    {
      name: "Kashmere Gate",
      lines: ["Yellow", "Red", "Violet"],
      audiences: ["Student", "Business", "Shopping"],
      types: ["Interchange", "High Footfall"],
      footfall: "~4,80,000 riders/day",
      description: "One of the busiest interchange stations.",
      address: "Kashmere Gate, New Delhi",
      latitude: 28.6673,
      longitude: 77.2273,
      totalInventory: 120,
      products: [
        { name: "Digital Screens", units: 25 },
        { name: "Ambient Lit Panels", units: 20 },
        { name: "Pillars", units: 35 },
        { name: "Promotional Spaces", units: 22 },
      ],
    },

    {
      name: "Dwarka Sector 21",
      lines: ["Blue", "Airport Express"],
      audiences: ["Residential", "Business"],
      types: ["High Footfall", "Popular"],
      footfall: "~2,50,000 riders/day",
      description: "Terminal station connecting Airport Express.",
      address: "Dwarka, New Delhi",
      latitude: 28.5489,
      longitude: 77.0684,
      totalInventory: 75,
      products: [
        { name: "Digital Screens", units: 14 },
        { name: "Platform Screen Doors", units: 18 },
        { name: "Co-Branding Rights", units: 6 },
      ],
    },

    {
      name: "Saket",
      lines: ["Yellow"],
      audiences: ["Shopping", "Residential", "Student"],
      types: ["Popular"],
      footfall: "~2,70,000 riders/day",
      description: "Station serving malls and residential areas.",
      address: "Saket, New Delhi",
      latitude: 28.5294,
      longitude: 77.2193,
      totalInventory: 70,
      products: [
        { name: "Backlit Panels", units: 16 },
        { name: "Promotional Spaces", units: 14 },
        { name: "Digital Screens", units: 10 },
      ],
    },

    {
      name: "Lajpat Nagar",
      lines: ["Violet", "Pink"],
      audiences: ["Shopping", "Residential", "Business"],
      types: ["Interchange", "Popular"],
      footfall: "~3,20,000 riders/day",
      description: "Interchange on Ring Road with heavy retail activity.",
      address: "Lajpat Nagar, New Delhi",
      latitude: 28.5674,
      longitude: 77.2435,
      totalInventory: 85,
      products: [
        { name: "Backlit Panels", units: 20 },
        { name: "Ambient Lit Panels", units: 14 },
        { name: "Digital Screens", units: 12 },
      ],
    },

    {
      name: "IGI Airport T3",
      lines: ["Airport Express"],
      audiences: ["Business", "Shopping"],
      types: ["High Footfall", "Popular"],
      footfall: "~1,00,000 riders/day",
      description: "Premium airport terminal station.",
      address: "IGI Airport, New Delhi",
      latitude: 28.5562,
      longitude: 77.1,
      totalInventory: 40,
      products: [
        { name: "Co-Branding Rights", units: 8 },
        { name: "Digital Screens", units: 10 },
        { name: "Platform Screen Doors", units: 12 },
      ],
    },
  ];

  for (const s of stations) {
    const st = await prisma.station.create({
      data: {
        name: s.name,
        description: s.description,
        address: s.address,
        latitude: s.latitude,
        longitude: s.longitude,
        footfall: s.footfall,
        totalInventory: s.totalInventory,
      },
    });

    /* LINES */
    for (const line of s.lines) {
      await prisma.stationLine.create({
        data: { stationId: st.id, lineId: lineMap[line] },
      });
    }

    /* AUDIENCES */
    for (const aud of s.audiences) {
      await prisma.stationAudienceMap.create({
        data: { stationId: st.id, audienceId: audienceMap[aud] },
      });
    }

    /* TYPES */
    for (const type of s.types) {
      await prisma.stationTypeMap.create({
        data: { stationId: st.id, typeId: typeMap[type] },
      });
    }

    /* PRODUCTS */
    for (const p of s.products) {
      await prisma.stationProduct.create({
        data: {
          stationId: st.id,
          productId: productMap[p.name],
          units: p.units,
        },
      });
    }

    /* IMAGES */
    for (let i = 0; i < 3; i++) {
      await prisma.stationImage.create({
        data: {
          stationId: st.id,
          imageUrl: `https://dummyimage.com/800x600/${Math.floor(
            Math.random() * 999
          )}/ffffff`,
        },
      });
    }
  }

  console.log("✔ Seeding completed successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
