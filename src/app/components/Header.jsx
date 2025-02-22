"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { Poppins } from "next/font/google";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    const checkUserUpdates = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) return;

      try {
        // Determine collection based on user type
        const collection = storedUser.coachingLevel ? "coaches" : "players";
        const userRef = doc(db, collection, storedUser.email);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          // Only update if data has changed
          if (JSON.stringify(userData) !== JSON.stringify(storedUser)) {
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Error checking user updates:", error);
      }
    };

    // Check for updates when component mounts and periodically
    checkUserUpdates();
    const interval = setInterval(checkUserUpdates, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    window.location.href="/";
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className={`text-2xl font-bold tracking-tight ${poppins.className}`} data-aos="fade-right" data-aos-duration="1000">
            Solo Leveling
          </h1>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="px-3 py-2 text-gray-700 hover:text-black" data-aos="zoom-in" data-aos-duration="1000">Home</Link>
            <Link href="/marketplace" className="px-3 py-2 text-gray-700 hover:text-black" data-aos="zoom-in" data-aos-duration="1000">Marketplace</Link>
            <Link href="/coaches" className="px-3 py-2 text-gray-700 hover:text-black" data-aos="zoom-in" data-aos-duration="1000">Coaches</Link>

            {user ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span data-aos="zoom-in" data-aos-duration="1000">{user.fullName}</span>
                  <ChevronDown size={16} className={`transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                    <Link 
                      href={user.coachingLevel ? "/coach_dashboard" : "/player_dashboard"} 
                      className="block w-full px-3 py-2 text-gray-700 hover:text-black hover:bg-gray-50" 
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="bg-gray-50 hover:bg-gray-100 px-6 py-2 rounded-lg" data-aos="zoom-in" data-aos-duration="1000">
                Sign in
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="md:hidden py-4 space-y-2">
            <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)} data-aos="zoom-in" data-aos-duration="1000">Home</Link>
            <Link href="/marketplace" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)} data-aos="zoom-in" data-aos-duration="1000">Marketplace</Link>
            <Link href="/coaches" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)} data-aos="zoom-in" data-aos-duration="1000">Coaches</Link>
            
            {user ? (
              <div className="flex flex-col gap-2">
                <Link 
                  href={user.coachingLevel ? "/coach_dashboard" : "/player_dashboard"}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50" 
                  onClick={() => setMenuOpen(false)} 
                  data-aos="zoom-in" 
                  data-aos-duration="1000"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50" 
                onClick={() => setMenuOpen(false)} 
                data-aos="zoom-in" 
                data-aos-duration="1000"
              >
                Sign in
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

