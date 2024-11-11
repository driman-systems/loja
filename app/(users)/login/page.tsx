"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';
import Link from 'next/link';
import { getSession, signIn } from 'next-auth/react';

export default function LoginPage() {
    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        const result = await signIn("credentials", {
            redirect: false,
            email,
            password,
            callbackUrl,
        });
    
        setLoading(false);
    
        if (result?.error) {
            setError('Verifique seu email ou senha');
        } else {
            const session = await getSession();
            
            if (session?.user?.role === "Admin") {
                router.push("/"); 
            } else {
                router.push(callbackUrl);
            }
        }
    };

    return (
        <div className='flex flex-col w-full min-h-screen items-center justify-center px-6'>
            <div className="w-full max-w-sm mx-auto bg-gray-800 rounded-lg shadow-md p-4 mt-[-30px] md:mt-0">
                <h2 className="text-2xl font-bold py-4 text-center">Acesse sua conta</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-1 bg-gray-700 border border-gray-600 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Senha:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-1 bg-gray-700 border border-gray-600 rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center font-bold px-4 py-2 border border-transparent rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-200"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <FiLoader className="mr-2 animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            "Entrar"
                        )}
                    </button>

                    <div className='flex flex-row w-full justify-end p-4 space-x-2 text-xs'>
                        <span>Não tem uma conta?</span> 
                        <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className='font-bold underline'>
                            Cadastre-se
                        </Link>
                    </div>
                </form>
                {error && <div className="text-red-500 mb-4 w-full justify-center items-center py-6 text-center">{error}</div>}
            </div>
        </div>
    );
}
