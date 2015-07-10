define([
    'models/result'
], function(Result) {
    var Collection = Backbone.Collection.extend({
        model: Result
    });
    return Collection;
});
