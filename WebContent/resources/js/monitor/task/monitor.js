define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	Common.requestCSS('css/dialog.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/monitor/task/monitor/taskList.html',
			data:'/cloud/task/task?deleted=false',
			beforeRender: function(data){
				return data;
			},
			callback: bindTaskEvent
		});
	};
	
	var commonEvent = {
		timeButtons: function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add" name="day">一天</span>'
			);
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add" name="week">一周</span>'
			);
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add" name="month">一月</span>'
			);
		}
	}
	
	var bindTaskEvent = function(){
		debugger
		//dataTables
		Common.initDataTable($('#monitorTable'),function($tar){debugger
			commonEvent.timeButtons($tar);
			
			//这个必须添加，不然就是隐藏的效果，看不到页面
			Common.$pageContent.removeClass("loading");
		});
		$("[data-toggle='tooltip']").tooltip();
		
		//默认显示当天的日志
		$("[name=day]").css({"background-color":"#8F8F8F"});
		
		//running  failed  success
	    $("#monitorTable_wrapper a.instanceList").on("click",function(){
	    	debugger;
	    	var id = $(this).attr("data");
	    	var name = $(this).attr("name");
	    	Common.render(true,{
				tpl:'tpls/monitor/task/monitor/list.html',
				data:'/cloud/task/instance?deleted=false',
				beforeRender: function(data){
					return data;
				},
				callback: bindEvent
			});
	    })
	}
	
	var bindEvent = function(){
		debugger
		//dataTables
		Common.initDataTable($('#monitorTable'),function($tar){debugger
			commonEvent.timeButtons($tar);
		
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add" name="back">返回</span>'
			);
			$tar.prev().find('.right-col:first').append(
					'<a href="javascript:void(0)" class="instanceList" name="running" data="{{item.id}}"><font color="#FFD700"><strong>running(12)</strong></font></a>&nbsp;&nbsp;&nbsp;&nbsp;'+
					'<a href="javascript:void(0)" class="instanceList" name="failed" data="{{item.id}}"><font color="#FF3030"><strong>failed(5)</strong></font></a>&nbsp;&nbsp;&nbsp;&nbsp;'+
					'<a href="javascript:void(0)" class="instanceList" name="success" data="{{item.id}}"><font color="#00FF00"><strong>success(90)</strong></font></a>'
			);
			//这个必须添加，不然就是隐藏的效果，看不到页面
			Common.$pageContent.removeClass("loading");
		});
		$("[data-toggle='tooltip']").tooltip();
		
		//默认显示当天的日志
		$("[name=day]").css({"background-color":"#8F8F8F"});
		$("[name=back]").on("click",function(){
			//先获取数据，进行加工后再去render
			Common.render(true,{
				tpl:'tpls/monitor/task/monitor/taskList.html',
				data:'/cloud/task/task?deleted=false',
				beforeRender: function(data){
					return data;
				},
				callback: bindTaskEvent
			});
		})
		
		//running  failed  success
	    $("#monitorTable_wrapper a.instanceList").on("click",function(){
	    	debugger;
	    	var id = $(this).attr("data");
	    	var name = $(this).attr("name");
	    	Common.render(true,{
				tpl:'tpls/monitor/task/monitor/list.html',
				data:'/cloud/task/instance?deleted=false',
				beforeRender: function(data){
					return data;
				},
				callback: bindEvent
			});
	    })
		
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
	    	            onshown : cb,
	    	            size : Modal.SIZE_WIDE
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
	    
	}	
	return {
		init : init
	}
})
