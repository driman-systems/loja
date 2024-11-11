"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiUpload, FiLoader } from 'react-icons/fi';
import { CldUploadWidget } from 'next-cloudinary';
import { useRouter } from 'next/navigation';

const UserForm: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("")
  const router = useRouter();

  const handleFormSubmit = async (data: any) => {
    if (!imageUrl) {
      setError('URL da imagem não está disponível.');
      return;
    }

    setLoading(true);

    const cleanedCpf = data.cpf.replace(/\D/g, '');
    const cleanedPhone = data.phone.replace(/\D/g, '');

    if (cleanedCpf.length !== 11) {
      setError('CPF inválido. Certifique-se de que ele contém 11 dígitos.');
      setLoading(false);
      return;
  }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          image: imageUrl,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/dashboard/users');
        setLoading(false);
      } else {
        setLoading(false);
        setError('Erro ao criar usuário');
      }
    } catch (errorCacth: any) {
      setLoading(false);
      setError('Erro ao criar usuário:');
    }
  };

  const handleImageUpload = async (result: any) => {
    if (result && result.info) {
      const imageUrl = result.info.secure_url;
      setImageUrl(imageUrl);
      setImageName(result.info.original_filename);
    }
  };

  return (
    <div className='flex flex-col w-full max-w-2xl mx-auto'>
      <h1 className='text-xl font-bold py-5'>Criar Novo Usuário</h1>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Nome
          </label>
          <input
            id="name"
            {...register('name')}
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
            {...register('email')}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium">
            CPF
          </label>
          <input
            id="cpf"
            {...register('cpf')}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Telefone
          </label>
          <input
            id="phone"
            {...register('phone')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Senha
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium">
            Nível de Acesso
          </label>
          <select
            id="role"
            {...register('role')}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          >
            <option value="Admin">Admin</option>
            <option value="Colaborador">Colaborador</option>
          </select>
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium">
            Imagem de Perfil
          </label>
          <div className="mt-1 flex items-center">
            <CldUploadWidget uploadPreset="driman-users" onSuccess={handleImageUpload}>
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="flex items-center cursor-pointer text-white"
                >
                  <FiUpload className="mr-2" />
                  <span>Escolher arquivo</span>
                </button>
              )}
            </CldUploadWidget>
          </div>
          {imageName && <p className="text-xs mt-1 text-gray-400">Arquivo: {imageName}</p>}
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-white text-black hover:bg-gray-200"
          disabled={loading}
        >
          {loading ? (
            <>
              <FiLoader className="mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar Usuário"
          )}
        </button>
      </form>
      {error && <div className='flex flex-col w-full justify-center text-center py-4 text-red'>{error}</div>}
    </div>
  );
};

export default UserForm;
