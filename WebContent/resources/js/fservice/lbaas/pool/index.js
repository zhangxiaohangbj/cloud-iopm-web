define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//render获取的数据
		Common.render(true,'tpls/fservice/lbaas/pool/list.html',function(){
			bindEvent();
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		var table = Common.initDataTable($('#PoolTable'),{
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":"networking/v2.0/subnets/page/", //ajax源，后端提供的分页接口
		      "columns": [
			        {
			        	"orderable": false,
			        	"defaultContent":"<label><input type='checkbox'></label>"
			        },
			        {"data": {}},
			        {"data": "name"},
			        {"data": "cidr"},
			        {"data": "vdc_name"},
			        {"data": "ip_version"},
			        {"data": "gateway_ip"},
			        {"data": "gateway_ip"},
			        {"data": {}}
		      ],
		      "columnDefs": [
					{
					    "targets": [1],
					    "render": function(data, type, full) {
					    	return "<a href='#fservice/lbaas/pool/detail/"+data.id+"'>"+data.name+"</a>";
					    }
					},
					{
						"targets": [8],
						"render": function(data, type, full) {
							var html = '<a class="btn-edit btn-opt pull-left" data-toggle="tooltip" title="编辑" data-act="stop" href="javascript:void(0)"><li class="glyphicon glyphicon-edit"></li></a>'
									+'<div class="dropdown">'
		                 		   	+'<a class="btn-opt dropdown-toggle" data-toggle="dropdown" title="更多"  aria-expanded="false" ><i class="fa fa-angle-double-right"></i></a>'
		                 		   	+'<ul class="dropdown-menu" style="right: 0;left: initial;">';
							if(data.ip_version == 6) html += '<li><a href="javascript:void(0)" class="editVip"><i class="fa fa-gear fa-fw"></i>编辑VIP</a></li>'
									+'<li><a href="javascript:void(0)" class="delVip"><i class="fa fa-trash-o fa-fw"></i>删除VIP</a></li>'
									+(data.monitor_id? '<li><a href="javascript:void(0)" class="unbindMonitor"><i class="fa fa-file-text fa-fw"></i>解除监控关联</a></li>':
										'<li><a href="javascript:void(0)" class="bindMonitor"><i class="fa fa-gear fa-fw"></i>关联监控</a></li>');
		                 		   
							else html += '<li><a href="javascript:void(0)" class="addVip"><i class="fa fa-gear fa-fw"></i>添加VIP</a></li>'
		                 		   +(data.monitor_id? '<li><a href="javascript:void(0)" class="unbindMonitor"><i class="fa fa-file-text fa-fw"></i>解除监控关联</a></li>':
									'<li><a href="javascript:void(0)" class="bindMonitor"><i class="fa fa-gear fa-fw"></i>关联监控</a></li>')
		                 		   +'<li><a href="javascript:void(0)" class="delPool"><i class="fa fa-trash-o fa-fw"></i>删除资源池</a></li>';
		                 	return html +'</ul></div>';
		                 		   
						}
					}
                ]
		    },
			function($tar){
		    	var $tbMenu = $tar.prev('.tableMenus');
		    	$tbMenu.length && $tbMenu.empty().html($('.table-menus').html());
				Common.$pageContent.removeClass("loading");
		});
		Common.on("click",'.dataTables_filter .btn-query',function(){
			table.search($('.global-search').val()).draw();
		})
		$("[data-toggle='tooltip']").tooltip();
		
	    var EventsHandler = {
	    		//表单校验
				formValidator: function(){
					$(".form-horizontal").validate({
						errorContainer:"_form",
			            rules: {
			            	'name': {
			                    required: true,
			                    maxlength:255
			                },
			                'description': {
			                    maxlength:255
			                },
			                'address': {
			                	IP: true
			                },
			                'protocol_port': {
			                	required: true,
			                	digits: true,
			                	min: 1,
			                	max: 65535
			                },
			                'connection_limit': {
			                	digits: true
			                }
			            }
			        });
				},
				//添加VIP -连接限制
				LimitSpinbox : function(){
					require(['bs/spinbox'],function(){
	    				$('#connection_limit').spinbox({
		    					value: 0,
		    					min: -1
	    				});
	    			})
				},
				SessionTypeChange : function(){
					$(document).off("change", "select[name='session_type']");
					$(document).on("change", "select[name='session_type']", function(){
						if($(this).val() == "APP_COOKIE")
							$("#app_cookie").css("display","");
						else $("#app_cookie").css("display","none");
					});
				}
	    }
	    
	    //创建
	    $(document).off("click","#PoolTable_wrapper span.btn-add");
	    $(document).on("click","#PoolTable_wrapper span.btn-add",function(){
    		//先获取subnet后，再render
    		Common.xhr.ajax('/networking/v2.0/subnets',function(data){
    			Common.render('tpls/fservice/lbaas/pool/add.html',data,function(html){
	    			Dialog.show({
	    	            title: '新增资源池',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '创建',
	    	                action: function(dialog) {
	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
	    	            		var data = $("#addPool").serializeArray();
	    	                	var serverData = {
	    	                		"pool":{
	    	                		}
	    	                	  };
	    	                	for(var i=0;i<data.length;i++){
	    	                		serverData.pool[data[i]["name"]] = data[i]["value"];
	    						}
	    	                	Common.xhr.postJSON('/networking/v2.0/subnets',serverData,function(data){
	    	                		if(data){
	    	                			Dialog.success('保存成功')
	    	                			setTimeout(function(){Dialog.closeAll()},2000);
	    	                			table.draw();
									}else{
										 Dialog.warning ('保存失败')
									}
								})
	    	                }
	    	            }],
	    	            onshown : function(){
	    		    		EventsHandler.formValidator();
	    		    	}
	    	        });
	    		});
    		})
	    });
	    //编辑
	    $(document).off("click","#PoolTable_wrapper a.btn-edit");
	    $(document).on("click","#PoolTable_wrapper a.btn-edit",function(){
	    	var id = $(this).parents("tr:first").data("rowData.dt").id;
    		Common.xhr.ajax('/networking/v2.0/subnets/'+id,function(data){
    		Common.render('tpls/fservice/lbaas/pool/edit.html',data.subnet,function(html){
    			Dialog.show({
    	            title: '编辑资源池',
    	            message: html,
    	            nl2br: false,
    	            buttons: [{
    	                label: '保存',
    	                action: function(dialog) {
    	                	var valid = $(".form-horizontal").valid();
    	            		if(!valid) return false;
    	            		var data = $("#addPool").serializeArray();
    	                	var serverData = {
    	                		"pool":{
    	                		}
    	                	  };
    	                	for(var i=0;i<data.length;i++){
    	                		serverData.pool[data[i]["name"]] = data[i]["value"];
    						}
    	                	Common.xhr.putJSON('/networking/v2.0/subnets/'+id,serverData,function(data){
    	                		if(data){
    	                			Dialog.success('保存成功')
    	                			setTimeout(function(){Dialog.closeAll()},2000);
    	                			table.draw();
								}else{
									Dialog.warning ('保存失败')
								}
							})
    	                }
    	            }],
    	            onshown : function(){
    		    		EventsHandler.formValidator();
    		    	}
    	        });
    		});
    		});
	    });
	    //删除
	    $(document).off("click","#PoolTable_wrapper a.delPool");
	     $(document).on("click","#PoolTable_wrapper a.delPool",function(){
	    	 var id = $(this).parents("tr:first").data("rowData.dt").id;
	    	 Dialog.confirm('确定要删除该资源池吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/networking/v2.0/subnets/'+id,
	                     function(data){
	                    	 if(data){
	                    		 Dialog.success('删除成功')
 	                			 setTimeout(function(){Dialog.closeAll()},2000);
	                    		 table.draw();
	                    	 }else{
	                    		 Dialog.warning ('删除失败')
	                    	 }
	                     });
	             }else {
	            	 Dialog.closeAll();
	             }
	         });
	     })
	     //创建VIP
	    $(document).off("click","#PoolTable_wrapper a.addVip");
	    $(document).on("click","#PoolTable_wrapper a.addVip",function(){
    		//先获取subnet后，再render
    		Common.xhr.ajax('/networking/v2.0/subnets',function(data){
    			Common.render('tpls/fservice/lbaas/pool/addVIP.html',data,function(html){
	    			Dialog.show({
	    	            title: '添加VIP',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '添加',
	    	                action: function(dialog) {
	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
	    	            		var data = $("#addPool").serializeArray();
	    	                	var serverData = {
	    	                		"vip":{
	    	                		}
	    	                	  };
	    	                	for(var i=0;i<data.length;i++){
	    	                		serverData.vip[data[i]["name"]] = data[i]["value"];
	    						}
	    	                	Common.xhr.postJSON('/networking/v2.0/subnets',serverData,function(data){
	    	                		if(data){
	    	                			Dialog.success('保存成功')
	    	                			setTimeout(function(){Dialog.closeAll()},2000);
	    	                			table.draw();
									}else{
										 Dialog.warning ('保存失败')
									}
								})
	    	                }
	    	            },
	    	            {
	    	            	label: '取消',
	    	            	action: function(dialog){
	    	            		dialog.close();
	    	            	}
	    	            }],
	    	            onshown : function(){
	    	            	EventsHandler.LimitSpinbox();
	    	            	EventsHandler.SessionTypeChange();
	    		    		EventsHandler.formValidator();
	    		    	}
	    	        });
	    		});
    		})
	    });
	    //编辑VIP
	    $(document).off("click","#PoolTable_wrapper a.editVip");
	    $(document).on("click","#PoolTable_wrapper a.editVip",function(){
    		Common.xhr.ajax('/networking/v2.0/subnets',function(data){  //获取资源池列表
    			Common.render('tpls/fservice/lbaas/pool/editVIP.html',data,function(html){
	    			Dialog.show({
	    	            title: '编辑VIP',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
	    	            		var data = $("#addPool").serializeArray();
	    	                	var serverData = {
	    	                		"vip":{
	    	                		}
	    	                	  };
	    	                	for(var i=0;i<data.length;i++){
	    	                		serverData.vip[data[i]["name"]] = data[i]["value"];
	    						}
	    	                	Common.xhr.postJSON('/networking/v2.0/subnets',serverData,function(data){
	    	                		if(data){
	    	                			Dialog.success('保存成功')
	    	                			setTimeout(function(){Dialog.closeAll()},2000);
	    	                			table.draw();
									}else{
										 Dialog.warning ('保存失败')
									}
								})
	    	                }
	    	            },
	    	            {
	    	            	label: '取消',
	    	            	action: function(dialog){
	    	            		dialog.close();
	    	            	}
	    	            }],
	    	            onshown : function(){
	    	            	EventsHandler.LimitSpinbox();
	    		    		EventsHandler.formValidator();
	    		    	}
	    	        });
	    		});
    		})
	    });
	    //删除VIP
	    $(document).off("click","#PoolTable_wrapper a.delVip");
	     $(document).on("click","#PoolTable_wrapper a.delVip",function(){
	    	 var id = $(this).parents("tr:first").data("rowData.dt").id;
	    	 Dialog.confirm('确定要删除该VIP吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/networking/v2.0/subnets/'+id,
	                     function(data){
	                    	 if(data){
	                    		 Dialog.success('删除成功')
 	                			 setTimeout(function(){Dialog.closeAll()},2000);
	                    		 table.draw();
	                    	 }else{
	                    		 Dialog.warning ('删除失败')
	                    	 }
	                     });
	             }else {
	            	 Dialog.closeAll();
	             }
	         });
	     })
	    //关联监控
	    $(document).off("click","#PoolTable_wrapper a.bindMonitor");
	    $(document).on("click","#PoolTable_wrapper a.bindMonitor",function(){
    		//先获取monitor后，再render
    		Common.xhr.ajax('/networking/v2.0/subnets',function(data){
    			Common.render('tpls/fservice/lbaas/pool/bindMonitor.html',data,function(html){
	    			Dialog.show({
	    	            title: '关联监控',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '关联',
	    	                action: function(dialog) {
	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
	    	        	    	
	    	                	var serverData = {
	    	                		"pool":{
	    	                		}
	    	                	  };
	    	                	Common.xhr.postJSON('/networking/v2.0/subnets',serverData,function(data){
	    	                		if(data){
	    	                			Dialog.success('保存成功')
	    	                			setTimeout(function(){Dialog.closeAll()},2000);
	    	                			table.draw();
									}else{
										 Dialog.warning ('保存失败')
									}
								})
	    	                }
	    	            },
	    	            {
	    	            	label: '取消',
	    	            	action: function(dialog){
	    	            		dialog.close();
	    	            	}
	    	            }]
	    	        });
	    		});
    		})
	    });
	    //解除关联
	    $(document).off("click","#PoolTable_wrapper a.unbindMonitor");
	    $(document).on("click","#PoolTable_wrapper a.unbindMonitor",function(){
	    	 var id = $(this).parents("tr:first").data("rowData.dt").id;
	    	 Dialog.confirm('确定要解除绑定吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/networking/v2.0/subnets/'+id,
	                     function(data){
	                    	 if(data){
	                    		 Dialog.success('删除成功')
 	                			 setTimeout(function(){Dialog.closeAll()},2000);
	                    		 table.draw();
	                    	 }else{
	                    		 Dialog.warning ('删除失败')
	                    	 }
	                     });
	             }else {
	            	 Dialog.closeAll();
	             }
	         });
	     })
	}
	return {
		init : init
	}
})
