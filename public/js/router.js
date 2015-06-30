define([
    'views/main'
], function(MainView) {
    var Router = Backbone.Router.extend({
        routes: {
            ".*": "main"
        },

        start: function() {
            Backbone.history.start();
        },

        main: function() {
            this.trigger('viewChange', MainView);
        }
    });

    return Router;
});
