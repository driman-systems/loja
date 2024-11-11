"use client";
import { FiUser } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

const Header = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const getTitle = () => {
    if (pathname.includes('/dashboard/products')) return 'Produtos';
    if (pathname.includes('/dashboard/users')) return 'Usuários';
    if (pathname.includes('/dashboard/companies')) return 'Empresas';
    return 'Produtos';
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-white">{getTitle()}</h1>
      <div className="flex items-center space-x-4">
        {session?.user ? (
          <Menu as="div" className="relative">
          <MenuButton className="flex items-center space-x-2 focus:outline-none">
            <Image 
              src={`${session.user.image}?w=40&h=40&c=fill` || '/default-image.png'} 
              alt={session.user.name || "image"} 
              width={40} 
              height={40} 
              className="object-cover rounded-full"
              priority
            />
            <span className="text-gray-300 text-xs">{session.user.name?.split(' ')[0]}</span>
          </MenuButton>
          <MenuItems className="absolute right-0 mt-2 w-48 bg-gray-700 text-white rounded-md shadow-lg">
            <MenuItem as="button" className="group flex rounded-md items-center w-full px-4 py-2 text-sm data-[active=true]:bg-gray-600 data-[hover=true]:bg-gray-500" onClick={() => signOut({ callbackUrl: '/login' })}>
              Sair
            </MenuItem>
          </MenuItems>
        </Menu>
        
        ) : (
          <FiUser className="text-lg" />
        )}
      </div>
    </header>
  );
};

export default Header;
