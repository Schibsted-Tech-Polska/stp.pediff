define([
    'jquery',
    'backbone',
    'lodash'
], function($, Backbone, _) {
    var current = 'application',
        available,
        storage,
        applicationStorage,
        getStorage;

    try {
        if(typeof(Storage) !== 'undefined' && localStorage && sessionStorage) {
            available = ['application', 'session', 'local'];
        } else {
            available = ['application'];
        }
    } catch (e) {
        available = ['application'];
    }

    applicationStorage = {
        items: {},
        length: function() {
            var length = 0, key;
            for (key in this.items) {
                if(this.items.hasOwnProperty(key)) {
                    length++;
                }
            }
            return length;
        },
        key: function(i) {
            var key, j = 0;
            for (key in this.items) {
                if(j++ === i) {
                    return key;
                }
            }
            return null;
        },
        setItem: function(key, data) {
            this.items[key] = data;
        },
        getItem: function(key) {
            if(typeof this.items[key] !== 'undefined') {
                return this.items[key];
            } else {
                return null;
            }
        },
        removeItem: function(key) {
            if(typeof this.items[key] !== 'undefined') {
                this.items[key] = undefined;
                try {
                    delete this.items[key];
                } catch (e) {
                }
            }
        },
        clear: function() {
            this.items = {};
        }
    };

    getStorage = function() {
        switch (current) {
            case 'application':
                return applicationStorage;
            case 'local':
                return localStorage;
            case 'session':
                return sessionStorage;
        }
    };

    storage = {
        use: function(type) {
            if(available.indexOf(type) > -1) {
                current = type;
            }
            return this;
        },
        set: function(key, value) {
            var storage = getStorage();

            if(current !== 'application' && !_.isString(value)) {
                value = JSON.stringify(value);
            }

            try {
                storage.setItem(key, value);
            } catch (error) {

            }
        },
        get: function(key) {
            var storage = getStorage(),
                value = storage.getItem(key);

            if(current !== 'application') {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                }
            }

            return value;
        },
        remove: function(key) {
            var storage = getStorage();

            storage.removeItem(key);
        }
    };

    return storage;
});
