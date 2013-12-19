exports.pages = ['page1', 'page2', 'page3', 'page4', 'page5', 'page6'];

exports.exec = function(){
    this.then(function(response){

        var withoutPage = response.url.replace('&page=0', '&page=');
        var urls = exports.pages.map(function(el){
        	return el.replace('page', withoutPage);
        });
        //[withoutPage+'1', withoutPage+'2', withoutPage+'3', withoutPage+'4', withoutPage+'5'];

        function runMore(){
        		this.wait(1000, function(){
	            this.save();

	            this.eachThen(urls, function(response) {
	                this.thenOpen(response.data, function(response) {

	                    this.waitUntilVisible('.alf-template', savePage, savePage, 9000);
	                    function savePage () {
	                    	this.wait(1000, function(){
	                        this.save('page'+response.url.slice(-1));
	                        console.log('Opened', response.url);
	                      });
	                    }

	                });
	            });
	           });
        };

        this.waitUntilVisible('.alf-template', runMore.bind(this), runMore.bind(this), 15000);
    })

}
