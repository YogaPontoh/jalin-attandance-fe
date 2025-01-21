"use client"
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/templates/AuthLayout";
import LoginForm from "@/components/organisms/LoginForm";
import "./globals.css";

export default function Home() {
  const router = useRouter();

  const handleLogin = (userRole: string) => {
    if (userRole === "admin") {
      router.push("/admin");
    } else if (userRole === "user") {
      router.push("/user");
    }
  };
  return (
    <AuthLayout>
      <div className="flex items-center justify-center min-h-screen">
          <LoginForm onLogin={handleLogin}/>
      </div>
    </AuthLayout>
  );
}