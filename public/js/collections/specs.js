define([
    'jquery',
    'backbone',
    'lodash',
    'models/spec'
], function($, Backbone, _, Spec) {
    var Collection = Backbone.Collection.extend({
        model: Spec,
        parse: function(data) {
            return data;
        }
    });
    return Collection;
});
