"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUserCircle, FaCog, FaSignOutAlt, FaShoppingCart } from "react-icons/fa";
import { signOut } from "next-auth/react";
import CartModal from "./cartModal"; // Modal do Carrinho

interface UserProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface HeaderProps {
  companyLogo: string | null;
  user?: UserProps | null;
}

const HeaderProduct = ({ companyLogo, user }: HeaderProps) => {
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // Estado do modal do carrinho
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userState, setUserState] = useState<UserProps | null>(user || null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCallbackUrl(window.location.href);
    }
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  // Fechar o dropdown se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setUserState(null);
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-gray-900 p-4 flex justify-between items-center">
      <div className="flex flex-row w-full max-w-2xl mx-auto items-center justify-between">
        <Link href="/">
          <Image
            src={companyLogo || "/default-image.png"}
            alt="Logo da Empresa"
            width={110}
            height={31}
            style={{ width: 'auto', height: 'auto' }}
            className="object-contain"
          />
        </Link>
        <div className="relative flex items-center space-x-4">
          {userState ? (
            <>
              <div className="flex items-center space-x-4 cursor-pointer" onClick={toggleDropdown}>
                <Image
                  src={userState.image || "/default-user.png"}
                  alt={userState.name || "image"}
                  width={40}
                  height={40}
                  className="object-cover rounded-full"
                  priority
                />
                <span className="text-gray-300 text-base font-bold">
                  {userState.name?.split(" ")[0]}
                </span>
              </div>

              {/* Menu suspenso */}
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-32 w-48 bg-gray-800 rounded-md shadow-lg"
                >
                  <Link href="/settings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                    <FaCog className="inline mr-2" /> Configurações
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    <FaSignOutAlt className="inline mr-2" /> Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            callbackUrl && (
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="text-white flex items-center space-x-2"
              >
                <FaUserCircle size={24} />
                <span>Login</span>
              </Link>
            )
          )}
          <FaShoppingCart size={32} className="text-white cursor-pointer" onClick={toggleCart} /> {/* Ícone do carrinho */}

          {/* Modal do Carrinho */}
          <CartModal isOpen={isCartOpen} onClose={toggleCart} />
        </div>
      </div>
    </header>
  );
};

export default HeaderProduct;
