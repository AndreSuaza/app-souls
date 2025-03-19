"use client";

import clsx from 'clsx';
import Link from 'next/link';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { authenticate } from '@/actions';



type FormInputs = {
  email: string;
  password: string;  
}



export const LoginForm = () => {

  const { register, handleSubmit, formState: {errors} } = useForm<FormInputs>();
  const [ userError, setUserError] = useState(false);


  const onSubmit: SubmitHandler<FormInputs> = async(data) => {
    await authenticate(data); 
    setUserError(true);     
  }

  useEffect(() => {

    setUserError(false);
    

  }, [errors.email || errors.password])
  

  return (
    <form onSubmit={ handleSubmit( onSubmit ) }  className="flex flex-col">

      {
       errors.email || errors.password ? 
          <span className="text-red-500 my-2">
            <p>{errors.email?.message}</p>
            <p>{errors.password?.message}</p>
          </span>
        :
        userError && 
        <span className="text-red-500 my-2">
        <p><i>Usuario incorrecto. Verifica tus credenciales e inténtalo de nuevo.</i></p>
        </span>
      }

      <label htmlFor="email">Correo electrónico</label>
      <input
        className={
          clsx(
            "px-5 py-2 border bg-gray-200 rounded mb-5",
            {
              'border-red-500': errors.email
            }
          )
        }
        type="email"
        { ...register('email', { 
            required: {value: true, message: "El campo 'email' es requerido"}, 
            pattern: {value: /^\S+@\S+$/i, message: "El correo ingresado no es válido. Verifica e inténtalo nuevamente." }}) }
      />

      <label htmlFor="email">Contraseña</label>
      <input
        className={
          clsx(
            "px-5 py-2 border bg-gray-200 rounded mb-5",
            {
              'border-red-500': errors.password
            }
          )
        }
        type="password"
        { ...register('password', { 
            required: {value: true, message: "El campo 'contraseña' es requerido."}, 
            minLength: {value: 6, message: "La contraseña debe tener un mínimo de 6 caracteres" }} ) }
      />

        <button className="btn-primary">Iniciar Sesión</button>

        {/* divisor l ine */ }
        <div className="flex items-center my-5">
            <div className="flex-1 border-t border-gray-500"></div>
            <div className="px-2 text-gray-800">O</div>
            <div className="flex-1 border-t border-gray-500"></div>
        </div>

        <Link
            href="/auth/new-account" 
            className="btn-secondary text-center">
            Crear una nueva cuenta
        </Link>
    </form>
  );
};