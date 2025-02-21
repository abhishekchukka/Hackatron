
// "use client";
// import { useState, useEffect } from "react";


// import Link from "next/link";
// import { Menu, X } from "lucide-react";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { auth } from "../utils/firebase";
// import { Poppins } from "next/font/google";

// const poppins = Poppins({
//     subsets: ["latin"],
//     weight: ["400"],
//     display: "swap",
// });


// export default function Header() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const [dropdownOpen, setDropdownOpen] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) {
//         localStorage.setItem("user", currentUser.email);
//         setUser(currentUser.email);
//       } else {
//         localStorage.removeItem("user");
//         setUser(null);
//       }
//     });
//     return () => unsubscribe();
//   }, []);


//   const handleLogout = async () => {
//     await signOut(auth);
//     localStorage.removeItem("user");
//     setUser(null);
//     setDropdownOpen(false);
//   };

//   return (
//     <header className="text-black px-6 py-4 shadow-md bg-white sticky top-0 z-50">
//       <div className="flex justify-between items-center max-w-7xl mx-auto">
//         <h1 className={`text-2xl font-bold ${poppins.clas}`}>Solo Leveling</h1>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex space-x-6 items-center">
//           <Link href="/" className="hover:text-gray-600">Home</Link>
//           <Link href="/marketplace" className="hover:text-gray-600">market Place</Link>
//           <Link href="/coaches" className="hover:text-gray-600">Coaches</Link>
//           {user ? (
//             <div className="relative">
//               {/* Username Button */}
//               <button
//                 className="bg-gray-200 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gray-300 focus:outline-none"
//                 onClick={() => setDropdownOpen(!dropdownOpen)}
//               >
//                 {user.split("@")[0]}
//               </button>

//               {/* Logout Dropdown */}
//               {dropdownOpen && (
//                 <div
//                   className="absolute left-1/2 -translate-x-1/2 w-[150px] bg-white text-black shadow-lg rounded-lg top-full mt-1 border border-gray-300"
//                 >
//                   <button
//                     onClick={handleLogout}
//                     className="w-full px-4 py-2 text-sm font-medium hover:bg-red-500 hover:text-white transition duration-300 rounded-md"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <Link href="/login" className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition-all duration-300">
//               Login
//             </Link>
//           )}
//         </nav>

//         {/* Mobile Menu Button */}
//         <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
//           {menuOpen ? <X size={28} /> : <Menu size={28} />}
//         </button>
//       </div>

//       {/* Mobile Navigation */}
//       {menuOpen && (
//         <nav className="md:hidden flex flex-col items-center bg-white py-4 space-y-4">
//           <Link href="/" className="hover:text-gray-600" onClick={() => setMenuOpen(false)}>Home</Link>
//           <Link href="/marketplace" className="hover:text-gray-600" onClick={() => setMenuOpen(false)}>Marketplace</Link>
//           <Link href="/coaches" className="hover:text-gray-600" onClick={() => setMenuOpen(false)}>Coaches</Link>
//           {user ? (
//             <button onClick={handleLogout} className="bg-red-200 px-4 py-2 rounded-lg">
//               Logout
//             </button>
//           ) : (
//             <Link href="/login" className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg" onClick={() => setMenuOpen(false)}>Login</Link>
//           )}
//         </nav>
//       )}
//     </header>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { Poppins } from "next/font/google";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "600"],
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

  const NavLink = ({ href, children }) => (
    <Link 
      href={href} 
      className="relative group px-3 py-2 text-gray-700 hover:text-black transition-colors duration-200"
    >
      <span>{children}</span>
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
    </Link>
  );

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className={`text-2xl font-bold tracking-tight ${poppins.className}`}>
            Solo Leveling
          </h1>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/marketplace">Marketplace</NavLink>
            <NavLink href="/coaches">Coaches</NavLink>
            
            {user ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-all duration-200"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="font-medium">{user.split("@")[0]}</span>
                  <ChevronDown size={16} className={`transform transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animate-fadeIn">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors duration-200"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-gray-50 hover:bg-gray-100 px-6 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                Sign in
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="md:hidden py-4 space-y-2 animate-slideDown">
            <Link 
              href="/" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/marketplace" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link 
              href="/coaches" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Coaches
            </Link>
            {user ? (
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                Sign out
              </button>
            ) : (
              <Link 
                href="/login" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
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