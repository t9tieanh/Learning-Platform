import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";

const AdminLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <header className="h-16 border-b bg-background/80 backdrop-blur-sm flex items-center px-6 shadow-sm">
            <SidebarTrigger />
            <div className="ml-4 flex items-center justify-between flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Quản trị hệ thống
              </h1>
            </div>
          </header>
          <main className="flex-1 min-h-0 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AdminLayout;