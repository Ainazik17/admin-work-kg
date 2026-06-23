import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import {
	STORAGE_TOKEN_KEY,
	SCRIPT_RETRY_COUNT,
} from '#shared/consts/localStorage.ts'
import { keyPaths } from '#shared/consts/routing.ts'

import { authApi, LoginRequest } from '#entities/auth/api/generated'
import { LoginForm } from '#features/authentication/login/ui/LoginForm'
import { setAuthData, setIsAuthorized, setTokens } from '#entities/auth/slice'

function LoginPage() {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const [login, { isLoading }] = authApi.useLoginMutation()

	const onSubmit = async (credentials: LoginRequest) => {
		try {
			const response = await login(credentials).unwrap()

			localStorage.setItem(STORAGE_TOKEN_KEY, response.token || '')
			localStorage.setItem(
				SCRIPT_RETRY_COUNT,
				response.refreshToken || '',
			)

			const userData = {
				email: response.email,
				name: response.name,
				role: response.role,
				adminId: response.adminId,
			}
			localStorage.setItem('user_data', JSON.stringify(userData))

			dispatch(
				setTokens({
					token: response.token,
					refreshToken: response.refreshToken,
				}),
			)
			dispatch(setAuthData(userData))
			dispatch(setIsAuthorized(true))

			navigate(keyPaths.dashboard(), { replace: true })
		} catch (err) {
			// обработка ошибок
		}
	}

	return (
		<Stack
			id='login-page'
			direction='row'
			height='100vh'
			sx={{
				overflow: 'hidden',
				background: '#ffffff',
			}}
		>
			{/* Left Side - Brand Section */}
			<Box
				sx={{
					display: { xs: 'none', md: 'flex' },
					flex: 1,
					background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					flexDirection: 'column',
					justifyContent: 'space-between',
					padding: '60px 40px',
					position: 'relative',
					overflow: 'hidden',

					'&::before': {
						content: '""',
						position: 'absolute',
						width: '500px',
						height: '500px',
						background: 'rgba(255, 255, 255, 0.1)',
						borderRadius: '50%',
						top: '-100px',
						right: '-100px',
					},
					'&::after': {
						content: '""',
						position: 'absolute',
						width: '300px',
						height: '300px',
						background: 'rgba(255, 255, 255, 0.05)',
						borderRadius: '50%',
						bottom: '-50px',
						left: '-50px',
					},
				}}
			>
				<Box sx={{ position: 'relative', zIndex: 1 }}>
					<Box
						sx={{
							color: 'white',
							mb: 4,
						}}
					>
						<Box
							sx={{
								fontSize: '48px',
								fontWeight: 700,
								letterSpacing: '-1px',
								mb: 2,
							}}
						>
							WorkKG
						</Box>
						<Box
							sx={{
								fontSize: '16px',
								opacity: 0.9,
								lineHeight: 1.6,
								maxWidth: '400px',
							}}
						>
							Admin Control Center for Your Business Operations
						</Box>
					</Box>
				</Box>

				<Box
					sx={{
						position: 'relative',
						zIndex: 1,
						color: 'rgba(255, 255, 255, 0.8)',
						fontSize: '14px',
					}}
				>
					Secure. Fast. Reliable.
				</Box>
			</Box>

			{/* Right Side - Form Section */}
			<Box
				sx={{
					flex: { xs: 1, md: 1 },
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					padding: { xs: '20px', sm: '40px' },
					backgroundColor: '#ffffff',
				}}
			>
				<LoginForm onSubmit={onSubmit} isLoading={isLoading} />
			</Box>
		</Stack>
	)
}

export default LoginPage
