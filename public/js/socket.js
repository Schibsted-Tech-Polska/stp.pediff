define([
    'jquery',
    'backbone',
    'lodash'
], function($, Backbone, _) {
    var instance,
        Socket = {
            initialize: function() {
                if(typeof io !== 'undefined') {
                    this.socket = new io(window.location.protocol + '//' + window.location.host);
                    this.socket.on('message', this.trigger.bind(this, 'message'));
                    this.enabled = true;
                }
            },
            emit: function() {
                if(this.enabled) {
                    this.socket.emit.apply(this.socket, arguments);
                }
            },
            on: function() {
                if(this.enabled) {
                    this.socket.on.apply(this.socket, arguments);
                }
            },
            once: function() {
                if(this.enabled) {
                    this.socket.once.apply(this.socket, arguments);
                }
            }
        };

    if(!instance) {
        instance = _.extend(Socket, Backbone.Events);
    }

    return instance;
});
