import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signout } from '../(auth)/actions'
import SavedRouteCard from '@/components/saved-route-card'
import { Bookmark, Map, Settings } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'

type Params = Promise<{ locale: string }>

export default async function MyTripsPage({ params }: { params: Params }) {
  const { locale } = await params
  const t = await getTranslations('MyTrips')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch trips for this user
  const { data: trips } = await supabase
    .from('user_trips')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch saved routes for this user
  const { data: savedRoutes } = await supabase
    .from('saved_routes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <div className="flex items-center gap-4">
          <Link href="/account" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <Settings className="h-4 w-4" />
            {t('settings')}
          </Link>
          <form action={signout}>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
              {t('signOut')}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Saved Routes Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            {t('savedRoutes')}
          </h2>
          
          {savedRoutes && savedRoutes.length > 0 ? (
            <div className="space-y-4">
              {savedRoutes.map((saved) => (
                <SavedRouteCard 
                  key={saved.id} 
                  routeId={saved.route_id} 
                  routeType={saved.route_type as "bus" | "metro"} 
                  locale={locale} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed">
              <h3 className="text-sm font-medium text-foreground">{t('noSavedRoutes')}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('exploreRoutes')}
              </p>
            </div>
          )}
        </div>

        {/* Trip History Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            {t('trackedTrips')}
          </h2>
          
          {trips && trips.length > 0 ? (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="p-4 border rounded-lg bg-card shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-primary">
                  {new Date(trip.created_at).toLocaleDateString()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  trip.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {trip.status === 'completed' ? t('completed') : t('inProgress')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {trip.end_time 
                  ? t('tripTrackedFromTo', { start: new Date(trip.start_time).toLocaleTimeString(), end: new Date(trip.end_time).toLocaleTimeString() })
                  : t('tripTrackedFrom', { start: new Date(trip.start_time).toLocaleTimeString() })
                }
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <h3 className="text-lg font-medium text-foreground">{t('noTripsYet')}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('hopOnMetro')}
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
