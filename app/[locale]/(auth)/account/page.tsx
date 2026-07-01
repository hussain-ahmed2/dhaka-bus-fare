import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile, updatePassword } from '../actions'
import { Link } from '@/i18n/routing'
import { ChevronLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

type Params = Promise<{ locale: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { message } = await searchParams
  const t = await getTranslations('Account')
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const displayName = user.user_metadata?.display_name || ''

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
      <div className="mb-8">
        <Link href="/my-trips" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('backToTrips')}
        </Link>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('desc')}</p>
      </div>

      {message && (
        <div className={`p-4 mb-8 rounded-md text-sm ${
          (message as string).includes('Updated') 
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
            : 'bg-destructive/10 text-destructive'
        }`}>
          {t(message as Parameters<typeof t>[0])}
        </div>
      )}

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{t('profileInfo')}</h2>
          <form action={updateProfile} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">{t('emailLabel')}</label>
              <input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="w-full p-2 rounded-md border bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">{t('emailHelp')}</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">{t('nameLabel')}</label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={displayName}
                required
                minLength={2}
                className="w-full p-2 rounded-md border bg-background text-foreground"
              />
            </div>

            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium">
              {t('updateProfile')}
            </button>
          </form>
        </div>

        {/* Security Section */}
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{t('security')}</h2>
          <form action={updatePassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">{t('newPassword')}</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full p-2 rounded-md border bg-background text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">{t('confirmNewPassword')}</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="w-full p-2 rounded-md border bg-background text-foreground"
              />
            </div>

            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium">
              {t('updatePassword')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
