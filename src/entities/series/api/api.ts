// Раздел «Сериал» (бэкенд: /api/admin/series). Видео — ссылки YouTube.
import { workBaseApi as api } from '../../../shared/api/workBaseApi'

export type SeriesEpisode = {
	id: number
	number: number
	title: string
	description?: string | null
	thumbnailUrl?: string | null
	durationSec?: number | null
	free: boolean
	locked: boolean
	videoUrl?: string | null
	youtubeId?: string | null
	isPublished?: boolean
}

export type Series = {
	id: number
	title: string
	description?: string | null
	coverUrl?: string | null
	episodesCount: number
	isActive?: boolean
	sortOrder?: number
	episodes?: SeriesEpisode[] | null
}

export type UpsertSeriesRequest = {
	title: string
	description?: string
	coverUrl?: string
	sortOrder?: number
	isActive?: boolean
}

export type UpsertEpisodeRequest = {
	number?: number | null
	title: string
	description?: string
	videoUrl?: string
	thumbnailUrl?: string
	durationSec?: number | null
	isFree?: boolean
	isPublished?: boolean
}

const fileBody = (file: File) => {
	const fd = new FormData()
	fd.append('file', file)
	return fd
}

const injectedRtkApi = api
	.enhanceEndpoints({ addTagTypes: ['Series'] })
	.injectEndpoints({
		endpoints: (build) => ({
			getSeriesList: build.query<Series[], void>({
				query: () => ({ url: `/api/admin/series` }),
				providesTags: ['Series'],
			}),
			getSeries: build.query<Series, number>({
				query: (id) => ({ url: `/api/admin/series/${id}` }),
				providesTags: ['Series'],
			}),
			createSeries: build.mutation<Series, UpsertSeriesRequest>({
				query: (body) => ({ url: `/api/admin/series`, method: 'POST', body }),
				invalidatesTags: ['Series'],
			}),
			updateSeries: build.mutation<Series, { id: number; body: UpsertSeriesRequest }>({
				query: ({ id, body }) => ({ url: `/api/admin/series/${id}`, method: 'PUT', body }),
				invalidatesTags: ['Series'],
			}),
			deleteSeries: build.mutation<void, number>({
				query: (id) => ({ url: `/api/admin/series/${id}`, method: 'DELETE' }),
				invalidatesTags: ['Series'],
			}),
			uploadSeriesCover: build.mutation<Series, { id: number; file: File }>({
				query: ({ id, file }) => ({ url: `/api/admin/series/${id}/cover`, method: 'POST', body: fileBody(file) }),
				invalidatesTags: ['Series'],
			}),
			addEpisode: build.mutation<SeriesEpisode, { seriesId: number; body: UpsertEpisodeRequest }>({
				query: ({ seriesId, body }) => ({ url: `/api/admin/series/${seriesId}/episodes`, method: 'POST', body }),
				invalidatesTags: ['Series'],
			}),
			updateEpisode: build.mutation<SeriesEpisode, { id: number; body: UpsertEpisodeRequest }>({
				query: ({ id, body }) => ({ url: `/api/admin/series/episodes/${id}`, method: 'PUT', body }),
				invalidatesTags: ['Series'],
			}),
			deleteEpisode: build.mutation<void, number>({
				query: (id) => ({ url: `/api/admin/series/episodes/${id}`, method: 'DELETE' }),
				invalidatesTags: ['Series'],
			}),
			uploadEpisodeThumbnail: build.mutation<SeriesEpisode, { id: number; file: File }>({
				query: ({ id, file }) => ({
					url: `/api/admin/series/episodes/${id}/thumbnail`,
					method: 'POST',
					body: fileBody(file),
				}),
				invalidatesTags: ['Series'],
			}),
		}),
		overrideExisting: false,
	})

export { injectedRtkApi as seriesApi }

export const {
	useGetSeriesListQuery,
	useGetSeriesQuery,
	useCreateSeriesMutation,
	useUpdateSeriesMutation,
	useDeleteSeriesMutation,
	useUploadSeriesCoverMutation,
	useAddEpisodeMutation,
	useUpdateEpisodeMutation,
	useDeleteEpisodeMutation,
	useUploadEpisodeThumbnailMutation,
} = injectedRtkApi
