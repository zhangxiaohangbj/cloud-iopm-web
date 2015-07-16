define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//render获取的数据
		Common.render(true,'tpls/fservice/vpc/router/list.html',function(){
			bindEvent();
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		var table = Common.initDataTable($('#RouterTable'),{
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":"networking/v2.0/routers/page/", //ajax源，后端提供的分页接口
	    	  /*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
		      "columns": [
			        {
			        	"orderable": false,
			        	"defaultContent":"<label><input type='checkbox'></label>"
			        },
			        {"data": {}},
			        {"data": "status"},
			        {"data": "virtualEnvName"},
			        {"data": "network_name"}, //external_gateway_info.network_id
			        {"data":""}
		      ],
		      /*
		       * columnDefs 属性操作自定义列
		       * targets ： 表示具体需要操作的目标列，下标从 0 开始
		       * data: 表示我们需要的某一列数据对应的属性名
		       * render: 返回需要显示的内容。在此我们可以修改列中样式，增加具体内容
		       *  属性列表： data，之前属性定义中对应的属性值； type，未知；full,全部数据值可以通过属性列名获取 
		       * */
		      "columnDefs": [
		            {
		            	"targets":[1],
		            	"render":function(data, type, full){
		            		return "<a href='#fservice/vpc/router/detail/"+data.id+"'>"+data.name+"</a>";
		            	}
		            },
					{
					    "targets": [5],
					    "data" :"external_gateway_info.network_id",
					    "render": function(data, type, full) {
					    	var html = '<a class="subnet" data-toggle="tooltip" title="连接子网" href="javascript:void(0)">连接子网</a>';
					    	if(data!=null) html += '<a class="deleteGateway" data-toggle="tooltip" title="清除网关" href="javascript:void(0)" style="margin: 0 8px;">清除网关</a>';
					    	else html+= '<a class="setGateway" data-toggle="tooltip" title="设置网关" href="javascript:void(0)" style="margin: 0 8px;">设置网关</a>';
					    	html += '<div class="dropdown">'
					    		+'<a class="btn-opt dropdown-toggle" data-toggle="dropdown" title="更多" aria-expanded="false"><li class="fa fa-angle-double-right"></li></a>'
					    		+'<ul class="dropdown-menu" style="right: 0;left: initial;">'
								+'<li><a href="javascript:void(0)" class="editRouter" data="{{item.id}}"><i class="fa fa-pencil fa-fw"></i>编辑路由</a></li>'
								+'<li><a href="javascript:void(0)" class="deleteRouter" data="{{item.id}}"><i class="fa fa-trash-o fa-fw"></i>删除路由</a></li>'
								+'</ul></div>';
					    	return html;
					    }
					}
                ]
		    },
			function($tar){
		    	var $tbMenu = $tar.prev('.tableMenus');
		    	$tbMenu.length && $tbMenu.empty().html($('.table-menus').html());
		    	Common.$pageContent.removeClass("loading");
		});
		Common.on('click','.dataTables_filter .btn-query',function(){
			table.search($('.global-search').val()).draw();
		});
		var EventsHandler = {
	    		//表单校验
				formValidator: function(){
					$(".form-horizontal").validate({
						errorContainer:"_form",
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
				}
		}
		 //载入默认的数据 inits,创建数据载入类
		var DataIniter = {
				//子网列表
				initSubnetList : function(){
					Common.xhr.ajax('/networking/v2.0/subnets',function(data){
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
					Common.xhr.get('/networking/v2.0/networks',data,function(data){
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
		$(document).off("click","#RouterTable_wrapper span.btn-add");
	    $(document).on("click","#RouterTable_wrapper span.btn-add",function(){
	    	Common.render('tpls/fservice/vpc/router/add.html','',function(html){
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
		                	Common.xhr.postJSON('/networking/v2.0/routers',routerData,function(data){
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
	    $(document).off("click","#RouterTable_wrapper a.editRouter");
	    $(document).on("click","#RouterTable_wrapper a.editRouter",function(){
	    	var id= $(this).parents("tr:first").data("rowData.dt").id;
	    	Common.xhr.ajax('/networking/v2.0/routers/'+id,function(data){
	    		Common.render('tpls/fservice/vpc/router/edit.html',data.router,function(html){
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
		                	Common.xhr.putJSON('/networking/v2.0/routers/'+id,routerData,function(data){
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
	    $(document).off("click","#RouterTable_wrapper a.deleteRouter");
	     $(document).on("click","#RouterTable_wrapper a.deleteRouter",function(){
	    	 var id= $(this).parents("tr:first").data("rowData.dt").id;
	    	 Dialog.confirm('确定要删除该路由吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/networking/v2.0/routers/'+id,
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
	     $(document).off("click","#RouterTable_wrapper a.deleteGateway");
	     $(document).on("click","#RouterTable_wrapper a.deleteGateway",function(){
	    	 var id= $(this).parents("tr:first").data("rowData.dt").id;
	    	 Dialog.confirm('确定要清除网关吗?', function(result){
	             if(result) {
					var routerData = { "router": {"external_gateway_info": {"network_id":""}}};
					Common.xhr.putJSON('/networking/v2.0/routers/'+id, routerData,
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
	     $(document).off("click","#RouterTable_wrapper a.setGateway");
	     $(document).on("click","#RouterTable_wrapper a.setGateway",function(){
	    	 var id= $(this).parents("tr:first").data("rowData.dt").id;
	    	 Common.xhr.ajax('/networking/v2.0/routers/'+id,function(data){
				    Common.render('tpls/fservice/vpc/router/setgateway.html',data.router,function(html){
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
				                	Common.xhr.putJSON('/networking/v2.0/routers/'+id,routerData,function(data){
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
	   
		var EditData = {
		    	//添加子网连接
		    	AddRouterSubnet : function(id,cb){
		    			Common.render('tpls/fservice/vpc/router/addlinksubnet.html',function(html){
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
			    	                	Common.xhr.putJSON('/networking/v2.0/routers/'+id+'/add_router_interface',routerInterface,function(data){ //需修改接口
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
		    		Common.render(true,'tpls/fservice/vpc/router/linksubnet.html',function(html){
			    		Common.initDataTable($('#subnetTable'),{
			  		      "processing": true,  //加载效果，默认false
					      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
					      "ordering": false,   //禁用所有排序
					      "sAjaxSource":"networking/v2.0/ports/page/",
					      "fnServerData": function( sSource, aoData, fnCallback ) {
					    	  //拼装请求参数
					    	  aoData.push({"name":"device_owner","value":"network"},{"name":"device_id","value":id});
					    	    $.ajax( {   
					    	        "url": sSource + (aoData[3].value/aoData[4].value+1) +"/"+aoData[4].value, 
					    	        "data":aoData,
					    	        "dataType": "json",   
					    	        "success": function(resp) {
					    	        	resp.data = resp.result;
					    	        	resp.recordsTotal = resp.totalCount;
					    	        	resp.recordsFiltered = resp.totalCount;
					    	            fnCallback(resp);   //fnCallback：服务器返回数据后的处理函数，需要按DataTables期望的格式传入返回数据 
					    	        }   
					    	    });   
					      },
					      "columns": [
						        {
						        	"orderable": false,
						        	"defaultContent":"<label><input type='checkbox'></label>"
						        },
						        {"data": "network_id"},
						        {"data": "fixed_ips"}, //fixed_ips[0].subnet_id
						        {"data": ""}, //fixed_ips[0].ip_address
						        {"data": "status"},
						        {"data": "device_owner"},
						        {"data": "admin_state_up"},
						        {"defaultContent":""}
					      ],
					      "columnDefs": [
								{
								    "targets": [2],
								    "render": function(data, type, full) {
								    	return data != null? data[0].subnet_id:"";
								    }
								},
								{
								    "targets": [3],
								    "render": function(data, type, row) {
								    	return row.fixed_ips != null? data[0].ip_address:"";
								    }
								},
								{
								    "targets": [5],
								    "render": function(data, type, full) {
								    	if(data == "network:router_interface") return "子网链接";
								    	else return "外部网关";
								    }
								},
								{
								    "targets": [6],
								    "render": function(data, type, full) {
								    	if(data == "1") return "启用";
								    	else return "禁用";
								    }
								},
								{
								    "targets": [7],
								    "data": "device_id",
								    "render": function(data, type, row) {
								    	if(row.device_owner == "network:router_interface") 
								    		return '<a class="btn-delete" data-toggle="tooltip" title="删除" href="javascript:void(0)"><i class="fa fa-trash-o fa-fw"></i></a>';
								    }
								}
			                ]
					    },
			    		function($tar){
			    			$tar.prev().find('.left-col:first').append(
			    					'<span class="btn btn-add">添加子网连接</span>'
			    				);
			    		});
			    		$("a.reload").on("click",function(){
		    		    	Common.router.route();
		    		    })
			    		//添加子网连接
		    		    $(document).off("click","#subnetTable_wrapper span.btn-add");
				    	$(document).on("click","#subnetTable_wrapper span.btn-add",function(){
				    		EditData.AddRouterSubnet(id,function(){
				    			DataIniter.initSubnetList();
				    			EventsHandler.formValidator();
				    		})
				    	});
					    //删除子网连接
			    		$(document).off("click","#subnetTable_wrapper a.btn-delete");
					    $(document).on("click","#subnetTable_wrapper a.btn-delete",function(){
					    	var portId= $(this).attr("data");
					    	var subnetId= $(this).attr("datasubnet");
					    	Dialog.confirm('确定要删除该子网连接吗?', function(result){
					             if(result) {
					            	 var serverData = {
	    	                				  "router_id": id,
	    	                				  "subnet_id": subnetId,
	    	                				  "port_id": portId
			    	                	  };
					            	 Common.xhr.putJSON('/networking/v2.0/routers/'+id+'/remove_router_interface',serverData,  //需修改接口
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
		$(document).off("click","#RouterTable_wrapper a.subnet");
	    $(document).on("click","#RouterTable_wrapper a.subnet",function(){
	    	var id = $(this).parents("tr:first").data("rowData.dt").id;
	    	EditData.GetSubnetList(id);
	    })
	}
	return{
		init:init
	}
})