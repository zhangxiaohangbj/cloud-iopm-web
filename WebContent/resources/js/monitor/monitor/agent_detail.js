define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/detail.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		var hashArr = Common.hash.split('/');
	    var id = hashArr[hashArr.length-1];
	    Common.render(true,"tpls/monitor/monitor/agent/detail.html","monitor/v2/agents/"+id,function(){
	    	Common.$pageContent.removeClass("loading");
	    });
    	
	};
	return {
		init: init
	}
})
