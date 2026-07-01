import { login, signup } from '../actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getTranslations } from 'next-intl/server'

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; tab?: string }>
}) {
  const { message, tab = 'login' } = await searchParams
  const t = await getTranslations('Auth')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/20 relative overflow-hidden">
      
      {/* Decorative Blobs */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute top-[20%] left-[20%] h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[20%] h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Tabs defaultValue={tab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">{t('signIn')}</TabsTrigger>
            <TabsTrigger value="signup">{t('signUp')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="animate-in fade-in-50 zoom-in-95 duration-300">
            <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-background/95">
              <CardHeader className="space-y-2 text-center pb-6">
                <CardTitle className="text-2xl font-bold tracking-tight">{t('welcomeBack')}</CardTitle>
                <CardDescription>
                  {t('welcomeDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-login">{t('email')}</Label>
                      <Input
                        id="email-login"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder={t('emailPlaceholder')}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password-login">{t('password')}</Label>
                      </div>
                      <Input
                        id="password-login"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        placeholder={t('passwordPlaceholder')}
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  {message && (
                    <div className="p-3 bg-destructive/10 text-destructive text-center rounded-md text-sm font-medium animate-in fade-in slide-in-from-top-2">
                      {t(message as Parameters<typeof t>[0])}
                    </div>
                  )}

                  <Button formAction={login} className="w-full font-bold">
                    {t('signIn')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup" className="animate-in fade-in-50 zoom-in-95 duration-300">
            <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-background/95">
              <CardHeader className="space-y-2 text-center pb-6">
                <CardTitle className="text-2xl font-bold tracking-tight">{t('createAccount')}</CardTitle>
                <CardDescription>
                  {t('createDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name-signup">{t('fullName')}</Label>
                      <Input
                        id="name-signup"
                        name="name"
                        type="text"
                        required
                        placeholder={t('namePlaceholder')}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-signup">{t('email')}</Label>
                      <Input
                        id="email-signup"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder={t('emailPlaceholder')}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup">{t('password')}</Label>
                      <Input
                        id="password-signup"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        placeholder={t('passwordSignupPlaceholder')}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        placeholder={t('confirmPlaceholder')}
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  {message && (
                    <div className="p-3 bg-destructive/10 text-destructive text-center rounded-md text-sm font-medium animate-in fade-in slide-in-from-top-2">
                      {t(message as Parameters<typeof t>[0])}
                    </div>
                  )}

                  <Button formAction={signup} className="w-full font-bold">
                    {t('createAccountBtn')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
