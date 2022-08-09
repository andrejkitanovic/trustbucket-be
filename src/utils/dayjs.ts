import dayjs from 'dayjs';

export const reverseFromNow = (text: string) => {
	if (text.includes('an hour ago')) {
		return dayjs().subtract(1, 'hour');
	}
	if (text.includes('a day ago')) {
		return dayjs().subtract(1, 'day');
	}
	if (text.includes('a week ago')) {
		return dayjs().subtract(1, 'week');
	}
	if (text.includes('a month ago')) {
		return dayjs().subtract(1, 'month');
	}
	if (text.includes('a year ago')) {
		return dayjs().subtract(1, 'year');
	}

	const value = text.split(' ').length && parseInt(text.split(' ')[0]);

	if (text.includes('minutes ago')) {
		return dayjs().subtract(value, 'minute');
	}
	if (text.includes('hours ago')) {
		return dayjs().subtract(value, 'hour');
	}
	if (text.includes('days ago')) {
		return dayjs().subtract(value, 'day');
	}
	if (text.includes('weeks ago')) {
		return dayjs().subtract(value, 'week');
	}
	if (text.includes('months ago')) {
		return dayjs().subtract(value, 'month');
	}
	if (text.includes('years ago')) {
		return dayjs().subtract(value, 'year');
	}

	return null;
};

import customParseFormat from 'dayjs/plugin/customParseFormat';

export const dayjsParser = () => {
	dayjs.extend(customParseFormat);

	return dayjs;
};
