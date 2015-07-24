define(['collections/results'], function(ResultsCollection) {
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
            return _.keys(this.get('results').at(0).get('screenshots'));
        },
        getViewports: function() {
            return this.get('results').pluck('viewport');
        },
        getDiff: function(viewport) {
            return this.get('results').find(function(model) {
                return model.get('viewport').name === viewport;
            }).get('diff');
        }
    });
    return Model;
});
