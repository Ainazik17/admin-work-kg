// Рассылка пользователям бота (бэкенд: /api/admin/broadcast)
import { workBaseApi as api } from '../../../shared/api/workBaseApi'

export type BroadcastAudience = 'ALL' | 'PRO' | 'FREE'

export type BroadcastRequest = {
	emoji?: string
	title?: string
	subtitle?: string
	message?: string
	buttonText?: string
	buttonUrl?: string
	/** экран Mini App: series, pro, saved, notify … */
	buttonOpen?: string
	footer?: string
	audience: BroadcastAudience
}

export type BroadcastJob = {
	id: string
	title: string
	status: 'RUNNING' | 'DONE' | 'CANCELLED'
	total: number
	sent: number
	failed: number
	startedBy?: string | null
	startedAt: string
	finishedAt?: string | null
}

const injectedRtkApi = api
	.enhanceEndpoints({ addTagTypes: ['Broadcast'] })
	.injectEndpoints({
		endpoints: (build) => ({
			getBroadcastRecipients: build.query<{ audience: BroadcastAudience; count: number }, BroadcastAudience>({
				query: (audience) => ({ url: `/api/admin/broadcast/recipients`, params: { audience } }),
			}),
			getBroadcastJobs: build.query<BroadcastJob[], void>({
				query: () => ({ url: `/api/admin/broadcast/jobs` }),
				providesTags: ['Broadcast'],
			}),
			sendBroadcast: build.mutation<BroadcastJob, BroadcastRequest>({
				query: (body) => ({ url: `/api/admin/broadcast/send`, method: 'POST', body }),
				invalidatesTags: ['Broadcast'],
			}),
			testBroadcast: build.mutation<{ sent: boolean }, { telegramId: number; body: BroadcastRequest }>({
				query: ({ telegramId, body }) => ({
					url: `/api/admin/broadcast/test`,
					method: 'POST',
					params: { telegramId },
					body,
				}),
			}),
			cancelBroadcast: build.mutation<{ cancelled: boolean }, string>({
				query: (id) => ({ url: `/api/admin/broadcast/jobs/${id}/cancel`, method: 'POST' }),
				invalidatesTags: ['Broadcast'],
			}),
		}),
		overrideExisting: false,
	})

export { injectedRtkApi as broadcastApi }

export const {
	useGetBroadcastRecipientsQuery,
	useGetBroadcastJobsQuery,
	useSendBroadcastMutation,
	useTestBroadcastMutation,
	useCancelBroadcastMutation,
} = injectedRtkApi
