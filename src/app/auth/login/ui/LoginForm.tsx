"use client";

import clsx from "clsx";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { MdError, MdCheckCircle } from "react-icons/md";
import { authenticate } from "@/actions";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type FormInputs = {
  email: string;
  password: string;
};

interface FormLoginProps {
  isVerified: boolean;
}

export const LoginForm = ({ isVerified }: FormLoginProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { update } = useSession();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    startTransition(async () => {
      const resp = await authenticate(data);
      if (!resp.success && resp.message) {
        setError(resp.message);
      } else {
        await update();
        router.push("/");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col mb-3 gap-3"
    >
      {isVerified && (
        <div className="flex items-center gap-2 text-green-600 text-sm my-4 px-2 py-2 bg-green-50 border border-green-200 rounded">
          <MdCheckCircle size={18} />
          <span>
            Correo electrónico verificado, ahora puedes iniciar sesión.
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm my-4 px-2 py-2 bg-red-50 border border-red-200 rounded">
          <MdError size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col">
        <label htmlFor="email" className="mb-1">
          Correo electrónico
        </label>

        <input
          className={clsx("px-5 py-2 border bg-gray-200 rounded", {
            "border-red-500": errors.email,
          })}
          type="email"
          placeholder="Ingresa tu correo electrónico"
          {...register("email", {
            required: {
              value: true,
              message: "El campo 'email' es requerido",
            },
            pattern: {
              value: /^\S+@\S+$/i,
              message:
                "El correo ingresado no es válido. Verifica e inténtalo nuevamente.",
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
        <label htmlFor="password" className="mb-1">
          Contraseña
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Ingresa tu contraseña"
            className={clsx(
              "px-5 py-2 border bg-gray-200 rounded w-full pr-12",
              { "border-red-500": errors.password }
            )}
            {...register("password", {
              required: {
                value: true,
                message: "El campo 'contraseña' es requerido.",
              },
              minLength: {
                value: 6,
                message: "La contraseña debe tener un mínimo de 6 caracteres",
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

      <div className="flex justify-end">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-slate-600 hover:text-slate-800 inline-block"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <button className="btn-primary" disabled={isPending}>
        Iniciar Sesión
      </button>

      {/* divisor line */}
      <div className="flex items-center my-1">
        <div className="flex-1 border-t border-gray-500"></div>
        <div className="px-2 text-gray-800">O</div>
        <div className="flex-1 border-t border-gray-500"></div>
      </div>

      <Link
        href="/auth/register"
        className="btn-secondary text-center text-white"
      >
        Crear una nueva cuenta
      </Link>
    </form>
  );
};
