"use client";

import clsx from 'clsx';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { userRegistration } from '@/actions/auth/register';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { palabrasProhibidas } from '@/models/inappropriateWords.model';

type FormInputs = {
  name: string;
  lastname: string;
  nickname: string;
  image: string;
  email: string;
  password: string;  
  confirmPassword: string;
}

export const RegisterForm = () => {

  const { register, handleSubmit, formState: {errors} } = useForm<FormInputs>();
  const [ userError, setUserError] = useState(false);
  const [ error, setError ] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit: SubmitHandler<FormInputs> = async(data) => {

    const resp = await userRegistration(data); 

    if(!resp.success && resp.message) {
      setError(resp.message);
    } else {
      router.push("/perfil");
    }
      
    }

  useEffect(() => {

    setUserError(false);
    

  }, [errors.name || errors.lastname || errors.nickname || errors.email || errors.password])
  

  return (
    <form onSubmit={ handleSubmit( onSubmit ) }  className="flex flex-col">

      {
       errors.email || errors.password ? 
          <span className="text-red-500 my-2">
            <p>{errors.name?.message}</p>
            <p>{errors.lastname?.message}</p>
            <p>{errors.nickname?.message}</p>
            <p>{errors.email?.message}</p>
            <p>{errors.password?.message}</p>
          </span>
        :
        error && 
        <span className="text-red-500 my-2">
        <p><i>{error}</i></p>
        </span>
      }

      <label htmlFor="name">Nombre</label>
      <input
        className={
          clsx(
            "px-5 py-2 border bg-gray-200 rounded mb-5",
            {
              'border-red-500': errors.name
            }
          )
        }
        type="name"
        {...register("name", {
        required: "El nombre es obligatorio.",
        minLength: { value: 3, message: "Debe tener al menos 3 caracteres." },
        maxLength: { value: 20, message: "Debe tener máximo 20 caracteres." },
        pattern: {
          value: /^[a-zA-Z0-9._]+$/,
          message: "Solo se permiten letras, números, puntos y guiones bajos.",
        },
        validate: {
          noRepetidos: (value) =>
            !/([a-zA-Z0-9._])\1{3,}/.test(value) || "No repitas el mismo carácter muchas veces.",
          noSoloNumeros: (value) =>
            !/^\d+$/.test(value) || "El nombre no puede ser solo números.",
          noUrls: (value) =>
            !/@|www\./.test(value) || "No se permiten correos o URLs.",
          noProhibidas: (value) => {
            const lower = value.toLowerCase();
            return (
              !palabrasProhibidas.some((p) => lower.includes(p)) ||
              "El nombre contiene palabras restringidas."
            );
          },
        },
        })}
      />

      <label htmlFor="text">Apellido</label>
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
        {...register("lastname", {
        required: "El apellido es obligatorio.",
        minLength: { value: 3, message: "Debe tener al menos 3 caracteres." },
        maxLength: { value: 20, message: "Debe tener máximo 20 caracteres." },
        pattern: {
          value: /^[a-zA-Z0-9._]+$/,
          message: "Solo se permiten letras, números, puntos y guiones bajos.",
        },
        validate: {
          noRepetidos: (value) =>
            !/([a-zA-Z0-9._])\1{3,}/.test(value) || "No repitas el mismo carácter muchas veces.",
          noSoloNumeros: (value) =>
            !/^\d+$/.test(value) || "El apellido no puede ser solo números.",
          noUrls: (value) =>
            !/@|www\./.test(value) || "No se permiten correos o URLs.",
          noProhibidas: (value) => {
            const lower = value.toLowerCase();
            return (
              !palabrasProhibidas.some((p) => lower.includes(p)) ||
              "El apellido contiene palabras restringidas."
            );
          },
        },
        })}
      />

      <label htmlFor="nickname">Nickname</label>
      <input
        className={
          clsx(
            "px-5 py-2 border bg-gray-200 rounded mb-5",
            {
              'border-red-500': errors.name
            }
          )
        }
        type="nickname"
        {...register("nickname", {
        required: "El nickname es obligatorio.",
        minLength: { value: 3, message: "Debe tener al menos 3 caracteres." },
        maxLength: { value: 20, message: "Debe tener máximo 20 caracteres." },
        pattern: {
          value: /^[a-zA-Z0-9._]+$/,
          message: "Solo se permiten letras, números, puntos y guiones bajos.",
        },
        validate: {
          noRepetidos: (value) =>
            !/([a-zA-Z0-9._])\1{3,}/.test(value) || "No repitas el mismo carácter muchas veces.",
          noSoloNumeros: (value) =>
            !/^\d+$/.test(value) || "El nickname no puede ser solo números.",
          noUrls: (value) =>
            !/@|www\./.test(value) || "No se permiten correos o URLs.",
          noProhibidas: (value) => {
            const lower = value.toLowerCase();
            return (
              !palabrasProhibidas.some((p) => lower.includes(p)) ||
              "El nickname contiene palabras restringidas."
            );
          },
        },
        })}
      />      

      <label htmlFor="email">Email</label>
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

      <label htmlFor="password">Contraseña</label>
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

      <label htmlFor="confirmPassword">Confirmar contraseña</label>
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
        { ...register('confirmPassword', { 
            required: {value: true, message: "El campo 'Confirmar contraseña' es requerido."}, 
            minLength: {value: 6, message: "La Confirmar contraseña debe tener un mínimo de 6 caracteres" }} ) }
      />

      <button className="mt-6 btn-primary">Registrarse</button>
      
      <Link className='mt-6 font-bold text-center text-slate-500' href={"/auth/login"}> ¿Ya tienes una cuenta? </Link>
      
    </form>
  );
};