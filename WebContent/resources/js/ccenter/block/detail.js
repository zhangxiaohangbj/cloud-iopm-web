define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/detail.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		var volume_id = Common.getParam();
		var tmpDetailData = {
	            name : "Tiger Nixon",
	            id: "di91jd9d29f9f29",
	            size:"20GB",
	            status: "in-use",
	            vm_id: "private",
	            type: "ceth(分布式)",
	            vdc_id : "vdc1",
	            available_zone: "WDK1",
	            read_only:"1",
	            description:"可用磁盘数据",
	            mount_list: [{
	            	name:'nexus-server',
	            	id: 'nexus-server'
	            }],
	            mount_path: '/opt/vdc',
	            create_time: '2015-04-24 17:14:57'
    	};
    	Common.render(true,'tpls/ccenter/block/volume/detail.html',tmpDetailData,function(html){
    		bindEvent();
    	});
	};
	function bindEvent(){
		Common.$pageContent.removeClass("loading");
	}
	return {
		init: init
	}
})
