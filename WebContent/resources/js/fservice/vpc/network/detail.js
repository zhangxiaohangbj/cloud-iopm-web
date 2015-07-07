define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/detail.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		var hashArr = Common.hash.split('/');
	    var id = hashArr[hashArr.length-1];
	    Common.render(true,"tpls/fservice/vpc/network/detail.html","/networking/v2.0/networks/"+id,function(){
	    	Common.$pageContent.removeClass("loading");
	    	Common.render(false,'tpls/fservice/vpc/network/subnetlist.html','/networking/v2.0/subnets?network_id='+id,function(html){
				$('#subnetTableDiv').html(html);
			});
	    });
    	
	};
	return {
		init: init
	}
})
