import { useActionData, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction, ActionFunction } from "@remix-run/server-runtime";
import { useState } from "react";
import { fetchUserContractDetails, saveContractDetails } from "~/utils/queries";

// Define loader function to preload data if necessary
export const loader: LoaderFunction = async ({ request }) => {
    // Simulated fetch function to get user contract details
    const userContractDetails = await fetchUserContractDetails(request);
    return json(userContractDetails);
};

// Define action function to handle form submissions
export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const contractDetails = {
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        contractType: formData.get("contractType"),
        trialPeriod: formData.get("trialPeriod"),
        workdayType: formData.get("workdayType"),
        weeklyHours: formData.get("weeklyHours"),
        netSalary: formData.get("netSalary"),
        grossSalary: formData.get("grossSalary"),
        extraPayments: formData.get("extraPayments"),
        sector: formData.get("sector"),
        cotizationGroup: formData.get("cotizationGroup")
    };
    // Here you would handle saving or updating contract details
    const saveResult = await saveContractDetails(contractDetails,request);
    return json(saveResult);
};

// Main component for contract details
export default function ContractDetails() {
    const actionData = useActionData();
    const loaderData = useLoaderData();
    
    const [contractDetails, setContractDetails] = useState(loaderData || {});

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setContractDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };

    return (
        <div className="relative h-screen w-full lg:ps-64">
            <div className="max-w-4xl px-4 py-10 sm:px-6 lg:px-8 mx-auto">
                <div className="bg-white rounded-xl shadow p-4 sm:p-7 dark:bg-neutral-800">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-200">
                            Detalles del Contrato
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-neutral-400">
                            Gestiona los detalles de tu contrato.
                        </p>
                    </div>
                    <form method="POST" className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Fecha de inicio del contrato
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={contractDetails.startDate || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Fecha de finalización del contrato
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={contractDetails.endDate || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Tipo de contrato
                            </label>
                            <select
                                name="contractType"
                                value={contractDetails.contractType || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="temporal">Temporal</option>
                                <option value="indefinido">Indefinido</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Periodo de prueba
                            </label>
                            <select
                                name="trialPeriod"
                                value={contractDetails.trialPeriod || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="yes">Sí</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Tipo de jornada
                            </label>
                            <select
                                name="workdayType"
                                value={contractDetails.workdayType || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="completa">Completa</option>
                                <option value="parcial">Parcial</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Horas semanales
                            </label>
                            <input
                                type="number"
                                name="weeklyHours"
                                value={contractDetails.weeklyHours || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Salario Neto
                            </label>
                            <input
                                type="number"
                                name="netSalary"
                                value={contractDetails.netSalary || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Salario Bruto
                            </label>
                            <input
                                type="number"
                                name="grossSalary"
                                value={contractDetails.grossSalary || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Pagas Extras
                            </label>
                            <input
                                type="number"
                                name="extraPayments"
                                value={contractDetails.extraPayments || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Sector / Sindicato
                            </label>
                            <input
                                type="text"
                                name="sector"
                                value={contractDetails.sector || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Grupo de Cotización
                            </label>
                            <select
                                name="cotizationGroup"
                                value={contractDetails.cotizationGroup || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="1">Grupo 1: Ingenieros y Licenciados</option>
                                <option value="2">Grupo 2: Personal de Oficinas</option>
                                <option value="3">Grupo 3: No cualificados</option>
                                <option value="6">Grupo 6: Subalternos</option>
                                <option value="7">Grupo 7: Auxiliares Administrativos</option>
                            </select>
                        </div>
    
                        <div className="mt-5 flex justify-end gap-x-2">
                            <button
                                type="submit"
                                className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
