define(['utils/storage'], function(storage) {
    var utils = {
        format: {
            date: function(date) {
                date = new Date(date);

                var day = date.getDate(),
                    month = (date.getMonth().toString().length === 1 ? '0' + date.getMonth() : date.getMonth()),
                    year = date.getFullYear(),
                    hours = date.getHours(),
                    minutes = (date.getMinutes().toString().length === 1 ? '0' + date.getMinutes() : date.getMinutes()),
                    seconds = (date.getSeconds().toString().length === 1 ? '0' + date.getSeconds() : date.getSeconds());

                return [day, month, year].join('-') + ' ' + [hours, minutes, seconds].join(':');
            }
        },
        getDiffColor: function(diff) {
            var color = 'green';

            if(diff > 25) {
                color = 'yellow';
            }

            if(diff > 50) {
                color = 'orange';
            }

            if(diff > 75) {
                color = 'red';
            }

            return color;
        },
        storage: storage,
        getImageUrl: function(url) {
            var report = storage.use('application').get('report');

            if(report) {
                url = 'results/' + url.replace(report.config.resultsDir, '');
            }

            return url;
        }
    };
    return utils;
});
