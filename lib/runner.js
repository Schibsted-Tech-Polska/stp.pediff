var _ = require('lodash'),
    async = require('async'),
    Browser = require('./browser.js'),
    Proxy = require('./proxy.js');

var Runner = function(config) {
    this.config = config;
};

Runner.prototype = {
    runBundle: function(specs) {
        // run all tests with spooky and compare the results - all in parallel
        var queue = [],
            screenshotsCount = 0;

        specs.forEach(function(spec) {
            // pre-calculate number of screenshots to be taken
            screenshotsCount += this.config.environments.length * spec.options.viewports.length;

            // build a specs queue to be run in parallel
            queue.push(this.runSpec.bind(this, spec));
        }.bind(this));

        // contract the number of screenshots if there's been an error
        Proxy.on('runner:capture:error', function() {
            screenshotsCount--;
        });

        // divide the parallel limit by number of specs to avoid exceeding the set number of phantom processes
        this.parallelLimit = Math.round(this.config.parallelLimit / specs.length);

        Proxy.emit('runner:bundle:started');

        // run the specs queue in parallel (executes runSpec in parallel)
        async.parallel(queue, function(error, res) {
            Proxy.emit('runner:bundle:finished', {
                screenshotsCount: screenshotsCount,
                results: res
            });
        });
    },
    runSpec: function(spec, callback) {
        // run a single testSpec
        var queue = [];

        // map the spec into a queue of variants (variant is defined by environment and viewport)
        this.config.environments.forEach(function(environment) {
            spec.options.viewports.forEach(function(viewport) {
                queue.push(this.runSpooky.bind(this, {
                    environment: environment,
                    viewport: viewport,
                    spec: spec
                }));
            }.bind(this));
        }.bind(this));

        Proxy.emit('runner:spec:started', spec.name);

        // run the queue of all variants in parallel (executes runSpooky in parallel)
        async.parallelLimit(queue, this.parallelLimit, function(err, res) {
            Proxy.emit('runner:spec:finished', spec.name);
            callback(err, res);
        }.bind(this));
    },
    runSpooky: function(task, callback) {
        // helper function - returns image path to be used when saving screenshot
        var getImagePath = function() {
            return this.config.resultsDir + '' +
                task.spec.name + '-' +
                task.viewport.name + '-' +
                task.environment.name + '.png';
        }.bind(this);

        // spawn actual spooky.js -> casper.js -> phantom.js process
        // runs onReady when everything is up and running
        // runs onSpawn when spooky.js has started successfully
        Browser.spawn({
            casperOptions: {
                viewportSize: task.viewport
            },
            onReady: function(err, spooky) {
                if(err) {
                    var error = new Error('Failed to initialize SpookyJS for test spec ' + task.spec.name);
                    error.details = err;
                    Proxy.emit('runner:error', error);
                } else {
                    Proxy.emit('runner:capture:started', {
                        spec: task.spec.name,
                        env: task.environment.name,
                        viewport: task.viewport.name
                    });

                    var baseUrl = task.environment.baseUrl + task.spec.path;

                    spooky.start(baseUrl);

                    spooky.then(task.spec.run);

                    spooky.then([{
                        imagePath: getImagePath()
                    }, function() {
                        /*jshint undef: false */
                        this.capture(imagePath);
                        /*jshint undef: true */
                    }]);
                }
            }.bind(this),
            onSpawn: function(spooky) {
                spooky.on('spooky:error', function(error) {
                    Proxy.emit('runner:error', error);
                    callback(null, _.extend({}, task, {
                        screenshot: false
                    }));
                });

                spooky.on('phantom:error', function(error) {
                    Proxy.emit('runner:capture:error', {
                        spec: task.spec.name,
                        env: task.environment.name,
                        viewport: task.viewport.name,
                        message: error
                    });
                    callback(null, _.extend({}, task, {
                        screenshot: false
                    }));
                });

                spooky.once('done', function() {
                    Proxy.emit('runner:capture:finished', {
                        spec: task.spec.name,
                        env: task.environment.name,
                        viewport: task.viewport.name
                    });
                    callback(null, _.extend({}, task, {
                        screenshot: getImagePath()
                    }));
                });
            }
        });
    }
};

module.exports = Runner;
