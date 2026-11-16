// Рассылка пользователям бота: текст, кнопка (ссылка или раздел Mini App), аудитория,
// тест себе и отправка в фоне с прогрессом.
import React, { useEffect, useMemo, useState } from 'react'
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	LinearProgress,
	MenuItem,
	Paper,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from '@mui/material'
import { Send, Science } from '@mui/icons-material'
import {
	BroadcastAudience,
	BroadcastJob,
	BroadcastRequest,
	useCancelBroadcastMutation,
	useGetBroadcastJobsQuery,
	useGetBroadcastRecipientsQuery,
	useSendBroadcastMutation,
	useTestBroadcastMutation,
} from '#entities/broadcast/api/api'
import { toastUtils } from '#shared/lib/toster'
import { getErrorMessage } from '#shared/lib/error.helper'

const TEST_ID_KEY = 'wk-broadcast-test-telegram-id'

// Куда ведёт кнопка: ссылка или экран Mini App (?open=…)
const BUTTON_TARGETS = [
	{ value: '', label: 'Без кнопки' },
	{ value: 'url', label: 'Ссылка (https://…)' },
	{ value: 'series', label: 'Mini App · Сериал' },
	{ value: 'pro', label: 'Mini App · Тарифы PRO' },
	{ value: 'saved', label: 'Mini App · Сохранённые' },
	{ value: 'myapps', label: 'Mini App · Мои отклики' },
	{ value: 'deals', label: 'Mini App · Сделки' },
	{ value: 'notify', label: 'Mini App · Настройки уведомлений' },
	{ value: 'home', label: 'Mini App · Главная' },
]

const AUDIENCE_LABEL: Record<BroadcastAudience, string> = {
	ALL: 'Всем',
	PRO: 'С тарифом',
	FREE: 'Без тарифа',
}

const STATUS_LABEL: Record<BroadcastJob['status'], string> = {
	RUNNING: 'Идёт',
	DONE: 'Готово',
	CANCELLED: 'Остановлена',
}

const empty = {
	emoji: '',
	title: '',
	subtitle: '',
	message: '',
	footer: '',
	buttonText: '',
	target: '',
	buttonUrl: '',
}

const safeGet = (k: string) => {
	try {
		return localStorage.getItem(k) || ''
	} catch {
		return ''
	}
}

export const BroadcastPage: React.FC = () => {
	const [form, setForm] = useState(empty)
	const [audience, setAudience] = useState<BroadcastAudience>('ALL')
	const [testId, setTestId] = useState(() => safeGet(TEST_ID_KEY))
	const set = (k: keyof typeof empty, v: string) => setForm((p) => ({ ...p, [k]: v }))

	const { data: recipients, isFetching: countLoading } = useGetBroadcastRecipientsQuery(audience)
	const { data: jobs = [] } = useGetBroadcastJobsQuery()
	const running = jobs.find((j) => j.status === 'RUNNING')
	// Пока идёт рассылка — обновляем прогресс каждые 2 с
	const { refetch } = useGetBroadcastJobsQuery(undefined, { pollingInterval: running ? 2000 : 0 })
	useEffect(() => {
		if (running) refetch()
	}, [running?.id])

	const [send, { isLoading: sending }] = useSendBroadcastMutation()
	const [test, { isLoading: testing }] = useTestBroadcastMutation()
	const [cancel] = useCancelBroadcastMutation()

	const body = useMemo<BroadcastRequest>(() => {
		const isUrl = form.target === 'url'
		const hasButton = !!form.target
		return {
			emoji: form.emoji.trim() || undefined,
			title: form.title.trim() || undefined,
			subtitle: form.subtitle.trim() || undefined,
			message: form.message.trim() || undefined,
			footer: form.footer.trim() || undefined,
			buttonText: hasButton ? form.buttonText.trim() : undefined,
			buttonUrl: isUrl ? form.buttonUrl.trim() : undefined,
			buttonOpen: hasButton && !isUrl ? form.target : undefined,
			audience,
		}
	}, [form, audience])

	const validate = () => {
		if (!body.title && !body.message) return 'Напишите заголовок или текст'
		if (form.target && !form.buttonText.trim()) return 'Укажите текст кнопки'
		if (form.target === 'url' && !/^https:\/\/\S+$/.test(form.buttonUrl.trim()))
			return 'Ссылка кнопки должна начинаться с https://'
		return ''
	}

	const onTest = async () => {
		const err = validate()
		if (err) return toastUtils.error(err)
		const id = Number(testId)
		if (!id) return toastUtils.error('Укажите свой Telegram ID')
		try {
			localStorage.setItem(TEST_ID_KEY, String(id))
		} catch {
			/* ignore */
		}
		try {
			const r = await test({ telegramId: id, body }).unwrap()
			r.sent
				? toastUtils.success('Тест отправлен — проверьте бота')
				: toastUtils.error('Не доставлено: этот ID не писал боту или заблокировал его')
		} catch (e) {
			toastUtils.error(getErrorMessage(e))
		}
	}

	const onSend = async () => {
		const err = validate()
		if (err) return toastUtils.error(err)
		const count = recipients?.count ?? 0
		if (!window.confirm(`Отправить рассылку «${AUDIENCE_LABEL[audience]}» — ${count} чел.? Отменить отправленное нельзя.`))
			return
		try {
			await send(body).unwrap()
			toastUtils.success('Рассылка запущена')
			setForm(empty)
		} catch (e) {
			toastUtils.error(getErrorMessage(e))
		}
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<Box>
				<Typography variant='h5' sx={{ fontWeight: 800, color: '#1e293b' }}>
					Рассылка
				</Typography>
				<Typography variant='body2' color='text.secondary'>
					Сообщение от бота пользователям Work KG. Сначала отправьте тест себе.
				</Typography>
			</Box>

			{running && (
				<Paper sx={{ p: 2 }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
						<Typography sx={{ fontWeight: 600 }}>
							Идёт рассылка «{running.title}»: {running.sent + running.failed} из {running.total}
						</Typography>
						<Button color='error' size='small' onClick={() => cancel(running.id)}>
							Остановить
						</Button>
					</Box>
					<LinearProgress
						variant='determinate'
						sx={{ mt: 1.5, height: 8, borderRadius: 4 }}
						value={running.total ? ((running.sent + running.failed) / running.total) * 100 : 0}
					/>
				</Paper>
			)}

			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 340px' }, gap: 3, alignItems: 'start' }}>
				<Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
					<Box sx={{ display: 'flex', gap: 2 }}>
						<TextField label='Эмодзи' size='small' sx={{ width: 100 }} value={form.emoji}
							inputProps={{ maxLength: 16 }} onChange={(e) => set('emoji', e.target.value)} />
						<TextField label='Заголовок' size='small' fullWidth value={form.title}
							inputProps={{ maxLength: 200 }} onChange={(e) => set('title', e.target.value)} />
					</Box>
					<TextField label='Подзаголовок' size='small' value={form.subtitle}
						inputProps={{ maxLength: 300 }} onChange={(e) => set('subtitle', e.target.value)} />
					<TextField label='Текст' multiline minRows={5} size='small' value={form.message}
						inputProps={{ maxLength: 3500 }} helperText={`${form.message.length} / 3500`}
						onChange={(e) => set('message', e.target.value)} />
					<TextField label='Подпись внизу' size='small' value={form.footer}
						inputProps={{ maxLength: 300 }} onChange={(e) => set('footer', e.target.value)} />

					<TextField select label='Кнопка' size='small' value={form.target} onChange={(e) => set('target', e.target.value)}>
						{BUTTON_TARGETS.map((t) => (
							<MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
						))}
					</TextField>
					{form.target && (
						<TextField label='Текст кнопки' size='small' placeholder='Смотреть сериал' value={form.buttonText}
							inputProps={{ maxLength: 64 }} onChange={(e) => set('buttonText', e.target.value)} />
					)}
					{form.target === 'url' && (
						<TextField label='Ссылка' size='small' placeholder='https://…' value={form.buttonUrl}
							onChange={(e) => set('buttonUrl', e.target.value)} />
					)}

					<Box>
						<Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>Кому</Typography>
						<ToggleButtonGroup exclusive size='small' value={audience}
							onChange={(_, v) => v && setAudience(v)}>
							{(Object.keys(AUDIENCE_LABEL) as BroadcastAudience[]).map((a) => (
								<ToggleButton key={a} value={a} sx={{ px: 2 }}>{AUDIENCE_LABEL[a]}</ToggleButton>
							))}
						</ToggleButtonGroup>
						<Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
							Получат: {countLoading ? '…' : `${recipients?.count ?? 0} чел.`}
						</Typography>
					</Box>

					<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mt: 1 }}>
						<TextField label='Ваш Telegram ID (для теста)' size='small' value={testId}
							onChange={(e) => setTestId(e.target.value.replace(/\D/g, ''))} sx={{ width: 240 }} />
						<Button variant='outlined' startIcon={testing ? <CircularProgress size={16} /> : <Science />}
							disabled={testing} onClick={onTest}>
							Тест себе
						</Button>
						<Box sx={{ flex: 1 }} />
						<Button variant='contained' startIcon={<Send />} sx={{ bgcolor: '#0f172a' }}
							disabled={sending || !!running} onClick={onSend}>
							Отправить {recipients ? `· ${recipients.count}` : ''}
						</Button>
					</Box>
					{running && <Alert severity='info'>Новую рассылку можно запустить, когда закончится текущая</Alert>}
				</Paper>

				<Box sx={{ position: { md: 'sticky' }, top: 16 }}>
					<Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>Как увидят в Telegram</Typography>
					<Preview form={form} />
				</Box>
			</Box>

			<Box>
				<Typography variant='h6' sx={{ fontWeight: 700, mb: 1.5 }}>Последние рассылки</Typography>
				{!jobs.length ? (
					<Typography color='text.secondary'>Рассылок с последнего перезапуска сервера не было</Typography>
				) : (
					jobs.map((j) => (
						<Paper key={j.id} sx={{ p: 2, mb: 1, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
							<Box sx={{ flex: 1, minWidth: 200 }}>
								<Typography sx={{ fontWeight: 600 }}>{j.title}</Typography>
								<Typography variant='body2' color='text.secondary'>
									{new Date(j.startedAt).toLocaleString('ru-RU')}
									{j.startedBy ? ` · ${j.startedBy}` : ''}
								</Typography>
							</Box>
							<Typography variant='body2'>
								✅ {j.sent} · ❌ {j.failed} · всего {j.total}
							</Typography>
							<Chip size='small' label={STATUS_LABEL[j.status]}
								color={j.status === 'DONE' ? 'success' : j.status === 'RUNNING' ? 'info' : 'default'} />
						</Paper>
					))
				)}
			</Box>
		</Box>
	)
}

// Превью сообщения в стиле Telegram
const Preview: React.FC<{ form: typeof empty }> = ({ form }) => {
	const hasText = form.title || form.message || form.subtitle || form.emoji
	return (
		<Box sx={{ bgcolor: '#c9d9e8', borderRadius: 3, p: 2 }}>
			<Box sx={{ bgcolor: '#fff', borderRadius: '14px 14px 14px 4px', p: 1.5, fontSize: 14.5, lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
				{!hasText ? (
					<span style={{ color: '#94a3b8' }}>Здесь будет сообщение</span>
				) : (
					<>
						{form.emoji && <div>{form.emoji}</div>}
						{form.title && <div style={{ fontWeight: 700 }}>{form.title}</div>}
						{form.subtitle && <div style={{ fontStyle: 'italic' }}>{form.subtitle}</div>}
						{form.message && <div style={{ marginTop: form.title || form.subtitle ? 12 : 0 }}>{form.message}</div>}
						{form.footer && (
							<div style={{ marginTop: 12, fontStyle: 'italic', color: '#475569' }}>
								─────────────────{'\n'}{form.footer}
							</div>
						)}
					</>
				)}
			</Box>
			{form.target && (
				<Box sx={{ mt: 0.5, bgcolor: 'rgba(255,255,255,.6)', borderRadius: 2, py: 1, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#2563eb' }}>
					{form.buttonText || 'Текст кнопки'}
				</Box>
			)}
		</Box>
	)
}
