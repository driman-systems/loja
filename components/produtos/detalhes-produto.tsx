function DetalhesProduto({ includedItems, notIncludedItems }: { includedItems: string[], notIncludedItems: string[] }) {
  return (
    <div className="flex flex-col w-full justify-center py-6">
      <h1 className="text-xl font-bold text-center py-6">INFORMAÇÕES IMPORTANTES</h1>
      <div className="flex flex-col sm:flex-row justify-between space-y-6 sm:space-y-0 sm:space-x-8 mt-8">
        
        {/* O QUE ESTÁ INCLUSO */}
        <div className="flex-[3]">
          <h3 className="font-semibold mb-4">O QUE ESTÁ INCLUSO</h3>
          <ul className="list-none space-y-2">
            {includedItems.map((item, index) => (
              <li key={index} className="text-gray-200">
                <span className="inline-flex items-center text-sm">
                  ✅ {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* O QUE NÃO ESTÁ INCLUSO */}
        <div className="flex-[2] pl-0 md:pl-10">
          <h3 className="font-semibold mb-4">O QUE NÃO ESTÁ INCLUSO</h3>
          <ul className="list-none space-y-2">
            {notIncludedItems.map((item, index) => (
              <li key={index} className="text-gray-200">
                <span className="inline-flex items-center text-sm">
                  ❌ {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DetalhesProduto;
