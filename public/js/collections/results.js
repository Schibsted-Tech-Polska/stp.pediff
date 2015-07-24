define([
    'models/result'
], function(Result) {
    var Collection = Backbone.Collection.extend({
        model: Result,
        parse: function(data) {
            return data;
        }
    });
    return Collection;
});
