'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  cpf: z.string().length(11),
  phone: z.string().min(10).optional(),
  password: z.string().min(6),
  role: z.enum(['Admin', 'Colaborador']),
  image: z.string().optional(),
});

export const createUser = async (formData: FormData) => {
  const parsedData = userSchema.safeParse(Object.fromEntries(formData));

  if (!parsedData.success) {
    throw new Error('Dados inválidos');
  }

  const userData = parsedData.data;

  // Verifica se a senha é do tipo string
  if (!userData.password) {
    throw new Error('A senha é obrigatória.');
  }

  // Criptografa a senha
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  await prisma.adminUser.create({
    data: {
      name: userData.name,
      email: userData.email,
      cpf: userData.cpf,
      phoneNumber: userData.phone,
      password: hashedPassword,
      role: userData.role,
      image: userData.image || null,
    },
  });
};

export async function getClientByEmail(userEmail: string) {
  try {
    const client = await prisma.clientUser.findUnique({
      where: {email: userEmail}
    })

    return client

  } catch (error) {
    console.error('Erro ao buscar cliente por email:', error);
    throw new Error('Erro ao buscar client por email');
  }
}

export const getUsers = async () => {
  return await prisma.adminUser.findMany();
};

export const updateUser = async (formData: FormData) => {
  const id = formData.get('id') as string;

  if (!id) {
    throw new Error('ID do usuário não foi fornecido');
  }

  const parsedData = userSchema.safeParse(Object.fromEntries(formData));

  if (!parsedData.success) {
    throw new Error('Dados inválidos');
  }

  const userData = parsedData.data;

  // Criptografa a senha, se fornecida
  const updatedData: any = {
    name: userData.name,
    email: userData.email,
    cpf: userData.cpf,
    phoneNumber: userData.phone,
    role: userData.role,
    image: userData.image || null,
  };

  if (userData.password) {
    updatedData.password = await bcrypt.hash(userData.password, 10);
  }

  return await prisma.adminUser.update({
    where: { id },
    data: updatedData,
  });
};

export const deleteUser = async (id: string) => {
  return await prisma.adminUser.delete({
    where: { id },
  });
};
