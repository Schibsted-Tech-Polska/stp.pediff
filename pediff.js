var Casper = require(phantom.casperPath + '/modules/casper').Casper,
    utils = require(phantom.casperPath + '/modules/utils'),
    fs = require('fs');

function Pediff(){
    Pediff.super_.apply(this, arguments);
}

utils.inherits(Pediff, Casper);

/**
 * Set the environment that the app is currently working in (eg. current, candidate).
 * Used for establishing output path for the page screenshots.
 *
 * @param {string} environment
 */
Pediff.prototype.setEnvironment = function(environment){
    this.environment = environment;
};

/**
 * Set the viewport size that the app is currently working with.
 *
 * @param {string} viewportSize
 */
Pediff.prototype.setViewportSize = function(viewportSize){
    this.viewportSize = viewportSize;
};

/**
 * Merge global config object from /config directory with current task specific options, set up
 * necessary properties.
 *
 * @param {Object} task
 */
Pediff.prototype.init = function(task){
    this.config = utils.mergeObjects(require('./config'), task.config);
    utils.mergeObjects(this.options, this.config.options);
    this.options.onResourceRequested = this.setMocks;
    this.execute = task.execute;
};

/**
 * Intercept requests matching keys from config.mocks and replace responses with corresponding
 * mocks from /mocks directory.
 * @see https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage#wiki-webpage-onResourceRequested
 *
 * @param {Object} pd Pediff instance
 * @param {Object} requestData
 * @param {Object} networkRequest
 */
Pediff.prototype.setMocks = function(pd, requestData, networkRequest){
    for (var key in this.config.mocks){
        if (requestData.url.split('/').pop() === key){
            networkRequest.changeUrl('./mocks/' + this.config.mocks[key]);
            break;
        }
    }
};

/**
 * Inject all custom CSS rules into head
 * @param {Object} pd Pediff instance
 */
Pediff.prototype.preExecute = function(pd){
    var styleString = '<style>';
    for (var key in this.config.css){
        styleString += key + ' { ' + this.config.css[key] + ' } ';
    }
    styleString += '</style>';

    this.evaluate(function(styleString) {
        $('head').append($(styleString));
    }, styleString);
};

/**
 * Convenience wrapper method for casper.capture and casper.captureSelector methods. Redirects output
 * to appropriate environment directory.
 * @see http://casperjs.org/api.html#casper.capture
 *
 * @param {string} filename name of the file to be written
 * @param {string} selector optional css or xpath selector
 */
Pediff.prototype.save = function(filename, selector){
    filename = this.config.package + ((filename) ? '@' + filename : '');
    this.wait(500,function(){
        if (this.options.verbose){
            console.log('[' + this.environment + '@' + this.viewportSize.width + 'x' +
                this.viewportSize.height + '] ' + filename + '.' + this.config.output.extension);
        }

        //save HTML for debugging purposes
        fs.write(this.environment + '/html/' + this.viewportSize.width + 'x' +
            this.viewportSize.height + '_' + filename  + '.html',this.getHTML(),'w');

        if (selector === undefined){
            this.capture(this.environment + '/' + this.viewportSize.width + 'x' +
                this.viewportSize.height + '_' + filename  + '.' + this.config.output.extension);
        } else {
            this.captureSelector(this.environment + '/' + this.viewportSize.width + 'x' +
                this.viewportSize.height + '_' + filename  + '.' + this.config.output.extension,
                selector);
        }

        this.captureMedia(filename);
    });
};

/**
 * Helper method allowing to use current stylesheet sections designed for specific media (such as print, handheld, ...)
 * as the default stylesheet. Used internally.
 * @param {string} filename name of the file to be written
 */
Pediff.prototype.captureMedia = function(filename){
    for(var media in this.config.media) {
        if(this.config.media[media] && typeof(this['media_'+media+'_'+this.environment]) == 'undefined') {
            this['media_'+media+'_'+this.environment] = true;

            this.viewport(this.config.media[media].width, this.config.media[media].height, function(){

                var data = this.evaluate(function() {
                    var $stylesheet = $('link[rel="stylesheet"][href*="main"]');
                    var url = $stylesheet.attr('href');
                    $stylesheet.remove();
                    return __utils__.sendAJAX('http:'+url, 'GET', null, false);
                });
                var styleString = '<style>'+data.replace('@media '+media,'@media screen')+'</style>';

                this.evaluate(function(styleString) {
                    $('head').append($(styleString));
                }, styleString);

                this.capture(this.environment + '/'  + this.config.media[media].width + 'x' +
                    this.config.media[media].height + '_' + media + '_' + filename  + '.' + this.config.output.extension);

            });
        }
    }
}

module.exports = Pediff;
