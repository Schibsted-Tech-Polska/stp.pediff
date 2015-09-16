define([
    'jquery',
    'backbone',
    'lodash',
    'utils'
], function($, Backbone, _, utils) {
    var Model = Backbone.Model.extend({
        defaults: {},
        parse: function(data) {
            data.screenshotsCount = 0;
            _.each(data.specs, function(spec) {
                _.each(spec.results, function(result){
                    data.screenshotsCount += _.keys(result.screenshots).length;
                });
            });

            data.started = new Date(data.started);
            data.finished = new Date(data.finished);
            data.duration = data.duration / 1000;

            data.environments = data.config.environments;
            data.viewports = data.config.viewports;

            data = _.omit(data, ['config', 'results']);

            return data;
        },
        getDateStarted: function() {
            return utils.format.date(this.get('started'));
        }
    });
    return Model;
});
