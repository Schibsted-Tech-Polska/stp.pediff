define([
    'jquery',
    'backbone',
    'lodash',
    'socket',
    'utils',
    'views/specs-list',
    'models/run',
    'collections/specs'
], function($, Backbone, _, Socket, utils, SpecsListView, Run, SpecsCollection) {
    var instance,
        Application = {
            initialize: function(router) {
                this.$container = $('.current-view-container');

                Socket.initialize();

                $('.pediff-logo').addClass('in');

                this.initializeRouter(router);

                if(Socket.enabled) {
                    // handle websocket communication
                } else {
                    // TODO: override Backbone.Sync to use a loaded json file as data source
                    this.runStaticReport();
                }
            },
            initializeRouter: function(router) {
                this.router = router;

                this.listenToOnce(this, 'ready', function() {
                    this.router.on('viewChange', function(view, options) {
                        this.setCurrentView(view, options);
                    }, this);

                    this.router.start();
                }.bind(this));
            },
            loadReport: function() {
                if(window.report) {
                    var deferred = new $.Deferred();

                    deferred.resolve(window.report);

                    return deferred;
                } else {
                    var url = window.location.href;

                    url = url.replace(window.location.hash, '');

                    if(url.indexOf('public/index.html') > -1) {
                        url = url.replace('public/index.html', 'public/results/report.json');
                    } else {
                        url += 'results/report.json';
                    }

                    return $.get(url);
                }
            },
            runStaticReport: function() {
                this.loadReport()
                    .done(function(data) {
                        utils.storage.use('application').set('report', data);

                        this.run = new Run(data, {parse: true});

                        this.specsView = new SpecsListView({
                            el: $('.specs-list-view-container'),
                            collection: new SpecsCollection(data.specs, {parse: true})
                        });
                        this.specsView.render();

                        this.listenTo(this.router, 'route', this.specsView.trigger.bind(this.specsView, 'route'));

                        this.trigger('ready');
                    }.bind(this))
                    .fail(function() {
                        this.router.navigate('!/error', {
                            trigger: true,
                            replace: false
                        });
                    }.bind(this));
            },
            setCurrentView: function(View, options) {
                if(this.currentView) {
                    this.currentView.undelegateEvents();
                    this.currentView.stopListening();
                    this.$container.empty();

                    if(_.isFunction(this.currentView.destroy)) {
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
