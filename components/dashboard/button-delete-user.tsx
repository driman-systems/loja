"use client"

import { FaTrash } from "react-icons/fa"
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string | null;
    role: string;
    image?: string | null;
  }

interface ButtonDeleteUserProps {
    user: User;
}

const ButtonDeleteUser = ({user}: ButtonDeleteUserProps) => {

const router = useRouter();

const deleteUser = async (userId: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
        await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        });
        router.refresh();
    };
}

  return (
    <button
        className="text-gray-400 hover:text-red-400 transition"
        title="Excluir Usuário"
        onClick={() => deleteUser(user.id)}
    >
        <FaTrash size={20} />
    </button>
  )
}

export default ButtonDeleteUser              