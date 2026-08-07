const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const images = JSON.stringify([
    "https://res.cloudinary.com/nlwawgpg/image/upload/l_logo3,w_150,g_south_east,x_10,y_10/ioyiiyzzp6esfmvknbve.jpg",
    "https://res.cloudinary.com/nlwawgpg/image/upload/l_logo3,w_150,g_south_east,x_10,y_10/rvjrtzgwz3udumu3m9yk.jpg",
    "https://res.cloudinary.com/nlwawgpg/image/upload/l_logo3,w_150,g_south_east,x_10,y_10/cxihokmx3jkk53vafn9m.jpg",
    "https://res.cloudinary.com/nlwawgpg/image/upload/l_logo3,w_150,g_south_east,x_10,y_10/kif5ypsnnr84p6hj0utp.jpg"
  ]);

  const car = await prisma.car.update({
    where: {
      id: "797bd1bb-b6c6-42ff-9bcd-c74673586b93"
    },
    data: {
      images: images
    }
  });
  console.log("Updated images successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
