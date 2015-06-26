var timers = {};

var time = function(key, force) {
    if(typeof timers[key] === 'undefined' || force === true) {
        timers[key] = Date.now();
        return true;
    } else {
        var elapsed = (Date.now() - timers[key]) / 1000;
        delete timers[key];
        return elapsed;
    }
};

module.exports = time;
