import { FaClock, FaCheckCircle } from "react-icons/fa";

export const MatchStatusIcon = ({ resolved }: { resolved: boolean }) => {
  return (
    <div className="flex justify-center">
      {resolved ? (
        <FaCheckCircle className="text-emerald-500 dark:text-emerald-400" size={18} />
      ) : (
        <FaClock className="text-slate-400 dark:text-slate-500" size={18} />
      )}
    </div>
  );
};
