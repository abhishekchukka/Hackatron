
"use client";
import { useState, useEffect } from "react";


import Link from "next/link";
import { Menu, X } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { Poppins } from "next/font/google";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400"],
    display: "swap",
});


export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        localStorage.setItem("user", currentUser.email);
        setUser(currentUser.email);
      } else {
        localStorage.removeItem("user");
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);


  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
  };

  return (
    <header className="text-black px-6 py-4 shadow-md bg-white sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className={`text-2xl font-bold ${poppins.clas}`}>Solo Leveling</h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <Link href="/marketplace" className="hover:text-gray-600">market Place</Link>
          <Link href="/coaches" className="hover:text-gray-600">Coaches</Link>
          {user ? (
            <div className="relative">
              {/* Username Button */}
              <button
                className="bg-gray-200 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gray-300 focus:outline-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.split("@")[0]}
              </button>

              {/* Logout Dropdown */}
              {dropdownOpen && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-[150px] bg-white text-black shadow-lg rounded-lg top-full mt-1 border border-gray-300"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm font-medium hover:bg-red-500 hover:text-white transition duration-300 rounded-md"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition-all duration-300">
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="md:hidden flex flex-col items-center bg-white py-4 space-y-4">
          <Link href="/" className="hover:text-gray-600" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/marketplace" className="hover:text-gray-600" onClick={() => setMenuOpen(false)}>Marketplace</Link>
          <Link href="/coaches" className="hover:text-gray-600" onClick={() => setMenuOpen(false)}>Coaches</Link>
          {user ? (
            <button onClick={handleLogout} className="bg-red-200 px-4 py-2 rounded-lg">
              Logout
            </button>
          ) : (
            <Link href="/login" className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg">Login</Link>
          )}
        </nav>
      )}
    </header>
  );
}