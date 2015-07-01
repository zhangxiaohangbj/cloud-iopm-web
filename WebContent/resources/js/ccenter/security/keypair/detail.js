define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/detail.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		var hashArr = Common.hash.split('/');
	    var id = hashArr[hashArr.length-1];
	    var current_vdc_id = Common.cookies.getVdcId();
	    Common.render(true,"tpls/ccenter/security/keypair/detail.html","/compute/v2/"+current_vdc_id+"/os-keypairs/"+id,function(){
	    	Common.$pageContent.removeClass("loading");
	    });
    	
	};
	return {
		init: init
	}
})
