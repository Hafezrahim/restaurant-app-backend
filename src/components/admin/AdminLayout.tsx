import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AdminSidebar />
      <div className="mr-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
