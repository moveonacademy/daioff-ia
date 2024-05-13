// login.tsx
import { useState, useEffect, useRef } from 'react'
import { validateEmail, validateName, validatePassword } from '~/utils/validators.server'
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node'
import { Link, useActionData, useLoaderData } from '@remix-run/react'

import { Input } from '~/components/Input'
import { Label } from '~/components/Label'
import { cn } from '~/utils/cn'
import { login } from '~/utils/queries'
import { setAuthOnResponse } from '~/utils/auth'


export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const email = form.get("email");
    const password = form.get("password");
    console.log("asdasdasd"+email)

    // If not all data was passed, error
    if ( 
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return json({ error: `Invalid Form Data`, form: "login" }, { status: 400 });
    }


    // Validate email & password
    const errors = {
        email: validateEmail(email),
        password: validatePassword(password),
     
    };

    //  If there were any errors, return them
    if (Object.values(errors).some(Boolean))
        return json({ errors, fields: { email, password }, form: "login" }, { status: 400 });

    
   
            let userId = await login(email, password)



            if (userId === false) {
              return json(
                { ok: false, errors: { password: "Invalid credentials" } },
                400,
              );
            }
          
            let response = redirect("/dashboard/bubbles");
            return setAuthOnResponse(response, userId.toString());
              
            
    
  
}

export default function Login() {
    const actionData = useActionData()
    const firstLoad = useRef(true)
    let actionResult = useActionData<typeof action>();
    const user = useLoaderData<typeof loader>();

    const [errors, setErrors] = useState(actionData?.errors || {})
    const [formData, setFormData] = useState({
      email: actionData?.fields?.email || '',
      password: actionData?.fields?.password || '',
  })
console.log(actionData)

    // Updates the form data when an input changes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
      console.log("event.target.value "+event.target.value )
        setFormData(form => ({ ...form, [field]: event.target.value }))
    }

    useEffect(() => {
        // We don't want to reset errors on page load because we want to see them
        firstLoad.current = false
    }, [])
    return (
        
            <div className="h-[100vh]  justify-center items-center flex flex-col gap-y-4">
                <div className="max-w-md mt-10 w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Ingresa a DAIOFF
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Completa todos los campos.
      </p>
 
      <form method="POST"  className="my-8" >

        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
        
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          
          <Input id="email" 
          name="email" 
          value={formData.email}
          onChange={e => handleInputChange(e, 'email')} 
          aria-describedby={
            actionResult?.errors?.email ? "email-error" : "login-header"
          }
                      placeholder="projectmayhem@fc.com" type="email" />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
         
          <Input id="password"       required          aria-describedby="password-error"
 name="password"  value={formData.password}
                        onChange={e => handleInputChange(e, 'password')} placeholder="••••••••" type="password" />
        </LabelInputContainer>
        {actionResult?.errors?.email && (
                  <span id="email-error" className="text-brand-red">
                    {actionResult.errors.email}
                  </span>
                )}
                    {actionResult?.errors?.password && (
                  <span id="password-error" className="text-brand-red">
                    {actionResult.errors.password}
                  </span>
                )}
        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          Log In&rarr;
          <BottomGradient />
        </button>
        <Link to={'/register'}>
        <Label  htmlFor="password">No tienes una cuenta?</Label>
        </Link>
        
      </form>
    </div>
            </div>
    )
}

const BottomGradient = () => {
    return (
      <>
        <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      </>
    );
  };
   
  const LabelInputContainer = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <div className={cn("flex flex-col space-y-2 w-full", className)}>
        {children}
      </div>
    );
  };