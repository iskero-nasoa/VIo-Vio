import React from "react";

interface UserStatusProps {
  isOnline: boolean;
}

export const UserStatus: React.FC<UserStatusProps> = ({ isOnline }) => {
  return (
    <div className="relative group inline-block">
      <span
        className={`inline-block w-3 h-3 rounded-full border-2 border-slate-900 ${
          isOnline ? "bg-green-500" : "bg-gray-500"
        }`}
      ></span>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap">
        {isOnline ? "Online" : "Offline"}
      </div>
    </div>
  );
};
