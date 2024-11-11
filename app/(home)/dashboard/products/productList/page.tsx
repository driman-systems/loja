import Link from 'next/link';
import prisma from '@/lib/prisma';
import { FaEdit } from 'react-icons/fa';
import Image from 'next/image';
import ButtonDeleteProduct from '@/components/dashboard/button-delete-product';

export const dynamic = 'force-dynamic';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  promoPrice: number | null;
  hasDateReservation: boolean;
  hasTimeReservation: boolean;
  reservationDays: number[];
  reservationTimes: any;  
  reservationLimits: any; 
  includedItems: string[];
  notIncludedItems: string[];
  image: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductList = async () => {
  const products: Product[] = await prisma.product.findMany();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Lista de Produtos</h2>
        <Link href="/dashboard/products/create" className="px-4 py-2 bg-transparent text-xs border border-gray-500 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-300">
            Criar Novo Produto
        </Link>
      </div>
      <div>
        <ul className="space-y-4">
          {products.map((product) => (
            <li key={product.id} className="p-4 bg-gray-800 rounded-md shadow flex items-center space-x-4 hover:bg-gray-700 transition-all duration-300">
              <Image 
                src={product.image || '/default-image.png'} 
                alt={product.title} 
                width={100} 
                height={56} 
                className="object-cover rounded-md"
                priority
              />
              <div className="flex-1">
                <div className="font-semibold text-white">
                  <Link href={`/produtos/${product.id}`} className="hover:underline" target='_blank'>
                    {product.title} - R${product.price.toFixed(2)}
                  </Link>
                </div>
                {product.promoPrice && (
                  <div className="text-red-500">Promoção: R${product.promoPrice.toFixed(2)}</div>
                )}
                {product.hasTimeReservation && product.reservationTimes.length > 0 && (
                  <div className="text-sm text-gray-400">
                    Horários disponíveis: {product.reservationTimes.join(', ')}
                  </div>
                )}
              </div>
              {/* Ações */}
              <div className="flex space-x-2">
                {/* Botão de Editar */}
                <Link href={`/dashboard/products/edit/${product.id}`} className="text-gray-400 hover:text-blue-400 transition" title="Editar Produto">
                  <FaEdit size={20} />
                </Link>
                {/* Botão de Excluir */}
                <ButtonDeleteProduct product={product} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductList;
