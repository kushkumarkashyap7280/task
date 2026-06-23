import React from 'react'

type Product = {
  id: number
  name: string
  price: number
  image_url: string
  description?: string
  createdAt: string
  category: { name: string }
}

interface ProductCardProps {
  product: Product
  index: number // 1-based index from the frontend
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  // Format index to a beautiful padded string, e.g., #001
  const formattedIndex = `#${String(index).padStart(3, '0')}`

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/60 transition-all duration-500 hover:-translate-y-1.5 hover:border-violet-500/30 hover:shadow-[0_12px_30px_-10px_rgba(139,92,246,0.15)] backdrop-blur-md">
      {/* Glow Effect Backdrop */}
      <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-violet-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      {/* Card Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 group-hover:rotate-1"
          loading="lazy"
        />
        
        {/* Subtle dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/35" />

        {/* Index/Numbering Badge */}
        <div className="absolute top-3 left-3 select-none rounded-lg bg-slate-950/80 px-2.5 py-1 text-xs font-mono font-bold tracking-wider text-violet-400 border border-violet-500/20 backdrop-blur-md shadow-lg shadow-black/40">
          {formattedIndex}
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3 rounded-md bg-violet-600/95 px-2 py-0.5 text-2xs font-semibold tracking-wide uppercase text-white shadow-md">
          {product.category.name}
        </div>

        {/* Price Tag in Image */}
        <div className="absolute bottom-3 right-3 rounded-lg bg-emerald-500/90 px-3 py-1 text-sm font-bold text-white shadow-md backdrop-blur-sm border border-emerald-400/20">
          ₹{product.price.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-slate-100 group-hover:text-violet-400 transition-colors duration-300">
          {product.name}
        </h3>
        
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
          {product.description || "No description provided for this product."}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-900">
          <span className="text-3xs text-slate-500 uppercase tracking-widest font-mono">
            ID: {product.id}
          </span>
          <span className="text-3xs text-slate-500 font-mono">
            {new Date(product.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

// Skeleton loader for loading state
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-900 bg-slate-950/40 animate-pulse">
      <div className="relative aspect-[4/3] w-full bg-slate-900/80" />
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="h-6 w-3/4 rounded bg-slate-900" />
        <div className="h-4 w-full rounded bg-slate-900" />
        <div className="h-4 w-5/6 rounded bg-slate-900" />
        <div className="mt-auto pt-4 border-t border-slate-900/50 flex justify-between">
          <div className="h-3 w-1/4 rounded bg-slate-900" />
          <div className="h-3 w-1/3 rounded bg-slate-900" />
        </div>
      </div>
    </div>
  )
}
