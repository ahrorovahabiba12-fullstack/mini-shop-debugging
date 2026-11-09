import * as bcrypt from 'bcrypt';
import { Category } from '../categories/entities/category.entity';
import { Role } from '../common/enums/role.enum';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { AppDataSource } from './data-source';

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const categoryRepo = AppDataSource.getRepository(Category);
  const productRepo = AppDataSource.getRepository(Product);

  const adminEmail = 'admin@shop.uz';
  if (!(await userRepo.findOneBy({ email: adminEmail }))) {
    await userRepo.save(
      userRepo.create({
        email: adminEmail,
        password: await bcrypt.hash('Admin123!', 10),
        fullName: 'Shop Admin',
        role: Role.ADMIN,
      }),
    );
  }

  const categoriesData = [
    { name: 'Smartfonlar', slug: 'smartfonlar' },
    { name: 'Noutbuklar', slug: 'noutbuklar' },
    { name: 'Aksessuarlar', slug: 'aksessuarlar' },
  ];

  const categories: Record<string, Category> = {};
  for (const data of categoriesData) {
    let category = await categoryRepo.findOneBy({ slug: data.slug });
    if (!category) {
      category = await categoryRepo.save(categoryRepo.create(data));
    }
    categories[data.slug] = category;
  }

  if ((await productRepo.count()) === 0) {
    const products = [
      { name: 'Galaxy S24', price: 899.99, stock: 15, slug: 'smartfonlar' },
      { name: 'iPhone 15', price: 999.5, stock: 10, slug: 'smartfonlar' },
      { name: 'Pixel 8', price: 699, stock: 8, slug: 'smartfonlar' },
      { name: 'Redmi Note 13', price: 249.9, stock: 30, slug: 'smartfonlar' },
      { name: 'MacBook Air M3', price: 1299, stock: 5, slug: 'noutbuklar' },
      {
        name: 'ThinkPad X1 Carbon',
        price: 1549.99,
        stock: 4,
        slug: 'noutbuklar',
      },
      { name: 'Dell XPS 13', price: 1199.95, stock: 6, slug: 'noutbuklar' },
      { name: 'ASUS Zenbook 14', price: 949, stock: 7, slug: 'noutbuklar' },
      { name: 'USB-C kabel', price: 9.99, stock: 200, slug: 'aksessuarlar' },
      {
        name: 'Simsiz quloqchin',
        price: 79.9,
        stock: 40,
        slug: 'aksessuarlar',
      },
      {
        name: 'Powerbank 20000 mAh',
        price: 39.5,
        stock: 25,
        slug: 'aksessuarlar',
      },
      { name: "Telefon g'ilofi", price: 14.99, stock: 3, slug: 'aksessuarlar' },
    ];

    for (const { slug, ...data } of products) {
      await productRepo.save(
        productRepo.create({
          ...data,
          description: `${data.name} — test mahsulot`,
          category: categories[slug],
        }),
      );
    }
  }

  console.log('Seed completed: admin@shop.uz / Admin123!');
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
