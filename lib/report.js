var _ = require('lodash');

var Report = {
    generate: function(results, options) {
        var finishTime = Date.now(),
            formatted = {
                started: options.startTime,
                finished: finishTime,
                duration: finishTime - options.startTime,
                results: [],
                failing: 0
            };

        _.each(results, function(result) {
            var res = {
                name: result.input[0].spec.name,
                viewport: result.input[0].viewport,
                screenshots: {}
            };

            _.each(result.input, function(input) {
                res.screenshots[input.environment.name] = input.screenshot;
            });

            res.screenshots['diff'] = result.output.screenshot;
            res.diff = result.output.diff;

            if(res.diff > 0) {
                formatted.failing++;
            }

            formatted.results.push(res);
        });

        return formatted;
    }
};

module.exports = Report;
