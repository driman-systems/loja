'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

const userSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  cpf: z.string().length(11, 'CPF deve ter 11 caracteres'),
  phone: z.string().min(10, 'O telefone deve ter no mínimo 10 dígitos').optional(),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  estado: z.string().min(2, 'O estado é obrigatório'),
  cidade: z.string().min(1, 'A cidade é obrigatória'),
  birthDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Data de nascimento inválida'
  ),
  role: z.enum(['Cliente']).default('Cliente'), // Padrão como "Cliente"
  image: z.string().optional(),
});

export const createUser = async (formData: FormData) => {
  const parsedData = userSchema.safeParse(Object.fromEntries(formData));

  if (!parsedData.success) {
    throw new Error('Dados inválidos');
  }

  const userData = parsedData.data;

  // Criptografa a senha
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  await prisma.clientUser.create({
    data: {
      name: userData.name,
      email: userData.email,
      cpf: userData.cpf,
      phoneNumber: userData.phone,
      password: hashedPassword,
      estado: userData.estado,
      cidade: userData.cidade,
      birthDate: new Date(userData.birthDate),
      role: userData.role, 
    },
  });
};

export const getUsers = async () => {
  return await prisma.clientUser.findMany();
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
    estado: userData.estado,
    cidade: userData.cidade,
    birthDate: new Date(userData.birthDate), // Converte para Date
    role: userData.role,
    image: userData.image || null,
  };

  if (userData.password) {
    updatedData.password = await bcrypt.hash(userData.password, 10);
  }

  return await prisma.clientUser.update({
    where: { id },
    data: updatedData,
  });
};

export const deleteUser = async (id: string) => {
  return await prisma.clientUser.delete({
    where: { id },
  });
};
