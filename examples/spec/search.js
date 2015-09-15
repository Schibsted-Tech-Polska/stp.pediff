module.exports = {
    path: '',
    options: {},
    run: function() {
        this.waitForSelector('body');
        this.thenEvaluate(function() {
            $('input[name="q"]').val('pediff');
            $('form').submit();
        });
        this.then(function() {
            this.wait(1000);
        });
    }
};
