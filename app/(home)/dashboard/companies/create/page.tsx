"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FiLoader, FiUpload } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';



interface CompanyFormValues {
  name: string;
  cnpj: string;
  phoneNumber: string;
  email: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  logo?: string;
  postalCode?: string;
  website?: string;
  representative?: string;
  representativePhone?: string;
  sector?: string;
}

const CompanyForm = () => {

  const { register, handleSubmit } = useForm<CompanyFormValues>();
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  const router = useRouter()

  const handleFormSubmit: SubmitHandler<CompanyFormValues> = async (data) => {
    setLoading(true);
    setErrorMessage(null);
  
    data.cnpj = data.cnpj.replace(/[^\d]/g, '');
  
    try {
      // Cria um novo objeto FormData
      const formData = new FormData();
  
      // Adiciona cada campo do formulário ao FormData
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key as keyof CompanyFormValues] as string);
      });
  
      // Adiciona a URL da imagem se ela existir
      if (imageUrl) {
        formData.append('logo', imageUrl);
      }
  
      const response = await fetch('/api/companies', {
        method: 'POST',
        body: formData,  // Envia o FormData em vez de JSON
      });
  
      if (response.ok) {
        router.push('/dashboard/companies');
      } else {
        const result = await response.json();
        const errorMsg = result?.message;
        setErrorMessage(errorMsg || "Erro ao criar a empresa! Verifique se o CNPJ ou email já não estão cadastrados");
      }
  
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  

const handleImageUpload = async(result: any) => {
  if (result && result.info) {
    const imageUrl = result.info.secure_url;
    setImageUrl(imageUrl);
    setImageName(result.info.original_filename);
  }
};


  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto">
      <h1 className="text-xl font-bold py-5">Cadastrar Nova Empresa</h1>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">

         {/* LOGO DA EMPRESA */}
         <div className='flex flex-row space-x-3 items-center'>
          <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-200">
            Logo da Empresa
          </label>
          <div className="mt-1 flex items-center">
            <CldUploadWidget uploadPreset="driman-logos" onSuccess={handleImageUpload}>
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="flex items-center cursor-pointer text-white bg-gray-700 p-2 rounded hover:bg-gray-600 transition"
                >
                  <FiUpload className="mr-2" />
                  <span>Escolher arquivo</span>
                </button>
              )}
            </CldUploadWidget>
          </div>
          {imageName && <p className="text-xs mt-1 text-gray-400">Arquivo: {imageName}</p>}
          </div>
          {imageUrl && (
            <div className="flex justify-center mb-4">
              <Image src={imageUrl} alt="Logo da Empresa" width={100} height={40} className="rounded-full object-cover" />
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Nome da Empresa
          </label>
          <input
            id="name"
            {...register('name')}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>

        <div>
          <label htmlFor="cnpj" className="block text-sm font-medium">
            CNPJ
          </label>
          <input
            id="cnpj"
            {...register('cnpj')}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium">
            Telefone
          </label>
          <input
            id="phoneNumber"
            {...register('phoneNumber')}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="street" className="block text-sm font-medium">
            Rua
          </label>
          <input
            id="street"
            {...register('street')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="number" className="block text-sm font-medium">
            Número
          </label>
          <input
            id="number"
            {...register('number')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="complement" className="block text-sm font-medium">
            Complemento
          </label>
          <input
            id="complement"
            {...register('complement')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="neighborhood" className="block text-sm font-medium">
            Bairro
          </label>
          <input
            id="neighborhood"
            {...register('neighborhood')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium">
            Cidade
          </label>
          <input
            id="city"
            {...register('city')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium">
            Estado
          </label>
          <input
            id="state"
            {...register('state')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium">
            CEP
          </label>
          <input
            id="postalCode"
            {...register('postalCode')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium">
            Website
          </label>
          <input
            id="website"
            {...register('website')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="representative" className="block text-sm font-medium">
            Representante
          </label>
          <input
            id="representative"
            {...register('representative')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="representativePhone" className="block text-sm font-medium">
            Telefone do Representante
          </label>
          <input
            id="representativePhone"
            {...register('representativePhone')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="sector" className="block text-sm font-medium">
            Área de atuação da empresa
          </label>
          <input
            id="sector"
            {...register('sector')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>

        {errorMessage && (
        <div className="text-red-500 text-sm">
          {errorMessage}
        </div>
      )}
        
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-white text-black hover:bg-gray-200"
          disabled={loading}
        >
          {loading ? (
            <>
              <FiLoader className="mr-2 animate-spin" />
              Cadastrando...
            </>
          ) : (
            "Cadastrar Empresa"
          )}
        </button>
      </form>
    </div>
  );
};

export default CompanyForm;
