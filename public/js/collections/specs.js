define([
    'models/spec'
], function(Spec) {
    var Collection = Backbone.Collection.extend({
        model: Spec,
        parse: function(data) {
            return data;
        }
    });
    return Collection;
});
