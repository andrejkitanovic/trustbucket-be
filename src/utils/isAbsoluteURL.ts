const absolutURLRegex = new RegExp('^(?:[a-z]+:)?//', 'i');

export const isAbsoluteURL = (url: string) => absolutURLRegex.test(url);
