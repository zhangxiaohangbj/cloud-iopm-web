define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var timeBucket = "day";  //当前选中的时间段  day/week/month
	var task_id = "";  //当前所查看的任务id
	var status = "running";  //当前所查看的任务监控的状态  running/failed/success
	var init = function(){
		Common.$pageContent.addClass("loading");
		
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/monitor/task/monitor/taskList.html',
			data:'/cloud/task/instance/task_instance_count?timeBucket='+timeBucket,
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
		Common.initDataTable($('#taskTable'),function($tar){debugger
			commonEvent.timeButtons($tar);
			
			//这个必须添加，不然就是隐藏的效果，看不到页面
			Common.$pageContent.removeClass("loading");
		});
		$("[data-toggle='tooltip']").tooltip();
		
		//默认显示当天的日志
		if(timeBucket == "day"){
			$("[name=day]").css({"background-color":"#8F8F8F"});
		}else if(timeBucket == "week"){
			$("[name=week]").css({"background-color":"#8F8F8F"});
		}else if(timeBucket == "month"){
			$("[name=month]").css({"background-color":"#8F8F8F"});
		}
		
		//绑定一天、一周、一月按钮的点击事件
		$("[name=day]").on("click",function(){
			timeBucket = "day";
			Common.render(true,{
				tpl:'tpls/monitor/task/monitor/taskList.html',
				data:'/cloud/task/instance/task_instance_count?timeBucket='+timeBucket,
				beforeRender: function(data){
					return data;
				},
				callback: bindTaskEvent
			});
		})
		$("[name=week]").on("click",function(){
			timeBucket = "week";
			Common.render(true,{
				tpl:'tpls/monitor/task/monitor/taskList.html',
				data:'/cloud/task/instance/task_instance_count?timeBucket='+timeBucket,
				beforeRender: function(data){
					return data;
				},
				callback: bindTaskEvent
			});
		})
		$("[name=month]").on("click",function(){
			timeBucket = "month";
			Common.render(true,{
				tpl:'tpls/monitor/task/monitor/taskList.html',
				data:'/cloud/task/instance/task_instance_count?timeBucket='+timeBucket,
				beforeRender: function(data){
					return data;
				},
				callback: bindTaskEvent
			});
		})
		
		//running  failed  success
	    $("#taskTable_wrapper a.instanceList").on("click",function(){
	    	debugger;
	    	var id = $(this).attr("data");
	    	var name = $(this).attr("name");
	    	task_id = id;
	    	status = name;
	    	Common.render(true,{
				tpl:'tpls/monitor/task/monitor/instanceList.html',
				data:'/cloud/task/instance?task_id='+task_id+'&timeBucket='+timeBucket+'&status='+status+'&deleted=false',
				beforeRender: function(data){
					return data;
				},
				callback: bindInstanceEvent
			});
	    })
	}
	
	var bindInstanceEvent = function(){
		debugger
		//dataTables
		Common.initDataTable($('#instanceTable'),function($tar){debugger
			commonEvent.timeButtons($tar);
		
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add" name="back">返回</span>'
			);
			$tar.prev().find('.right-col:first').append(
					'<a href="javascript:void(0)" class="instanceList" name="running"><font color="#FFD700"><strong><span id="runningSpan">running(0)</span></strong></font></a>&nbsp;&nbsp;&nbsp;&nbsp;'+
					'<a href="javascript:void(0)" class="instanceList" name="failed"><font color="#FF3030"><strong><span id="failedSpan">failed(0)</span></strong></font></a>&nbsp;&nbsp;&nbsp;&nbsp;'+
					'<a href="javascript:void(0)" class="instanceList" name="success"><font color="#00FF00"><strong><span id="successSpan">success(0)</span></strong></font></a>'
			);
			//这个必须添加，不然就是隐藏的效果，看不到页面
			Common.$pageContent.removeClass("loading");
		});
		$("[data-toggle='tooltip']").tooltip();
		
		//默认显示当天的日志
		if(timeBucket == "day"){
			$("[name=day]").css({"background-color":"#8F8F8F"});
		}else if(timeBucket == "week"){
			$("[name=week]").css({"background-color":"#8F8F8F"});
		}else if(timeBucket == "month"){
			$("[name=month]").css({"background-color":"#8F8F8F"});
		}
		
		//绑定一天、一周、一月按钮的点击事件
		$("[name=day]").on("click",function(){
			timeBucket = "day";
			Common.render(true,{
				tpl:'tpls/monitor/task/monitor/instanceList.html',
				data:'/cloud/task/instance?task_id='+task_id+'&timeBucket='+timeBucket+'&status='+status+'&deleted=false',
				beforeRender: function(data){
					return data;
				},
				callback: bindInstanceEvent
			});
		})
		$("[name=week]").on("click",function(){
			timeBucket = "week";
			Common.render(true,{
				tpl:'tpls/monitor/task/monitor/instanceList.html',
				data:'/cloud/task/instance?task_id='+task_id+'&timeBucket='+timeBucket+'&status='+status+'&deleted=false',
				beforeRender: function(data){
					return data;
				},
				callback: bindInstanceEvent
			});
		})
		$("[name=month]").on("click",function(){
			timeBucket = "month";
			Common.render(true,{
				tpl:'tpls/monitor/task/monitor/instanceList.html',
				data:'/cloud/task/instance?task_id='+task_id+'&timeBucket='+timeBucket+'&status='+status+'&deleted=false',
				beforeRender: function(data){
					return data;
				},
				callback: bindInstanceEvent
			});
		})
		
		//绑定返回按钮事件
		$("[name=back]").on("click",function(){
			//先获取数据，进行加工后再去render
			Common.render(true,{
				tpl:'tpls/monitor/task/monitor/taskList.html',
				data:'/cloud/task/instance/task_instance_count?timeBucket='+timeBucket,
				beforeRender: function(data){
					return data;
				},
				callback: bindTaskEvent
			});
		})
		
		//设置running  failed  success的数量
		Common.xhr.ajax('/cloud/task/instance/task_instance_count?task_id='+task_id+'&timeBucket='+timeBucket,function(data){
			if(data.length > 0){
				var task = data[0];
				$("#task_name").text(task.name);
				$("#runningSpan").text("running("+task.runningCount+")");
				$("#failedSpan").text("failed("+task.failedCount+")");
				$("#successSpan").text("success("+task.successCount+")");
			}
		})
		
		//running  failed  success
	    $("#instanceTable_wrapper a.instanceList").on("click",function(){
	    	debugger;
	    	var name = $(this).attr("name");
	    	status = name;
	    	Common.render(true,{
				tpl:'tpls/monitor/task/monitor/instanceList.html',
				data:'/cloud/task/instance?task_id='+task_id+'&timeBucket='+timeBucket+'&status='+status+'&deleted=false',
				beforeRender: function(data){
					return data;
				},
				callback: bindInstanceEvent
			});
	    })
	    
	    if(status == "running"){
			$("#runningSpan").css({"background-color":"#EEEED1"});
		}else if(status == "failed"){
			$("#failedSpan").css({"background-color":"#EEEED1"});
		}else if(status == "success"){
			$("#successSpan").css({"background-color":"#EEEED1"});
		}
		
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
				Common.render('tpls/monitor/task/monitor/monitorList.html','/cloud/task/monitor?instanceId='+instanceId+'&deleted=false',function(html){
					debugger
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
	    $("#instanceTable_wrapper a.btn-opt").on("click",function(){
	    	EditData.Detail($(this).attr("data"),function(){
	    		var format = function(rowData) {
				    // `rowData` is the original data object for the row
	    			debugger;
				    return '<table style="width:100%">'+
				        '<tr>'+
				            '<td style="width:100px">上下文:</td>'+
				            '<td>'+rowData[5]+'</td>'+
				        '</tr>'+
				        '<tr>'+
				            '<td style="width:100px">异常信息:</td>'+
				            '<td>'+rowData[6]+'</td>'+
				        '</tr>'+
				    '</table>';
				}
	    		var table = Common.initDataTable("#monitorTable",{bFilter:false, bPaginage:false});
    			$('#monitorTable tbody').on('click', 'td.details-control', function(){
    		        var tr = $(this).closest('tr');
    		        var row = table.row( tr );
    		 
    		        if ( row.child.isShown() ) {
    		            // This row is already open - close it
    		            row.child.hide();
    		            tr.removeClass('shown');
    		        }
    		        else {
    		            // Open this row
    		            row.child(format(row.data()) ).show();
    		            tr.addClass('shown');
    		        }
    		    } );
	    	});
	    });
	    
	}	
	return {
		init : init
	}
})
