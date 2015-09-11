var _ = require('lodash');

var Report = {
    generate: function(results, options) {
        var finishTime = Date.now(),
            formatted = {
                started: options.startTime,
                finished: finishTime,
                duration: finishTime - options.startTime,
                specs: [],
                failing: 0,
                config: _.omit(options.config || {}, ['debug', 'live', 'logLevel', 'parallelLimit', 'port'])
            };

        _.each(results, function(result) {
            var name = result.input[0].spec.name,
                spec = _.find(formatted.specs, {name: name}),
                res = {
                    viewport: result.input[0].viewport,
                    screenshots: {}
                };

            var specConfig = _.find(options.specs, {name: name});

            _.each(result.input, function(input) {
                res.screenshots[input.environment.name] = input.screenshot;
            });

            res.screenshots['diff'] = result.output.screenshot;
            res.diff = result.output.diff;

            if(res.diff > 0) {
                formatted.failing++;
            }

            if(!spec) {
                spec = {
                    name: name,
                    results: [],
                    url: specConfig.path
                };
                formatted.specs.push(spec);
            }
            spec.results.push(res);
        });

        return formatted;
    }
};

module.exports = Report;
