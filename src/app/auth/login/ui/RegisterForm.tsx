"use client";

import clsx from "clsx";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { userRegistration } from "@/actions/auth/register";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { MdError, MdCheckCircle } from "react-icons/md";
import Link from "next/link";
import { palabrasProhibidas } from "@/models/inappropriateWords.model";

type FormInputs = {
  name: string;
  lastname: string;
  nickname: string;
  image: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    startTransition(async () => {
      const resp = await userRegistration(data);

      if (!resp.success && resp.message) {
        setError(resp.message);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm my-2 px-2 py-2 bg-red-50 border border-red-200 rounded">
          <MdError size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-600 text-sm my-2 px-2 py-2 bg-green-50 border border-green-200 rounded">
          <MdCheckCircle size={18} />
          <span>
            Por favor verifica tu correo electronico para completar tu registro.
          </span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <div className="flex flex-col">
          <label
            htmlFor="name"
            className="text-xs font-semibold tracking-[0.12em] text-slate-600"
          >
            Nombre
          </label>
          <input
            className={clsx(
              "mt-2 px-4 py-2 border rounded-lg bg-slate-100/80 text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
              {
                "border-red-500": errors.name,
                "border-slate-200": !errors.name,
              }
            )}
            type="name"
            placeholder="Ingresa tu nombre"
            {...register("name", {
              required: "El campo 'nombre' es requerido.",
              minLength: {
                value: 3,
                message: "Debe tener al menos 3 caracteres.",
              },
              maxLength: {
                value: 15,
                message: "Debe tener maximo 15 caracteres.",
              },
              validate: {
                noRepetidos: (value) =>
                  !/([a-zA-Z0-9._])\1{3,}/.test(value) ||
                  "No permite repetir el mismo caracter muchas veces.",
                noSoloNumeros: (value) =>
                  !/^\d+$/.test(value) || "No puede ser solo numeros.",
                noUrls: (value) =>
                  !/@|www\./.test(value) || "No permite correos o URLs.",
                noProhibidas: (value) => {
                  const lower = value.toLowerCase();
                  return (
                    !palabrasProhibidas.some((p) => lower.includes(p)) ||
                    "Contiene palabras restringidas."
                  );
                },
              },
            })}
          />

          {errors.name && (
            <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
              <MdError size={14} />
              <span>{errors.name.message}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="text"
            className="text-xs font-semibold tracking-[0.12em] text-slate-600"
          >
            Apellido
          </label>
          <input
            className={clsx(
              "mt-2 px-4 py-2 border rounded-lg bg-slate-100/80 text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
              {
                "border-red-500": errors.name,
                "border-slate-200": !errors.name,
              }
            )}
            type="text"
            placeholder="Ingresa tu apellido"
            {...register("lastname", {
              required: "El campo 'apellido' es requerido.",
              minLength: {
                value: 3,
                message: "Debe tener al menos 3 caracteres.",
              },
              maxLength: {
                value: 15,
                message: "Debe tener maximo 15 caracteres.",
              },
              validate: {
                noRepetidos: (value) =>
                  !/([a-zA-Z0-9._])\1{3,}/.test(value) ||
                  "No permite repetir el mismo caracter muchas veces",
                noSoloNumeros: (value) =>
                  !/^\d+$/.test(value) || "No puede ser solo numeros.",
                noUrls: (value) =>
                  !/@|www\./.test(value) || "No permite correos o URLs.",
                noProhibidas: (value) => {
                  const lower = value.toLowerCase();
                  return (
                    !palabrasProhibidas.some((p) => lower.includes(p)) ||
                    "Contiene palabras restringidas."
                  );
                },
              },
            })}
          />

          {errors.lastname && (
            <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
              <MdError size={14} />
              <span>{errors.lastname.message}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="text"
            className="text-xs font-semibold tracking-[0.12em] text-slate-600"
          >
            Nickname
          </label>
          <input
            className={clsx(
              "mt-2 px-4 py-2 border rounded-lg bg-slate-100/80 text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
              {
                "border-red-500": errors.nickname,
                "border-slate-200": !errors.nickname,
              }
            )}
            type="text"
            placeholder="Crea tu nickname"
            {...register("nickname", {
              required: "El campo 'nickname' es requerido.",
              minLength: {
                value: 3,
                message: "Debe tener al menos 3 caracteres.",
              },
              maxLength: {
                value: 15,
                message: "Debe tener maximo 15 caracteres.",
              },
              pattern: {
                value: /^[a-zA-Z0-9._]+$/,
                message: "Solo permite letras, numeros, puntos y guiones bajos.",
              },
              validate: {
                noRepetidos: (value) =>
                  !/([a-zA-Z0-9._])\1{3,}/.test(value) ||
                  "No permite repetir el mismo caracter muchas veces",
                noSoloNumeros: (value) =>
                  !/^\d+$/.test(value) || "No puede ser solo numeros.",
                noUrls: (value) =>
                  !/@|www\./.test(value) || "No permite correos o URLs.",
                noProhibidas: (value) => {
                  const lower = value.toLowerCase();
                  return (
                    !palabrasProhibidas.some((p) => lower.includes(p)) ||
                    "Contiene palabras restringidas."
                  );
                },
              },
            })}
          />

          {errors.nickname && (
            <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
              <MdError size={14} />
              <span>{errors.nickname.message}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="text-xs font-semibold tracking-[0.12em] text-slate-600"
          >
            Email
          </label>
          <input
            className={clsx(
              "mt-2 px-4 py-2 border rounded-lg bg-slate-100/80 text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
              {
                "border-red-500": errors.email,
                "border-slate-200": !errors.email,
              }
            )}
            type="email"
            placeholder="Ingresa tu correo electronico"
            {...register("email", {
              required: {
                value: true,
                message: "El campo 'email' es requerido.",
              },
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Ingresado no es valido. Verifica e intentalo nuevamente.",
              },
            })}
          />

          {errors.email && (
            <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
              <MdError size={14} />
              <span>{errors.email.message}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="password"
            className="text-xs font-semibold tracking-[0.12em] text-slate-600"
          >
            Contrasena
          </label>
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={clsx(
                "w-full px-4 py-2 border rounded-lg bg-slate-100/80 text-slate-900 placeholder-slate-400 pr-12 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
                {
                  "border-red-500": errors.password,
                  "border-slate-200": !errors.password,
                }
              )}
              {...register("password", {
                required: "El campo 'contrasena' es requerido.",
                minLength: {
                  value: 8,
                  message: "Debe tener al menos 8 caracteres",
                },
                validate: {
                  hasUppercase: (v) =>
                    /[A-Z]/.test(v) || "Debe contener una mayuscula",
                  hasNumber: (v) => /\d/.test(v) || "Debe contener un numero",
                  hasSpecialChar: (v) =>
                    /[!@#$%^&*(),.?\":{}|<>]/.test(v) ||
                    "Debe contener un caracter especial",
                },
              })}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 inset-y-0 flex items-center text-slate-500"
              tabIndex={-1}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={22} />
              ) : (
                <AiOutlineEye size={22} />
              )}
            </button>
          </div>

          {errors.password && (
            <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
              <MdError size={14} />
              <span>{errors.password.message}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-semibold tracking-[0.12em] text-slate-600"
          >
            Confirmar contrasena
          </label>
          <div className="relative mt-2">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              className={clsx(
                "w-full px-4 py-2 border rounded-lg bg-slate-100/80 text-slate-900 placeholder-slate-400 pr-12 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200",
                {
                  "border-red-500": errors.confirmPassword,
                  "border-slate-200": !errors.confirmPassword,
                }
              )}
              {...register("confirmPassword", {
                required: "El campo 'confirmar contrasena' es requerido.",
                minLength: {
                  value: 8,
                  message: "Debe tener al menos 8 caracteres",
                },
              })}
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 inset-y-0 flex items-center text-slate-500"
              tabIndex={-1}
            >
              {showConfirm ? (
                <AiOutlineEyeInvisible size={22} />
              ) : (
                <AiOutlineEye size={22} />
              )}
            </button>
          </div>

          {errors.confirmPassword && (
            <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
              <MdError size={14} />
              <span>{errors.confirmPassword.message}</span>
            </div>
          )}
        </div>
      </div>

      <button
        className={clsx(
          "mt-3 py-3 rounded-lg text-sm font-semibold tracking-wide transition",
          {
            "bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_12px_30px_rgba(79,70,229,0.35)]":
              !success,
            "bg-gray-300 text-gray-500": success,
          }
        )}
        disabled={success || isPending}
      >
        Registrarse
      </button>

      <Link
        className="mt-0.5 text-center text-sm font-semibold text-slate-500"
        href={"/auth/login"}
      >
        {" "}
        Ya tienes una cuenta?{" "}
      </Link>
    </form>
  );
};

