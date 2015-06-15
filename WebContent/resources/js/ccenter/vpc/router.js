define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3','bs/switcher'],function(Common,Dialog){
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
			                    maxlength:255
			                }
			            }
			        });
				}
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
					Common.xhr.ajax('/v2.0/networks',function(data){
						var networks = data.networks;
						var id = $("[name='networkId']").attr("data");
						if(id!=null){
							for (var i=0;i<networks.length;i++) {
								if (networks[i].id==id) {
									networks[i].selected="selected";
								}
							}
						}				
						var html = Common.uiSelect(networks);
				    	$("[name='networkId']").html(html);
				    	
					})
				}
		};
		//创建路由
	    $("#RouterTable_wrapper span.btn-add").on("click",function(){
	    	Dialog.show({
	            title: '路由创建',
	            message: '<form class="form-horizontal" id="addRouter"><div class="form-group"><label for="name" class="control-label col-sm-3">'
	            	+'<span style="color: red;">* </span>路由名称：</label><div class="col-sm-7 col-sm">'
	    			+'<input type="text" class="dialog-form-control" name="name" value=""></div></div>'
	    			+'<div class="form-group"><label for="network_id" class="control-label col-sm-3">'
	    		 	+'<span style="color: red;">* </span>VPC：</label><div class="col-sm-7 col-sm">'
	    		 	+'<select class="dialog-form-control select" name="networkId"></select></div></div></form>',
	            nl2br: false,
	            buttons: [{
	                label: '创建',
	                action: function(dialog) {
	                	var valid = $(".form-horizontal").valid();
	            		if(!valid) return false;
	                	var serverData = {
            				  "router": {
            				    "admin_state_up": true,
            				    "enable_snat": true,
            				    "external_gateway_info": {
            				    		"network_id":$("[name='networkId']").val(),
            				    		"enable_snat":true},
            				    "gw_port_id": "",
            				    "name":  $("[name='name']").val(),
            				    "status": "",
            				    "tenant_id": "vdcid1"
            				  }
	                	  };
	                	Common.xhr.postJSON('/v2.0/routers',serverData,function(data){
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
	            }
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
		            nl2br: false,
		            buttons: [{
		                label: '确定',
		                action: function(dialog) {
		                	var valid = $(".form-horizontal").valid();
		            		if(!valid) return false;
		                	var serverData = {
	            				  "router": {
	            				    "admin_state_up": true,
	            				    "enable_snat": true,
	            				    "external_gateway_info": {
	            				    		"enable_snat":true},
	            				    "gw_port_id": "",
	            				    "name":  $("[name='name']").val(),
	            				    "status": ""
	            				  }
		                	  };
		                	Common.xhr.putJSON('/v2.0/routers/'+id,serverData,function(data){
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
		            }
		        });
	    		})
	    	});
	    });
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
	            	 Common.xhr.del('/v2.0/routers/'+id,  //需修改接口
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
	         });
	     })
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
			    	                	var serverData = {
	    	                				  "port_id": null,
	    	                				  "subnet_id": $("[name='subnetId']").val(),
			    	                	  };
			    	                	Common.xhr.putJSON('/v2.0/routers/'+id+'/add_router_interface',serverData,function(data){ //需修改接口
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
					                    		 Dialog.success('删除成功')
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