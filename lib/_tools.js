'use strict';

module.exports = {};

module.exports.formatDate = function formatDate(d, dateonly, floating, hasTimezone) {
    var s;

    function pad(i) {
        return (i < 10 ? '0' : '') + i;
    }

    var year    = hasTimezone ? d.getFullYear() : d.getUTCFullYear(),
        month   = hasTimezone ? d.getMonth()+1  : d.getUTCMonth()+1,
        date    = hasTimezone ? d.getDate()     : d.getUTCDate(),
        hours   = hasTimezone ? d.getHours()    : d.getUTCHours(),
        minutes = hasTimezone ? d.getMinutes()  : d.getUTCMinutes(),
        seconds = hasTimezone ? d.getSeconds()  : d.getUTCSeconds();

    s = year;
    s += pad(month);
    s += pad(date);

    if (!dateonly) {
        s += 'T';
        s += pad(hours);
        s += pad(minutes);
        s += pad(seconds);

        if (!hasTimezone && !floating) {
            s += 'Z';
        }
    }

    return s;
};

// For information about this format, see RFC 5545, section 3.3.5
// https://tools.ietf.org/html/rfc5545#section-3.3.5
module.exports.formatDateTZ = function formatDateTZ(property, date, eventData) {
    var tzParam = '',
        floating = eventData.floating,
        hasTimezone = eventData.timezone ? true : false;

    if(eventData.timezone) {
        tzParam = ';TZID=' + eventData.timezone;
    }

    return property + tzParam + ':' + module.exports.formatDate(date, false, floating, hasTimezone);
};

module.exports.escape = function escape(str) {
    return str.replace(/[\\;,"]/g, function(match) {
        return '\\' + match;
    }).replace(/(?:\r\n|\r|\n)/g, '\\n');
};

module.exports.duration = function duration(seconds) {
    var string = '';

    // < 0
    if(seconds < 0) {
        string = '-';
        seconds *= -1;
    }

    string += 'P';

    // DAYS
    if(seconds >= 86400) {
        string += Math.floor(seconds / 86400) + 'D';
        seconds %= 86400;
    }
    if(!seconds && string.length > 1) {
        return string;
    }

    string += 'T';

    // HOURS
    if(seconds >= 3600) {
        string += Math.floor(seconds / 3600) + 'H';
        seconds %= 3600;
    }

    // MINUTES
    if(seconds >= 60) {
        string += Math.floor(seconds / 60) + 'M';
        seconds %= 60;
    }

    // SECONDS
    if(seconds > 0) {
        string += seconds + 'S';
    }
    else if(string.length <= 2) {
        string += '0S';
    }

    return string;
};

module.exports.toJSON = function(object, attributes, options) {
    var result = {};
    options = options || {};
    options.ignoreAttributes = options.ignoreAttributes || [];
    options.hooks = options.hooks || {};

    attributes.forEach(function(attribute) {
        if(options.ignoreAttributes.indexOf(attribute) !== -1) {
            return;
        }

        var value = object[attribute](),
            newObj;

        if(options.hooks[attribute]) {
            value = options.hooks[attribute](value);
        }
        if(!value) {
            return;
        }

        result[attribute] = value;

        if(Array.isArray(result[attribute])) {
            newObj = [];
            result[attribute].forEach(function(object) {
                newObj.push(object.toJSON());
            });
            result[attribute] = newObj;
        }
    });

    return result;
};