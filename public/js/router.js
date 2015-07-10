define([
    'views/run',
    'views/result',
    'views/error'
], function(RunView, ResultView, ErrorView) {
    var Router = Backbone.Router.extend({
        routes: {
            "!/error": "error",
            "!/run": "run",
            "!/result/:slug": "result"
        },

        start: function() {
            Backbone.history.start();
        },

        run: function() {
            this.trigger('viewChange', RunView);
        },

        result: function(slug) {
            this.trigger('viewChange', ResultView, slug);
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
