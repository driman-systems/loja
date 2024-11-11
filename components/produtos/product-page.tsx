"use client"
import Image from 'next/image';
import DetalhesProduto from './detalhes-produto';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ProductPageProps {
  product: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    promoPrice: number | null;
    image: string | null;
    company: {
      logo: string | null;
    };
    includedItems: string[];
    notIncludedItems: string[];
  };
}

export default function ProductPage({ product }: ProductPageProps) {

  const { data: session } = useSession();
    const router = useRouter();

  const handleBuyNow = (productId: string) => {
    router.push(`/agendamento/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-4">
      <main className="px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col">
            {/* Imagem do Produto */}
            <div className="w-full relative" style={{ height: '200px' }}>
            <Image 
              src={product.image || '/default-product-image.png'} 
              alt={product.title} 
              fill
              style={{ objectFit: 'cover' }} 
              className="rounded-md"
            />
            </div>

            {/* Título e Descrição */}
            <div className="flex-1 mt-4">
              <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
              <div className="description mb-4" dangerouslySetInnerHTML={{ __html: product.description || "" }} />

              {/* Seção de Preços e Botão */}
              <div className="flex flex-col md:flex-row justify-between py-6 rounded-md space-y-5 md:space-y-0">
                <div className="flex items-start">
                  {product.promoPrice ? (
                    <div className="flex flex-col">
                      <span className="text-base text-gray-400">De <span className='line-through'> R${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></span>
                      <div className='flex flex-row space-x-2 items-end'>
                        <span className="text-sm pb-2">A partir de</span>
                        <span className="text-3xl font-bold text-white">R$ {product.promoPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-white">R${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  )}
                </div>
                
                {/* Botão Comprar */}
                <button 
                  onClick={() => handleBuyNow(product.id)}
                  className="bg-red-500 text-white px-6 py-2 rounded-md font-bold hover:bg-red-600 transition">
                  COMPRAR AGORA
                </button>
              </div>

              {/* Detalhes do Produto */}
              <DetalhesProduto 
                includedItems={product.includedItems || []} 
                notIncludedItems={product.notIncludedItems || []} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}