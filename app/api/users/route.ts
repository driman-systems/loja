import { NextResponse, NextRequest } from 'next/server';
import { createUser, getClientByEmail } from '@/actions/userActions';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('Content-Type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      await createUser(formData);
    } else {
      const data = await request.json();
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      await createUser(formData);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar o usuário:', error);
    return NextResponse.json({ error: 'Erro ao criar o usuário' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'E-mail não fornecido' }, { status: 400 });
    }

    const client = await getClientByEmail(email);

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar o cliente:', error);
    return NextResponse.json({ error: 'Erro ao buscar o cliente' }, { status: 500 });
  }
}

