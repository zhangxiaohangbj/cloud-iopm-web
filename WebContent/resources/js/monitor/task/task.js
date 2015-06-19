define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/monitor/task/task/list.html',
			data:'/cloud/task/task?deleted=false',
			beforeRender: function(data){
				return data;
			},
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		//dataTables
		Common.initDataTable($('#taskTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">新 建</span>'
			);
			//这个必须添加，不然就是隐藏的效果，看不到页面
			Common.$pageContent.removeClass("loading");
		});
		$("[data-toggle='tooltip']").tooltip();
		
		var renderData = {};
        //初始化加载，不依赖其他模块
		var DataGetter = {
				//任务分组列表
				getTaskGroupList: function(type){
					Common.xhr.get('/cloud/task/task-group',{'deleted':'false'},function(list){
						renderData.taskGroupList = list;
					});
				},
		}
		DataGetter.getTaskGroupList();
		
		//事件处理
		var EventsHandler = {
    		//表单校验
			formValidator: function(){
				$(".form-horizontal").validate({
		            rules: {
		            	'name': {
		                    required: true,
		                    maxlength:255
		                },
		                'memo': {
		                    maxlength:255
		                },
		                'class_name': {
		                	required: true,
		                    maxlength:255
		                },
		                'method_name': {
		                	required: true,
		                    maxlength:255
		                },
		                'params_memo': {
		                    maxlength:1024
		                }
		            }
		        });
			},
	    }
		
		//弹窗初始化
	    var EditData = {
	    	//创建弹框
	    	Add : function(cb){
	    		//需要修改为真实数据源
				Common.render('tpls/monitor/task/task/add.html',renderData,function(html){
					Modal.show({
	    	            title: '新建任务',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
	    	            		Modal.confirm('确定要保存吗?', function(result){
	    	            			if(result) {
	    	            				Common.xhr.postJSON('/cloud/task/task',$("#editTask").serializeObject(),function(data){
	    	    	                		if(data){
	    	    	                			Modal.alert("保存成功",function(){
		    	    	                			dialog.close();
		    	    	                			Common.router.reload();
	    	    	                			});
	    									}else{
	    										Modal.alert("保存失败",function(){
		    	    	                			
	    	    	                			});
	    									}
	    								})
	    	            			}
	    	            		});
	    	                }
	    	            }, {
	    	                label: '取消',
	    	                action: function(dialog) {
	    	                    dialog.close();
	    	                }
	    	            }],
	    	            onshown : cb
	    	        });
				})
	    	},
	    	
	    	//编辑弹框
	    	Edit : function(id,cb){
	    		Common.xhr.ajax('/cloud/task/task/'+id,function(data){
	    			data.taskGroupList=renderData.taskGroupList;
	    			Common.render('tpls/monitor/task/task/add.html',data,function(html){
						Modal.show({
		    	            title: '编辑任务',
		    	            message: html,
		    	            nl2br: false,
		    	            buttons: [{
		    	                label: '保存',
		    	                action: function(dialog) {
		    	                	var valid = $(".form-horizontal").valid();
		    	            		if(!valid) return false;
		    	            		Modal.confirm('确定要保存吗?', function(result){
		    	            			if(result) {
		    	            				Common.xhr.putJSON('/cloud/task/task/'+id,$("#editTask").serializeObject(),function(data){
		    	            					if(data){
		    	    	                			Modal.alert("保存成功",function(){
			    	    	                			dialog.close();
			    	    	                			Common.router.reload();
		    	    	                			});
		    									}else{
		    										Modal.alert("保存失败",function(){
			    	    	                			
		    	    	                			});
		    									}
		    								})
		    	            			}
		    	            		});
		    	                }
		    	            }, {
		    	                label: '取消',
		    	                action: function(dialog) {
		    	                    dialog.close();
		    	                }
		    	            }],
		    	            onshown : cb
		    	        });
					})
	    		});
	    	}
	    }
		
		//新建
		$("#taskTable_wrapper span.btn-add").on("click",function(){
	    	EditData.Add(function(){
	    		EventsHandler.formValidator();
	    	});
	    });
		
	    //编辑
	    $("#taskTable_wrapper a.btn-opt").on("click",function(){
	    	EditData.Edit($(this).attr("data"),function(){
	    		EventsHandler.formValidator();
	    	});
	    });
	    
	    //删除
	    $("#taskTable_wrapper a.delete").on("click",function(){
	    	debugger;
	    	var id = $(this).attr("data");
	    	Modal.confirm('确定要删除吗?', function(result){
	    		if(result) {
	    			Common.xhr.del('/cloud/task/task/'+id,"",function(data){
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
