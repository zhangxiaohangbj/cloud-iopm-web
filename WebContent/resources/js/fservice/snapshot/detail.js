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
	    	linkUrl = "#fservice/snapshot/volume";
	    	linkName = "磁盘快照";
	    }else{
	    	ajaxUrl = "get vm snapshot detail url";
	    	linkUrl = "#fservice/snapshot/vm";
	    	linkName = "主机快照";
	    };
	    var volumeStatus = {
				available: "可用", 
				attaching: "挂载中", 
				backing_up: "备份", 
				creating: "正在创建", 
				deleting: "正在删除", 
				downloading: "下载中", 
				uploading: "上传中", 
				error: "错误", 
				error_deleting: "删除错误", 
				deleted: "已删除", 
				error_restoring: "恢复错误", 
				in_use: "使用中", 
				restoring_backup: "恢复中", 
				unrecognized: "未知"	
			};
	    ajaxUrl = '/identity/v2.0/tenants';
	    Common.xhr.get(ajaxUrl,function(detail){
	    	detail = {
		            name : "Tiger Nixon",
		            id: "di91jd9d29f9f29",
		            size:"20",
		            status: "in_use",
		            vmId: "private",
		            type: "ceth(分布式)",
		            vdc_id : "vdc1",
		            availability_zone: "WDK1",
		            description:"可用磁盘数据",
		            'os-vol-tenant-attr:tenant_id': 'vdc1',
		            created_at: '2015-04-24 17:14:57'
	    	};
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
		            vm_id: {
		            	desc: "挂载主机",
		            	value: detail.vmId
		            },
		            type: {
		            	desc: "卷类型",
		            	value: (function(){
		            		return detail.volume_type == '' ? 'ceth(分布式)' : 'iscsi';
		            	})()
		            },
		            vdc_id : {
		            	desc: "虚拟数据中心",
		            	value: detail['os-vol-tenant-attr:tenant_id']
		            },
		            available_zone: {
		            	desc: "可用域",
		            	value: detail.availability_zone
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
