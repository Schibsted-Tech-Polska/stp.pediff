var _ = require('lodash'),
    async = require('async'),
    pngDiffer = require('png-differ'),
    pngToJpg = require('png-jpg'),
    pngCrop = require('png-crop'),
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
    compare: function(group, done) {
        var file1 = group.variants[0].screenshot,
            file2 = group.variants[1].screenshot,
            resultPath = group.variants[0].screenshot.replace(group.variants[0].environment.name, 'diff');

        Proxy.emit('differ:group:started', group.name);

        async.each(group.variants, function(variant, done) {
            // TODO: limit capture frame instead of resizing images
            pngCrop.crop(variant.screenshot, variant.screenshot, {
                width: variant.viewport.width,
                height: 10000
            }, function(err) {
                done(err);
            });
        }, function(err) {
            pngDiffer.outputDiff(file1, file2, resultPath, function(err, diffMetric) {
                if(err) throw err;

                var images = [file1, file2, resultPath];

                async.eachSeries(images, function(image, callback) {
                    pngToJpg({
                        input: image,
                        output: image.replace('.png', '.jpg'),
                        options: {
                            quality: 60
                        }
                    }, callback);
                }, function() {
                    Proxy.emit('differ:group:finished', {
                        name: group.name,
                        diff: diffMetric
                    });

                    _.each(group.variants, function(variant, index) {
                        group.variants[index].screenshot = {
                            hi: variant.screenshot,
                            lo: variant.screenshot.replace('.png', '.jpg')
                        };
                    });

                    done(null, {
                        name: group.name,
                        input: group.variants,
                        output: {
                            screenshot: {
                                hi: resultPath,
                                lo: resultPath.replace('.png', '.jpg')
                            },
                            diff: diffMetric
                        }
                    });
                });
            });
        });
    }
};

module.exports = Differ;
