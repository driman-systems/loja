import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const CompanyList = async () => {
  const companies = await prisma.company.findMany();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Lista de Empresas</h2>
        <Link href="/dashboard/companies/create" className="px-4 py-2 bg-transparent text-xs border border-gray-500 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-all duration-300">
          Criar Nova Empresa
        </Link>
      </div>
      <div className="space-y-4">
        <ul>
          {companies.map((company) => (
            <li key={company.id} className="p-4 bg-gray-800 rounded-md shadow flex items-center space-x-4 hover:bg-gray-700 transition-all duration-300">
              {/* Logo da empresa */}
              {company.logo && (
                <div className="w-50 h-35">
                  <Image
                    src={company.logo}
                    alt={`Logo da ${company.name}`}
                    width={100}
                    height={55}
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              {/* Informações da empresa */}
              <div className="flex-1">
                <div className="font-semibold text-white">{company.name}</div>
                <div className="text-sm text-gray-400">{company.email}</div>
                <div className="text-sm text-gray-400">{company.phoneNumber}</div>
                <div className="text-sm text-gray-400">{company.city}, {company.state}</div>
              </div>
              {/* Setor da empresa */}
              <div className="text-sm text-gray-400">
                {company.sector || 'Setor não especificado'}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CompanyList;
