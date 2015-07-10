define([], function() {
    var utils = {
        format: {
            date: function(date) {
                var date = new Date(date),
                    day = date.getDate(),
                    month = (date.getMonth().toString().length === 1 ? '0' + date.getMonth() : date.getMonth()),
                    year = date.getFullYear(),
                    hours = date.getHours(),
                    minutes = (date.getMinutes().toString().length === 1 ? '0' + date.getMinutes() : date.getMinutes()),
                    seconds = (date.getSeconds().toString().length === 1 ? '0' + date.getSeconds() : date.getSeconds());

                return [day, month, year].join('-') + ' ' + [hours, minutes, seconds].join(':');
            }
        }
    };
    return utils;
});
