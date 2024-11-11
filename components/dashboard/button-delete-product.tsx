"use client"

import { FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface Product {
    id: string;
    title: string;
    description: string | null;
    price: number;
    promoPrice: number | null;
    hasDateReservation: boolean;
    hasTimeReservation: boolean;
    reservationDays: number[];
    reservationTimes: string[];  
    reservationLimits: { [key: string]: number }; 
    includedItems: string[];
    notIncludedItems: string[];
    image: string | null;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ButtonDeleteProductProps {
    product: Product;
}

const ButtonDeleteProduct = ({ product }: ButtonDeleteProductProps) => {
    const router = useRouter();

    const deleteProduct = async (productId: string) => {
        if (confirm("Tem certeza que deseja excluir este produto?")) {
            await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });
            router.refresh(); 
        }
    };

    return (
        <button
            className="text-gray-400 hover:text-red-400 transition"
            title="Excluir Produto"
            onClick={() => deleteProduct(product.id)}
        >
            <FaTrash size={20} />
        </button>
    );
}

export default ButtonDeleteProduct;
