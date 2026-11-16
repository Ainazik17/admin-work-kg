// Раздел «Сериал»: 1-я серия бесплатна, остальные — с любым тарифом.
// Первый активный сериал показывается баннером на главной Mini App.
import React, { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	IconButton,
	Paper,
	Switch,
	TextField,
	Typography,
} from '@mui/material'
import { Add, ArrowBack, DeleteOutline, EditOutlined, ImageOutlined, OpenInNew } from '@mui/icons-material'
import {
	Series,
	SeriesEpisode,
	UpsertEpisodeRequest,
	useAddEpisodeMutation,
	useCreateSeriesMutation,
	useDeleteEpisodeMutation,
	useDeleteSeriesMutation,
	useGetSeriesListQuery,
	useGetSeriesQuery,
	useUpdateEpisodeMutation,
	useUpdateSeriesMutation,
	useUploadEpisodeThumbnailMutation,
	useUploadSeriesCoverMutation,
} from '#entities/series/api/api'
import { toastUtils } from '#shared/lib/toster'
import { getErrorMessage } from '#shared/lib/error.helper'
import { keyPaths } from '#shared/consts/routing'

const YT = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/

const fmtDuration = (sec?: number | null) =>
	sec ? `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` : ''

const coverSx = { width: 160, aspectRatio: '16/9', objectFit: 'cover' as const, borderRadius: 2, bgcolor: '#e2e8f0', display: 'block' }

// ---------- Список ----------
export const SeriesList: React.FC = () => {
	const navigate = useNavigate()
	const { data = [], isLoading } = useGetSeriesListQuery()
	const [open, setOpen] = useState(false)

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
				<Box>
					<Typography variant='h5' sx={{ fontWeight: 800, color: '#1e293b' }}>
						Сериал
					</Typography>
					<Typography variant='body2' color='text.secondary'>
						1-я серия бесплатно, остальные — с любым тарифом. Первый активный сериал — баннер на главной Mini App
					</Typography>
				</Box>
				<Button variant='contained' startIcon={<Add />} sx={{ bgcolor: '#0f172a', borderRadius: 2 }} onClick={() => setOpen(true)}>
					Новый сериал
				</Button>
			</Box>

			{isLoading ? (
				<CircularProgress />
			) : !data.length ? (
				<Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>Сериалов пока нет</Paper>
			) : (
				data.map((s) => (
					<Paper
						key={s.id}
						onClick={() => navigate(keyPaths.seriesDetails(String(s.id)))}
						sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
					>
						<Box component='img' src={s.coverUrl || undefined} alt='' sx={{ ...coverSx, width: 140 }} />
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography sx={{ fontWeight: 700 }}>{s.title}</Typography>
							<Typography variant='body2' color='text.secondary'>
								{s.episodesCount} сер. · порядок {s.sortOrder ?? 0}
							</Typography>
						</Box>
						{s.isActive ? <Chip label='Показывается' color='success' size='small' /> : <Chip label='Скрыт' size='small' />}
					</Paper>
				))
			)}

			<SeriesDialog open={open} onClose={() => setOpen(false)} onCreated={(id) => navigate(keyPaths.seriesDetails(String(id)))} />
		</Box>
	)
}

// ---------- Создать / изменить сериал ----------
const SeriesDialog: React.FC<{
	open: boolean
	onClose: () => void
	series?: Series
	onCreated?: (id: number) => void
}> = ({ open, onClose, series, onCreated }) => {
	const [form, setForm] = useState({ title: '', description: '', sortOrder: 0, isActive: true })
	const [create, { isLoading: creating }] = useCreateSeriesMutation()
	const [update, { isLoading: updating }] = useUpdateSeriesMutation()

	const onEnter = () =>
		setForm({
			title: series?.title || '',
			description: series?.description || '',
			sortOrder: series?.sortOrder ?? 0,
			isActive: series?.isActive ?? true,
		})

	const save = async () => {
		if (!form.title.trim()) return toastUtils.error('Укажите название')
		try {
			if (series) {
				await update({ id: series.id, body: form }).unwrap()
				toastUtils.success('Сохранено')
			} else {
				const s = await create(form).unwrap()
				toastUtils.success('Сериал создан')
				onCreated?.(s.id)
			}
			onClose()
		} catch (e) {
			toastUtils.error(getErrorMessage(e))
		}
	}

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth='sm' TransitionProps={{ onEnter }}>
			<DialogTitle>{series ? 'Изменить сериал' : 'Новый сериал'}</DialogTitle>
			<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
				<TextField label='Название' required size='small' value={form.title} inputProps={{ maxLength: 255 }}
					onChange={(e) => setForm({ ...form, title: e.target.value })} />
				<TextField label='Описание' multiline minRows={3} size='small' value={form.description} inputProps={{ maxLength: 5000 }}
					onChange={(e) => setForm({ ...form, description: e.target.value })} />
				<TextField label='Порядок (меньше — выше)' type='number' size='small' value={form.sortOrder}
					onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })} />
				<FormControlLabel label='Показывать в Mini App'
					control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} />
			</DialogContent>
			<DialogActions>
				<Button color='inherit' onClick={onClose}>Отмена</Button>
				<Button variant='contained' sx={{ bgcolor: '#0f172a' }} disabled={creating || updating} onClick={save}>
					{series ? 'Сохранить' : 'Создать'}
				</Button>
			</DialogActions>
		</Dialog>
	)
}

// ---------- Серия ----------
const emptyEpisode = { number: '', title: '', videoUrl: '', description: '', durationMin: '', isFree: false, isPublished: true }

const EpisodeDialog: React.FC<{
	open: boolean
	onClose: () => void
	seriesId: number
	episode?: SeriesEpisode | null
}> = ({ open, onClose, seriesId, episode }) => {
	const [form, setForm] = useState(emptyEpisode)
	const [add, { isLoading: adding }] = useAddEpisodeMutation()
	const [update, { isLoading: updating }] = useUpdateEpisodeMutation()
	const set = (k: keyof typeof emptyEpisode, v: any) => setForm((p) => ({ ...p, [k]: v }))

	const onEnter = () =>
		setForm(
			episode
				? {
						number: String(episode.number),
						title: episode.title,
						videoUrl: episode.videoUrl || '',
						description: episode.description || '',
						durationMin: episode.durationSec ? String(+(episode.durationSec / 60).toFixed(1)) : '',
						isFree: episode.free && episode.number !== 1,
						isPublished: episode.isPublished !== false,
					}
				: emptyEpisode,
		)

	const urlError = form.videoUrl.trim() && !YT.test(form.videoUrl) ? 'Нужна ссылка на видео YouTube' : ''

	const save = async () => {
		if (!form.title.trim()) return toastUtils.error('Укажите название серии')
		if (!form.videoUrl.trim()) return toastUtils.error('Вставьте ссылку на YouTube')
		if (urlError) return toastUtils.error(urlError)
		const min = Number(form.durationMin)
		const body: UpsertEpisodeRequest = {
			number: form.number ? Number(form.number) : episode ? episode.number : null,
			title: form.title.trim(),
			description: form.description,
			videoUrl: form.videoUrl.trim(),
			durationSec: min > 0 ? Math.round(min * 60) : null,
			isFree: form.isFree,
			isPublished: form.isPublished,
		}
		try {
			if (episode) await update({ id: episode.id, body }).unwrap()
			else await add({ seriesId, body }).unwrap()
			toastUtils.success(episode ? 'Серия сохранена' : 'Серия добавлена')
			onClose()
		} catch (e) {
			toastUtils.error(getErrorMessage(e))
		}
	}

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth='sm' TransitionProps={{ onEnter }}>
			<DialogTitle>{episode ? `Изменить серию ${episode.number}` : 'Новая серия'}</DialogTitle>
			<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
				<Typography variant='body2' color='text.secondary'>
					На YouTube поставьте доступ «По ссылке» и не выключайте «Разрешить встраивание».
					Без тарифа ссылка на закрытые серии в Mini App не показывается.
				</Typography>
				<Box sx={{ display: 'flex', gap: 2 }}>
					<TextField label='Номер' type='number' size='small' placeholder='следующий' value={form.number}
						onChange={(e) => set('number', e.target.value)} sx={{ width: 140 }} />
					<TextField label='Длительность, мин' type='number' size='small' value={form.durationMin}
						onChange={(e) => set('durationMin', e.target.value)} fullWidth />
				</Box>
				<TextField label='Название' required size='small' value={form.title} inputProps={{ maxLength: 255 }}
					onChange={(e) => set('title', e.target.value)} />
				<TextField label='Ссылка на YouTube' required size='small' placeholder='https://youtu.be/…' value={form.videoUrl}
					error={!!urlError} helperText={urlError || ' '} onChange={(e) => set('videoUrl', e.target.value)} />
				<TextField label='Описание' multiline minRows={2} size='small' value={form.description} inputProps={{ maxLength: 5000 }}
					onChange={(e) => set('description', e.target.value)} />
				<FormControlLabel label='Бесплатная (1-я серия бесплатна всегда)'
					control={<Switch checked={form.isFree} onChange={(e) => set('isFree', e.target.checked)} />} />
				<FormControlLabel label='Опубликована'
					control={<Switch checked={form.isPublished} onChange={(e) => set('isPublished', e.target.checked)} />} />
			</DialogContent>
			<DialogActions>
				<Button color='inherit' onClick={onClose}>Отмена</Button>
				<Button variant='contained' sx={{ bgcolor: '#0f172a' }} disabled={adding || updating} onClick={save}>
					{episode ? 'Сохранить' : 'Добавить'}
				</Button>
			</DialogActions>
		</Dialog>
	)
}

// ---------- Сериал с сериями ----------
export const SeriesDetails: React.FC = () => {
	const navigate = useNavigate()
	const { id } = useParams()
	const seriesId = Number(id)
	const { data: s, isLoading, isError } = useGetSeriesQuery(seriesId)
	const [deleteSeries] = useDeleteSeriesMutation()
	const [deleteEpisode] = useDeleteEpisodeMutation()
	const [uploadCover, { isLoading: coverLoading }] = useUploadSeriesCoverMutation()
	const [uploadThumb] = useUploadEpisodeThumbnailMutation()
	const [editSeries, setEditSeries] = useState(false)
	const [epDialog, setEpDialog] = useState<{ open: boolean; episode?: SeriesEpisode | null }>({ open: false })
	const coverInput = useRef<HTMLInputElement>(null)
	const thumbInput = useRef<HTMLInputElement>(null)
	const thumbFor = useRef<number | null>(null)

	if (isLoading) return <CircularProgress />
	if (isError || !s) return <Typography>Сериал не найден</Typography>

	const onCover = async (file?: File) => {
		if (!file) return
		try {
			await uploadCover({ id: s.id, file }).unwrap()
			toastUtils.success('Обложка загружена')
		} catch (e) {
			toastUtils.error(getErrorMessage(e))
		}
	}
	const onThumb = async (file?: File) => {
		if (!file || !thumbFor.current) return
		try {
			await uploadThumb({ id: thumbFor.current, file }).unwrap()
			toastUtils.success('Превью загружено')
		} catch (e) {
			toastUtils.error(getErrorMessage(e))
		}
	}
	const removeSeries = async () => {
		if (!window.confirm(`Удалить сериал «${s.title}» со всеми сериями? Это нельзя отменить.`)) return
		try {
			await deleteSeries(s.id).unwrap()
			toastUtils.success('Сериал удалён')
			navigate(keyPaths.series())
		} catch (e) {
			toastUtils.error(getErrorMessage(e))
		}
	}
	const removeEpisode = async (e: SeriesEpisode) => {
		if (!window.confirm(`Удалить серию ${e.number} «${e.title}»?`)) return
		try {
			await deleteEpisode(e.id).unwrap()
			toastUtils.success('Серия удалена')
		} catch (err) {
			toastUtils.error(getErrorMessage(err))
		}
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Button startIcon={<ArrowBack />} color='inherit' sx={{ alignSelf: 'flex-start' }} onClick={() => navigate(keyPaths.series())}>
				Все сериалы
			</Button>

			<Paper sx={{ p: 3, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
				<Box>
					<Box component='img' src={s.coverUrl || undefined} alt='' sx={coverSx} />
					<Button size='small' startIcon={<ImageOutlined />} sx={{ mt: 1 }} disabled={coverLoading}
						onClick={() => coverInput.current?.click()}>
						Обложка
					</Button>
					<input ref={coverInput} type='file' accept='image/*' hidden
						onChange={(e) => { onCover(e.target.files?.[0]); e.target.value = '' }} />
				</Box>
				<Box sx={{ flex: 1, minWidth: 240 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Typography variant='h5' sx={{ fontWeight: 800, color: '#1e293b' }}>{s.title}</Typography>
						{s.isActive ? <Chip label='Показывается' color='success' size='small' /> : <Chip label='Скрыт' size='small' />}
					</Box>
					{s.description && (
						<Typography color='text.secondary' sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{s.description}</Typography>
					)}
					<Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
						Обложка 16:9. Без обложки на баннере будет превью 1-й серии с YouTube
					</Typography>
					<Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
						<Button variant='outlined' startIcon={<EditOutlined />} onClick={() => setEditSeries(true)}>Изменить</Button>
						<Button color='error' startIcon={<DeleteOutline />} onClick={removeSeries}>Удалить</Button>
					</Box>
				</Box>
			</Paper>

			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography variant='h6' sx={{ fontWeight: 700 }}>Серии · {s.episodes?.length || 0}</Typography>
				<Button variant='contained' startIcon={<Add />} sx={{ bgcolor: '#0f172a', borderRadius: 2 }}
					onClick={() => setEpDialog({ open: true, episode: null })}>
					Добавить серию
				</Button>
			</Box>

			{!s.episodes?.length ? (
				<Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>Серий пока нет — добавьте первую</Paper>
			) : (
				s.episodes.map((e) => (
					<Paper key={e.id} sx={{ p: 1.5, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
						<Box component='img' src={e.thumbnailUrl || undefined} alt='' sx={{ ...coverSx, width: 128 }} />
						<Box sx={{ flex: 1, minWidth: 200 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
								<Typography sx={{ fontWeight: 700 }}>{e.number}. {e.title}</Typography>
								{e.free ? <Chip label='Бесплатно' color='success' size='small' /> : <Chip label='С тарифом' color='error' size='small' variant='outlined' />}
								{e.isPublished === false && <Chip label='Черновик' size='small' />}
							</Box>
							<Typography variant='body2' color='text.secondary'>
								{fmtDuration(e.durationSec)}
								{e.durationSec && e.videoUrl ? ' · ' : ''}
								{e.videoUrl ? (
									<a href={e.videoUrl} target='_blank' rel='noopener noreferrer'>YouTube <OpenInNew sx={{ fontSize: 13, verticalAlign: 'middle' }} /></a>
								) : (
									<b style={{ color: '#b91c1c' }}>нет ссылки</b>
								)}
							</Typography>
						</Box>
						<Box>
							<IconButton title='Изменить' onClick={() => setEpDialog({ open: true, episode: e })}><EditOutlined /></IconButton>
							<IconButton title='Загрузить превью' onClick={() => { thumbFor.current = e.id; thumbInput.current?.click() }}><ImageOutlined /></IconButton>
							<IconButton title='Удалить' color='error' onClick={() => removeEpisode(e)}><DeleteOutline /></IconButton>
						</Box>
					</Paper>
				))
			)}
			<input ref={thumbInput} type='file' accept='image/*' hidden
				onChange={(e) => { onThumb(e.target.files?.[0]); e.target.value = '' }} />

			<SeriesDialog open={editSeries} onClose={() => setEditSeries(false)} series={s} />
			<EpisodeDialog open={epDialog.open} episode={epDialog.episode} seriesId={s.id}
				onClose={() => setEpDialog({ open: false })} />
		</Box>
	)
}
