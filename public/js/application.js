define([
    'socket',
    'views/specs',
    'models/run',
    'collections/specs'
], function(Socket, SpecsView, Run, SpecsCollection) {
    var instance,
        Application = {
            initialize: function(router) {
                this.$container = $('.current-view-container');

                Socket.initialize();

                $('.pediff-logo').addClass('in');

                if(Socket.enabled) {
                    // handle websocket communication
                } else {
                    // TODO: override Backbone.Sync to use a loaded json file as data source
                    this.runStaticReport();
                }

                // TODO: keyboard navigation layer

                this.initializeRouter(router);
            },
            initializeRouter: function(router) {
                this.router = router;
                this.router.on('viewChange', function(view, options) {
                    this.setCurrentView(view, options);
                }, this);
                this.router.start();
            },
            runStaticReport: function() {
                var url = window.location.href.replace('public/index.html', 'results/report.json');
                $.get(url)
                    .done(function(data) {
                        this.run = new Run(data, {parse: true});

                        this.specsView = new SpecsView({
                            el: $('.specs-view-container'),
                            collection: new SpecsCollection(data.specs, {parse: true})
                        });
                        this.specsView.render();

                        this.router.navigate('!/run', {
                            trigger: true,
                            replace: true
                        });
                    }.bind(this))
                    .fail(function() {
                        this.router.navigate('!/error', {
                            trigger: true,
                            replace: true
                        });
                    }.bind(this));
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
