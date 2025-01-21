import React from "react";

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <main className="flex justify-center h-screen m-0 bg-white">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
