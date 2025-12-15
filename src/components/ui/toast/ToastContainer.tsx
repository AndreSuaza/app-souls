"use client";

import { useToastStore } from "@/store/ui/toast.store";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

const typeStyles = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  warning: "bg-yellow-500 text-black",
  info: "bg-blue-600 text-white",
};

const typeIcon = {
  success: <FiCheckCircle className="text-xl mr-2" />,
  error: <FiAlertCircle className="text-xl mr-2" />,
  warning: <FiAlertCircle className="text-xl mr-2" />,
  info: <FiInfo className="text-xl mr-2" />,
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`min-w-[260px] max-w-[340px] shadow-lg rounded-md px-4 py-3 flex items-start animate-slideIn ${
            typeStyles[t.type]
          }`}
        >
          <div className="flex items-center flex-1">
            {typeIcon[t.type]}

            <p className="text-sm font-medium">{t.message}</p>
          </div>

          <button onClick={() => removeToast(t.id)}>
            <FiX className="text-xl ml-4 hover:scale-110 transition-transform" />
          </button>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(50%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};
