export const keyPaths = {
	// ========= Base =========
	index: () => '/',
	dashboard: () => '/dashboard',

	// ========= Auth =========
	login: () => `/login`,
	forgotPassword: () => '/forgot-password',
	resetPassword: () => '/reset-password',
	authCallback: () => '/auth/callback',

	// ========= Questionnaires =========
	questionnaires: () => '/questionnaires',
	questionnaireDetails: (id: string = ':id') => `/questionnaires/${id}`,

	// ========= Vacancies =========
	vacancies: () => '/vacancies',
	createVacancy: () => '/vacancies/create',
	editVacancy: (id: string = ':id') => `/vacancies/edit/${id}`,
	vacancyDetails: (id: string = ':id') => `/vacancies/${id}`,

	// ========= Users =========
	users: () => '/users',
	userDetails: (id: string = ':id') => `/users/${id}`,

	// ========= Subscriptions =========
	subscriptions: () => '/subscriptions',

	// ========= Feedback =========
	feedback: () => '/feedback',

	// ========= Points =========
	points: () => '/points',

	categories: () => '/categories',

	// ========= Social Networks =========
	socialNetworks: () => '/social-networks',

	// ========= Broadcast =========
	broadcast: () => '/broadcast',

	// ========= Series =========
	series: () => '/series',
	seriesDetails: (id: string = ':id') => `/series/${id}`,

	// ========= Payments / Payouts =========
	payouts: () => '/payouts',

	// ========= Profile / Settings =========
	profileSettings: () => '/profile/settings',

	// ========= System =========
	logout: () => '/logout',
}
