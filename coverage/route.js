Route = function(path,name) {
    this.path = path.replace('(/','/(').replace('!/','');
    this.name = name;
    this.fragments = this.path.split('/');
    this.variants = [];

    this.init();
}

Route.prototype = {
    path: null,
    name: null,
    fragments: [],

    init: function(){
        var self = this;
        self.variants = this.buildVariants(self.fragments);
    },

    /**
     * Used to build all possible route variants, depending on optionality of its fragments.
     * @param {Array} fragments
     * @return {Array} variants - an array of all possible variants represented by RouteVariant objects
     */
    buildVariants: function(fragments){
        var self = this;

        //count optional route fragments
        var count = 0;
        for(var i=0; i<fragments.length; i++) {
            var fragment = fragments[i];
            if(self.isFragmentOptional(fragment))
                count++;
        }

        //build a binary helper array
        var opt = [];
        for(i=0; i<count; i++) {
            opt[i] = Math.pow(2,count)/Math.pow(2,i+1);
        }

        var variants = [];
        var k = 0;

        //build all variants possible to make with current route's fragments
        for(i=0; i<fragments.length; i++) {
            fragment = fragments[i];

            var printOpt = true;
            for(var j=0;j<Math.pow(2,count);j++) {
                if(opt.length > 0 && (j % opt[k] == 0))
                    printOpt = !printOpt;

                if(!utils.isArray(variants[j]))
                    variants[j] = [];
                if(!self.isFragmentOptional(fragment)) {
                    variants[j].push(fragment);
                } else if(printOpt) {
                    variants[j].push(fragment);
                }
            }

            if(self.isFragmentOptional(fragment))
                k++;
        }

        var tmp = [];
        for(i=0; i<variants.length; i++) {
            tmp.push(new RouteVariant(variants[i]));
        }

        return tmp;
    },

    test: function(tests){
        var self = this;

        for(var i=0; i<tests.length; i++) {
            for(var j=0; j<self.variants.length; j++) {
                self.variants[j].test(tests[i]);
            }
        }
    },

    /**
    * Used to determine whether a given route fragment is optional or not. In backbone.js that could be "base(/fragment)".
    * @param {string} fragment
    * @return {boolean} true of false
    */
    isFragmentOptional: function(fragment){
        return /\(.[^\)]*\)/.test(fragment);
    },

    /**
     * Used to determine whether a given route fragment is variable. In backbone.js that could be "base/:fragment".
     * @param {string} fragment
     * @return {boolean} true of false
     */
    isFragmentVariable: function(fragment){
        return (fragment.indexOf(':') === 0 || Route.prototype.isFragmentOptional(fragment) && fragment.indexOf(':') === 1);
    },

    mapException: function(route){
        for(var i=0;i<coverageConfig.exceptions.length;i++) {
            var exc = coverageConfig.exceptions[i];

            if(exc.route == route)
                return exc.mapTo;
        }
        return false;
    }
}
