declare namespace Express {
	interface Request {
		auth: {
			id: string;
			selectedCompany: string;
		};
	}
}
