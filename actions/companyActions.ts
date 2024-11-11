'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const companySchema = z.object({
  name: z.string().min(1),
  cnpj: z.string().length(14),
  phoneNumber: z.string().min(10),
  email: z.string().email(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  website: z.string().optional(),
  representative: z.string().optional(),
  representativePhone: z.string().optional(),
  sector: z.string().optional(),
  logo: z.string().optional(),  // Novo campo para logo
});

export const createCompany = async (formData: FormData) => {
  const parsedData = companySchema.safeParse(Object.fromEntries(formData));

  if (!parsedData.success) {
    throw new Error('Dados inválidos');
  }

  const companyData = parsedData.data;

  try {
    const newCompany = await prisma.company.create({
      data: {
        name: companyData.name,
        cnpj: companyData.cnpj,
        phoneNumber: companyData.phoneNumber,
        email: companyData.email,
        street: companyData.street || null,
        number: companyData.number || null,
        complement: companyData.complement || null,
        neighborhood: companyData.neighborhood || null,
        city: companyData.city || null,
        state: companyData.state || null,
        postalCode: companyData.postalCode || null,
        website: companyData.website || null,
        representative: companyData.representative || null,
        representativePhone: companyData.representativePhone || null,
        sector: companyData.sector || null,
        logo: companyData.logo || null,  // Inclua o campo logo aqui
        status: 'Ativa',
      },
    });

    return {
      id: newCompany.id,
      name: newCompany.name,
      cnpj: newCompany.cnpj,
      email: newCompany.email,
      phoneNumber: newCompany.phoneNumber,
    };

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const duplicatedField = error.meta?.target;
        throw new Error(`Erro: O campo ${duplicatedField} já está em uso.`);
      }
    }
    throw error;
  }
};

  

export const getCompanies = async () => {
  return await prisma.company.findMany();
};

export const updateCompany = async (formData: FormData) => {
  const id = formData.get('id') as string;

  if (!id) {
    throw new Error('ID da empresa não foi fornecido');
  }

  const parsedData = companySchema.safeParse(Object.fromEntries(formData));

  if (!parsedData.success) {
    throw new Error('Dados inválidos');
  }

  const companyData = parsedData.data;

  return await prisma.company.update({
    where: { id },
    data: {
      name: companyData.name,
      cnpj: companyData.cnpj,
      phoneNumber: companyData.phoneNumber,
      email: companyData.email,
      street: companyData.street || null,
      number: companyData.number || null,
      complement: companyData.complement || null,
      neighborhood: companyData.neighborhood || null,
      city: companyData.city || null,
      state: companyData.state || null,
      postalCode: companyData.postalCode || null,
      website: companyData.website || null,
      representative: companyData.representative || null,
      representativePhone: companyData.representativePhone || null,
      sector: companyData.sector || null,
      status: 'Ativa',  // Status padrão
    },
  });
};

export const deleteCompany = async (id: string) => {
  return await prisma.company.delete({
    where: { id },
  });
};
