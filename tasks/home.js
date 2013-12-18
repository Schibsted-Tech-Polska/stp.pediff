module.exports = {
    config: {
        path: '?',
        options: {
            viewportSize: [{width: 1440, height: 900}]
        },
        media: {
            print: false
        },
        package: 'homepage',
        actions: ['input-entered']
    },
    execute: function(){
        this.save();

        this.then(function(){
             this.waitForSelector('input', function(){
                 this.sendKeys('input', 'phrase', {keepFocus: true});
                 this.save(this.config.actions[0]);
             }, function(){}, 10000);
        })
    }
};
