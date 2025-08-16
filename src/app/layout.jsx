"use client"

import '../styles/globals.css';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import RequireAuth from '../components/RequireAuth.jsx';

// export const metadata = {
//   title: 'Collaborative Code Editor',
//   description: 'Real-time collaborative coding with Next.js'
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 flex h-screen">
        {/* <Sidebar /> */}
        <div className="flex-1 flex flex-col">
          <Header />
          <RequireAuth>
            <main className="flex-1 p-4 overflow-auto">{children}</main>
          </RequireAuth>
        </div>
      </body>
    </html>
  );
}