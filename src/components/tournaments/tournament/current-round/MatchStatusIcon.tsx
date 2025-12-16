import { FaClock, FaCheckCircle } from "react-icons/fa";

export const MatchStatusIcon = ({ resolved }: { resolved: boolean }) => {
  return (
    <div className="flex justify-center">
      {resolved ? (
        <FaCheckCircle className="text-green-500" size={18} />
      ) : (
        <FaClock className="text-gray-400" size={18} />
      )}
    </div>
  );
};
