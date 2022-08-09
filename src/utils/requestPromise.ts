import rp from 'request-promise';

export const useRp = (url: string) =>
	rp({
		url,
		headers: {
			'User-Agent': 'Request-Promise',
		},
		json: true,
	});
