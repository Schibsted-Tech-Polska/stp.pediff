define(['collections/results'], function(ResultsCollection) {
    var Model = Backbone.Model.extend({
        defaults: {},
        parse: function(data) {
            data.results = new ResultsCollection(data.results, {parse: true});
            return data;
        },
        getClass: function() {
            return 'spec-' + this.get('name')
        }
    });
    return Model;
});
