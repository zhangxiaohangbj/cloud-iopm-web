define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	Common.requestCSS('css/dialog.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//render获取的数据
		Common.render(true,'tpls/ccenter/vpc/router.html','/v2.0/routers/page/1/10',function(){
			bindEvent();
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#RouterTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">创 建</span>'
				);
			Common.$pageContent.removeClass("loading");
		});
		var EventsHandler = {
	    		//表单校验
				formValidator: function(){
					$(".form-horizontal").validate({
			            rules: {
			            	'name': {
			                    required: true,
			                    minlength: 4,
			                    maxlength:255
			                }
			            }
			        });
				},
				switcher:function(){
					$(".col-sm input[type=\"checkbox\"], input[type=\"radio\"]").not("[data-switch-no-init]").switcher();
				},
		}
		 //载入默认的数据 inits,创建数据载入类
		var DataIniter = {
				//子网列表
				initSubnetList : function(){
					Common.xhr.ajax('/v2.0/subnets',function(data){
						var subnets = data.subnets;
						var id = $("[name='subnetId']").attr("data");
						if(id!=null){
							for (var i=0;i<subnets.length;i++) {
								if (subnets[i].id==id) {
									subnets[i].selected="selected";
								}
							}
						}				
						var html = Common.uiSelect(subnets);
				    	$("[name='subnetId']").html(html);
				    	
					})
				},
				//vpc列表
				initNetworkList : function(){
					var data = {isExternalNetwork:true};
					Common.xhr.get('/v2.0/networks',data,function(data){
						var networks = data.networks;
						var id = $("[name='network_id']").attr("data");
						if(id!=null){
							for (var i=0;i<networks.length;i++) {
								if (networks[i].id==id) {
									networks[i].selected="selected";
								}
							}
						}				
						var html = Common.uiSelect(networks);
				    	$("[name='network_id']").html(html);
				    	
					})
				}
		};
		//创建路由
	    $("#RouterTable_wrapper span.btn-add").on("click",function(){
	    	Common.render('tpls/ccenter/vpc/addrouter.html','',function(html){
		    	Dialog.show({
		            title: '路由创建',
		            message: html,
		            closeByBackdrop: false,
		            nl2br: false,
		            buttons: [{
		                label: '创建',
		                action: function(dialog) {
		                	var valid = $(".form-horizontal").valid();
		            		if(!valid) return false;
		                	var routerData = {
	            				  "router": {
	            				    "admin_state_up":$("#addRouter [name='admin_state_up']:checked").length?true:false,
	            				    "external_gateway_info": {
	            				    		"network_id":$("[name='network_id']").val(),
	            				    		"enable_snat":true},
	            				    "name":  $("[name='name']").val()
	            				  }
		                	  };
		                	Common.xhr.postJSON('/v2.0/routers',routerData,function(data){
		                		if(data){
		                			Dialog.success('保存成功')
		                			setTimeout(function(){Dialog.closeAll()},2000);
		                			Common.router.route();
								}else{
									 Dialog.warning ('保存失败')
								}
							})
		                }
		            }],
		            onshown : function(){
		            	DataIniter.initNetworkList();
		            	EventsHandler.formValidator();
		            	EventsHandler.switcher();
		            }
		        });
			});
	    });
		//编辑路由
	    $("#RouterTable_wrapper a.editRouter").on("click",function(){
	    	var id= $(this).attr("data");
	    	Common.xhr.ajax('/v2.0/routers/'+id,function(data){
	    		Common.render('tpls/ccenter/vpc/editrouter.html',data.router,function(html){
		    	Dialog.show({
		            title: '编辑路由',
		            message: html,
		            closeByBackdrop: false,
		            nl2br: false,
		            buttons: [{
		                label: '确定',
		                action: function(dialog) {
		                	var valid = $(".form-horizontal").valid();
		            		if(!valid) return false;
		                	var routerData = {
	            				  "router": {
	            				    "admin_state_up": $("#addRouter [name='admin_state_up']:checked").length?true:false,
	            				    "name":  $("[name='name']").val(),
	            				  }
		                	  };
		                	Common.xhr.putJSON('/v2.0/routers/'+id,routerData,function(data){
		                		if(data){
		                			Dialog.success('保存成功')
		                			setTimeout(function(){Dialog.closeAll()},2000);
		                			Common.router.route();
								}else{
									 Dialog.warning ('保存失败')
								}
							})
		                }
		            }],
		            onshown : function(){
		            	EventsHandler.formValidator();
		            	EventsHandler.switcher();
		            }
		        });
	    		})
	    	});
	    })
	  //删除路由
	     $("#RouterTable_wrapper a.deleteRouter").on("click",function(){
	    	 var id = $(this).attr("data");
	    	 Dialog.confirm('确定要删除该路由吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/v2.0/routers/'+id,
	                     function(data){
	                    	 if(data){
	                    		 Dialog.success('删除成功')
	                			 setTimeout(function(){Dialog.closeAll()},2000);
	                    		 Common.router.route();
	                    	 }else{
	                    		 Dialog.warning ('删除失败')
	                    	 }
	                     });
	             }else {
	            	 Dialog.closeAll();
	             }
	         });
	     })
	     //清除网关
	     $("#RouterTable_wrapper span.deleteGateway").on("click",function(){
	    	 var id = $(this).attr("data");
	    	 Dialog.confirm('确定要清除网关吗?', function(result){
	             if(result) {
					var routerData = { "router": {"external_gateway_info": {"network_id":""}}};
					Common.xhr.putJSON('/v2.0/routers/'+id, routerData,
						function(data){
							 if(data){
								 Dialog.success('操作成功')
								 setTimeout(function(){Dialog.closeAll()},2000);
								 Common.router.route();
							 }else{
								 Dialog.warning ('操作失败')
							 }
					});
	             }else {
	            	 Dialog.closeAll();
	             }
	         })
	     });
	     //设置网关
	     $("#RouterTable_wrapper span.setGateway").on("click",function(){
	    	 var id = $(this).attr("data");
	    	 Common.xhr.ajax('/v2.0/routers/'+id,function(data){
				    Common.render('tpls/ccenter/vpc/setroutergateway.html',data.router,function(html){
			    	 Dialog.show({
				            title: '设置网关',
				            message: html,
				            closeByBackdrop: false,
				            nl2br: false,
				            buttons: [{
				                label: '确定',
				                action: function(dialog) {
				                	var valid = $(".form-horizontal").valid();
				            		if(!valid) return false;
				                	var routerData = {
			            				  "router": {
			            					  "external_gateway_info": {
			            				    		"network_id":$("[name='network_id']").val()
			            				    		}
			            				  }
				                	  };
				                	Common.xhr.putJSON('/v2.0/routers/'+id,routerData,function(data){
				                		if(data){
				                			Dialog.success('设置成功')
				                			setTimeout(function(){Dialog.closeAll()},2000);
				                			Common.router.route();
										}else{
											 Dialog.warning ('设置失败')
										}
									})
				                }
				            }],
				            onshown : function(){
				            	DataIniter.initNetworkList();
				            	//EventsHandler.formValidator();
				            }
				        });
				    });
	    	 });
	     });
		//路由明细
		$("#RouterTable_wrapper a.router-name").on("click",function(){
		    	Common.xhr.ajax('/v2.0/routers/'+$(this).attr("data"),function(data){
		    		Common.render('tpls/ccenter/vpc/routerdetail.html',data.router,function(html){
		    			$("#page-main .page-content").html(html);
		    			//返回按钮
		    		    $(".form-horizontal a.reload").on("click",function(){
		    		    	Common.router.route();
		    		    })
		    		});
		    	});
		});
	   
		var EditData = {
		    	//添加子网连接
		    	AddRouterSubnet : function(id,cb){
		    			Common.render('tpls/ccenter/vpc/addroutersubnet.html',function(html){
			    			Dialog.show({
			    	            title: '连接子网',
			    	            message: html,
			    	            nl2br: false,
			    	            buttons: [{
			    	                label: '确定',
			    	                action: function(dialog) {
			    	                	var valid = $(".form-horizontal").valid();
			    	            		if(!valid) return false;
			    	                	var routerInterface = {
	    	                				  "port_id": null,
	    	                				  "subnet_id": $("[name='subnetId']").val(),
			    	                	  };
			    	                	Common.xhr.putJSON('/v2.0/routers/'+id+'/add_router_interface',routerInterface,function(data){ //需修改接口
			    	                		if(data){
			    	                			Dialog.success('保存成功')
			    	                			setTimeout(function(){Dialog.closeAll()},2000);
			    	                			EditData.GetSubnetList(id);
											}else{
												 Dialog.warning ('保存失败')
											}
										})
			    	                }
			    	            }],
			    	            onshown : cb
			    	        });
			    		});
		    		
		    	},
		    	//获取子网连接列表
		    	GetSubnetList :function(id){
		    		Common.render(true,'tpls/ccenter/vpc/routersubnet.html','/v2.0/ports?device_owner=network&device_id='+id,function(html){ //需修改接口
			    		Common.initDataTable($('#subnetTable'),function($tar){
			    			$tar.prev().find('.left-col:first').append(
			    					'<span class="btn btn-add">添加子网连接</span>'
			    				);
			    		});
			    		$("a.reload").on("click",function(){
		    		    	Common.router.route();
		    		    })
			    		//添加子网连接
				    	$("#subnetTable_wrapper span.btn-add").on("click",function(){
				    		EditData.AddRouterSubnet(id,function(){
				    			DataIniter.initSubnetList();
				    			EventsHandler.formValidator();
				    		})
				    	});
					    //删除子网连接
					    $("#subnetTable_wrapper a.btn-delete").on("click",function(){
					    	var portId= $(this).attr("data");
					    	var subnetId= $(this).attr("datasubnet");
					    	Dialog.confirm('确定要删除该子网连接吗?', function(result){
					             if(result) {
					            	 var serverData = {
	    	                				  "router_id": id,
	    	                				  "subnet_id": subnetId,
	    	                				  "port_id": portId
			    	                	  };
					            	 Common.xhr.putJSON('/v2.0/routers/'+id+'/remove_router_interface',serverData,  //需修改接口
					                     function(data){
					                    	 if(data){
					                    		 Dialog.success('删除成功');
					                			 setTimeout(function(){Dialog.closeAll()},2000);
					                    		 EditData.GetSubnetList(id);
					                    	 }else{
					                    		 Dialog.warning ('删除失败')
					                    	 }
					                     });
					             }else {
					            	 Dialog.closeAll();
					             }
					         });
					    });
			    	});
		    	}
		}
		//连接子网
	    $("#RouterTable_wrapper span.subnet").on("click",function(){
	    	var id = $(this).attr("data");
	    	EditData.GetSubnetList(id);
	    })
	}
	return{
		init:init
	}
})