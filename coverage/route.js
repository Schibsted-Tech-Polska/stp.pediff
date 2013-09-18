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
        this.buildVariants();
    },

    buildVariants: function(){
        var self = this;

        //count optional route fragments
        var count = 0;
        for(var i=0; i<self.fragments.length; i++) {
            var fragment = self.fragments[i];
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
        for(i=0; i<self.fragments.length; i++) {
            fragment = self.fragments[i];

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

        for(i=0; i<variants.length; i++) {
            self.variants.push(new RouteVariant(variants[i]));
        }
    },

    test: function(tests){
        var self = this;

        for(var i=0; i<tests.length; i++) {
            for(var j=0; j<self.variants.length; j++) {
                self.variants[j].test(tests[i]);
            }
        }
    },

    isFragmentOptional: function(fragment){
        return /\(.[^\)]*\)/.test(fragment);
    },

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
