define([
    'jquery',
    'backbone',
    'lodash',
    'text!templates/error.html'
], function($, Backbone, _, viewTemplate) {
    var View = Backbone.View.extend({
        events: {},
        render: function() {
            console.log('error view render')
            this.$el.html(_.template(viewTemplate));
        }
    });
    return View;
});
