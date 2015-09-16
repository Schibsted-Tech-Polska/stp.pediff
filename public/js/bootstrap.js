require.config({
    baseUrl: 'js',
    enforceDefine: true,
    paths: {
        'text': 'vendor/requirejs/text',
        'templates': '../templates',
        'jquery': [
            '//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min',
            'vendor/jquery-1.11.2.min'
        ],
        'lodash': [
            '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min',
            'vendor/lodash-2.4.1.min'
        ],
        'backbone': [
            '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone.min',
            'vendor/backbone-1.1.2.min'
        ],
        'materialize': 'vendor/materialize.amd'
    },
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'materialize': {
            deps: ['jquery']
        }
    },
    map: {
        '*': {
            'underscore': 'lodash'
        }
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

define([
    'jquery',
    'backbone',
    'lodash',
    'application',
    'router',
    'materialize'
], function($, Backbone, _, Application, Router, Materialize) {
    Application.initialize(new Router());
});
