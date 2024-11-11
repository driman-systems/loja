import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import ProductPage from '@/components/produtos/product-page';
import HeaderProduct from '@/components/produtos/header-produto';
import { authOptions } from '@/lib/auth';
import FooterProducts from '@/components/produtos/footer-produtos';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  promoPrice: number | null;
  image: string | null;
  company: {
    logo: string | null;
  };
  includedItems: string[],  
  notIncludedItems: string[], 
}

export default async function Page({ params }: { params: { id: string } }) {
  // Buscar os dados do produto pelo ID
  const product: Product | null = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      company: {
        select: {
          logo: true,
        },
      },
    },
  });

  // Verificar se o produto existe
  if (!product) {
    return <div>Produto não encontrado</div>;
  }

  // Buscar a sessão do usuário logado
  const session = await getServerSession(authOptions);

  // Extrair as informações do usuário da sessão (se estiver logado)
  const user = session?.user
    ? {
        name: session.user.name?.split(' ')[0], // Apenas o primeiro nome
        email: session.user.email,
        image: session.user.image,
      }
    : null;


  // Renderizar a página do produto com as informações do produto, empresa e usuário
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <HeaderProduct companyLogo={product.company.logo} user={user} />
      <ProductPage product={product} />
      <FooterProducts />
    </div>
  );
}
