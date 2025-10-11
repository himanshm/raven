import AppHeader from "@/components/AppHeader";
import { Outlet } from "react-router";

const DefaultLayout = () => {
  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex items-center justify-between mt-6">
        <AppHeader />
      </div>
      <main className="my-10">
        <Outlet />
      </main>
    </div>
  );
};

export default DefaultLayout;
