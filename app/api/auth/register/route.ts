import { NextResponse } from 'next/server';
import { createUser } from '@/actions/clientActions';

export async function POST(request: Request) {
    try {
        const contentType = request.headers.get('Content-Type') || '';

        let formData: FormData;

        if (contentType.includes('multipart/form-data')) {
            formData = await request.formData();
        } else {
            const data = await request.json();
            formData = new FormData();
            for (const key in data) {
                formData.append(key, data[key]);
            }
        }

        await createUser(formData);

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error: any) {
        console.error('Erro ao criar o usuário:', error);
        return NextResponse.json({ error: error.message || 'Erro ao criar o usuário' }, { status: 400 });
    }
}
