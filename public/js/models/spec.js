define([
    'jquery',
    'backbone',
    'lodash',
    'collections/results'
], function($, Backbone, _, ResultsCollection) {
    var Model = Backbone.Model.extend({
        defaults: {},
        parse: function(data) {
            var result = _.omit(data, []);
            result.results = new ResultsCollection(data.results, {parse: true});
            return result;
        },
        getAverageDiff: function() {
            return Math.ceil(this.get('results').reduce(function(sum, result) {
                    return sum + result.get('diff');
                }, 0) / this.get('results').length);
        },
        getSlug: function() {
            return this.get('name').replace(/ /g, '-')
        },
        getEnvironments: function() {
            var environments = _.keys(this.get('results').at(0).get('screenshots'));

            if(_.isArray(environments) && environments.indexOf('diff') > -1) {
                environments = ['diff'].concat(_.without(environments, 'diff'));
            }

            return environments;
        },
        getViewports: function() {
            var viewports = this.get('results').pluck('viewport');
            return viewports;
        },
        getDiff: function(viewport) {
            return Math.ceil(this.get('results').find(function(model) {
                return model.get('viewport').name === viewport;
            }).get('diff'));
        }
    });
    return Model;
});
