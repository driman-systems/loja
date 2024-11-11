import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { FaEdit, FaTrash } from 'react-icons/fa';
import ButtonDeleteUser from '@/components/dashboard/button-delete-user';

export const dynamic = 'force-dynamic';

const UserList = async() => {
  // Busca todos os usuários
  const users = await prisma.adminUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
      image: true,
    },
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Lista de Usuários</h2>
        <Link
          href="/dashboard/users/create"
          className="px-4 py-2 bg-transparent text-xs border border-gray-500 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-300"
        >
          Criar Novo Usuário
        </Link>
      </div>
      <div>
        <ul className="space-y-4">
          {users.map((user) => (
            <li key={user.id} className="p-4 bg-gray-800 rounded-md shadow flex items-center space-x-4 hover:bg-gray-700 transition-all duration-300">
              {/* Avatar do Usuário */}
              <Image
                src={user.image || '/default-avatar.png'}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              {/* Informações do Usuário */}
              <div className="flex-1">
                <div className="font-semibold text-white">{user.name}</div>
                <div className="text-sm text-gray-400">{user.email}</div>
                <div className="text-sm text-gray-400">Telefone: {user.phoneNumber || 'Não informado'}</div>
                <div className="text-sm text-gray-400">Tipo: {user.role}</div>
              </div>
              {/* Ações */}
              <div className="flex space-x-2">
                {/* Botão de Editar */}
                <Link href={`/dashboard/users/edit/${user.id}`} className="text-gray-400 hover:text-blue-400 transition" title="Editar Usuário">
                  <FaEdit size={20} />
                </Link>
                {/* Botão de Excluir */}
                <ButtonDeleteUser user={user} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserList;
