define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var strategyGroupSelect = "";
	var strategySelect = "";
	var rowCount = 1;
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
		                'className': {
		                	required: true,
		                    maxlength:255
		                },
		                'methodName': {
		                	required: true,
		                    maxlength:255
		                },
		                'paramsMemo': {
		                    maxlength:1024
		                }
		            }
		        });
			},
			addRow: function(rowData){
				debugger;
				//行内容
				var rowHtml = '';
				if(rowData){  //修改
					rowHtml = '<tr>'
						+'<td><span class="rowCount">'+rowCount+'</span><input type="hidden" name="id'+rowCount+'" value=""></td>'
						+'<td><select name="strategyGroup'+rowCount+'" class="form-control select">'+strategyGroupSelect+'</select></td>'
						+'<td><label><input type="checkbox" name="isMust'+rowCount+'"></></label></td>'
						+'<td><select name="strategy'+rowCount+'" class="form-control select"></select></td>'
						+'<td><textarea class="form-control" name="initParamsValue'+rowCount+'" style="height:auto;" rows="2" placeholder=""></textarea></td>'
						/*+'<td><a class="btn-delete" data-toggle="tooltip" title="删除" href="javascript:void(0)" style="margin: 0 8px;">'
						+'<i class="fa fa-trash-o fa-fw"></i></a></td>'*/
						+'</tr>';
				}else{  //新增
					rowHtml = '<tr>'
						+'<td><span class="rowCount">'+rowCount+'</span><input type="hidden" name="id'+rowCount+'" value=""></td>'
						+'<td><select name="strategyGroup'+rowCount+'" class="form-control select">'+strategyGroupSelect+'</select></td>'
						+'<td><label><input type="checkbox" name="isMust'+rowCount+'"></></label></td>'
						+'<td><select name="strategy'+rowCount+'" class="form-control select"></select></td>'
						+'<td><textarea class="form-control" name="initParamsValue'+rowCount+'" style="height:auto;" rows="2" placeholder=""></textarea></td>'
						+'<td><a class="btn-delete" data-toggle="tooltip" title="删除" href="javascript:void(0)" style="margin: 0 8px;">'
						+'<i class="fa fa-trash-o fa-fw"></i></a></td>'
						+'</tr>';
				}
				$("#strategyTable tbody").append(rowHtml);
				EventsHandler.initStrategyOptions(rowCount,null);
				
				//删除行事件
				$(document).off("click","a.btn-delete");
				$(document).on("click","a.btn-delete",function(){
					$(this).parent().parent().remove();
					var i = 1;
					$("#strategyTable .rowCount").each(function(){
						$(this).html((i++));
                	});
				});
				
				//选择完策略分组后 初始化策略下拉框内容
				$(document).off("change","#strategyTable [name='strategyGroup"+rowCount+"']");
				$(document).on("change","#strategyTable [name='strategyGroup"+rowCount+"']",function(){
					debugger;
					var rowNo = $(this).parents('td:first').prev().find('.rowCount').html();
					EventsHandler.initStrategyOptions(rowNo,null);
				});
				//下拉框赋值 以在确认信息页面显示所选内容
				$(document).off("change","#strategyTable select");
				$(document).on("change","#strategyTable select",function(){
					var value = $(this).val();
					$(this).find("option[value='"+value+"']").attr("selected",true);
				});
				//复选框赋值 以在确认信息页面显示所选内容
				$(document).off("change","#strategyTable input[type='checkbox']");
				$(document).on("change","#strategyTable input[type='checkbox']",function(){
					if($(this).attr("checked")){
						$(this).attr("checked",false);
						$(this).val(false);
					}else{
						$(this).attr("checked",true);
						$(this).val(true);
					}
				});
				//文本域赋值 以在确认信息页面显示所填内容
				$(document).off("change","#strategyTable textarea");
				$(document).on("change","#strategyTable textarea",function(){
					var value = $(this).val();
					$(this).text(value);
				});
				
				//新增行后初始化行数据
				debugger;
				if(rowData){
					$("#strategyTable [name='id"+rowCount+"']").val(rowData.id);
					$("#strategyTable [name='strategyGroup"+rowCount+"']").find("option[value='"+rowData.strategyGroupId+"']").attr("selected",true);
					//选中策略分组后调用初始化策略下拉框的方法
					var rowNo = $("#strategyTable [name='strategyGroup"+rowCount+"']").parents('td:first').prev().find('.rowCount').html();
					EventsHandler.initStrategyOptions(rowNo,rowData.strategyId);
					if(rowData.isMust){
						$("#strategyTable [name='isMust"+rowCount+"']").attr("checked",true);
					}
					$("#strategyTable [name='initParamsValue"+rowCount+"']").text(rowData.initParamsValue);
					
					//禁用策略分组 和 必选
					$("#strategyTable [name='strategyGroup"+rowCount+"']").attr("disabled","disabled");
					$("#strategyTable [name='isMust"+rowCount+"']").attr("disabled","disabled");
				}
				
				rowCount++;
			},
			initStrategyOptions : function(rowNo,value){
				//初始化 策略  下拉框数据,如果value不为空，则设置选中项
				debugger;
				var strategyGroupId = $("#strategyTable [name='strategyGroup"+rowNo+"']").val();
	    		Common.xhr.ajax('/cloud/task/strategy?strategyGroupId='+strategyGroupId,function(data){
	    			var selectData = [];
	    			strategySelect = "";
					for(var i=0;i<data.length;i++){
						strategySelect = strategySelect + '<option value="'+data[i]["id"]+'">'+data[i]["name"]+'</option>';
					}
					$("#strategyTable [name='strategy"+rowNo+"']").html(strategySelect);
					if(value){
						$("#strategyTable [name='strategy"+rowNo+"']").find("option[value='"+value+"']").attr("selected",true);
					}
				});
			}
	    }
		
		//弹窗初始化
	    var EditData = {
	    	//创建弹框
	    	Add : function(){
				//需要修改为真实数据源
				Common.render('tpls/monitor/task/task/add.html',renderData,function(html){
					$('body').append(html);
					//wizard show
	    			$.fn.wizard.logging = true;
	    			var wizard;
	    			
			    	//载入依赖数据
			    	
	    			//添加行事件
	    			rowCount = 1;
		    		$(document).off("click","span.addStrategy");
					$(document).on("click","span.addStrategy",function(){
						EventsHandler.addRow(null);
					})
		    		
					//初始化 策略分组  下拉框数据
		    		Common.xhr.ajax('/cloud/task/strategy-group',function(data){
						var selectData = [];
						strategyGroupSelect = "";
						for(var i=0;i<data.length;i++){
							strategyGroupSelect = strategyGroupSelect + '<option value="'+data[i]["id"]+'">'+data[i]["name"]+'</option>';
						}
					});
					
	    			
	    			wizard = $('#create-task-wizard').wizard({
	    				keyboard : false,
	    				contentHeight : 526,
	    				contentWidth : 900,
	    				showCancel: true,
	    				backdrop: 'static',
	    				buttons: {
	    	                cancelText: "取消",
	    	                nextText: "下一步",
	    	                backText: "上一步",
	    	                submitText: "确定",
	    	                submittingText: "提交中..."
	    	            },
	    	            validate: {
		            		0: function(){
		            			return this.el.find('form').valid();
		            		}
	    	            }
	    			});
	    			//加载时载入validate
	    			wizard.on('show',function(){
	    				wizard.form.each(function(){
	    					//表单校验
	    					EventsHandler.formValidator();
	    				})
	    				
	    			});
	    			//确认信息卡片被选中的监听
	    			wizard.cards.confirm.on('selected',function(card){
	    				//获取上几步中填写的值
//	    				var serverData = wizard.serializeObject()
//	    				$('.name-confirm').text(serverData.name)
	    				$("#editTaskBasic input[type='text']").each(function(){
							$("#confirm label[name='"+$(this).attr("name")+"']").html($(this).val());
	                	});
	    				$("#editTaskBasic textarea").each(function(){
							$("#confirm label[name='"+$(this).attr("name")+"']").html($(this).val());
	                	});
						$("#editTaskBasic select").each(function(){
							$("#confirm label[name='"+$(this).attr("name")+"']").html($(this).find("option:selected").html());
	                	});
						$("#confirm .table tbody").html($("#strategyInfo .table tbody").html());
						$("#confirm .table tr").each(function(){
							$(this).find("td:last").remove();
						})
					});
	    			//展现wizard
	    			wizard.show();
	    			
	    			//wizard.disableNextButton();
	    			//关闭弹窗
					var closeWizard = function(){
	    				$('div.wizard').remove();
	    				$('div.modal-backdrop').remove();
	    			}
					//关闭后移出dom
	    			wizard.on('closed', function() {
	    				closeWizard();
	    				
	    			});
	    			//创建提交数据
	    			wizard.on("submit", function(wizard) {
	    				debugger;
	    				var wizardData = wizard.serializeObject();
	    				var list = [];
	    				for(var i=1;i<=(rowCount-1);i++){
	    					if(wizardData["strategyGroup"+i]){
	    						var id = wizardData["id"+i][0];
	    						var strategyGroup = wizardData["strategyGroup"+i][0];
	    						var strategy = wizardData["strategy"+i][0];
	    						var initParamsValue = wizardData["initParamsValue"+i][0];
	    						
	    						var taskStragety = {};
	    						if(id != ""){
	    							taskStragety["id"] = id;
	    						}
	    						taskStragety["rank"] = i;
	    						taskStragety["strategyGroupId"] = strategyGroup;
	    						taskStragety["strategyId"] = strategy;
	    						if($("#strategyTable [name='isMust"+i+"']").attr("checked")){
	    							taskStragety["isMust"] = true;
	    						}else{
	    							taskStragety["isMust"] = false;
	    						}
	    						taskStragety["initParamsValue"] = initParamsValue;
	    						list.push(taskStragety);
	    						
	    						delete wizardData["id"+i];
	    						delete wizardData["strategyGroup"+i];
	    						delete wizardData["strategy"+i];
	    						delete wizardData["isMust"+i];
	    						delete wizardData["initParamsValue"+i];
	    					}
	    				}
	    				debugger;
	    				wizardData["list"] = list;
	    				debugger;
	    				Common.xhr.postJSON('/cloud/task/task',wizardData,function(data){
	    					wizard._submitting = false;
	    					wizard.updateProgressBar(100);
	    					closeWizard();
	    					Common.router.reload();
	    				})
	    			});
				});
	    	},
	    	
	    	//编辑弹框
	    	Edit : function(id,cb){
	    		Common.xhr.ajax('/cloud/task/task/'+id,function(data){
	    			debugger;
	    			data.taskGroupList = renderData.taskGroupList;
	    			//需要修改为真实数据源
					Common.render('tpls/monitor/task/task/edit.html',data,function(html){
						$('body').append(html);
						//wizard show
		    			$.fn.wizard.logging = true;
		    			var wizard;
		    			
				    	//添加行事件
		    			rowCount = 1;
			    		$(document).off("click","span.addStrategy");
						$(document).on("click","span.addStrategy",function(){
							EventsHandler.addRow(null);
						})
			    		
						//初始化 策略分组  下拉框数据 和  策略  下拉框数据
			    		Common.xhr.ajax('/cloud/task/strategy-group',function(strategyGroupList){
							var selectData = [];
							strategyGroupSelect = "";
							for(var i=0;i<strategyGroupList.length;i++){
								strategyGroupSelect = strategyGroupSelect + '<option value="'+strategyGroupList[i]["id"]+'">'+strategyGroupList[i]["name"]+'</option>';
							}
							
							//初始化策略信息页中的策略列表
			    			for(var i = 0; i < data.list.length; i++ ){
			    			    var taskStrategy = data.list[i];
			    			    EventsHandler.addRow(taskStrategy);
			    			}
						});
		    			
		    			wizard = $('#create-task-wizard').wizard({
		    				keyboard : false,
		    				contentHeight : 526,
		    				contentWidth : 900,
		    				showCancel: true,
		    				backdrop: 'static',
		    				buttons: {
		    	                cancelText: "取消",
		    	                nextText: "下一步",
		    	                backText: "上一步",
		    	                submitText: "确定",
		    	                submittingText: "提交中..."
		    	            },
		    	            validate: {
			            		0: function(){
			            			return this.el.find('form').valid();
			            		}
		    	            }
		    			});
		    			//加载时载入validate
		    			wizard.on('show',function(){
		    				wizard.form.each(function(){
		    					//表单校验
		    					EventsHandler.formValidator();
		    				})
		    				
		    			});
		    			//确认信息卡片被选中的监听
		    			wizard.cards.confirm.on('selected',function(card){
		    				//获取上几步中填写的值
//		    				var serverData = wizard.serializeObject()
//		    				$('.name-confirm').text(serverData.name)
		    				$("#editTaskBasic input[type='text']").each(function(){
								$("#confirm label[name='"+$(this).attr("name")+"']").html($(this).val());
		                	});
		    				$("#editTaskBasic textarea").each(function(){
								$("#confirm label[name='"+$(this).attr("name")+"']").html($(this).val());
		                	});
							$("#editTaskBasic select").each(function(){
								$("#confirm label[name='"+$(this).attr("name")+"']").html($(this).find("option:selected").html());
		                	});
							$("#confirm .table tbody").html($("#strategyInfo .table tbody").html());
//							$("#confirm .table tr").each(function(){
//								$(this).find("td:last").remove();
//							})
						});
		    			//展现wizard
		    			wizard.show();
		    			
		    			//wizard.disableNextButton();
		    			//关闭弹窗
						var closeWizard = function(){
		    				$('div.wizard').remove();
		    				$('div.modal-backdrop').remove();
		    			}
						//关闭后移出dom
		    			wizard.on('closed', function() {
		    				closeWizard();
		    				
		    			});
		    			//创建提交数据
		    			wizard.on("submit", function(wizard) {
		    				debugger;
		    				var wizardData = wizard.serializeObject();
		    				var list = [];
		    				var taskStragetyIds = "";
		    				for(var i=1;i<=(rowCount-1);i++){
		    					if(wizardData["strategy"+i]){
		    						var id = wizardData["id"+i][0];
//		    						var strategyGroup = wizardData["strategyGroup"+i][0];
		    						var strategy = wizardData["strategy"+i][0];
		    						var initParamsValue = wizardData["initParamsValue"+i][0];
		    						
		    						var taskStragety = {};
		    						if(id != ""){
		    							taskStragety["id"] = id;
//		    							taskStragetyIds = taskStragetyIds + id + ",";
		    						}
//		    						taskStragety["taskId"] = data.id;
//		    						taskStragety["rank"] = i;
//		    						taskStragety["strategyGroupId"] = strategyGroup;
		    						taskStragety["strategyId"] = strategy;
//		    						if($("#strategyTable [name='isMust"+i+"']").attr("checked")){
//		    							taskStragety["isMust"] = true;
//		    						}else{
//		    							taskStragety["isMust"] = false;
//		    						}
		    						taskStragety["initParamsValue"] = initParamsValue;
		    						list.push(taskStragety);
		    						
		    						delete wizardData["id"+i];
		    						delete wizardData["strategyGroup"+i];
		    						delete wizardData["strategy"+i];
		    						delete wizardData["isMust"+i];
		    						delete wizardData["initParamsValue"+i];
		    					}
		    				}
		    				
		    				//对删除行操作的处理
//			    			for(var i = 0; i < data.list.length; i++ ){
//			    			    var id = data.list[i].id;
//			    			    if(taskStragetyIds.indexOf(""+id+",") == -1){
//			    			    	var taskStragety = {};
//			    			    	taskStragety["id"] = id;
//			    			    	taskStragety["deleted"] = true;
//			    			    	list.push(taskStragety);
//			    			    }
//			    			}
			    			
			    			debugger;
		    				wizardData["list"] = list;
		    				debugger;
		    				
		    				Common.xhr.putJSON('/cloud/task/task/'+data.id,wizardData,function(data){
		    					wizard._submitting = false;
		    					wizard.updateProgressBar(100);
		    					closeWizard();
		    					Common.router.reload();
		    				})
		    			});
					});
	    		})
	    	}
	    }
		
		//新建
		$("#taskTable_wrapper span.btn-add").on("click",function(){
	    	EditData.Add();
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
