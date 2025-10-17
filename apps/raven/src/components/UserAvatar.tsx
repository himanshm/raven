import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import type { LucideIcon } from "lucide-react";
import {
  LockKeyhole,
  LogOut,
  MonitorCog,
  Settings,
  UserCog
} from "lucide-react";
import { useNavigate } from "react-router";
import AvatarItem from "./AvatarItem";

export interface UserAvatarItem {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  submenuItems?: UserAvatarItem[];
}

const UserAvatar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userAvatarItems: UserAvatarItem[] = [
    {
      label: "Settings",
      icon: Settings,
      submenuItems: [
        {
          label: "Profile",
          icon: UserCog,
          onClick: () => navigate("/profile")
        },
        {
          label: "Preferences",
          icon: MonitorCog,
          onClick: () => navigate("/preferences")
        },
        {
          label: "Change Password",
          icon: LockKeyhole,
          onClick: () => navigate("/update-password")
        }
      ]
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
          <AvatarItem key={item.label} item={item} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar;
