const dayjs = require('dayjs');

exports.reverseFromNow = (string) => {
	if (string === 'an hour ago') {
		return dayjs().subtract(1, 'hour');
	} else if (string === 'a day ago') {
		return dayjs().subtract(1, 'day');
	} else if (string === 'a week ago') {
		return dayjs().subtract(1, 'week');
	} else if (string === 'a month ago') {
		return dayjs().subtract(1, 'month');
	} else if (string === 'a year ago') {
		return dayjs().subtract(1, 'year');
	}

	const value = string.split(' ').length && string.split(' ')[0];

	if (string.includes('minutes ago')) {
		return dayjs().subtract(value, 'minute');
	} else if (string.includes('days ago')) {
		return dayjs().subtract(value, 'day');
	} else if (string.includes('weeks ago')) {
		return dayjs().subtract(value, 'week');
	} else if (string.includes('months ago')) {
		return dayjs().subtract(value, 'month');
	} else if (string.includes('years ago')) {
		return dayjs().subtract(value, 'year');
	}

	return null;
};


exports.dayjsParser = () => {
	const customParseFormat = require('dayjs/plugin/customParseFormat');
	dayjs.extend(customParseFormat);

	return dayjs
}