"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ProductForm = dynamic(()=> import('@/components/dashboard/productForm'), {ssr: false});

const CreateProductPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    const fetchCompanies = async () => {
      const response = await fetch('/api/companies');
      const data = await response.json();
      setCompanies(data);
    };
    fetchCompanies();
  }, []);  

  const onSubmit = async (data: any) => {
    setLoading(true);

    const jsonPayload = {
      price: parseFloat(data.price.replace(',', '.')),
      promoPrice: data.promoPrice ? parseFloat(data.promoPrice.replace(',', '.')) : null,
      title: data.title,
      description: data.description,
      reservationTimes: data.reservationTimes || [],
      reservationLimits: data.reservationLimits || {},
      includedItems: data.includedItems || [],
      notIncludedItems: data.notIncludedItems || [],
      hasDateReservation: data.hasDateReservation,
      reservationDays: data.reservationDays || [],
      hasTimeReservation: data.hasTimeReservation,
      image: data.image,
      companyId: data.companyId,
    };

    let response;
  
    if (data.image) {
      const formData = new FormData();
  
      Object.keys(jsonPayload).forEach((key) => {
        if (Array.isArray(jsonPayload[key as keyof typeof jsonPayload]) || typeof jsonPayload[key as keyof typeof jsonPayload] === 'object') {
          formData.append(key, JSON.stringify(jsonPayload[key as keyof typeof jsonPayload]));
        } else {
          formData.append(key, jsonPayload[key as keyof typeof jsonPayload] as any);
        }
      });
  
      response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });
    } else {
      // Envia o payload como JSON quando não há imagem
      response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonPayload),
      });
    }
  
    if (response.ok) {
      router.push('/dashboard/products/productList');
      setLoading(false);
    } else {
      setLoading(false);
      console.error('Erro ao criar o produto');
    }
  };
  
  return (
    <div className="flex flex-col w-full min-h-[100vh] bg-gray-900">
      <div className="flex flex-col w-full max-w-3xl mx-auto p-4 text-white bg-gray-900">
        <h1 className="text-2xl font-bold mb-4">Criar Novo Produto</h1>
        <ProductForm onSubmit={onSubmit} loading={loading} companies={companies} />
      </div>
    </div>
  );
};

export default CreateProductPage;
