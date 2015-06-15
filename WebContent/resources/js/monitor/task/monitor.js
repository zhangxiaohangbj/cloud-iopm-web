define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	Common.requestCSS('css/dialog.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/monitor/task/monitor/list.html',
			data:'/cloud/task/instance?deleted=false',
			beforeRender: function(data){
				return data;
			},
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		debugger
		//dataTables
		Common.initDataTable($('#monitorTable'),function($tar){debugger
			
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">批量删除</span>'
			);
			//这个必须添加，不然就是隐藏的效果，看不到页面
			Common.$pageContent.removeClass("loading");
		});
		$("[data-toggle='tooltip']").tooltip();
		
		var renderData = {};
        //初始化加载，不依赖其他模块
		var DataGetter = {
				
		}
		
		//事件处理
		var EventsHandler = {
    		
	    }
		
		//弹窗初始化
	    var EditData = {
	    	//详情弹框
	    	Detail : function(instanceId,cb){
	    		//需要修改为真实数据源
				Common.render('tpls/monitor/task/monitor/detail.html','/cloud/task/monitor?instanceId='+instanceId+'&deleted=false',function(html){
					Modal.show({
	    	            title: '监控明细',
	    	            message: html,
	    	            nl2br: false,
	    	            onshown : cb
	    	        });
				})
	    	}
	    }
		
	    //查看详情
	    $("#monitorTable_wrapper a.btn-opt").on("click",function(){
	    	EditData.Detail($(this).attr("data"),function(){
	    		EventsHandler.formValidator();
	    	});
	    });
	    
	    //删除
	    $("#monitorTable_wrapper a.delete").on("click",function(){
	    	debugger;
	    	var id = $(this).attr("data");
	    	Modal.confirm('确定要删除吗?', function(result){
	    		if(result) {
	    			Common.xhr.del('/cloud/task/instance/'+id,"",function(data){
    					if(data){
                			Modal.alert("删除成功",function(){
	                			Common.router.reload();
                			});
						}else{
							Modal.alert("删除失败",function(){
	                			
                			});
						}
					})
	    		}
	    	});
	    })
	}	
	return {
		init : init
	}
})
