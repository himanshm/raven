import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import type { LucideIcon } from "lucide-react";
import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router";

interface UserAvatarItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

const UserAvatar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  console.log("user", user);
  const userAvatarItems: UserAvatarItem[] = [
    {
      label: "Settings",
      icon: Settings,
      onClick: () => navigate("/settings/profile")
    },
    {
      label: "Logout",
      icon: LogOut,
      onClick: () => logout()
    }
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Avatar>
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {userAvatarItems.map(item => (
          <DropdownMenuItem key={item.label} onClick={item.onClick}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar;
