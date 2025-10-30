"use client";

import clsx from 'clsx';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveDeck } from '@/actions';

type FormInputs = {
  name: string;
  description: string;
  archetypesId: string;
  cards: string;
  visible: boolean;
  image: string;
}

interface Props {
  deck: string;
  imgDeck: string;
  
}

export const SaveDeckForm = ({deck, imgDeck}: Props ) => {

  const { register, handleSubmit, formState: {errors} } = useForm<FormInputs>();
  const [ error, setError ] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit: SubmitHandler<FormInputs> = async(data) => {

    const resp = await saveDeck(data, deck, imgDeck); 
    
    if(resp && resp?.message) {
      setError(resp.message);
    } else {
      router.push("/perfil");
    }
      
    }

  useEffect(() => {

    //setUserError(false);
    

  }, [errors.name || errors.description || errors.archetypesId || errors.visible ])
  

  return (
    <form onSubmit={ handleSubmit( onSubmit ) }  className="flex flex-col mx-6 my-6 text-left">

      {
       errors.name || errors.description || errors.archetypesId || errors.visible? 
          <span className="text-red-500 my-2">
            <p>{errors.name?.message}</p>
            <p>{errors.description?.message}</p>
            <p>{errors.archetypesId?.message}</p>
            <p>{errors.visible?.message}</p>
          </span>
        :
        error && 
        <span className="text-red-500 my-2">
        <p><i>{error}</i></p>
        </span>
      }

      <label htmlFor="text">Nombre del Mazo</label>
      <input
        className={
          clsx(
            "px-5 py-2 border bg-gray-200 rounded mb-5",
            {
              'border-red-500': errors.name
            }
          )
        }
        type="text"
        { ...register('name', { 
            required: {value: true, message: "El campo 'Nombre' es requerido"}}) }
      />

      <label htmlFor="text">Arquetipo Principal</label>
       <select
          className={
            clsx(
              "px-5 py-2 border bg-gray-200 rounded mb-5",
              {
                'border-red-500': errors.archetypesId
              }
            )
          }
          { ...register('archetypesId', { 
          required: {value: true, message: "El campo 'Arquetipo' es requerido"}}) }>
          <option value="">-- Selecciona --</option>
          <option value="67c5d1595d56151173f8f232">Ángeles</option>
          <option value="demonios">Demonios</option>
          <option value="aliens">Aliens</option>
          <option value="vampiros">Vampiros</option>
      </select>
      <textarea
          {...register("description")}
          rows={4}
          placeholder="Describe tu mazo o tus estrategias..."
          className='rounded px-2'
        /> 
      <label className="flex items-center gap-3 cursor-pointer mt-4">
        <input
          type="checkbox"
          {...register("visible")}
          className="w-5 h-5 accent-indigo-500 rounded"
        />
        <span>Deseo mantener mi mazo privado.</span>
      </label>

      <button className="mt-6 btn-primary">Guardar</button>
      
    </form>
  );
};