"use client";
/* eslint-disable @next/next/no-img-element */
import { Alert } from "antd";
import { loginAction } from "@/features/auth/actions/auth-actions";
import useFormData from "@/lib/Hooks/useFormData";
import InputField from "@/components/ui/InputField";
import Link from "next/link";

export default function LoginPage() {
  const { actionState, formAction, isPending, formData, handleChange, errors, handleAddError } = useFormData(
    loginAction,
    undefined,
    { email: "", password: "" }
  );

  return (
    <div>
      <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
        <div className="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 lg:flex-row lg:gap-6 xl:gap-0">
          <div className="relative hidden w-full items-center justify-center bg-primary p-5 lg:inline-flex lg:max-w-[835px] xl:-ms-28 ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]">
            <div className="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent ltr:-right-10 ltr:bg-gradient-to-r rtl:-left-10 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-20 rtl:xl:-left-20"></div>
            <div className="ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
              {/* <Link href="/" className="w-32 block lg:w-56 mx-auto mt-5">
                <img src="/logoLight.svg" alt="Logo" className="w-full" />
              </Link> */}
              <div className="mt-6 hidden w-full max-w-[430px] lg:block">
                <img src="/assets/images/auth/login.svg" alt="Cover Image" className="w-full" />
              </div>
            </div>
          </div>
          <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-6 pt-6 sm:px-6 lg:max-w-[667px]">
            <div className="flex w-full max-w-[440px] items-center gap-2 lg:absolute lg:end-6 lg:top-6 lg:max-w-full">
              {/* <Link href="/" className="w-16 block lg:hidden">
                <img src="/logo.svg" alt="Logo" className="mx-auto rounded-full w-full" />
              </Link> */}
            </div>
            <div className="w-full max-w-[440px] lg:mt-5">
              <div className="mb-10">
                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign in</h1>
                <p className="text-base font-bold leading-normal text-white-dark mt-1">Enter your email and password to login</p>
              </div>

              {actionState?.error && (
                <Alert
                  message={actionState.error}
                  type="error"
                  showIcon
                  className="mb-6 rounded-lg"
                />
              )}

              <form action={formAction} className="space-y-5 dark:text-white">
                <div className='flex flex-col gap-4'>
                  <InputField
                    id='email'
                    label='Email'
                    type='email'
                    value={formData.email}
                    onChange={handleChange("email")}
                    handleAddError={handleAddError}
                    formErrors={errors}
                    unstyled={true}
                    withFieldset={true}
                    validate={true}
                    required
                  />
                  <InputField
                    id='password'
                    type='password'
                    label='Password'
                    value={formData.password}
                    onChange={handleChange("password")}
                    handleAddError={handleAddError}
                    formErrors={errors}
                    unstyled={true}
                    withFieldset={true}
                    validate={true}
                    required
                    conditions={{
                      password: {
                        min: 8,
                        requireUppercase: false,
                        requireSpecial: false
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="flex cursor-pointer items-center">
                    <input type="checkbox" className="form-checkbox bg-white dark:bg-black w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-white-dark ml-2">Remember Me</span>
                  </label>
                </div>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="btn btn-gradient !mt-6 w-full py-3 font-semibold bg-primary text-white rounded-md border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)] hover:opacity-90 transition-opacity disabled:opacity-50"
                  // style={{ background: 'linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)' }}
                >
                  {isPending ? "Signing in ...." : "Sign in"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
