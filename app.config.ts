export const config = {
	port: 3000,
	cookie: {
		name: 'session',
		httpOnly: true,
		secure: false,
		sameSite: 'lax',
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};
