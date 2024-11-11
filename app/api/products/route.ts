import { NextRequest, NextResponse } from 'next/server';
import { createProduct, getAllProducts, getProductById } from '@/actions/productActions'; 

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('Content-Type') || '';
    let formData: FormData;

    if (contentType.includes('multipart/form-data')) {
      formData = await request.formData();
    } else {
      const json = await request.json();
      formData = new FormData();
      for (const key in json) {
        formData.append(key, JSON.stringify(json[key]));
      }
    }

    // Utilize a função createProduct para criar o produto
    await createProduct(formData);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar o produto:', error);
    return NextResponse.json({ error: 'Erro ao criar o produto' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const productId = searchParams.get('productId')

    let responseData;

    if (productId) {
      // Busca o produto por ID
      responseData = await getProductById(productId);
    } else {
      // Busca todos os produtos
      responseData = await getAllProducts();
    }

    if (!responseData) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar o(s) produto(s):', error);
    return NextResponse.json({ error: 'Erro ao buscar o(s) produto(s)' }, { status: 500 });
  }
}

