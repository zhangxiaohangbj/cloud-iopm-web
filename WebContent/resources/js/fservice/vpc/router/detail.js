define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/detail.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		var hashArr = Common.hash.split('/');
	    var id = hashArr[hashArr.length-1];
	    Common.render(true,"tpls/fservice/vpc/router/detail.html","/networking/v2.0/routers/"+id,function(){
	    	Common.$pageContent.removeClass("loading");
	    });
    	
	};
	return {
		init: init
	}
})
