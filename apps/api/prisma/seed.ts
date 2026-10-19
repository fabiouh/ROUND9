// Development seed: one clearly fictional course so rounds can be created locally.
// Not real course data; ratings and stroke indexes are invented.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const pars = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5];
const strokeIndexes = [7, 11, 15, 1, 9, 3, 17, 13, 5, 8, 16, 2, 6, 12, 10, 18, 4, 14];

const name = 'ROUND9 Demo Links (fictional)';
if (!(await prisma.golfCourse.findFirst({ where: { name } }))) {
  await prisma.golfCourse.create({
    data: {
      name,
      country: 'AT',
      city: 'Demo',
      holes: { create: pars.map((par, i) => ({ holeNumber: i + 1, par, strokeIndex: strokeIndexes[i]! })) },
      tees: {
        create: [
          { name: 'White', courseRating: 72.1, slopeRating: 131 },
          { name: 'Yellow', courseRating: 70.4, slopeRating: 127 },
          { name: 'Red', courseRating: 72.8, slopeRating: 125, genderCategory: 'women' },
        ],
      },
    },
  });
  console.log(`Seeded ${name}`);
}
await prisma.$disconnect();
