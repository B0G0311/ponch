import {toast} from 'sonner'

import {trpcClient} from '@/trpc/trpc'

export function trackAppOpen(appId: string) {
	trpcClient.user.apps.trackAppOpen.mutate({appId})
	toast(`${appId} opened`)
}