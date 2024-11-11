"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { estados } from '@/components/auth/estados';
import { getCities } from '@/components/auth/cidades';
import { FiLoader } from 'react-icons/fi';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
    const [loading, setLoading] = useState<boolean>(false);
    const [loadCities, setLoadCities] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [cpf, setCpf] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [birthDate, setBirthDate] = useState<string>("");
    const [selectedState, setSelectedState] = useState<string>("RS");
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [cities, setCities] = useState<Array<{ id: number; nome: string }>>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    useEffect(() => {
        const fetchCities = async (estado: string) => {
            setLoadCities(true);
            const citiesData = await getCities(estado);
            setCities(citiesData);
            setLoadCities(false);
            if (citiesData.length > 0) {
                setSelectedCity(citiesData[0].nome);
            }
        };

        fetchCities(selectedState);
    }, [selectedState]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
                name,
                cpf,
                phone,
                estado: selectedState,
                cidade: selectedCity,
                birthDate,
            }),
        });

        if (res.ok) {
            // Após o cadastro, fazer o login automático
            const signInRes = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (signInRes?.error) {
                setError('Erro ao logar após cadastro');
            } else {
                router.push(callbackUrl); // Redirecionar para a página de origem
            }
        } else {
            const result = await res.json();
            setError(result.error || 'Erro ao criar usuário');
        }

        setLoading(false);
    };

    return (
        <div className='flex flex-col w-full min-h-screen items-center justify-center p-4'>
            <div className="w-full max-w-xl mx-auto bg-gray-800 rounded-lg shadow-md px-5 py-4">
                <h2 className="text-2xl font-bold mb-4 text-center">Cadastro de Usuário</h2>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-1 bg-gray-700 border border-gray-600 rounded"
                        />
                    </div>
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
                    <div>
                        <label className="block text-sm font-medium mb-1">CPF:</label>
                        <input
                            type="text"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            required
                            className="w-full p-1 bg-gray-700 border border-gray-600 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Telefone:</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full p-1 bg-gray-700 border border-gray-600 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Estado:</label>
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                        >
                            <option value="">Selecione o estado</option>
                            {estados.map((state) => (
                                <option key={state.sigla} value={state.sigla}>
                                    {state.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="flex flex-row items-center text-sm font-medium mb-1">
                            Cidade: {loadCities && <FiLoader className="mr-2 animate-spin" />}
                        </label>
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                        >
                            <option value="">Selecione a cidade</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.nome}>
                                    {city.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='pb-4'>
                        <label className="block text-sm font-medium mb-1">Data de Nascimento:</label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            required
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
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
                                Enviando...
                            </>
                        ) : (
                            "Cadastrar"
                        )}
                    </button>

                    <div className='flex flex-row w-full justify-end p-4 space-x-2 text-sm'>
                       <span>Já tem cadastro?</span> <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className='font-bold underline'>Entrar</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
