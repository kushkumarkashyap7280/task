'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type ProductInput = {
  name: string
  price: number
  categoryId: number
  image_url: string
  description?: string
}

/**
 * Server Action to insert one or many products.
 */
export async function createProducts(products: ProductInput[]) {
  if (!products || products.length === 0) {
    return { success: false, error: "No products to insert." }
  }

  // Basic validation
  for (const product of products) {
    if (!product.name || product.name.trim() === "") {
      return { success: false, error: "Product name is required for all items." }
    }
    if (isNaN(product.price) || product.price <= 0) {
      return { success: false, error: "Price must be a positive number for all items." }
    }
    if (!product.categoryId || isNaN(product.categoryId)) {
      return { success: false, error: "Category is required for all items." }
    }
    if (!product.image_url || product.image_url.trim() === "") {
      return { success: false, error: "Image URL is required for all items." }
    }
  }

  try {
    // Insert products into the database using createMany
    const result = await prisma.product.createMany({
      data: products.map((p) => ({
        name: p.name.trim(),
        price: p.price,
        categoryId: Number(p.categoryId),
        image_url: p.image_url.trim(),
        description: p.description?.trim() || null,
      })),
    })

    // Revalidate the main store page
    revalidatePath("/")

    return { success: true, count: result.count }
  } catch (error: any) {
    console.error("Failed to insert products:", error)
    return { success: false, error: error.message || "Failed to save products to database." }
  }
}
