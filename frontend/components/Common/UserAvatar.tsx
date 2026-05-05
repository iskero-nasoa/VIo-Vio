import React from "react";

interface UserAvatarProps {
  user: {
    username: string;
    avatar?: string;
    status?: "online" | "offline" | "away";
  };
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = "md", 
  showStatus = true 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-32 h-32 text-3xl",
  };

  const statusClasses = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    offline: "bg-slate-500",
  };

  const statusSizeClasses = {
    sm: "w-2.5 h-2.5 border-2",
    md: "w-3 h-3 border-2",
    lg: "w-4 h-4 border-2",
    xl: "w-8 h-8 border-4",
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const fileBaseUrl = apiUrl.replace(/\/api$/, "");
  const fullAvatarUrl = user.avatar ? `${fileBaseUrl}${user.avatar}` : null;

  return (
    <div className={`relative shrink-0 ${sizeClasses[size]}`}>
      <div className={`w-full h-full rounded-2xl flex items-center justify-center font-bold shadow-lg overflow-hidden bg-slate-800 text-slate-300`}>
        {fullAvatarUrl ? (
          <img src={fullAvatarUrl} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <span>{user.username.charAt(0).toUpperCase()}</span>
        )}
      </div>
      {showStatus && user.status && (
        <div className={`absolute -bottom-0.5 -right-0.5 rounded-full border-slate-950 shadow-sm ${statusClasses[user.status]} ${statusSizeClasses[size]}`}></div>
      )}
    </div>
  );
};
