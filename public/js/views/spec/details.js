define([
    'jquery',
    'backbone',
    'lodash',
    'utils',
    'text!templates/spec/details.html'
], function($, Backbone, _, utils, viewTemplate) {
    var View = Backbone.View.extend({
        events: {},
        initialize: function() {
        },
        destroy: function() {
            this.undelegateEvents();
            this.stopListening();
            this.$el.empty();
        },
        render: function() {
            var report = utils.storage.use('application').get('report');

            this.$el.html(_.template(viewTemplate, {
                model: this.model,
                environments: report.config.environments
            }));

            $('[data-tooltip]').tooltip();
        }
    });
    return View;
});
