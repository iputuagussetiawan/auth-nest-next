import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Product Discount' }

export default function ProductDiscountPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold tracking-tight">Product Discount</h1>
        </div>
    )
}
