var util = (function () {

var exports = {};

// From MDN: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/random
exports.random_int = function random_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.is_mobile_device = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

// Like C++'s std::lower_bound.  Returns the first index at which
// `value` could be inserted without changing the ordering.  Assumes
// the array is sorted.
//
// `first` and `last` are indices and `less` is an optionally-specified
// function that returns true if
//   array[i] < value
// for some i and false otherwise.
//
// Usage: lower_bound(array, value, [less])
//        lower_bound(array, first, last, value, [less])
exports.lower_bound = function (array, arg1, arg2, arg3, arg4) {
    var first, last, value, less;
    if (arg3 === undefined) {
        first = 0;
        last = array.length;
        value = arg1;
        less = arg2;
    } else {
        first = arg1;
        last = arg2;
        value = arg3;
        less = arg4;
    }

    if (less === undefined) {
        less = function (a, b) { return a < b; };
    }

    var len = last - first;
    var middle;
    var step;
    var lower = 0;
    while (len > 0) {
        step = Math.floor(len / 2);
        middle = first + step;
        if (less(array[middle], value, middle)) {
            first = middle;
            first++;
            len = len - step - 1;
        }
        else {
            len = step;
        }
    }
    return first;
};

exports.same_stream_and_subject = function util_same_stream_and_subject(a, b) {
    // Streams and subjects are case-insensitive.
    return ((a.stream.toLowerCase() === b.stream.toLowerCase()) &&
            (a.subject.toLowerCase() === b.subject.toLowerCase()));
};

exports.same_major_recipient = function (a, b) {
    // Same behavior as same_recipient, except that it returns true for messages
    // on different topics but the same stream.
    if ((a === undefined) || (b === undefined)) {
        return false;
    }
    if (a.type !== b.type) {
        return false;
    }

    switch (a.type) {
    case 'private':
        return a.reply_to === b.reply_to;
    case 'stream':
        return a.stream.toLowerCase() === b.stream.toLowerCase();
    }

    // should never get here
    return false;
};

exports.same_recipient = function util_same_recipient(a, b) {
    if ((a === undefined) || (b === undefined)) {
        return false;
    }
    if (a.type !== b.type) {
        return false;
    }

    switch (a.type) {
    case 'private':
        return a.reply_to === b.reply_to;
    case 'stream':
        return exports.same_stream_and_subject(a, b);
    }

    // should never get here
    return false;
};

exports.same_sender = function util_same_sender(a, b) {
    return ((a !== undefined) && (b !== undefined) &&
            (a.sender_email === b.sender_email));
};

exports.normalize_recipients = function (recipients) {
    // Converts a string listing emails of message recipients
    // into a canonical formatting: emails sorted ASCIIbetically
    // with exactly one comma and no spaces between each.
    recipients = _.map(recipients.split(','), $.trim);
    recipients = _.filter(recipients, function (s) { return s.length > 0; });
    recipients.sort();
    return recipients.join(',');
};

// Avoid URI decode errors by removing characters from the end
// one by one until the decode succeeds.  This makes sense if
// we are decoding input that the user is in the middle of
// typing.
exports.robust_uri_decode = function (str) {
    var end = str.length;
    while (end > 0) {
        try {
            return decodeURIComponent(str.substring(0, end));
        } catch (e) {
            if (!(e instanceof URIError)) {
                throw e;
            }
            end--;
        }
    }
    return '';
};

// If we can, use a locale-aware sorter.  However, if the browser
// doesn't support the ECMAScript Internationalization API
// Specification, do a dumb string comparison because
// String.localeCompare is really slow.
exports.strcmp = (function () {
    try {
        var collator = new Intl.Collator();
        return collator.compare;
    } catch (e) {
    }

    return function util_strcmp (a, b) {
        return (a < b ? -1 : (a > b ? 1 : 0));
    };
}());

exports.escape_regexp = function (string) {
    // code from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    // Modified to escape the ^ to appease jslint. :/
    return string.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, "\\$1");
};

exports.array_compare = function util_array_compare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    var i;
    for (i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
};

/* Represents a value that is expensive to compute and should be
 * computed on demand and then cached.  The value can be forcefully
 * recalculated on the next call to get() by calling reset().
 *
 * You must supply a option to the constructor called compute_value
 * which should be a function that computes the uncached value.
 */
var unassigned_value_sentinel = {};
exports.CachedValue = function (opts) {
    this._value = unassigned_value_sentinel;
    _.extend(this, opts);
};

exports.CachedValue.prototype = {
    get: function CachedValue_get() {
        if (this._value === unassigned_value_sentinel) {
            this._value = this.compute_value();
        }
        return this._value;
    },

    reset: function CachedValue_reset() {
        this._value = unassigned_value_sentinel;
    }
};

exports.enforce_arity = function util_enforce_arity(func) {
    return function () {
        if (func.length !== arguments.length) {
            throw new Error("Function '" + func.name + "' called with "
                            + arguments.length + " arguments, but expected "
                            + func.length);
        }
        return func.apply(this, arguments);
    };
};

exports.execute_early = function (func) {
    if (page_params.test_suite) {
        $(document).one('phantom_page_loaded', func);
    } else {
        $(func);
    }
};

return exports;
}());
if (typeof module !== 'undefined') {
    module.exports = util;
}
