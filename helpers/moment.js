moment.locale('en');

exports.reversefromNow = (input) => {
	let relativeLocale = JSON.parse(JSON.stringify(moment.localeData()._relativeTime));
	let pastfutureObject = {
		future: relativeLocale.future,
		past: relativeLocale.past,
	};
	delete relativeLocale.future;
	delete relativeLocale.past;

	//detect if past or future
	let pastfuture;
	for (const [key, value] of Object.entries(pastfutureObject)) {
		if (input.indexOf(value.replace('%s', '')) != -1) {
			pastfuture = key;
		}
	}

	//detect the time unit
	let unitkey;
	for (const [key, value] of Object.entries(relativeLocale)) {
		if (input.indexOf(value.replace('%d', '')) != -1) {
			unitkey = key.charAt(0);
		}
	}

	//if its not in the data, then assume that it is a week
	if (unitkey == null) {
		unitkey = 'w';
	}

	const units = {
		M: 'month',
		d: 'day',
		h: 'hour',
		m: 'minute',
		s: 'second',
		w: 'week',
		y: 'year',
	};
	//Detect number value
	const regex = /(\d+)/g;
	let numbervalue = input.match(regex) || [1];
	//Add if future, subtract if past
	if (pastfuture == 'past') {
		return moment().subtract(numbervalue, units[unitkey]).valueOf();
	} else {
		return moment().add(numbervalue, units[unitkey]).valueOf();
	}
}
