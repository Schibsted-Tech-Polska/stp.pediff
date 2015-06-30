var _ = require('lodash'),
    customLogger = require('custom-logger'),
    Proxy = require('./proxy.js'),
    time = require('./time.js');

var Logger = function(debug) {
    this.logger = customLogger.config({level: debug ? 0 : 1});
    var logger = this.logger;

    var events = {
        'info': function(msg) {
            logger.info(msg);
        },
        'warn': function(msg) {
            logger.warn(msg);
        },
        'error': function(msg) {
            logger.error(msg);
        },
        'specsLoaded': function(specs) {
            logger.info(specs.length + ' test specs found');
        },
        'error:specsNotFound': function() {
            logger.error('no test specs found');
        },
        'error:specDirNotFound': function(dir) {
            logger.error('test specs directory not found - ' + dir);
        },
        'error:specFileLoadFailure': function(file) {
            logger.warn('unable to load spec file ' + file);
        },
        'runner:error': function(message) {
            logger.error(message);
        },
        'bundle:started': function() {
            time('bundle');
            logger.info('pediff bundle started');
        },
        'bundle:finished': function(data) {
            var elapsed = time('bundle');
            logger.info('pediff bundle finished (ran ' + data.specsLength + ' test specs in ' + elapsed + 's)');
        },
        'runner:bundle:started': function() {
            time('runner:bundle');
            logger.info('bundle runner started');
        },
        'runner:bundle:finished': function(data) {
            var elapsed = time('runner:bundle');
            logger.info('bundle runner finished (taken ' + data.screenshotsCount + ' screenshots in ' + elapsed + 's)');
        },
        'runner:spec:started': function(name) {
            time('runner:spec' + name);
            logger.debug('spec [' + name + '] started');
        },
        'runner:spec:finished': function(name) {
            var elapsed = time('runner:spec' + name);
            logger.debug('spec [' + name + '] finished (' + elapsed + 's)');
        },
        'runner:capture:started': function(details) {
            time('[' + details.spec + '][' + details.viewport + '][' + details.env + ']');
            logger.debug('loading [' + details.spec + '][' + details.viewport + '][' + details.env + ']');
        },
        'runner:capture:finished': function(details) {
            var elapsed = time('[' + details.spec + '][' + details.viewport + '][' + details.env + ']');
            logger.debug('loaded [' + details.spec + '][' + details.viewport + '][' + details.env + '] (' + elapsed + 's)');
        },
        'runner:capture:error': function(details) {
            logger.error('[' + details.spec + '][' + details.viewport + '][' + details.env + '] ' + details.message);
        },
        'differ:group:started': function(name) {
            time('differ:group' + name);
            logger.debug('calculating differences in [' + name + ']');
        },
        'differ:group:finished': function(data) {
            var elapsed = time('differ:group' + data.name);
            logger.debug('finished calculating differences in [' + data.name + '] (' + elapsed + 's - ' + data.diff + '% of difference)');
        },
        'differ:bundle:started': function() {
            time('differ:bundle');
            logger.info('difference calculator started');
        },
        'differ:bundle:finished': function(data) {
            var elapsed = time('differ:bundle');
            logger.info('difference calculator finished (compared ' + data.length * 2 + ' screenshots in ' + elapsed + 's)');
        }
    };

    _.each(events, function(callback, event) {
        Proxy.on(event, callback.bind(this));
    });
};

Logger.prototype = {
    debug: function() {
        this.logger.debug.apply(this.logger, arguments);
    },
    info: function() {
        this.logger.info.apply(this.logger, arguments);
    },
    warn: function() {
        this.logger.warn.apply(this.logger, arguments);
    },
    error: function() {
        this.logger.error.apply(this.logger, arguments);
    }
};

module.exports = Logger;
