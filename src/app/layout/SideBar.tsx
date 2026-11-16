import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
	Box,
	Drawer,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
	Divider,
	Button,
	styled,
	useMediaQuery,
	useTheme,
} from '@mui/material'
import {
	DashboardOutlined,
	DescriptionOutlined,
	WorkOutline,
	GroupOutlined,
	CardMembershipOutlined,
	ChatBubbleOutline,
	AccountBalanceWalletOutlined,
	ShareOutlined,
	PaymentOutlined,
	SettingsOutlined,
	LogoutOutlined,
	Category,
	MovieOutlined,
	CampaignOutlined,
} from '@mui/icons-material'
import { keyPaths } from '#shared/consts/routing.ts'

const DRAWER_WIDTH = 280

const getMenuItems = () => [
	{
		text: 'Дашборд',
		path: keyPaths.dashboard(),
		icon: <DashboardOutlined />,
	},
	{
		text: 'Анкеты',
		path: keyPaths.questionnaires(),
		icon: <DescriptionOutlined />,
	},
	{ text: 'Вакансии', path: keyPaths.vacancies(), icon: <WorkOutline /> },
	{ text: 'Пользователи', path: keyPaths.users(), icon: <GroupOutlined /> },
	{
		text: 'Подписки',
		path: keyPaths.subscriptions(),
		icon: <CardMembershipOutlined />,
	},
	{
		text: 'Обратная связь',
		path: keyPaths.feedback(),
		icon: <ChatBubbleOutline />,
	},
	{
		text: 'Баллы',
		path: keyPaths.points(),
		icon: <AccountBalanceWalletOutlined />,
	},
	{
		text: 'Соц. сети',
		path: keyPaths.socialNetworks(),
		icon: <ShareOutlined />,
	},
	{ text: 'Сериал', path: keyPaths.series(), icon: <MovieOutlined /> },
	{ text: 'Рассылка', path: keyPaths.broadcast(), icon: <CampaignOutlined /> },
	{ text: 'Выплаты', path: keyPaths.payouts(), icon: <PaymentOutlined /> },
	{ text: 'Категории', path: keyPaths.categories(), icon: <Category /> },
]

const Logo = styled(Box)(() => ({
	padding: '32px 24px',
	display: 'flex',
	alignItems: 'center',
	gap: '12px',
	cursor: 'pointer',
}))

const NavItem = styled(ListItemButton)<{ to: string }>(() => ({
	borderRadius: '12px',
	marginBottom: '4px',
	color: '#64748b',
	'&.active': {
		backgroundColor: '#eff6ff',
		color: '#2563eb',
		'& .MuiListItemIcon-root': {
			color: '#2563eb',
		},
	},
}))

interface SideBarProps {
	mobileOpen: boolean
	onDrawerToggle: () => void
}

export const SideBar: React.FC<SideBarProps> = ({
	mobileOpen,
	onDrawerToggle,
}) => {
	const navigate = useNavigate()
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('md'))
	const menuItems = getMenuItems()

	// Закрываем drawer при навигации только на мобайле
	const handleNavClick = () => {
		if (isMobile) onDrawerToggle()
	}

	const drawerContent = (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
			<Logo
				onClick={() => {
					navigate(keyPaths.dashboard())
					handleNavClick()
				}}
			>
				<Box
					sx={{
						bgcolor: '#2563eb',
						p: 1,
						borderRadius: 2,
						display: 'flex',
					}}
				>
					<Typography
						sx={{
							color: '#fff',
							fontWeight: 900,
							fontSize: 20,
							lineHeight: 1,
						}}
					>
						W
					</Typography>
				</Box>
				<Typography
					variant='h5'
					sx={{ fontWeight: 800, color: '#1e293b' }}
				>
					WORK<span style={{ color: '#f97316' }}>KG</span>
				</Typography>
			</Logo>

			<List sx={{ px: 2, flexGrow: 1 }}>
				{menuItems.map((item) => (
					<NavItem
						key={item.path}
						LinkComponent={NavLink}
						to={item.path}
						onClick={handleNavClick}
					>
						<ListItemIcon sx={{ minWidth: 40 }}>
							{item.icon}
						</ListItemIcon>
						<ListItemText primary={item.text} />
					</NavItem>
				))}
			</List>

			<Box sx={{ p: 2, pb: 4 }}>
				<Divider sx={{ mb: 2 }} />
				<Box
					component={NavLink}
					to={keyPaths.profileSettings()}
					onClick={handleNavClick}
					sx={{
						display: 'flex',
						alignItems: 'center',
						px: 2,
						py: 1.5,
						borderRadius: 3,
						color: '#64748b',
						textDecoration: 'none',
						mb: 1,
						'&:hover': { bgcolor: '#f8fafc' },
						'&.active': { color: '#2563eb' },
					}}
				>
					<ListItemIcon sx={{ minWidth: 40 }}>
						<SettingsOutlined />
					</ListItemIcon>
					<ListItemText
						primary='Настройки'
						primaryTypographyProps={{
							fontSize: '0.9rem',
							fontWeight: 600,
						}}
					/>
				</Box>
				<Button
					fullWidth
					onClick={() => {
						navigate(keyPaths.login())
						handleNavClick()
					}}
					startIcon={<LogoutOutlined />}
					sx={{
						justifyContent: 'flex-start',
						color: '#ef4444',
						textTransform: 'none',
						fontWeight: 600,
						px: 2,
						py: 1.5,
						borderRadius: 3,
						'&:hover': { bgcolor: '#fef2f2' },
					}}
				>
					Выйти
				</Button>
			</Box>
		</Box>
	)

	return (
		<Box
			component='nav'
			sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
		>
			{/* Мобильный drawer (temporary) */}
			<Drawer
				variant='temporary'
				open={mobileOpen}
				onClose={onDrawerToggle}
				ModalProps={{ keepMounted: true }} // Лучше для мобильной производительности
				sx={{
					display: { xs: 'block', md: 'none' },
					'& .MuiDrawer-paper': {
						width: DRAWER_WIDTH,
						boxSizing: 'border-box',
					},
				}}
			>
				{drawerContent}
			</Drawer>

			{/* Десктопный drawer (permanent) */}
			<Drawer
				variant='permanent'
				sx={{
					display: { xs: 'none', md: 'block' },
					'& .MuiDrawer-paper': {
						width: DRAWER_WIDTH,
						boxSizing: 'border-box',
						borderRight: '1px solid #e2e8f0',
					},
				}}
				open
			>
				{drawerContent}
			</Drawer>
		</Box>
	)
}
