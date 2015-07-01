define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/detail.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		var hashArr = Common.hash.split('/');
	    var id = hashArr[hashArr.length-1],
	    	type = hashArr[hashArr.length-2],
	    	ajaxUrl,linkUrl,linkName;
	    if(type == 'volume'){
	    	ajaxUrl = "get volume snapshot detail url";
	    	linkUrl = "#ccenter/snapshot/volume";
	    	linkName = "磁盘快照";
	    }else{
	    	ajaxUrl = "get vm snapshot detail url";
	    	linkUrl = "#ccenter/snapshot/vm";
	    	linkName = "主机快照";
	    }
	    ajaxUrl = '/identity/v2.0/tenants';
	    Common.xhr.get(ajaxUrl,function(detail){
			detail = {
		            name : "Tiger Nixon",
		            id: "di91jd9d29f9f29",
		            size:"20GB",
		            status: "in-use",
		            vm_id: "private",
		            type: "ceth(分布式)",
		            vdc_id : "vdc1",
		            available_zone: "WDK1",
		            description:"可用磁盘数据",
		            mount_list: [{
		            	name:'nexus-server',
		            	id: 'nexus-server'
		            }],
		            create_time: '2015-04-24 17:14:57'
	    	};
			detail.linkName = linkName;
			detail.linkUrl = linkUrl;
			Common.render(true,'tpls/ccenter/snapshot/detail.html',detail,function(html){
				Common.$pageContent.removeClass("loading");
	    	});
		});
    	
	};
	return {
		init: init
	}
})
