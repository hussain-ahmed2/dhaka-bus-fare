'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getLocale } from 'next-intl/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.email('invalidEmail'),
  password: z.string().min(6, 'shortPassword'),
})

const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'shortName'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "passwordsMismatch",
  path: ["confirmPassword"],
})

const updateProfileSchema = z.object({
  name: z.string().min(2, 'shortName'),
})

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'shortPassword'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "passwordsMismatch",
  path: ["confirmPassword"],
})

export async function login(formData: FormData) {
  const locale = await getLocale()
  const result = loginSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    const errorMsg = result.error.issues.map(e => e.message).join(',')
    redirect(`/${locale}/login?message=${encodeURIComponent(errorMsg)}`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) {
    redirect(`/${locale}/login?message=authFailed`)
  }

  revalidatePath('/', 'layout')
  redirect(`/${locale}/my-trips`)
}

export async function signup(formData: FormData) {
  const locale = await getLocale()
  const result = signupSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    const errorMsg = result.error.issues.map(e => e.message).join(',')
    redirect(`/${locale}/login?tab=signup&message=${encodeURIComponent(errorMsg)}`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        display_name: result.data.name
      }
    }
  })

  if (error) {
    redirect(`/${locale}/login?tab=signup&message=createAccountFailed`)
  }

  revalidatePath('/', 'layout')
  redirect(`/${locale}/my-trips`)
}

export async function signout() {
  const locale = await getLocale()
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(`/${locale}/login`)
}

export async function updateProfile(formData: FormData) {
  const locale = await getLocale()
  const result = updateProfileSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    const errorMsg = result.error.issues.map(e => e.message).join(',')
    redirect(`/${locale}/account?message=${encodeURIComponent(errorMsg)}`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    data: { display_name: result.data.name }
  })

  if (error) {
    redirect(`/${locale}/account?message=updateProfileFailed`)
  }

  revalidatePath('/account')
  redirect(`/${locale}/account?message=profileUpdated`)
}

export async function updatePassword(formData: FormData) {
  const locale = await getLocale()
  const result = updatePasswordSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    const errorMsg = result.error.issues.map(e => e.message).join(',')
    redirect(`/${locale}/account?message=${encodeURIComponent(errorMsg)}`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: result.data.password
  })

  if (error) {
    redirect(`/${locale}/account?message=updatePasswordFailed`)
  }

  revalidatePath('/account')
  redirect(`/${locale}/account?message=passwordUpdated`)
}
