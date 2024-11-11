import Link from 'next/link';
import { FiBox, FiUsers, FiBriefcase } from 'react-icons/fi';

const Sidebar = () => {
  return (
    <aside className="w-48 bg-gray-800 text-white min-h-screen p-5 flex flex-col shadow-md pl-8">
      <div className="mb-10">
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>
      <nav className="space-y-4">
        <Link href="/dashboard/products/productList" className="flex items-center space-x-3 text-gray-300 hover:text-white">
          <FiBox className="text-lg" />
          <span>Produtos</span>
        </Link>
        <Link href="/dashboard/users" className="flex items-center space-x-3 text-gray-300 hover:text-white">
          <FiUsers className="text-lg" />
          <span>Usuários</span>
        </Link>
        <Link href="/dashboard/companies" className="flex items-center space-x-3 text-gray-300 hover:text-white">
          <FiBriefcase className="text-lg" />
          <span>Empresas</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
