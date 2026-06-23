import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { Box, IconButton } from '@mui/material'
import Typography from '@mui/material/Typography'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { StyledForm, StyledFormWrap, SubmitButton } from './components'
import { useCustomForm } from '#shared/lib/hooks/useCustomForm'
import { Input } from '#shared/ui/input/Input'
import Link from '#shared/ui/link/Link'
import { keyPaths } from '#shared/consts/routing'
import { LoginRequest } from '#entities/auth/api/generated'
import { FieldError } from 'react-hook-form'

type LoginFormProps = {
	onSubmit: (data: LoginRequest) => Promise<void>
	isLoading: boolean
}

export const LoginForm: FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
	const { t } = useTranslation(['auth', 'common'])
	const [showPassword, setShowPassword] = useState(false)

	const handleClickShowPassword = () => setShowPassword(!showPassword)

	// Инициализация формы с типами LoginRequest
	const methods = useCustomForm<LoginRequest>({
		mode: 'onChange',
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const {
		register,
		formState: { errors, isValid },
		handleSubmit,
	} = methods

	return (
		<StyledFormWrap>
			<StyledForm
				id='login-form'
				onSubmit={handleSubmit(onSubmit)}
			>
				<Box
					display='flex'
					gap={'12px'}
					flexDirection='column'
					marginBottom='8px'
				>
					<Typography
						id='login-title'
						textAlign='left'
						fontWeight={700}
						fontSize={{ xs: '28px', sm: '32px' }}
						color='#111827'
					>
						{t('youkoso')}
					</Typography>
					<Typography
						id='login-description'
						fontSize='15px'
						textAlign='left'
						color='#6B7280'
						fontWeight={400}
					>
						{t('loginToContinue')}
					</Typography>
				</Box>

				<Input
					id='email'
					type='email'
					autoFocus
					label={t('common:email')}
					placeholder='admin@work.kg'
					error={errors.email as FieldError}
					{...register('email', {
						required: t('common:requiredField'),
						pattern: {
							value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
							message: t('common:invalidEmail'),
						},
					})}
					sx={{
						'& .MuiOutlinedInput-root': {
							borderRadius: '10px',
							fontSize: '15px',
							height: '48px',
							backgroundColor: '#F9FAFB',
							border: '1.5px solid #E5E7EB',
							transition: 'all 0.3s ease',

							'&:hover': {
								borderColor: '#D1D5DB',
								backgroundColor: '#F3F4F6',
							},

							'&.Mui-focused': {
								borderColor: '#667eea',
								backgroundColor: '#ffffff',
								boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
							},
						},
						'& .MuiInputBase-input::placeholder': {
							opacity: 0.5,
						},
					}}
				/>

				<Input
					id='password'
					type={showPassword ? 'text' : 'password'}
					label={t('password')}
					placeholder={t('password')}
					error={errors.password as FieldError}
					{...register('password', {
						required: t('common:requiredField'),
						minLength: { value: 4, message: t('common:tooShort') },
					})}
					endAdornment={
						<IconButton
							aria-label='toggle password visibility'
							onClick={handleClickShowPassword}
							edge='end'
							sx={{
								color: '#9CA3AF',
								'&:hover': {
									color: '#667eea',
									backgroundColor: 'transparent',
								},
							}}
						>
							{showPassword ? <VisibilityOff /> : <Visibility />}
						</IconButton>
					}
					sx={{
						'& .MuiOutlinedInput-root': {
							borderRadius: '10px',
							fontSize: '15px',
							height: '48px',
							backgroundColor: '#F9FAFB',
							border: '1.5px solid #E5E7EB',
							transition: 'all 0.3s ease',

							'&:hover': {
								borderColor: '#D1D5DB',
								backgroundColor: '#F3F4F6',
							},

							'&.Mui-focused': {
								borderColor: '#667eea',
								backgroundColor: '#ffffff',
								boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
							},
						},
						'& .MuiInputBase-input::placeholder': {
							opacity: 0.5,
						},
					}}
				/>

				<Box display='flex' justifyContent='flex-end' marginTop='4px'>
					<Link
						sx={{
							width: 'fit-content',
							fontSize: '14px',
							fontWeight: 500,
							textDecoration: 'none',
							color: '#667eea',
							'&:hover': {
								color: '#764ba2',
								textDecoration: 'underline',
							},
						}}
						id='forgot-password-link'
						to={keyPaths.forgotPassword()}
					>
						{t('forgot-password')}
					</Link>
				</Box>

				<SubmitButton
					id='submit-btn'
					isLoading={isLoading}
					disabled={!isValid || isLoading}
					type='submit'
					variant='contained'
				>
					{t('common:continue')}
				</SubmitButton>
			</StyledForm>
		</StyledFormWrap>
	)
}
