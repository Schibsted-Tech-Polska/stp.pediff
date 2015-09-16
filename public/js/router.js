define([
    'jquery',
    'backbone',
    'lodash',
    'views/run',
    'views/spec',
    'views/error'
], function($, Backbone, _, RunView, SpecView, ErrorView) {
    var Router = Backbone.Router.extend({
        routes: {
            "!/error": "error",
            "!": "run",
            "": "run",
            "!/run": "run",
            "!/spec/:slug": "spec"
        },

        start: function() {
            Backbone.history.start();
        },

        run: function() {
            this.trigger('viewChange', RunView);
        },

        spec: function(slug) {
            this.trigger('viewChange', SpecView, slug);
        },

        error: function() {
            this.trigger('viewChange', ErrorView);
        },

        main: function() {
            //this.trigger('viewChange', MainView);
        }
    });

    return Router;
});
