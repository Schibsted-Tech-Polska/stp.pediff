define([
    'jquery',
    'backbone',
    'lodash'
], function($, Backbone, _) {
    var codes = {
        'left':  37,
        'right': 39,
        'up': 38,
        'down': 40,
        'cmd': 91,
        'ctrl': 17
    };

    var View = Backbone.View.extend({
        events: {
            'click .tab a': 'onTabClick'
        },
        initialize: function() {
            $(document).on('keyup.' + this.cid, this.onKeyup.bind(this));
            $(document).on('keydown.' + this.cid, this.onKeydown.bind(this));
        },
        destroy: function() {
            $(document).off('keyup.' + this.cid, this.onKeyup.bind(this));
            $(document).off('keydown.' + this.cid, this.onKeydown.bind(this));
            this.undelegateEvents();
            this.stopListening();
            this.$el.empty();
        },
        onKeyup: function(event) {
            if(event.keyCode === codes.ctrl) {
                return this.ctrl = false;
            }
            if(event.keyCode === codes.cmd) {
                return this.cmd = false;
            }
        },
        onKeydown: function(event) {
            var code = event.keyCode;

            if(code === codes.ctrl) {
                event.preventDefault();
                return this.ctrl = true;
            }
            if(code === codes.cmd) {
                event.preventDefault();
                return this.cmd = true;
            }

            if(this.ctrl || this.cmd) {
                if(code === codes.left) {
                    event.preventDefault();
                    this.trigger('navigate', {
                        type: 'viewport',
                        direction: 'previous'
                    });
                }
                if(code === codes.right) {
                    event.preventDefault();
                    this.trigger('navigate', {
                        type: 'viewport',
                        direction: 'next'
                    });
                }

                if(code === codes.up) {
                    event.preventDefault();
                    this.trigger('navigate', {
                        type: 'spec',
                        direction: 'previous'
                    });
                }
                if(code === codes.down) {
                    event.preventDefault();
                    this.trigger('navigate', {
                        type: 'spec',
                        direction: 'next'
                    });
                }
            } else {
                if(code === codes.left) {
                    event.preventDefault();
                    this.trigger('navigate', {
                        type: 'environment',
                        direction: 'previous'
                    });
                }
                if(code === codes.right) {
                    event.preventDefault();
                    this.trigger('navigate', {
                        type: 'environment',
                        direction: 'next'
                    });
                }
            }
        }
    });
    return View;
});
