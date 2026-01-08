import { PrismaClient } from '@prisma/client';
import elasticsearchService from '../service/utils/elasticSearch.service';

const prisma = new PrismaClient();

async function main() {
  // Lấy tất cả sản phẩm và variant từ database
  const products = await prisma.products.findMany({
    include: {
      category: true,
      variants: true,
    },
  });

  // Index từng sản phẩm vào ElasticSearch
  for (const product of products) {
    // Index thông tin sản phẩm chính
    await elasticsearchService.index('products', product.id, {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category?.name,
      coverImg: product.coverImg,
    });

    // Index các variant của sản phẩm
    for (const variant of product.variants) {
      await elasticsearchService.index('product_variants', variant.id, {
        id: variant.id,
        productId: product.id,
        size: variant.size,
        color: variant.color,
        imageUri: variant.imageUri,
        price: variant.price,
        quantity: variant.quantity,
        discount_percentage: variant.discount_percentage,
      });
    }
  }

  console.log('✅ Đã index dữ liệu sản phẩm và variant lên ElasticSearch!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi index ElasticSearch:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
