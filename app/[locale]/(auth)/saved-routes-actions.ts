'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const saveRouteSchema = z.object({
  routeId: z.string().min(1),
  routeType: z.enum(['bus', 'metro']),
})

export async function toggleSavedRoute(formData: FormData) {
  const result = saveRouteSchema.safeParse({
    routeId: formData.get('routeId'),
    routeType: formData.get('routeType'),
  })

  if (!result.success) {
    return { error: 'Invalid route data' }
  }

  const { routeId, routeType } = result.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if it's already saved
  const { data: existing } = await supabase
    .from('saved_routes')
    .select('id')
    .eq('user_id', user.id)
    .eq('route_id', routeId)
    .eq('route_type', routeType)
    .single()

  if (existing) {
    // Unsave
    const { error } = await supabase
      .from('saved_routes')
      .delete()
      .eq('id', existing.id)

    if (error) return { error: 'Failed to unsave route' }
  } else {
    // Save
    const { error } = await supabase
      .from('saved_routes')
      .insert({
        user_id: user.id,
        route_id: routeId,
        route_type: routeType,
      })

    if (error) return { error: 'Failed to save route' }
  }

  revalidatePath('/my-trips')
  revalidatePath(`/routes/${routeId}`)
  
  return { success: true }
}
