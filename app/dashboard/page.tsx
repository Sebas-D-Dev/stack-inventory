import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function Dashboard() {
  // Get inventory stats
  const [
    totalProducts,
    lowStockProducts,
    totalCategories,
    totalVendors,
    recentProducts
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({
      where: {
        quantity: {
          lte: prisma.product.fields.reorderThreshold
        }
      }
    }),
    prisma.category.count(),
    prisma.vendor.count(),
    prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        vendor: true
      }
    })
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Welcome back! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here&apos;s your inventory overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-lg shadow-sm" style={{ 
          backgroundColor: 'var(--card-background)', 
          borderColor: 'var(--card-border)',
          borderWidth: '1px'
        }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Products</h3>
          <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
        </div>
        
        <div className="p-6 rounded-lg shadow-sm" style={{ 
          backgroundColor: 'var(--card-background)', 
          borderColor: 'var(--card-border)',
          borderWidth: '1px'
        }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Low Stock Items</h3>
          <p className="text-3xl font-bold text-red-600">{lowStockProducts}</p>
        </div>
        
        <div className="p-6 rounded-lg shadow-sm" style={{ 
          backgroundColor: 'var(--card-background)', 
          borderColor: 'var(--card-border)',
          borderWidth: '1px'
        }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Categories</h3>
          <p className="text-3xl font-bold text-green-600">{totalCategories}</p>
        </div>
        
        <div className="p-6 rounded-lg shadow-sm" style={{ 
          backgroundColor: 'var(--card-background)', 
          borderColor: 'var(--card-border)',
          borderWidth: '1px'
        }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Vendors</h3>
          <p className="text-3xl font-bold text-purple-600">{totalVendors}</p>
        </div>
      </div>

      {/* Recent Products */}
      <div className="rounded-lg shadow-sm" style={{ 
        backgroundColor: 'var(--card-background)', 
        borderColor: 'var(--card-border)',
        borderWidth: '1px'
      }}>
        <div className="px-6 py-4" style={{ 
          borderColor: 'var(--card-border)',
          borderBottomWidth: '1px'
        }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ 
            backgroundColor: 'var(--table-background)'
          }}>
            <thead style={{ backgroundColor: 'var(--table-header-background)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--table-header-foreground)' }}>Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--table-header-foreground)' }}>SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--table-header-foreground)' }}>Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--table-header-foreground)' }}>Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--table-header-foreground)' }}>Price</th>
              </tr>
            </thead>
            <tbody style={{ 
              borderColor: 'var(--table-border)',
              borderTopWidth: '1px'
            }}>
              {recentProducts.map((product) => (
                <tr key={product.id} style={{ 
                  borderColor: 'var(--table-border)',
                  borderTopWidth: '1px'
                }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--table-cell-foreground-strong)' }}>
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--table-cell-foreground)' }}>
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--table-cell-foreground)' }}>
                    {product.category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--table-cell-foreground)' }}>
                    <span className={`${product.quantity <= product.reorderThreshold ? 'text-red-600 font-medium' : ''}`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--table-cell-foreground)' }}>
                    ${product.price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}