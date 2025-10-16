import AppHeader from "@/components/AppHeader";
import ThemeToggle from "@/components/ThemeToggle";
import UserAvatar from "@/components/UserAvatar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { useAppSelector } from "@/store/hooks";
import type { RefObject } from "react";
import { Outlet } from "react-router";

const DefaultLayout = () => {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  const headerHeightRef = useResizeObserver(height =>
    document.documentElement.style.setProperty("--header-height", `${height}px`)
  );
  return (
    <div className="container mx-auto max-w-7xl">
      <div
        ref={headerHeightRef as RefObject<HTMLDivElement>}
        className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex items-center justify-between mt-2">
          <AppHeader />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated && user && <UserAvatar />}
          </div>
        </div>
        <Separator className="my-3 w-full max-w-[90rem]" />
      </div>
      <main className="my-10">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors duration={4000} closeButton />
    </div>
  );
};

export default DefaultLayout;
