import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";


///api/products?limit=10&cursor=999.00_145&categoryId=2&search=nike&sortBy=price&sortOrder=asc

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const limit      = Number(searchParams.get('limit')) || 10
  const cursor     = searchParams.get('cursor')
  const categoryId = searchParams.get('categoryId')
  const search     = searchParams.get('search')
  const sortBy     = searchParams.get('sortBy') || 'createdAt'     // default newest first
  const sortOrder  = searchParams.get('sortOrder') || 'desc'

  const where: any = {}

  if (categoryId) where.categoryId = Number(categoryId)
  if (search) where.name = { contains: search, mode: 'insensitive' }

  // cursor logic depends on sortBy
  if (cursor) {
    const [cursorValue, cursorId] = cursor.split('_')

    if (sortBy === 'price') {
      const price = Number(cursorValue)
      where.OR = [
        { price: sortOrder === 'asc' ? { gt: price } : { lt: price } },
        {
          price: price,
          id: { lt: Number(cursorId) }
        }
      ]
    } else if (sortBy === 'name') {
      const name = cursorValue
      where.OR = [
        { name: sortOrder === 'asc' ? { gt: name } : { lt: name } },
        {
          name: name,
          id: { lt: Number(cursorId) }
        }
      ]
    } else {
      // default — createdAt
      const date = new Date(cursorValue)
      where.OR = [
        { createdAt: sortOrder === 'asc' ? { gt: date } : { lt: date } },
        {
          createdAt: { equals: date },
          id: { lt: Number(cursorId) }
        }
      ]
    }
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: [
      { [sortBy]: sortOrder },   // dynamic sort field
      { id: 'desc' }             // always tiebreaker
    ],
    take: limit,
    select: {
      id: true,
      name: true,
      price: true,
      image_url: true,
      createdAt: true,
      category: { select: { name: true } }
    }
  })

  const lastItem = products[products.length - 1]

  // cursor value depends on sortBy
  const getCursorValue = (item: any) => {
    if (sortBy === 'price') return `${item.price}_${item.id}`
    if (sortBy === 'name') return `${item.name}_${item.id}`
    return `${item.createdAt.toISOString()}_${item.id}`
  }

  const nextCursor = lastItem ? getCursorValue(lastItem) : null

  return Response.json({
    data: products,
    nextCursor,
    hasMore: nextCursor !== null
  })
}