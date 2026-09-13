import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col text-[#181b26] antialiased">
      <Navbar />
      <div className="flex flex-1 w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
