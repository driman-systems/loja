"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Switch } from '@headlessui/react';
import { FiUpload, FiTrash2, FiPlus, FiLoader } from 'react-icons/fi';
import { CldUploadWidget } from 'next-cloudinary';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ProductFormProps {
  onSubmit: (data: any, imageFile: File | null) => void;
  loading: boolean;
  companies: Array<{ id: string; name: string }>;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, loading, companies }) => {
  const { register, handleSubmit, watch, resetField, setValue } = useForm();
  const [hasDateReservation, setHasDateReservation] = useState(false);
  const [hasTimeReservation, setHasTimeReservation] = useState(false);
  const [reservationTimes, setReservationTimes] = useState<string[]>([]);
  const [includedItems, setIncludedItems] = useState<string[]>([]);
  const [notIncludedItems, setNotIncludedItems] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [reservationDays, setReservationDays] = useState<number[]>([]);
  const [reservationLimits, setReservationLimits] = useState<{ [key: string]: number }>({});
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [description, setDescription] = useState(""); 

  const handleFormSubmit = async (data: any) => {
    if (!imageUrl) {
      console.error('URL da imagem não está disponível.');
      return;
    }
  
    onSubmit(
      {
        ...data,
        companyId: selectedCompany,
        hasDateReservation,
        hasTimeReservation,
        reservationTimes,
        reservationDays,
        reservationLimits: limitEnabled ? reservationLimits : {},
        includedItems,
        notIncludedItems,
        image: imageUrl,
        description, 
      },
      null
    );
  };

  const addReservationTime = () => {
    const time = watch('reservationTime');
    if (time && !reservationTimes.includes(time)) {
      setReservationTimes([...reservationTimes, time]);
      resetField('reservationTime');
    }
  };

  const removeReservationTime = (timeToRemove: string) => {
    setReservationTimes(reservationTimes.filter(time => time !== timeToRemove));
  };

  const addItem = (itemList: string[], setItemList: (items: string[]) => void, item: string, fieldName: string) => {
    if (item && !itemList.includes(item)) {
      setItemList([...itemList, item]);
      resetField(fieldName);
    }
  };

  const removeItem = (itemList: string[], setItemList: (items: string[]) => void, itemToRemove: string) => {
    setItemList(itemList.filter(item => item !== itemToRemove));
  };

  const handleImageUpload = async(result: any) => {
    if (result && result.info) {
      const imageUrl = result.info.secure_url;
      setImageUrl(imageUrl);
      setImageName(result.info.original_filename);
    }
  };

  const weekDays = [
    { id: 1, label: 'Seg' },
    { id: 2, label: 'Ter' },
    { id: 3, label: 'Qua' },
    { id: 4, label: 'Qui' },
    { id: 5, label: 'Sex' },
    { id: 6, label: 'Sáb' },
    { id: 0, label: 'Dom' },
  ];

  const toggleDaySelection = (day: number) => {
    if (reservationDays.includes(day)) {
      setReservationDays(reservationDays.filter(d => d !== day));
    } else {
      setReservationDays([...reservationDays, day]);
    }
  };

  const handleLimitChange = (time: string, limit: number) => {
    setReservationLimits(prev => ({
      ...prev,
      [time]: limit,
    }));
  };

  const removeLimit = (time: string) => {
    setReservationLimits(prev => {
      const newLimits = { ...prev };
      delete newLimits[time];
      return newLimits;
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* NOME */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Título
        </label>
        <input
          id="title"
          {...register('title')}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
        />
      </div>

      {/* EMPRESA */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium">
          Empresa
        </label>
        <select
          id="company"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
        >
          <option value="">Selecione uma empresa</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {/* DESCRIÇÃO */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descrição
        </label>
        <ReactQuill
          theme="snow"
          value={description}
          onChange={setDescription} 
          className="mt-1 block w-full h-48 min-h-[18rem] max-h-[20rem] overflow-y-auto border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white quill-custom"
        />
      </div>

      {/* PREÇOS */}
      <div className="flex space-x-4">

        {/* PREÇO */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium">
            Preço
          </label>
          <div className="flex relative mt-1 items-center">
            <span className="absolute left-2 text-white">R$</span>
            <input
              type="text"
              id="price"
              {...register('price')}
              required
              className="pl-8 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white text-lg"
            />
          </div>
        </div>

        {/* PREÇO PROMOCIONAL */}
        <div>
          <label htmlFor="promoPrice" className="block text-sm font-medium">
            Preço Promocional
          </label>
          <div className="flex relative mt-1 items-center">
            <span className="absolute left-2 text-white">R$</span>
            <input
              type="text"
              id="promoPrice"
              {...register('promoPrice')}
              className="pl-8 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white text-lg"
            />
          </div>
        </div>
      </div>

      {/* IMAGEM */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium">
          Imagem
        </label>
        <div className="mt-1 flex items-center">
          <CldUploadWidget uploadPreset="driman-produtos" onSuccess={handleImageUpload}>
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

      {/* AGENDAMENTO */}
      <div className="flex flex-col space-y-3">
        <div className='flex flex-row space-x-2'>
          <Switch
            checked={hasDateReservation}
            onChange={(checked) => {
              setHasDateReservation(checked);
            }}
            className={`${hasDateReservation ? 'bg-gray-700' : 'bg-gray-600'}
              relative inline-flex items-center h-6 rounded-full w-11`}
          >
            <span
              className={`${hasDateReservation ? 'translate-x-6' : 'translate-x-1'}
                inline-block w-4 h-4 transform bg-white rounded-full`}
            />
          </Switch>
          <span>Agendamento por Data</span>
        </div>

        {hasDateReservation && (
          <div className='pl-5'>
            <div className="flex space-x-2">
              {weekDays.map((day) => (
                <div key={day.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`day-${day.id}`}
                    value={day.id}
                    checked={reservationDays.includes(day.id)}
                    onChange={() => toggleDaySelection(day.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`day-${day.id}`} className="text-white">
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className='flex flex-row space-x-2 pt-3'>
          <Switch
            checked={hasTimeReservation}
            onChange={(checked) => {
              setHasTimeReservation(checked);
            }}
            className={`${hasTimeReservation ? 'bg-gray-700' : 'bg-gray-600'}
              relative inline-flex items-center h-6 rounded-full w-11`}
          >
            <span
              className={`${hasTimeReservation ? 'translate-x-6' : 'translate-x-1'}
                inline-block w-4 h-4 transform bg-white rounded-full`}
            />
          </Switch>
          <span>Agendamento por Horário</span>
        </div>

      </div>

      {hasTimeReservation && (
        <div>
          <label htmlFor="reservationTime" className="block text-sm font-medium">
            Horários Disponíveis
          </label>
          <div className="flex items-center space-x-2 pt-2">
            <div className="relative">
              <input
                type="time"
                id="reservationTime"
                {...register('reservationTime')}
                className="block w-24 border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
              />
            </div>
            <button
              type="button"
              onClick={addReservationTime}
              className="bg-gray-700 text-white rounded-md p-2 hover:bg-gray-800"
            >
              <FiPlus />
            </button>
          </div>
          <div className="flex flex-wrap mt-1 space-x-2">
            {reservationTimes.map((time, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="bg-gray-700 text-white rounded-md p-2 text-xs">{time}</span>
                {limitEnabled && (
                  <input
                    type="number"
                    placeholder="Limite"
                    value={reservationLimits[time] || ''}
                    onChange={(e) => handleLimitChange(time, parseInt(e.target.value))}
                    className="w-16 bg-gray-800 text-white border border-gray-300 rounded-md p-1 text-xs"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeReservationTime(time)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          <div className='flex flex-row space-x-2 pt-3'>
            <Switch
              checked={limitEnabled}
              onChange={setLimitEnabled}
              className={`${limitEnabled ? 'bg-gray-700' : 'bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11`}
            >
              <span className={`${limitEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full`} />
            </Switch>
            <span>Limitar quantidade por horário</span>
          </div>

        </div>
      )}

      {/* O que está incluso */}
      <div className='pt-3'>
        <label htmlFor="includedItem" className="block text-sm font-medium">
          O que está incluso
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            id="includedItem"
            {...register('includedItem')}
            className="block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
          />
          <button
            type="button"
            onClick={() => addItem(includedItems, setIncludedItems, watch('includedItem'), 'includedItem')}
            className="bg-gray-700 text-white rounded-md p-2 hover:bg-gray-800"
          >
            <FiPlus />
          </button>
        </div>
        <div className="flex flex-wrap mt-1 space-x-2">
          {includedItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="bg-gray-700 text-white rounded-md p-2 text-xs">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(includedItems, setIncludedItems, item)}
                className="text-red-500 hover:text-red-700"
              >
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* O que não está incluso */}
    <div>
      <label htmlFor="notIncludedItem" className="block text-sm font-medium">
        O que não está incluso
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          id="notIncludedItem"
          {...register('notIncludedItem')}
          className="block w-full border border-gray-300 rounded-md shadow-sm bg-gray-800 text-white p-1"
        />
        <button
          type="button"
          onClick={() => addItem(notIncludedItems, setNotIncludedItems, watch('notIncludedItem'), 'notIncludedItem')}
          className="bg-gray-700 text-white rounded-md p-2 hover:bg-gray-800"
        >
          <FiPlus />
        </button>
      </div>

      <div className="flex flex-wrap mt-1 space-x-2">
        {notIncludedItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="bg-gray-700 text-white rounded-md p-2 text-xs">{item}</span>
            <button
              type="button"
              onClick={() => removeItem(notIncludedItems, setNotIncludedItems, item)}
              className="text-red-500 hover:text-red-700"
            >
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Botão de Submissão */}
    <button
      type="submit"
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-white text-black hover:bg-gray-200"
      disabled={loading || (hasTimeReservation && reservationTimes.length === 0)}
    >
      {loading ? (
        <>
          <FiLoader className="mr-2 animate-spin" />
          Criando...
        </>
      ) : (
        "Criar Produto"
      )}
    </button>
  </form>
);
};

export default ProductForm;
