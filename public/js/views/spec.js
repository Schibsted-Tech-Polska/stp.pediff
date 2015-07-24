define([
    'utils',
    'application',
    'socket',
    'models/spec',
    'views/spec/details',
    'views/spec/navigation',
    'views/spec/result',
    'text!templates/spec.html'
], function(utils, Application, Socket, Spec, DetailsView, NavigationView, ResultView, viewTemplate) {
    var View = Backbone.View.extend({
        events: {},
        initialize: function(options, slug) {
            if(Socket.enabled) {
            } else {
                var report = utils.storage.use('application').get('report');

                if(!report) {
                    return Application.router.navigate('!/run', {
                        trigger: true,
                        replace: true
                    });
                } else {
                    this.model = new Spec(_.find(report.specs, {name: slug}), {
                        parse: true
                    });
                }
            }
        },
        destroy: function() {
            this.detailsView.destroy();
            this.navigationView.destroy();
            _.each(this.resultViews, function(view) {
                view.destroy();
            });
        },
        render: function() {
            this.$el.html(_.template(viewTemplate, {model: this.model}));

            this.detailsView = new DetailsView({
                model: this.model,
                el: this.$('.details')
            });

            this.navigationView = new NavigationView({
                model: this.model,
                el: this.$('.navigation')
            });

            var $result = this.$('.result-view');
            this.resultViews = {};
            this.model.get('results').each(function(model) {
                this.resultViews[model.get('viewport').name] = new ResultView({
                    model: model,
                    el: $result
                });
            }.bind(this));

            this.listenTo(this.navigationView, 'change:environment', this.onEnvironmentChange.bind(this));
            this.listenTo(this.navigationView, 'change:viewport', this.onViewportChange.bind(this));

            this.detailsView.render();
            this.navigationView.render();
            this.getCurrentResultView().render();
        },

        getCurrentResultView: function(viewport) {
            if(viewport) {
                this.currentViewport = viewport;
            } else if(!this.currentViewport) {
                this.currentViewport = this.model.get('results').at(0).get('viewport').name;
            }
            return this.resultViews[this.currentViewport];
        },

        onEnvironmentChange: function(environment) {
            this.currentEnvironment = environment;
            this.getCurrentResultView().trigger('change:environment', environment);
        },

        onViewportChange: function(viewport) {
            this.getCurrentResultView(viewport).render(this.currentEnvironment);
        }
    });
    return View;
});
