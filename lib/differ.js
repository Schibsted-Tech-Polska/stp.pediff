var _ = require('lodash'),
    async = require('async'),
    pngDiffer = require('png-differ'),
    Proxy = require('./proxy.js');

var Differ = function(config) {
    this.config = config;
};

Differ.prototype = {
    run: function(results) {
        var tasks = [],
            grouped, mapped = [];

        // group results by specification and viewport type
        grouped = _.chain(results).flatten().groupBy(function(task) {
            return task.spec.name + '-' + task.viewport.name;
        }).value();

        _.each(grouped, function(value, key) {
            mapped.push({
                name: key,
                variants: value
            });
        });

        _.each(mapped, function(group) {
            tasks.push(this.compare.bind(this, group));
        }.bind(this));

        Proxy.emit('differ:bundle:started');

        async.parallel(tasks, function(err, data) {
            Proxy.emit('differ:bundle:finished', data);
        })
    },
    compare: function(group, callback) {
        var file1 = group.variants[0].screenshot,
            file2 = group.variants[1].screenshot,
            resultPath = group.variants[0].screenshot.replace(group.variants[0].environment.name, 'diff');

        Proxy.emit('differ:group:started', group.name);

        pngDiffer.outputDiff(file1, file2, resultPath, function(err, diffMetric) {
            if(err) throw err;

            Proxy.emit('differ:group:finished', {
                name: group.name,
                diff: diffMetric
            });

            callback(null, {
                name: group.name,
                input: group.variants,
                output: {
                    screenshot: resultPath,
                    diff: diffMetric
                }
            });
        });
    }
};

module.exports = Differ;
