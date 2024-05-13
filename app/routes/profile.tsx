import { useActionData, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, json } from "@remix-run/server-runtime";
import { useEffect, useRef, useState } from "react";
import { getEmail, getUserProfile, saveProfile } from "~/utils/queries";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const email = await getEmail(request);
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const bio = formData.get("bio");
  const gender = formData.get("gender"); // Make sure this matches the name attribute in the form
  const birthday = formData.get("birthday");
  const avatar = formData.get("avatar");

  if (!email) {
    return json({ success: false, message: "User not found" });
  }

  const updatedUser = await saveProfile(email, firstName, lastName, bio, gender, birthday, avatar);
  if (!updatedUser) {
    return json({ success: false, message: "User not found or update failed." });
  }

  return json({ success: true, message: "Profile updated successfully.", user: updatedUser });
};
export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUserProfile(request);
  if (!user) {
      // Handle unauthenticated or non-existing user cases
      return json({}, { status: 401 }); // Or redirect to a login page
  }

  // Return user data to populate the form
  return json({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      bio: user.bio || '',
      gender: user.gender || '',
      birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '', // Format for date input
  });
};
export default function ContractDetails() {const actionData = useActionData();
  const loaderData = useLoaderData();
  const [date, setDate] = useState(new Date());


  // Hide calendar when clicking outside
  const [formData, setFormData] = useState({
    firstName: actionData?.fields?.name ||loaderData.firstName,

    lastName: actionData?.fields?.lastName ||loaderData.lastName,
    gender: actionData?.fields?.gender || loaderData.gender,
    birthday: actionData?.fields?.birthday || loaderData.birthday,
    bio: actionData?.fields?.bio || loaderData.bio
  });

  const handleInputChange = (event, field) => {
    let value = event.target.value;
    if (field === 'birthday') {
        // Ensure the date is in ISO format
        value = new Date(value).toISOString().split('T')[0];
    }
    setFormData(prev => ({ ...prev, [field]: value }));
};

  return (
    <div className="relative h-screen w-full lg:ps-64">
<div className="max-w-4xl px-4 py-10 sm:px-6 lg:px-8 mx-auto">
  <div className="bg-white rounded-xl shadow p-4 sm:p-7 dark:bg-neutral-800">
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-200">
        Profile
      </h2>
      <p className="text-sm text-gray-600 dark:text-neutral-400">
        Manage your name, password and account settings.
      </p>
    </div>

    <form method="POST"  >
      <div className="grid sm:grid-cols-12 gap-2 sm:gap-6">
        <div className="sm:col-span-3">
          <label className="inline-block text-sm text-gray-800 mt-2.5 dark:text-neutral-200">
            Profile photo
          </label>
        </div>

        <div className="sm:col-span-9">
          <div className="flex items-center gap-5">
            <img className="inline-block size-16 rounded-full ring-2 ring-white dark:ring-neutral-900" src="https://res.cloudinary.com/dug5cohaj/image/upload/v1715526626/dgoztmlvittkhvldpkpr.png" alt="Image Description"/>
            <div className="flex gap-x-2">
              <div>
                <button type="button" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800">
                  <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  Upload photo
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label className="inline-block text-sm text-gray-800 mt-2.5 dark:text-neutral-200">
            Full name
          </label>
          <div className="hs-tooltip inline-block">
            <button type="button" className="hs-tooltip-toggle ms-1">
              <svg className="inline-block size-3 text-gray-400 dark:text-neutral-600" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
              </svg>
            </button>
            <span className="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible w-40 text-center z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded shadow-sm dark:bg-neutral-700" role="tooltip">
              Displayed on public forums, such as Preline
            </span>
          </div>
        </div>

        <div className="sm:col-span-9">
          <div className="sm:flex">
            <input id="af-account-full-name" type="text" className="py-2 px-3 pe-11 block w-full border-gray-200 shadow-sm -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"  id="email" 
          name="firstName" 
          value={formData.firstName}
          onChange={e => handleInputChange(e, 'firstName')}   placeholder="Maria"/>
            <input type="text"    name="lastName" 
          value={formData.lastName}
          onChange={e => handleInputChange(e, 'lastName')} className="py-2 px-3 pe-11 block w-full border-gray-200 shadow-sm -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" placeholder="Boone"/>
            
          </div>
        </div>

       
      



        <div className="sm:col-span-3">
          <label  className="inline-block text-sm text-gray-800 mt-2.5 dark:text-neutral-200">
            Gender
          </label>
        </div>

        <div className="sm:col-span-9">
          <div className="sm:flex">
            <label className="flex py-2 px-3 w-full border border-gray-200 shadow-sm -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
              <input name="gender" onChange={e => handleInputChange(e, 'gender')}  value="hombre" checked={formData.gender === 'hombre'} type="radio" className="shrink-0 mt-0.5 border-gray-300 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-500 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800" id="af-account-gender-checkbox" />
              <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">Hombre</span>
            </label>

            <label  className="flex py-2 px-3 w-full border border-gray-200 shadow-sm -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
              <input type="radio" onChange={e => handleInputChange(e, 'gender')}  value="mujer" checked={formData.gender === 'mujer'}   name="gender" className="shrink-0 mt-0.5 border-gray-300 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-500 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800" id="af-account-gender-checkbox-female"/>
              <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">Mujer</span>
            </label>

            <label  className="flex py-2 px-3 w-full border border-gray-200 shadow-sm -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
              <input type="radio" onChange={e => handleInputChange(e, 'gender')} value="noBinario" checked={formData.gender === 'noBinario'}   name="gender" className="shrink-0 mt-0.5 border-gray-300 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-500 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800" id="af-account-gender-checkbox-other"/>
              <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">No Binario</span>
            </label>
          </div>

          </div>

          <div className="sm:col-span-3">
          <label className="inline-block text-sm text-gray-800 mt-2.5 dark:text-neutral-200">
            BIO
          </label>
        </div>

        <div className="sm:col-span-9">
          <textarea  name="bio" 
          value={formData.bio}
          onChange={e => handleInputChange(e, 'bio')}   id="bio" className="py-2 px-3 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" rows="6" placeholder="Type your message..."></textarea>
        </div>
      
        <div className="sm:col-span-3">
          <label className="inline-block text-sm text-gray-800 mt-2.5 dark:text-neutral-200">
            Fecha de Nacimiento
          </label>
        </div>

        <div className="sm:col-span-9">
        <input name="birthday"  value={formData.birthday}
          onChange={e => handleInputChange(e, 'birthday')} aria-label="Date" type="date" />

</div>
      </div>

      <div className="mt-5 flex justify-end gap-x-2">
     
        <button           type="submit"
 className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
          Save changes
        </button>
      </div>
    </form>
  </div>
</div>
    </div>
  );
}
