const absolutURLRegex = new RegExp('^(?:[a-z]+:)?//', 'i')

exports.isAbsoluteURL = (string) => absolutURLRegex.test(string);
