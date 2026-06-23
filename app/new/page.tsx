'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createProducts, ProductInput } from '../actions'

// Helper to generate a random high-quality placeholder image
const getRandomImageUrl = () => {
  const seed = Math.floor(Math.random() * 100000)
  return `https://picsum.photos/seed/${seed}/400/300`
}

export default function NewProductPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null)

  // Initialize with one empty product, with a pre-filled random image URL
  const [formItems, setFormItems] = useState<ProductInput[]>([
    {
      name: '',
      price: 0,
      categoryId: 1, // Default to Electronics
      image_url: getRandomImageUrl(),
      description: '',
    },
  ])

  // Handlers for dynamic batch inputs
  const handleItemChange = (index: number, field: keyof ProductInput, value: any) => {
    setFormItems((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: field === 'price' || field === 'categoryId' ? Number(value) : value,
      }
      return updated
    })
  }

  const addFormItem = () => {
    setFormItems((prev) => [
      ...prev,
      {
        name: '',
        price: 0,
        categoryId: 1,
        image_url: getRandomImageUrl(),
        description: '',
      },
    ])
    setStatus(null)
  }

  const removeFormItem = (index: number) => {
    if (formItems.length === 1) return
    setFormItems((prev) => prev.filter((_, i) => i !== index))
    setStatus(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)

    // Basic client validation
    for (let i = 0; i < formItems.length; i++) {
      const item = formItems[i]
      if (!item.name.trim()) {
        setStatus({ success: false, message: `Product #${i + 1} is missing a name.` })
        return
      }
      if (item.price <= 0) {
        setStatus({ success: false, message: `Product #${i + 1} must have a price greater than 0.` })
        return
      }
      if (!item.image_url.trim()) {
        setStatus({ success: false, message: `Product #${i + 1} requires an image URL.` })
        return
      }
    }

    startTransition(async () => {
      const response = await createProducts(formItems)
      if (response.success) {
        setStatus({
          success: true,
          message: `Successfully inserted ${response.count} product(s) into the catalog!`,
        })
        // Reset form
        setFormItems([
          {
            name: '',
            price: 0,
            categoryId: 1,
            image_url: getRandomImageUrl(),
            description: '',
          },
        ])
      } else {
        setStatus({
          success: false,
          message: response.error || 'Failed to insert products.',
        })
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background Decorative Blurs */}
      <div className="absolute top-0 left-1/3 -z-10 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="absolute bottom-10 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-emerald-600/5 blur-[120px]" />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Navigation / Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:border-slate-700 hover:text-white backdrop-blur-md"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Catalog
          </Link>
          <span className="text-xs font-mono text-slate-500">BATCH CREATOR</span>
        </div>

        <header className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-violet-400 to-indigo-200 bg-clip-text text-transparent">
            Insert Products
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Create new items one by one or click <strong className="text-violet-400">Add Product to Batch</strong> to insert multiple products in a single operation.
          </p>
        </header>

        {/* Status Messaging */}
        {status && (
          <div
            className={`mb-8 rounded-xl border p-5 text-sm backdrop-blur-sm ${
              status.success
                ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300'
                : 'border-red-500/20 bg-red-950/20 text-red-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {status.success ? (
                <svg className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              <div>
                <p className="font-bold">{status.success ? 'Success' : 'Error'}</p>
                <p className="mt-1 text-xs opacity-90">{status.message}</p>
                {status.success && (
                  <div className="mt-4 flex gap-4">
                    <button
                      onClick={() => setStatus(null)}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                    >
                      Insert More
                    </button>
                    <Link
                      href="/"
                      className="rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors"
                    >
                      View in Catalog
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            {formItems.map((item, index) => (
              <div
                key={index}
                className="relative rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-xl backdrop-blur-md transition-all duration-300"
              >
                {/* Header for item */}
                <div className="mb-4 flex items-center justify-between border-b border-slate-900 pb-3">
                  <span className="text-xs font-mono font-bold tracking-wider text-violet-400">
                    PRODUCT #{index + 1}
                  </span>
                  {formItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFormItem(index)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-950/20 px-2.5 py-1 text-2xs font-semibold text-red-400 transition-colors hover:bg-red-950/50 hover:text-red-300"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
                  {/* Name field */}
                  <div className="sm:col-span-8">
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      placeholder="e.g. Mechanical Keyboard"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 px-3.5 text-sm placeholder-slate-600 transition-all focus:border-violet-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/10 text-slate-100"
                    />
                  </div>

                  {/* Price field */}
                  <div className="sm:col-span-4">
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={item.price || ''}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      placeholder="999.00"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 px-3.5 text-sm placeholder-slate-600 transition-all focus:border-violet-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/10 text-slate-100"
                    />
                  </div>

                  {/* Category select */}
                  <div className="sm:col-span-4">
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Category *
                    </label>
                    <div className="relative">
                      <select
                        value={item.categoryId}
                        onChange={(e) => handleItemChange(index, 'categoryId', e.target.value)}
                        className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 pl-3.5 pr-10 text-sm text-slate-200 transition-all focus:border-violet-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/10 cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundSize: '1.25rem',
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        <option value="1" className="bg-slate-950 text-slate-300">Electronics</option>
                        <option value="2" className="bg-slate-950 text-slate-300">Shoes</option>
                        <option value="3" className="bg-slate-950 text-slate-300">Clothing</option>
                        <option value="4" className="bg-slate-950 text-slate-300">Books</option>
                        <option value="5" className="bg-slate-950 text-slate-300">Home & Kitchen</option>
                      </select>
                    </div>
                  </div>

                  {/* Image URL field */}
                  <div className="sm:col-span-8">
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Image URL *
                    </label>
                    <div className="relative flex gap-2">
                      <input
                        type="text"
                        required
                        value={item.image_url}
                        onChange={(e) => handleItemChange(index, 'image_url', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 px-3.5 text-sm placeholder-slate-600 transition-all focus:border-violet-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/10 text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleItemChange(index, 'image_url', getRandomImageUrl())}
                        title="Regenerate random placeholder image"
                        className="rounded-xl border border-slate-800 bg-slate-900/40 px-3.5 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Description field */}
                  <div className="sm:col-span-12">
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Write a brief overview of the product..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 px-3.5 text-sm placeholder-slate-600 transition-all focus:border-violet-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/10 text-slate-100 resize-y"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-900 pt-6">
            <button
              type="button"
              onClick={addFormItem}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-600/10 hover:bg-violet-600/25 px-5 py-3 text-sm font-semibold text-violet-400 transition-colors disabled:opacity-50"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product to Batch
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <svg className="h-4.5 w-4.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving Batch...
                </>
              ) : (
                <>
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit {formItems.length} Product{formItems.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
