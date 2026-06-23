// prisma/seed.ts
import  prisma  from '@/lib/prisma'



async function main() {
  console.log('Seeding categories...')

  await prisma.category.createMany({
    data: [
      { name: 'Electronics' },
      { name: 'Shoes' },
      { name: 'Clothing' },
      { name: 'Books' },
      { name: 'Home & Kitchen' },
    ]
  })

  // fetch real IDs — don't assume they're 1,2,3,4,5
  const categories = await prisma.category.findMany({ select: { id: true } })
  const ids = categories.map(c => c.id)

  console.log(`Found category IDs: ${ids}`)
  console.log('Seeding 200,000 products...')

  const start = Date.now()

 await prisma.$executeRaw`
    INSERT INTO "Product" (name, "categoryId", price, image_url, description, "createdAt", "updatedAt")
    SELECT
      'Product #' || i,
      (ARRAY[${ids[0]}::int, ${ids[1]}::int, ${ids[2]}::int, ${ids[3]}::int, ${ids[4]}::int])[(i % 5) + 1],
      ROUND((random() * 999 + 1)::numeric, 2),
      'https://picsum.photos/seed/' || i || '/400/300',
      'Description for product ' || i,
      NOW() - (random() * INTERVAL '365 days'),
      NOW()
    FROM generate_series(1, 200000) AS s(i)
  `

  const end = Date.now()
  console.log(`Done! 200,000 products seeded in ${((end - start) / 1000).toFixed(2)}s`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())