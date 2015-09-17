var _ = require('lodash'),
    events = require('events'),
    instance;

var Proxy = function() {
    events.EventEmitter.call(this);
};

Proxy.prototype = _.extend({}, events.EventEmitter.prototype);

module.exports = (function() {
    if(!instance) {
        instance = new Proxy();
    }
    return instance;
})();
