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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col mb-2 gap-3"
    >
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
            Por favor verifica tu correo electrónico para completar tu registro.
          </span>
        </div>
      )}

      <div className="flex flex-col">
        <label htmlFor="name">Nombre</label>
        <input
          className={clsx("px-5 py-2 border bg-gray-200 rounded", {
            "border-red-500": errors.name,
          })}
          type="name"
          placeholder="Ingresa tu nombre"
          {...register("name", {
            required: "El campo 'nombre' es requerido.",
            minLength: {
              value: 3,
              message: "Debe tener al menos 3 caracteres.",
            },
            maxLength: {
              value: 20,
              message: "Debe tener máximo 20 caracteres.",
            },
            validate: {
              noRepetidos: (value) =>
                !/([a-zA-Z0-9._])\1{3,}/.test(value) ||
                "No permite repetir el mismo carácter muchas veces.",
              noSoloNumeros: (value) =>
                !/^\d+$/.test(value) || "No puede ser solo números.",
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
        <label htmlFor="text">Apellido</label>
        <input
          className={clsx("px-5 py-2 border bg-gray-200 rounded", {
            "border-red-500": errors.name,
          })}
          type="text"
          placeholder="Ingresa tu apellido"
          {...register("lastname", {
            required: "El campo 'apellido' es requerido.",
            minLength: {
              value: 3,
              message: "Debe tener al menos 3 caracteres.",
            },
            maxLength: {
              value: 20,
              message: "Debe tener máximo 20 caracteres.",
            },
            validate: {
              noRepetidos: (value) =>
                !/([a-zA-Z0-9._])\1{3,}/.test(value) ||
                "No permite repetir el mismo carácter muchas veces",
              noSoloNumeros: (value) =>
                !/^\d+$/.test(value) || "No puede ser solo números.",
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
        <label htmlFor="text">Nickname</label>
        <input
          className={clsx("px-5 py-2 border bg-gray-200 rounded", {
            "border-red-500": errors.nickname,
          })}
          type="text"
          placeholder="Crea tu nickname"
          {...register("nickname", {
            required: "El campo 'nickname' es requerido.",
            minLength: {
              value: 3,
              message: "Debe tener al menos 3 caracteres.",
            },
            maxLength: {
              value: 20,
              message: "Debe tener máximo 20 caracteres.",
            },
            pattern: {
              value: /^[a-zA-Z0-9._]+$/,
              message: "Solo permite letras, números, puntos y guiones bajos.",
            },
            validate: {
              noRepetidos: (value) =>
                !/([a-zA-Z0-9._])\1{3,}/.test(value) ||
                "No permite repetir el mismo carácter muchas veces",
              noSoloNumeros: (value) =>
                !/^\d+$/.test(value) || "No puede ser solo números.",
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
        <label htmlFor="email">Email</label>
        <input
          className={clsx("px-5 py-2 border bg-gray-200 rounded", {
            "border-red-500": errors.email,
          })}
          type="email"
          placeholder="Ingresa tu correo electrónico"
          {...register("email", {
            required: {
              value: true,
              message: "El campo 'email' es requerido.",
            },
            pattern: {
              value: /^\S+@\S+$/i,
              message:
                "Ingresado no es válido. Verifica e inténtalo nuevamente.",
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
        <label htmlFor="password">Contraseña</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Crea una contraseña segura"
            className={clsx(
              "px-5 py-2 border bg-gray-200 rounded w-full pr-12",
              {
                "border-red-500": errors.password,
              }
            )}
            {...register("password", {
              required: "El campo 'contraseña' es requerido.",
              minLength: {
                value: 8,
                message: "Debe tener al menos 8 caracteres",
              },
              validate: {
                hasUppercase: (v) =>
                  /[A-Z]/.test(v) || "Debe contener una mayúscula",
                hasNumber: (v) => /\d/.test(v) || "Debe contener un número",
                hasSpecialChar: (v) =>
                  /[!@#$%^&*(),.?\":{}|<>]/.test(v) ||
                  "Debe contener un carácter especial",
              },
            })}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
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
        <label htmlFor="confirmPassword">Confirmar contraseña</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Repite tu contraseña"
            className={clsx(
              "px-5 py-2 border bg-gray-200 rounded w-full pr-12",
              {
                "border-red-500": errors.confirmPassword,
              }
            )}
            {...register("confirmPassword", {
              required: "El campo 'confirmar contraseña' es requerido.",
              minLength: {
                value: 6,
                message: "Debe tener un mínimo de 6 caracteres",
              },
            })}
          />

          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
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

      <button
        className={clsx("mt-2 py-2 rounded", {
          "bg-indigo-500 text-white hover:bg-indigo-600 transition": !success,
          "bg-gray-300": success,
        })}
        disabled={success || isPending}
      >
        Registrarse
      </button>

      <Link
        className="mt-2 font-bold text-center text-slate-500"
        href={"/auth/login"}
      >
        {" "}
        ¿Ya tienes una cuenta?{" "}
      </Link>
    </form>
  );
};
