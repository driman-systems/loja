"use server"
import { NextResponse } from 'next/server';
import { createCompany, getCompanies, updateCompany, deleteCompany } from '@/actions/companyActions';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';


export async function POST(request: Request) {
    try {
      const formData = await request.formData();
      const newCompany = await createCompany(formData);
      return NextResponse.json(newCompany, { status: 201 });
    } catch (error: any) {
      // Verifica se o erro é uma violação de chave única (como CNPJ duplicado)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return NextResponse.json({ message: 'CNPJ ou Email já cadastrado.' }, { status: 400 });
      }
  
      return NextResponse.json({ message: 'Erro ao criar a empresa' }, { status: 500 });
    }
  }
  

  export async function GET() {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
      },
    });
    return NextResponse.json(companies);
  }

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const updatedCompany = await updateCompany(formData);
    return NextResponse.json(updatedCompany, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar a empresa:', error);
    return NextResponse.json({ error: 'Erro ao atualizar a empresa' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await deleteCompany(id);
    return NextResponse.json({ message: 'Empresa deletada com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao deletar a empresa:', error);
    return NextResponse.json({ error: 'Erro ao deletar a empresa' }, { status: 500 });
  }
}
