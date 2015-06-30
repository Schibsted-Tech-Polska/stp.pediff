define([
    'config',
    'models/result'
], function(config, Result) {
    var Collection = Backbone.Collection.extend({
        model: Result
    });
    return Collection;
});
