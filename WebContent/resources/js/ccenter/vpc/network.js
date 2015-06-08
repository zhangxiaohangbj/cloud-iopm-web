define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//需要修改为真实数据源
		Common.render(true,'tpls/ccenter/vpc/network.html','/resources/data/network.txt',function(){
			bindEvent();
		});
	};
	
	var bindEvent = function(){
		
	}	
	return {
		init : init
	}
})
