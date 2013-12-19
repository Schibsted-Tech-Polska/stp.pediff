exports.pages = function(pages){
	var arr = [];
	var i = '1';
	do{
		arr.push('page'+i);
	}while(i++ < pages);
	return arr;
}

// console.log(exports.pages(0)) // -> [ 'page1' ]
// console.log(exports.pages(1)) // -> [ 'page1' ]
// console.log(exports.pages(2)) // -> [ 'page1', 'page2' ]
// console.log(exports.pages(3)) // -> [ 'page1', 'page2', 'page3' ]
// console.log(exports.pages(4)) // -> [ 'page1', 'page2', 'page3', 'page4' ]

exports.exec = function(){
    this.then(function(response){

        var withoutPage = response.url.replace('&page=0', '&page=');
        var urls = this.config.actions.map(function(el){
        	return el.replace('page', withoutPage);
        });

        function runMore(){
        		this.wait(2000, function(){
	            this.save();

	            this.eachThen(urls, function(response) {
	                this.thenOpen(response.data, function(response) {

	                    this.waitUntilVisible('.alf-template', savePage, savePage, 5000);
	                    function savePage () {
	                    	this.wait(2000, function(){
	                        this.save('page'+response.url.slice(-1));
	                        console.log('Opened', response.url);
	                      });
	                    }

	                });
	            });
	           });
        };

        this.waitUntilVisible('.alf-template', runMore.bind(this), runMore.bind(this), 5000);
    })

}
