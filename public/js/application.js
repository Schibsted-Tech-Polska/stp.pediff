define([
    'socket'
], function(Socket) {
    var instance,
        Application = {
            initialize: function(router) {
                this.$body = $('body');
                this.$container = $('#container');

                this.router = router;
                this.router.on('viewChange', function(view, options) {
                    this.setCurrentView(view, options);
                }, this);

                Socket.initialize();

                $('.pediff-logo').addClass('in');

                this.router.start();
            },
            setCurrentView: function(View, options) {
                if(this.currentView) {
                    this.currentView.undelegateEvents();
                    this.currentView.stopListening();
                    this.$container.empty();

                    if(this.currentView.destroy) {
                        this.currentView.destroy();
                    }
                }

                this.currentView = new View({
                    el: this.$container
                }, options || {});
                this.currentView.render();
            }
        };

    if(!instance) {
        instance = _.extend(Application, Backbone.Events);
    }

    return instance;
});
