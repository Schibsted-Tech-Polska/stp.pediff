define([
    'jquery',
    'backbone',
    'lodash',
    'models/result'
], function($, Backbone, _, Result) {
    var Collection = Backbone.Collection.extend({
        model: Result,
        parse: function(data) {
            return data;
        }
    });
    return Collection;
});
