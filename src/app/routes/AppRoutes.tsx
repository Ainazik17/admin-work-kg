import { createBrowserRouter, Navigate } from 'react-router-dom'

import { BaseLayout } from '#app/layout/BaseLayout.tsx'
import AuthorizedGuard from '#app/routes/AuthorizedGuard.tsx'
// import { LazyLoading } from '#app/routes/LazyLoader.tsx'
import UnauthorizedGuard from '#app/routes/UnauthorizedGuard.tsx'

import { keyPaths } from '#shared/consts/routing.ts'
import { lazyWithRetry } from '#shared/lib/lazyWithRetry.ts'

// Импорт страниц
import LoginPage from '#pages/LoginPage'

// Импорт фич (форм)
// import { ForgotPasswordForm } from '#features/authentication copy/forgot-password/ui/ForgotPasswordForm'
// import { ResetPasswordForm } from '#features/authentication copy/reset-password/ui/ResetPasswordForm'
import { Dashboard } from '#pages/Dashboard'
import { Applications } from '#pages/Application/Applications'
import { Vacancies } from '#pages/Vacancies/Vacancies'
import { Users } from '#pages/Users/Users'
import { Payouts } from '#pages/Payouts'
import { Settings } from '#pages/Settings'
import { Subscriptions } from '#pages/Subscriptions/Subscriptions'
import { Points } from '#pages/Points/Points'
import { Social } from '#pages/SocialTask/Social'
import { FeedbackPage } from '#pages/Feedback/Feedback'
import { Categories } from '#pages/Categories/Categories'
import { SeriesDetails, SeriesList } from '#pages/Series/SeriesPage'

const ErrorFallback = lazyWithRetry(
	() => import('#shared/ui/error-fallback/ErrorFallback'),
)

export const buildAppRoutes = () =>
	createBrowserRouter([
		{
			ErrorBoundary: ErrorFallback,
			children: [
				// --- Публичные роуты (Только для НЕавторизованных) ---
				{
					path: keyPaths.login(),
					element: (
						<AuthorizedGuard>
							<LoginPage />
						</AuthorizedGuard>
					),
				},
				// {
				// 	path: keyPaths.forgotPassword(),
				// 	element: (
				// 		<AuthorizedGuard>
				// 			<ForgotPasswordForm />
				// 		</AuthorizedGuard>
				// 	),
				// },
				// {
				// 	path: keyPaths.resetPassword(),
				// 	element: (
				// 		<AuthorizedGuard>
				// 			<ResetPasswordForm />
				// 		</AuthorizedGuard>
				// 	),
				// },

				// --- Защищенные роуты (Только для авторизованных) ---
				{
					path: '',
					element: (
						<UnauthorizedGuard>
							<BaseLayout />
						</UnauthorizedGuard>
					),
					children: [
						{
							index: true,
							element: <Navigate to={keyPaths.dashboard()} />,
						},
						{
							path: keyPaths.dashboard(),
							element: <Dashboard />,
						},

						// Questionnaires / Applications
						{
							path: keyPaths.questionnaires(),
							element: <Applications />,
						},
						{
							path: keyPaths.questionnaireDetails(),
							element: <Applications />, // Обычно здесь детальная страница, если она есть
						},

						// Vacancies
						{
							path: keyPaths.vacancies(),
							element: <Vacancies />,
						},
						{
							path: keyPaths.createVacancy(),
							element: <Vacancies />, // Либо отдельный компонент CreateVacancy
						},
						{
							path: keyPaths.editVacancy(),
							element: <Vacancies />,
						},
						{
							path: keyPaths.vacancyDetails(),
							element: <Vacancies />,
						},

						// Users
						{
							path: keyPaths.users(),
							element: <Users />,
						},
						{
							path: keyPaths.userDetails(),
							element: <Users />,
						},

						// Other modules
						{
							path: keyPaths.subscriptions(),
							element: <Subscriptions />,
						},
						{
							path: keyPaths.feedback(),
							element: <FeedbackPage />,
						},
						{
							path: keyPaths.points(),
							element: <Points />,
						},
						{
							path: keyPaths.categories(),
							element: <Categories />,
						},
						{
							path: keyPaths.socialNetworks(),
							element: <Social />,
						},
						{
							path: keyPaths.series(),
							element: <SeriesList />,
						},
						{
							path: keyPaths.seriesDetails(),
							element: <SeriesDetails />,
						},
						{
							path: keyPaths.payouts(),
							element: <Payouts />,
						},
						{
							path: keyPaths.profileSettings(),
							element: <Settings />,
						},

						// 404
						{
							path: '*',
							element: <div>Страница не найдена</div>,
						},
					],
				},
			],
		},
	])
