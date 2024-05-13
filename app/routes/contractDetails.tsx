// Chatbot.tsx
import { useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { useEventSource } from "remix-utils/sse/react";
import DID_API from './api.json' 
import { ActionFunction, LoaderFunction, json } from "@remix-run/server-runtime";
import { getUserDetails, saveDetails } from "~/utils/queries";

export const loader: LoaderFunction = async ({ request }) => {
  const contractDetails = await getUserDetails(request);
  return json(contractDetails || {});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const contractDetails = {
    profession: formData.get("profession"),
    community: formData.get("community"),
    city: formData.get("city"),
    province: formData.get("province"),
    address: formData.get("address"),
  };

  const saveResult = await saveDetails(contractDetails, request);
  return json(saveResult);
};

export default function ContractDetails() {
  const loaderData = useLoaderData();
 
  const [contractDetails, setContractDetails] = useState(loaderData || {});

  const handleInputChange = (event) => {
      const { name, value } = event.target;
      setContractDetails(prevDetails => ({
          ...prevDetails,
          [name]: value
      }));
  };
  return (<div className="relative h-screen w-full lg:ps-64">
  <div className="max-w-2xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <div className="bg-white rounded-xl shadow p-4 sm:p-7 dark:bg-neutral-900">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-neutral-200">
          Informacion del contrato
        </h2>
        <p className="text-sm text-gray-600 dark:text-neutral-400">
          Meneja tus detalles de contrato
        </p>
      </div>

      <form method="POST">
        <div className="py-6 first:pt-0 last:pb-0 border-t first:border-transparent border-gray-200 dark:border-neutral-700 dark:first:border-transparent">
          <label htmlFor="profession" className="inline-block text-sm font-medium dark:text-white">
            Profesión
          </label>
          <select
            name="profession"
            value={contractDetails.profession || ''}
            onChange={handleInputChange}
            className="py-2 mt-2 px-3 block w-full border-gray-200 shadow-sm text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
          >
            <option value="">Seleccione una profesión</option>
            <option value="Engineering">Ingeniería</option>
            <option value="Medicine">Medicina</option>
            <option value="Law">Derecho</option>
          </select>
        </div>

        <div className="py-6 border-t border-gray-200 dark:border-neutral-700">
          <label htmlFor="community" className="inline-block text-sm font-medium dark:text-white">
            Comunidad Autónoma
          </label>
          <select
            name="community"
            value={contractDetails.community || ''}
            onChange={handleInputChange}
            className="py-2 mt-2 px-3 block w-full border-gray-200 shadow-sm text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
          >
            <option value="">Seleccione una comunidad</option>
            <option value="Catalonia">Cataluña</option>
            <option value="Madrid">Madrid</option>
            <option value="Andalusia">Andalucía</option>
          </select>
        </div>

        <div className="py-6 border-t border-gray-200 dark:border-neutral-700">
          <label htmlFor="city" className="inline-block text-sm font-medium dark:text-white">
            Ciudad
          </label>
          <select
            name="city"
            value={contractDetails.city || ''}
            onChange={handleInputChange}
            className="py-2 mt-2 px-3 block w-full border-gray-200 shadow-sm text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
          >
            <option value="">Seleccione una ciudad</option>
            <option value="Barcelona">Barcelona</option>
            <option value="Madrid">Madrid</option>
            <option value="Seville">Sevilla</option>
          </select>
        </div>

        <div className="py-6 border-t border-gray-200 dark:border-neutral-700">
          <label htmlFor="province" className="inline-block text-sm font-medium dark:text-white">
            Provincia
          </label>
          <select
            name="province"
            value={contractDetails.province || ''}
            onChange={handleInputChange}
            className="py-2 mt-2 px-3 block w-full border-gray-200 shadow-sm text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
          >
            <option value="">Seleccione una provincia</option>
            <option value="Barcelona">Barcelona</option>
            <option value="Madrid">Madrid</option>
            <option value="Seville">Sevilla</option>
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
