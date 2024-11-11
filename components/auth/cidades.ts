"use server"

export async function getCities(estado: string) {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`);
    const cidades = response.json();
    return cidades
}