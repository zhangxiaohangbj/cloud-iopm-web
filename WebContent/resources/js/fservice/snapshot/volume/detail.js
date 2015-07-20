define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/detail.css');
	var current_vdc_id = Common.cookies.getVdcId();
	var init = function(){
		Common.$pageContent.addClass("loading");
		var hashArr = Common.hash.split('/');
	    var id = hashArr[hashArr.length-1],
	    	type = hashArr[hashArr.length-3],
	    	ajaxUrl,linkUrl,linkName;
	    if(type == 'volume'){
	    	ajaxUrl = 'block-storage/v2/'+current_vdc_id+'/snapshots/'+id+'';
	    	linkUrl = "#fservice/snapshot/volume/";
	    	linkName = "磁盘快照";
	    }
	    var volumeStatus = {
				available: "可用", 
				creating: "正在创建", 
				deleting: "正在删除", 
				error: "错误", 
				error_deleting: "删除错误", 
				deleted: "已删除", 
				unrecognized: "未知"	
			};
	    Common.xhr.get(ajaxUrl,function(snapDetail){
	    	var detail = snapDetail.snapshot;
			data = {
		            name: {
		            	desc: "名称",
		            	value: detail.name
		            },
		            id: {
		            	desc: "ID",
		            	value: detail.id
		            },
					size: {
						desc: "容量",
		            	value: detail.size+'GB'
		            },
		            status: {
		            	desc: "状态",
		            	value: volumeStatus[detail.status]
		            },
		            type: {
		            	desc: "磁盘",
		            	value: detail.volumeName
		            },
		            description:{
		            	desc: "描述",
		            	value: detail.description
		            },
		            create_time: {
		            	desc: "创建时间",
		            	value: detail.created_at
		            }
	    	};
			var renderData = {
					detail: data,
		            linkName: linkName,
		            linkUrl: linkUrl
			}
			Common.render(true,'tpls/fservice/snapshot/detail.html',renderData,function(html){
				Common.$pageContent.removeClass("loading");
	    	});
		});
    	
	};
	return {
		init: init
	}
})
