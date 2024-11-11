'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';

const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.preprocess((val) => parseFloat(val as string), z.number().min(0)),
  promoPrice: z.preprocess((val) => val ? parseFloat(val as string) : null, z.number().optional().nullable()),
  hasDateReservation: z.preprocess((val) => val === 'true', z.boolean()),
  hasTimeReservation: z.preprocess((val) => val === 'true', z.boolean()),
  reservationTimes: z.preprocess((val) => {
    if (typeof val === 'string') {
      return JSON.parse(val);
    }
    return val;
  }, z.array(z.string()).optional()),
  reservationLimits: z.preprocess((val) => {
    if (typeof val === 'string') {
      return JSON.parse(val);
    }
    return val;
  }, z.record(z.string(), z.number()).optional()), 
  includedItems: z.preprocess((val) => {
    if (typeof val === 'string') {
      return JSON.parse(val);
    }
    return val;
  }, z.array(z.string()).optional()),
  notIncludedItems: z.preprocess((val) => {
    if (typeof val === 'string') {
      return JSON.parse(val);
    }
    return val;
  }, z.array(z.string()).optional()),
  image: z.string().optional(),
  reservationDays: z.preprocess((val) => {
    if (typeof val === 'string') {
      return JSON.parse(val);
    }
    return val;
  }, z.array(z.number()).optional()), 
  companyId: z.string().cuid(),
});

export const createProduct = async (formData: FormData) => {
  const parsedData = productSchema.safeParse(Object.fromEntries(formData));

  if (!parsedData.success) {
    throw new Error('Dados inválidos');
  }

  const productData = parsedData.data;

  await prisma.product.create({
    data: {
      title: productData.title,
      description: productData.description,
      price: productData.price,
      promoPrice: productData.promoPrice,
      hasDateReservation: productData.hasDateReservation,
      hasTimeReservation: productData.hasTimeReservation,
      reservationTimes: productData.hasTimeReservation ? productData.reservationTimes : [], 
      reservationLimits: productData.hasTimeReservation ? productData.reservationLimits : {}, 
      reservationDays: productData.hasDateReservation ? productData.reservationDays : [],
      includedItems: productData.includedItems || [], 
      notIncludedItems: productData.notIncludedItems || [], 
      image: productData.image,  
      companyId: productData.companyId,
    },
  });
};

export async function getProductById(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    return product;
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error);
    throw new Error('Erro ao buscar produto por ID');
  }
}

export async function getAllProducts() {
  try {
    const products = await prisma.product.findMany();
    return products;
  } catch (error) {
    console.error('Erro ao buscar todos os produtos:', error);
    throw new Error('Erro ao buscar todos os produtos');
  }
}
