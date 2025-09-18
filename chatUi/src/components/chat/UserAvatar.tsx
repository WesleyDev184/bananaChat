import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  username: string;
  isOnline?: boolean;
  size?: "sm" | "md" | "lg";
  showOnlineIndicator?: boolean;
  className?: string;
}

// Função para gerar iniciais do usuário
function getUserInitials(username: string): string {
  return username
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Função para gerar cor baseada no username
function getUserColor(username: string): string {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-cyan-500",
  ];

  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export default function UserAvatar({
  username,
  isOnline = false,
  size = "md",
  showOnlineIndicator = false,
  className,
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "size-6",
    md: "size-10",
    lg: "size-12",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const indicatorSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const initials = getUserInitials(username);
  const bgColor = getUserColor(username);

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={`/api/avatar/${username}`} alt={username} />
        <AvatarFallback
          className={cn(
            bgColor,
            textSizeClasses[size],
            "text-white font-medium flex items-center justify-center"
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      {showOnlineIndicator && isOnline && (
        <div
          className={cn(
            "absolute -bottom-1 -right-1 rounded-full border-2 border-background bg-green-500",
            indicatorSizes[size]
          )}
          aria-label="Online"
        />
      )}
    </div>
  );
}
