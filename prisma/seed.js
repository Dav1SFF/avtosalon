const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin User
  const adminEmail = "admin@vidkrytyi.com.ua";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync("admin", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Адміністратор",
        role: "ADMIN",
      },
    });
    console.log("Admin user created (admin@vidkrytyi.com.ua / admin)");
  } else {
    console.log("Admin user already exists");
  }

  // 2. Clear old cars (optional)
  await prisma.car.deleteMany({});
  console.log("Cleared old car records");

  // 3. Realistic Cars List
  const cars = [
    {
      make: "BMW",
      model: "330i (G20) M Sport",
      price: 34950,
      year: 2022,
      mileage: 26000,
      engine: "2.0 бензин",
      transmission: "Автомат",
      drive: "Повний привід",
      body: "Седан",
      color: "Білий",
      owners: 1,
      status: "IN_STOCK",
      isNew: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=1200"
      ]),
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      description: "Офіційний автомобіль в ідеальному стані. Оригінальний пробіг. Обслуговувався виключно на офіційному дилері BMW. Жодних підфарбувань чи ДТП. Багата комплектація M Sport: спортивні сидіння, M кермо, адаптивна підвіска, преміальна оптика, круїз-контроль, великий монітор мультимедіа.",
      specs: JSON.stringify({
        engineVol: "1998 см³",
        power: "258 к.с.",
        acceleration: "5.8 с",
        maxSpeed: "250 км/год",
        consumption: "7.2 л/100км"
      }),
      equipment: JSON.stringify([
        "M Sport пакет",
        "Шкіряний салон Dakota",
        "Камери 360",
        "Адаптивний круїз-контроль",
        "Акустика Harman Kardon",
        "Безключовий доступ",
        "Панорамний дах",
        "Підігрів керма та всіх сидінь"
      ]),
      serviceHistory: JSON.stringify([
        { date: "2023-05-15", mileage: 12000, type: "Регламентне ТО", note: "Заміна оливи, повітряного та масляного фільтрів. Зауважень немає." },
        { date: "2024-06-20", mileage: 24500, type: "Друге ТО", note: "Заміна оливи, всіх фільтрів, гальмівної рідини. Перевірка ходової частини." }
      ]),
      seoTitle: "BMW 330i G20 M Sport 2022 купити в Києві - VIDKRYTYI",
      seoDescription: "Продаж BMW 330i G20 M Sport 2022 року. Офіційне авто з пробігом 26 тис. км. Стан нового автомобіля. Кредит, лізинг, трейд-ін."
    },
    {
      make: "Volkswagen",
      model: "Tiguan R-Line",
      price: 29900,
      year: 2021,
      mileage: 48000,
      engine: "2.0 бензин",
      transmission: "Автомат",
      drive: "Повний привід",
      body: "Кросовер",
      color: "Білий",
      owners: 1,
      status: "IN_STOCK",
      isNew: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1621993202323-f438eec934ff?auto=format&fit=crop&q=80&w=1200"
      ]),
      description: "Volkswagen Tiguan у топовій комплектації R-Line. Куплений новим в Україні. Ідеальний сімейний кросовер з динамічним характером. Салон алькантара, цифрова панель приладів Active Info Display, асистенти паркування, утримання в смузі, екстрене гальмування.",
      specs: JSON.stringify({
        engineVol: "1984 см³",
        power: "220 к.с.",
        acceleration: "6.5 с",
        maxSpeed: "220 км/год",
        consumption: "8.4 л/100км"
      }),
      equipment: JSON.stringify([
        "R-Line обвіс та диски R19",
        "Світлодіодна оптика IQ.Light",
        "Цифровий кокпіт",
        "Бездротовий Apple CarPlay",
        "Трьохзонний клімат-контроль",
        "Електропривід багажника",
        "Підігрів лобового скла"
      ]),
      serviceHistory: JSON.stringify([
        { date: "2022-08-10", mileage: 15000, type: "ТО-1", note: "Офіційне сервісне обслуговування." },
        { date: "2023-09-12", mileage: 31000, type: "ТО-2", note: "Заміна оливи в коробці DSG та свічок запалювання." },
        { date: "2024-10-05", mileage: 45000, type: "ТО-3", note: "Заміна передніх гальмівних колодок, фільтрів." }
      ]),
      seoTitle: "Volkswagen Tiguan R-Line 2021 купити - VIDKRYTYI",
      seoDescription: "Преміальний кросовер Volkswagen Tiguan R-Line 2021 року з оригінальним пробігом 48 тис. км. Офіційний, один власник."
    },
    {
      make: "Alfa Romeo",
      model: "Stelvio Veloce",
      price: 27500,
      year: 2020,
      mileage: 55000,
      engine: "2.0 бензин",
      transmission: "Автомат",
      drive: "Повний привід",
      body: "Кросовер",
      color: "Червоний",
      owners: 2,
      status: "IN_STOCK",
      isNew: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1627454820516-dc767bcb4d3e?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1627454819213-f77e07a3eeaa?auto=format&fit=crop&q=80&w=1200"
      ]),
      description: "Справжні італійські емоції та бездоганна керованість. Alfa Romeo Stelvio у версії Veloce. Червоний колір Rosso Alfa. Алюмінієві підрульові пелюстки, спортивний випуск, ідеальний розподіл ваги 50:50. Стан кузова та салону відмінний.",
      specs: JSON.stringify({
        engineVol: "1995 см³",
        power: "280 к.с.",
        acceleration: "5.7 с",
        maxSpeed: "230 км/год",
        consumption: "7.9 л/100км"
      }),
      equipment: JSON.stringify([
        "Veloce спортивні крісла з підтримкою",
        "Преміум шкіра з тисненням логотипу",
        "19-дюймові легкосплавні диски",
        "Аудіосистема преміум-класу",
        "Адаптивний круїз та утримання смуги",
        "Ксенонова оптика з авторегулюванням"
      ]),
      serviceHistory: JSON.stringify([
        { date: "2023-11-20", mileage: 42000, type: "Велике ТО", note: "Заміна гальмівних дисків, колодок, свічок, рідин." }
      ]),
      seoTitle: "Alfa Romeo Stelvio Veloce 2020 купити Київ - VIDKRYTYI",
      seoDescription: "Продаж спортивного кросовера Alfa Romeo Stelvio 2020 року. Потужність 280 к.с., повний привід Q4. Привезений з мінімальними пошкодженнями."
    },
    {
      make: "Infiniti",
      model: "QX50 Essential",
      price: 24900,
      year: 2019,
      mileage: 70000,
      engine: "2.0 бензин",
      transmission: "Автомат",
      drive: "Повний привід",
      body: "Кросовер",
      color: "Сірий",
      owners: 2,
      status: "IN_STOCK",
      isNew: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200"
      ]),
      description: "Інноваційний двигун VC-Turbo із змінним ступенем стиснення. Комфорт та розкіш японського преміум бренду. Комплектація Essential: шкіра наппа, панорама, камери 360 градусів, проекція на лобове скло, акустика Bose.",
      specs: JSON.stringify({
        engineVol: "1997 см³",
        power: "268 к.с.",
        acceleration: "7.3 с",
        maxSpeed: "220 км/год",
        consumption: "8.9 л/100км"
      }),
      equipment: JSON.stringify([
        "Шкіра Nappa з перфорацією",
        "Панорамний скляний дах",
        "Акустика Bose (16 динаміків)",
        "Круговий огляд 360",
        "Світлодіодні LED фари",
        "Диски R20"
      ]),
      serviceHistory: JSON.stringify([
        { date: "2024-02-15", mileage: 65000, type: "ТО", note: "Регулярне обслуговування із заміною фільтрів та оливи." }
      ]),
      seoTitle: "Infiniti QX50 2019 ціна київ - VIDKRYTYI",
      seoDescription: "Продаж Infiniti QX50 2019 року. Максимальна комплектація Essential, панорама, акустика Bose, повний привід."
    },
    {
      make: "Porsche",
      model: "Taycan 4S",
      price: 68500,
      year: 2021,
      mileage: 32000,
      engine: "Електро",
      transmission: "Автомат",
      drive: "Повний привід",
      body: "Седан",
      color: "Чорний",
      owners: 1,
      status: "BOOKED",
      isNew: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1611245801314-e0e5a2b4b2ef?auto=format&fit=crop&q=80&w=1200"
      ]),
      description: "Повністю електричний спорткар від Porsche. Версія 4S з великою батареєю Performance Plus. Неймовірна динаміка, пневмопідвіска, поворотна задня вісь. Автомобіль затягнутий у захисну матову плівку.",
      specs: JSON.stringify({
        engineVol: "Електро",
        power: "571 к.с.",
        acceleration: "4.0 с",
        maxSpeed: "250 км/год",
        consumption: "22 кВт/100км"
      }),
      equipment: JSON.stringify([
        "Батарея Performance Plus 93.4 кВт",
        "Пневматична підвіска PASM",
        "Керамічні гальма PCCB",
        "Матричні фари PDLS Plus",
        "Акустика Burmester 3D",
        "Салон із натуральної шкіри Club Leather"
      ]),
      serviceHistory: JSON.stringify([
        { date: "2023-07-10", mileage: 18000, type: "Плановий сервіс", note: "Діагностика батареї, оновлення ПЗ, заміна салонного фільтра." }
      ]),
      seoTitle: "Porsche Taycan 4S 2021 купити в Україні - VIDKRYTYI",
      seoDescription: "Ексклюзивний електрокар Porsche Taycan 4S 2021 року. Батарея 93.4 кВт, потужність 571 к.с. Стан нового авто. Заброньовано."
    }
  ];

  for (const car of cars) {
    await prisma.car.create({
      data: car,
    });
  }

  // 4. Seed some Reviews
  await prisma.review.deleteMany({});
  await prisma.review.createMany({
    data: [
      { name: "Олександр Коваль", rating: 5, comment: "Дуже задоволений купівлею BMW 5-ї серії. Авто повністю відповідало опису, перевірка на СТО підтвердила всі слова менеджера. Рекомендую салон!", status: "APPROVED" },
      { name: "Марія Литвин", rating: 5, comment: "Купували тут кросовер по системі Trade-In. Наше старе авто оцінили дуже адекватно, процедура оформлення зайняла всього 2 години. Дякую за оперативність!", status: "APPROVED" },
      { name: "Дмитро Вернидуб", rating: 5, comment: "Чесність — це головне, що я зустрів у VIDKRYTYI. Пробіг рідний, історія обслуговування чиста. Наступне авто купуватиму тільки тут.", status: "APPROVED" }
    ]
  });

  // 5. Seed Banners
  await prisma.banner.deleteMany({});
  await prisma.banner.create({
    data: {
      title: "Відкрито про автомобілі",
      subtitle: "Чесні автомобілі з перевіреною історією. Понад 1000 проданих авто.",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920",
      link: "/catalog"
    }
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
