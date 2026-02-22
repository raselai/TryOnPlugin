import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Muse Hair Pro catalog...");

  // Seed shades
  const shades = [
    { name: "Jet Black", hexColor: "#0A0A0A", displayOrder: 1 },
    { name: "Off Black", hexColor: "#1B1B1B", displayOrder: 2 },
    { name: "Dark Brown", hexColor: "#3B2219", displayOrder: 3 },
    { name: "Medium Brown", hexColor: "#5C3A28", displayOrder: 4 },
    { name: "Chestnut Brown", hexColor: "#6A3E2E", displayOrder: 5 },
    { name: "Light Brown", hexColor: "#8B6847", displayOrder: 6 },
    { name: "Dark Blonde", hexColor: "#A67B4B", displayOrder: 7 },
    { name: "Honey Blonde", hexColor: "#C69C5E", displayOrder: 8 },
    { name: "Golden Blonde", hexColor: "#D4A843", displayOrder: 9 },
    { name: "Platinum Blonde", hexColor: "#E8D5B0", displayOrder: 10 },
    { name: "Auburn", hexColor: "#7B3621", displayOrder: 11 },
    { name: "Burgundy", hexColor: "#5C1A1A", displayOrder: 12 },
  ];

  for (const shade of shades) {
    await prisma.shade.upsert({
      where: { id: shade.name.toLowerCase().replace(/\s+/g, "-") },
      update: shade,
      create: { id: shade.name.toLowerCase().replace(/\s+/g, "-"), ...shade },
    });
    console.log(`  Shade: ${shade.name}`);
  }

  // Seed lengths
  const lengths = [
    { label: "14 inches", inches: 14, bodyLandmark: "shoulders", displayOrder: 1 },
    { label: "18 inches", inches: 18, bodyLandmark: "mid-back", displayOrder: 2 },
    { label: "22 inches", inches: 22, bodyLandmark: "waist", displayOrder: 3 },
    { label: "26 inches", inches: 26, bodyLandmark: "below waist", displayOrder: 4 },
  ];

  for (const length of lengths) {
    const id = `${length.inches}-inch`;
    await prisma.length.upsert({
      where: { id },
      update: length,
      create: { id, ...length },
    });
    console.log(`  Length: ${length.label}`);
  }

  // Seed textures
  const textures = [
    { name: "Straight", displayOrder: 1 },
    { name: "Wavy", displayOrder: 2 },
    { name: "Curly", displayOrder: 3 },
  ];

  for (const texture of textures) {
    const id = texture.name.toLowerCase();
    await prisma.texture.upsert({
      where: { id },
      update: texture,
      create: { id, ...texture },
    });
    console.log(`  Texture: ${texture.name}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
