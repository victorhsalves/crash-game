import { useState } from "react";
import { UserAvatarIcon } from "@/components/icons/user-avatar-icon";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLogout } from "@/hooks/use-logout";

export function PlayerMenu() {
  const { isAuthenticated, isInitialized } = useAuth();
  const userQuery = useCurrentUser();
  const logout = useLogout();
  const [isOpen, setIsOpen] = useState(false);

  if (!isInitialized || !isAuthenticated) {
    return null;
  }

  const username = userQuery.isLoading ? "..." : (userQuery.data?.username ?? "—");

  function handleLogout() {
    setIsOpen(false);
    void logout();
  }

  return (
    <DropdownMenu
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <>
          <UserAvatarIcon />
          <span className="font-medium text-foreground">{username}</span>
          <span className="text-xs text-muted" aria-hidden="true">
            ▾
          </span>
        </>
      }
    >
      <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
    </DropdownMenu>
  );
}
