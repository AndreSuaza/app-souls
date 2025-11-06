"use client";

import clsx from 'clsx';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';
import { userRegistration } from '@/actions/auth/register';
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

const getLabel = (field: string) => {
  switch (field) {
    case "name": return "El nombre";
    case "lastname": return "El apellido";
    case "nickname": return "El nickname";
    case "email": return "El correo electrónico";
    case "password": return "La contraseña";
    case "confirmPassword": return "La confirmación de la contraseña";
    default: return field;
  }
};

export const RegisterForm = () => {

  const { register, handleSubmit, formState: {errors} } = useForm<FormInputs>();
  const [ error, setError ] = useState<string | null>(null);
  const [ success, setSuccess ] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSubmit: SubmitHandler<FormInputs> = async(data) => {
    startTransition(async () => {
      const resp = await userRegistration(data); 

      if(!resp.success && resp.message) {
        setError(resp.message);
      } else {
        setSuccess(true);
      }
    }) 
    }

  return (
    <form onSubmit={ handleSubmit( onSubmit ) }  className="flex flex-col">
      {
        success && (
          <p className="text-center text-green-500 mb-5 text-sm">
            Por favor verifica tu correo electrónico para completar tu registro.
          </p>
        )
      }
      {
        
        Object.keys(errors).length > 0 ? 
        <span className="text-red-500 my-2">
        {Object.entries(errors).map(([key, value]) => (
          <p key={key}>{getLabel(key)} {value?.message}</p>
        ))}
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
        required: "es requerido.",
        minLength: { value: 3, message: "debe tener al menos 3 caracteres." },
        maxLength: { value: 20, message: "debe tener máximo 20 caracteres." },
        validate: {
          noRepetidos: (value) =>
            !/([a-zA-Z0-9._])\1{3,}/.test(value) || "no permite repetir el mismo carácter muchas veces.",
          noSoloNumeros: (value) =>
            !/^\d+$/.test(value) || "no puede ser solo números.",
          noUrls: (value) =>
            !/@|www\./.test(value) || "no permite correos o URLs.",
          noProhibidas: (value) => {
            const lower = value.toLowerCase();
            return (
              !palabrasProhibidas.some((p) => lower.includes(p)) ||
              "contiene palabras restringidas."
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
        required: "es requerido.",
        minLength: { value: 3, message: "debe tener al menos 3 caracteres." },
        maxLength: { value: 20, message: "debe tener máximo 20 caracteres." },
        validate: {
          noRepetidos: (value) =>
            !/([a-zA-Z0-9._])\1{3,}/.test(value) || "no permite repetir el mismo carácter muchas veces",
          noSoloNumeros: (value) =>
            !/^\d+$/.test(value) || "no puede ser solo números.",
          noUrls: (value) =>
            !/@|www\./.test(value) || "no permite correos o URLs.",
          noProhibidas: (value) => {
            const lower = value.toLowerCase();
            return (
              !palabrasProhibidas.some((p) => lower.includes(p)) ||
              "contiene palabras restringidas."
            );
          },
        },
        })}
      />

      <label htmlFor="text">Nickname</label>
      <input
        className={
          clsx(
            "px-5 py-2 border bg-gray-200 rounded mb-5",
            {
              'border-red-500': errors.nickname
            }
          )
        }
        type="text"
        {...register("nickname", {
        required: "es requerido.",
        minLength: { value: 3, message: "debe tener al menos 3 caracteres." },
        maxLength: { value: 20, message: "debe tener máximo 20 caracteres." },
        pattern: {
          value: /^[a-zA-Z0-9._]+$/,
          message: "solo permite letras, números, puntos y guiones bajos.",
        },
        validate: {
          noRepetidos: (value) =>
            !/([a-zA-Z0-9._])\1{3,}/.test(value) || "no permite repetir el mismo carácter muchas veces",
          noSoloNumeros: (value) =>
            !/^\d+$/.test(value) || "no puede ser solo números.",
          noUrls: (value) =>
            !/@|www\./.test(value) || "no permite correos o URLs.",
          noProhibidas: (value) => {
            const lower = value.toLowerCase();
            return (
              !palabrasProhibidas.some((p) => lower.includes(p)) ||
              "contiene palabras restringidas."
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
            required: {value: true, message: "es requerido"}, 
            pattern: {value: /^\S+@\S+$/i, message: "ingresado no es válido. Verifica e inténtalo nuevamente." }}) }
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
        {...register("password", {
          required: "es obligatoria",
          minLength: {
            value: 8,
            message: "Debe tener al menos 8 caracteres",
          },
          validate: {
            hasUppercase: (value) =>
              /[A-Z]/.test(value) || "bebe contener al menos una mayúscula",
            hasNumber: (value) =>
              /\d/.test(value) || "bebe contener al menos un número",
            hasSpecialChar: (value) =>
              /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
              "bebe contener al menos un carácter especial",
          }
        })}
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
            required: {value: true, message: "es requerida."}, 
            minLength: {value: 6, message: "debe tener un mínimo de 6 caracteres" }} ) }
      />

      <button className={
        clsx(
            " py-2 rounded",
            {
              'bg-indigo-500 text-white hover:bg-indigo-600 transition': !success,
              'bg-gray-300': success,
            }
          )
      } disabled={success || isPending}>Registrarse</button>
      
      <Link className='mt-6 font-bold text-center text-slate-500' href={"/auth/login"}> ¿Ya tienes una cuenta? </Link>
      
    </form>
  );
};