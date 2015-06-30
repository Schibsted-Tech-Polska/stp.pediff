var _ = require('lodash');

var Report = function(config) {
    this.config = config;
};

Report.prototype = {
    run: function(results) {
    }
};

module.exports = Report;
