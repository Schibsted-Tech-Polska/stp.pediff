var Casper = require(phantom.casperPath + '/modules/casper').Casper,
    utils = require(phantom.casperPath + '/modules/utils'),
    cli = require(phantom.casperPath + '/modules/cli');

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
 * Merge global config object from /config directory with current task specific options, set up
 * necessary properties.
 *
 * @param {Object} task
 */
Pediff.prototype.init = function(task){
    this.config = this.mergeRecursive(require('./config'), task.config);
    this.options = this.mergeRecursive(this.options, this.config.options);
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
 * Convenience wrapper method for casper.capture and casper.captureSelector methods. Redirects output
 * to appropriate environment directory.
 * @see http://casperjs.org/api.html#casper.capture
 *
 * @param {string} filename name of the file to be written
 * @param {string} selector optional css or xpath selector
 */
Pediff.prototype.save = function(filename, selector){
    if (this.options.verbose){
        console.log('[' + this.environment + '@' + this.options.viewportSize.width + 'x' +
                this.options.viewportSize.height + '] ' + filename + '.' + this.config.output.extension);
    }
    if (selector === undefined){
        this.capture(this.environment + '/' + this.options.viewportSize.width + 'x' +
                this.options.viewportSize.height + '_' + filename  + '.' + this.config.output.extension,
                {top: 0, left: 0, width: this.options.viewportSize.width,
                    height: this.options.viewportSize.height});
    } else {
        this.captureSelector(this.environment + '/' + filename  + '.' + this.config.output.extension,
                selector);
    }
};

/**
 * Merge javascript objects recursively
 * @link http://phpjs.org/functions/array_merge_recursive/
 */
Pediff.prototype.mergeRecursive = function(arr1, arr2){
    var idx = '';
    if (arr1 && Object.prototype.toString.call(arr1) === '[object Array]' &&
            arr2 && Object.prototype.toString.call(arr2) === '[object Array]'){
                for (idx in arr2){
                    arr1.push(arr2[idx]);
                }
            } else if ((arr1 && (arr1 instanceof Object)) && (arr2 && (arr2 instanceof Object))){
                for (idx in arr2){
                    if (idx in arr1){
                        if (typeof arr1[idx] == 'object' && typeof arr2 == 'object'){
                            arr1[idx] = this.mergeRecursive(arr1[idx], arr2[idx]);
                        } else {
                            arr1[idx] = arr2[idx];
                        }
                    } else {
                        arr1[idx] = arr2[idx];
                    }
                }
            }
    return arr1;
};

module.exports = Pediff;
