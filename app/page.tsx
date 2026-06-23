'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard'

// ── types ──────────────────────────────────────────────
type Product = {
  id: number
  name: string
  price: number
  image_url: string
  description?: string
  createdAt: string
  category: { name: string }
}

type ProductsResponse = {
  data: Product[]
  nextCursor: string | null
  hasMore: boolean
}

// ── fetcher ────────────────────────────────────────────
const fetchProducts = async ({
  pageParam = null,
  categoryId,
  search,
  sortBy,
  sortOrder,
}: {
  pageParam?: string | null
  categoryId: string
  search: string
  sortBy: string
  sortOrder: string
}): Promise<ProductsResponse> => {
  const params = new URLSearchParams({ sortBy, sortOrder, limit: '10' })
  if (pageParam) params.set('cursor', pageParam)
  if (categoryId) params.set('categoryId', categoryId)
  if (search) params.set('search', search)

  const res = await fetch(`/api/products?${params}`)
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

// ── component ──────────────────────────────────────────
export default function Home() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showScrollTop, setShowScrollTop] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  // Debounce search to prevent excessive database hits on 200,000 rows
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 450)
    return () => clearTimeout(handler)
  }, [search])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['products', categoryId, debouncedSearch, sortBy, sortOrder],
    queryFn: ({ pageParam }) =>
      fetchProducts({
        pageParam,
        categoryId,
        search: debouncedSearch,
        sortBy,
        sortOrder,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null,
     staleTime: 600 * 1000,          // ← data stays fresh 60 seconds, no refetch during this
  refetchOnWindowFocus: false,   // ← switching tabs won't trigger refetch
  })

  // Flatten all pages into one array
  const products = data?.pages.flatMap((page) => page.data) ?? []

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )
    if (bottomRef.current) observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Track window scroll for "Scroll to Top" button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isInitialLoading = status === 'pending' && isFetching && !isFetchingNextPage

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-emerald-600/5 blur-[150px]" />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header Hero Section */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-950/30 px-3.5 py-1.5 text-xs font-medium text-violet-400 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            200K+ Products Loaded
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-emerald-400 bg-clip-text text-transparent">
              Infinite Showcase
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
            Explore our massive, high-performance catalog. Seamlessly sort, filter, and search with lightning-fast infinite scroll.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/new"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:-translate-y-0.5"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Insert Products
            </Link>
          </div>
        </header>

        {/* Filter / Search Controls Container */}
        <section className="sticky top-6 z-40 mb-10 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            
            {/* Search Input */}
            <div className="relative md:col-span-6">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-3 pl-11 pr-10 text-sm placeholder-slate-500 transition-all focus:border-violet-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/10 text-slate-100"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category Select */}
            <div className="md:col-span-3">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900/60 py-3 px-4 text-sm text-slate-200 transition-all focus:border-violet-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/10 cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <option value="" className="bg-slate-950 text-slate-300">All Categories</option>
                <option value="1" className="bg-slate-950 text-slate-300">Electronics</option>
                <option value="2" className="bg-slate-950 text-slate-300">Shoes</option>
                <option value="3" className="bg-slate-950 text-slate-300">Clothing</option>
                <option value="4" className="bg-slate-950 text-slate-300">Books</option>
                <option value="5" className="bg-slate-950 text-slate-300">Home & Kitchen</option>
              </select>
            </div>

            {/* Sorting Select */}
            <div className="md:col-span-3">
              <select
                value={`${sortBy}_${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('_')
                  setSortBy(by)
                  setSortOrder(order)
                }}
                className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900/60 py-3 px-4 text-sm text-slate-200 transition-all focus:border-violet-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/10 cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <option value="createdAt_desc" className="bg-slate-950 text-slate-300">Newest First</option>
                <option value="createdAt_asc" className="bg-slate-950 text-slate-300">Oldest First</option>
                <option value="price_asc" className="bg-slate-950 text-slate-300">Price: Low to High</option>
                <option value="price_desc" className="bg-slate-950 text-slate-300">Price: High to Low</option>
                <option value="name_asc" className="bg-slate-950 text-slate-300">Name: A to Z</option>
                <option value="name_desc" className="bg-slate-950 text-slate-300">Name: Z to A</option>
              </select>
            </div>

          </div>

          {/* Stats Bar */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-900/80 pt-3 text-xs text-slate-400">
            <div>
              {status === 'success' && (
                <span>
                  Loaded <strong className="text-violet-400">{products.length}</strong> items
                </span>
              )}
              {isFetching && !isFetchingNextPage && <span className="ml-2 text-slate-500">(Refetching...)</span>}
            </div>
            {debouncedSearch && (
              <div>
                Search term: <strong className="text-violet-400">"{debouncedSearch}"</strong>
              </div>
            )}
          </div>
        </section>

        {/* Error State */}
        {status === 'error' && (
          <div className="my-12 rounded-2xl border border-red-500/20 bg-red-950/20 p-8 text-center backdrop-blur-sm">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-bold text-slate-200">Error Loading Products</h3>
            <p className="mt-2 text-sm text-slate-400">Something went wrong while fetching the products from the database.</p>
            <button
              onClick={() => refetch()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Initial Loading Grid */}
        {isInitialLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Product Cards Grid */}
        {status === 'success' && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index + 1} // 1-based frontend index
              />
            ))}

            {/* Additional Skeleton placeholders for Infinite Loading */}
            {isFetchingNextPage &&
              Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={`skeleton-${i}`} />
              ))}
          </div>
        )}

        {/* Scroll Sentinel */}
        <div ref={bottomRef} className="h-20 w-full" />

        {/* Empty State */}
        {status === 'success' && products.length === 0 && (
          <div className="my-16 text-center">
            <svg className="mx-auto h-16 w-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-4 text-lg font-bold text-slate-300">No Products Found</h3>
            <p className="mt-2 text-sm text-slate-500">We couldn't find any products matching your search criteria.</p>
            <button
              onClick={() => {
                setSearch('')
                setCategoryId('')
              }}
              className="mt-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* End of Results Message */}
        {!hasNextPage && products.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm text-slate-400 backdrop-blur-md">
              <svg className="h-4.5 w-4.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              You've viewed all products. Beautifully done!
            </div>
          </div>
        )}

      </main>

      {/* Floating Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-950/90 text-slate-400 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:text-violet-400 ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  )
}