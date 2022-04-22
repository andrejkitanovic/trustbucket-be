const dayjs = require('dayjs')

exports.reverseFromNow = (string) => {
    if (string.includes('an hour ago')) {
        return dayjs().subtract(1, 'hour')
    }
    if (string.includes('a day ago')) {
        return dayjs().subtract(1, 'day')
    }
    if (string.includes('a week ago')) {
        return dayjs().subtract(1, 'week')
    }
    if (string.includes('a month ago')) {
        return dayjs().subtract(1, 'month')
    }
    if (string.includes('a year ago')) {
        return dayjs().subtract(1, 'year')
    }

    const value = string.split(' ').length && string.split(' ')[0]

    if (string.includes('minutes ago')) {
        return dayjs().subtract(value, 'minute')
    }
    if (string.includes('hours ago')) {
        return dayjs().subtract(value, 'hour')
    }
    if (string.includes('days ago')) {
        return dayjs().subtract(value, 'day')
    }
    if (string.includes('weeks ago')) {
        return dayjs().subtract(value, 'week')
    }
    if (string.includes('months ago')) {
        return dayjs().subtract(value, 'month')
    }
    if (string.includes('years ago')) {
        return dayjs().subtract(value, 'year')
    }

    return null
}

const customParseFormat = require('dayjs/plugin/customParseFormat')

exports.dayjsParser = () => {
    dayjs.extend(customParseFormat)

    return dayjs
}
