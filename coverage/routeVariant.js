RouteVariant = function(fragments) {
    this.fragments = fragments;
    this.tested = false;
    this.tests = [];
    this.init();
}

RouteVariant.prototype = {
    fragments: [],
    requiredCount: 0,
    tested: null,
    tests: [],

    init: function(){
        var self = this;
        for(var i=0; i<self.fragments.length; i++) {
            if(!Route.prototype.isFragmentOptional(self.fragments[i]))
                this.requiredCount++;
        }
    },

    toString: function(){
        var self = this;

        return self.fragments.join('/');
    },

    test: function(test){
        var self = this;

        var testRoute = test.getTestRoute();

        if(Route.prototype.mapException(self.toString()) === testRoute) {
            self.tests.push(test);
            self.tested = true;
            return true;
        }

        var fragments = testRoute.split('/');
        var matching = 0;

        var key = 0;
        for(var i=0; i<self.fragments.length; i++){

            var fragment = self.fragments[i];

            if(!Route.prototype.isFragmentOptional(fragment)) {
                if(!Route.prototype.isFragmentVariable(fragment)) {
                    if(fragment == fragments[key]) {
                        //found required static part
                        matching++;
                        key++;
                    } else {
                        //failure
                        break;
                    }
                } else {
                    if(typeof(fragments[key]) !== 'undefined') {
                        //found required variable
                        matching++;
                        key++;
                    } else {
                        //failure
                        break;
                    }
                }
            } else {
                if(typeof(fragments[key]) !== 'undefined') {
                    matching++;
                    key++;
                } else if(coverageConfig.skipOptional) {
                    matching++;
                    key++;
                }
            }

        }

        if(matching == self.fragments.length) {
            self.tests.push(test);
            self.tested = true;
            return true;
        } else {
            if((matching >= self.requiredCount) && coverageConfig.skipOptional)
                return true;
            else
                return false;
        }

    }
}
