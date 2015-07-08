define('js/fservice/vpc/firewall/firewall', ['Common','bs/modal','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common, Dialog){
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#FirewallTable'),{
			"processing": true,  //加载效果，默认false
			"serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
			"ordering": false,   //禁用所有排序
			"sAjaxSource":"networking/v2.0/fw/firewalls/page/", //ajax源，后端提供的分页接口
			/*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
			"columns": [
				        {"orderable": false,"defaultContent":"<label><input type='checkbox'></label>"},
				        {"data": "name"},
				        {"data": "firewallPolicyName"},
				        {"data": "router_ids"},
				        {"data": "status"},
				        {"data": "admin_state_up"},
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
                	 "targets": [0],
                	 "orderable": false,
                	 "render": function() {
                		 return "<label><input type='checkbox'></label>";
                	 }
                 },
                 {
                	 "targets":[1],
                	 "render":function(data, type, full){
                		 return "<a href='javascript:void(0);' class='firewall-name'>"+data+"</a>";
                	 }
                 },
                 {
                	 "targets":[3],
                	 "render":function(data, type, full){
                		 var dataStr = "";
                		 for(var i = 0; i < data.length-1; i++){
                			 dataStr = dataStr + data[i] + ","
                		 }
                		 if(data.length > 0){
                			 dataStr = dataStr + data[data.length-1];
                		 }
                		 return dataStr;
                	 }
                 },
                 {
                	 "targets": [6],
                	 "data" :"id",
                	 "render": function(data, type, full) {
                		 var html = '<a class="editFirewall" data-toggle="tooltip" title="编辑防火墙" href="javascript:void(0)">编辑防火墙</a>';
                		 html += '<div class="dropdown">'
                			 +'<a class="btn-opt dropdown-toggle" data-toggle="dropdown" title="更多" aria-expanded="false"><li class="fa fa-angle-double-right"></li></a>'
                			 +'<ul class="dropdown-menu" style="right: 0;left: initial;">'
                			 +'<li><a href="javascript:void(0)" class="addRouter" data="{{item.id}}"><i class="fa fa-pencil fa-fw"></i>添加路由</a></li>'
                			 +'<li><a href="javascript:void(0)" class="deleteRouter" data="{{item.id}}"><i class="fa fa-pencil fa-fw"></i>删除路由</a></li>'
                			 +'<li><a href="javascript:void(0)" class="deleteFirewall" data="{{item.id}}"><i class="fa fa-trash-o fa-fw"></i>删除防火墙</a></li>'
                			 +'</ul></div>';
                		 return html;
                	 }
                 }
                 ]
			},
			function($tar){
				$tar.prev().find('.left-col:first').append('<span class="btn btn-add">创建防火墙</span>');
				var $tab = $('.tab-content').find('div.policy');
				Common.hideLocalLoading($tab);
			}
		);
		
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
			            },
			            'firewall_policy_id': {
			                required: true
			            },
			            'admin_state_up': {
			                required: true
			            }
			        }
			    });
			},
			switcher:function(){
				$(".col-sm input[type=\"checkbox\"], input[type=\"radio\"]").not("[data-switch-no-init]").switcher();
			},
			tabSwitch: function(){
				$('.create-info .nav li').on('click',function(){
					var $this = $(this);
					if(!$this.hasClass('active')){
						$('.create-info .nav li').removeClass('active');
						$this.addClass('active');
						var data = $this.attr('data-for');
						$('.create-info .tab-content').find('.tab-pane').removeClass('active');
						var $tab = $('.create-info .tab-content').find('div.' + data);
						$tab.addClass('active');
					}
				});
			}
		}
		Common.on("click","#FirewallTable_wrapper span.btn-add",function(){
			Common.render('tpls/fservice/vpc/firewall/firewall/add.html','',function(html){
				Dialog.show({
				    title: '防火墙创建',
				    message: html,
				    closeByBackdrop: false,
				    nl2br: false,
				    buttons: [{
				        label: '创建',
				        action: function(dialog) {
				        	var valid = $(".form-horizontal").valid();
				    		if(!valid) return false;
				        	var firewallData = {
			        			"firewall": {
			        				"admin_state_up":$("#addFirewall [name='admin_state_up']:checked").length?true:false,
	        						"external_gateway_info": {
		    						"network_id":$("[name='network_id']").val(),
		    						"enable_snat":true},
		    						"name":  $("[name='name']").val()
			        			}
				        	};
				        	Common.xhr.postJSON('/networking/v2.0/fw/firewalls',firewallData,function(data){
				        		if(data){
				        			Dialog.success('保存成功')
				        			setTimeout(function(){Dialog.closeAll()},2000);
			            			Common.firewall.route();
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
		//编辑防火墙
		Common.on("click","#FirewallTable_wrapper a.editFirewall", function(){
			var id= $(this).parents("tr:first").data("rowData.dt").id;
			Common.xhr.ajax('/networking/v2.0/fw/firewalls/'+id,function(data){
				Common.render('tpls/fservice/vpc/firewall/firewall/edit.html', data.firewall, function(html){
					Dialog.show({
				        title: '编辑防火墙',
				        message: html,
				        closeByBackdrop: false,
				        nl2br: false,
				        buttons: [{
				            label: '确定',
				            action: function(dialog) {
				            	var valid = $(".form-horizontal").valid();
				        		if(!valid) return false;
				            	var firewallData = {
			            			"firewall": {
			            				"admin_state_up": $("#addFirewall [name='admin_state_up']:checked").length?true:false,
	            						"name":  $("[name='name']").val()
			            			}
				            	};
				            	Common.xhr.putJSON('/networking/v2.0/fw/firewalls/'+id,firewallData,function(data){
				            		if(data){
				            			Dialog.success('保存成功')
				            			setTimeout(function(){Dialog.closeAll()},2000);
				            			Common.firewall.route();
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
		//删除防火墙
		Common.on("click","#FirewallTable_wrapper a.deleteFirewall",function(){
			var id= $(this).parents("tr:first").data("rowData.dt").id;
			Dialog.confirm('确定要删除该防火墙吗?', function(result){
				if(result) {
					Common.xhr.del('/networking/v2.0/fw/firewalls/'+id,
    					function(data){
							if(data){
								Dialog.success('删除成功')
								setTimeout(function(){Dialog.closeAll()}, 2000);
								Common.firewall.route();
							}else{
								Dialog.warning ('删除失败')
							}
					});
				}else {
					Dialog.closeAll();
				}
			});
		})
	   //防火墙明细
		Common.on("click","#FirewallTable_wrapper a.firewall-name",function(){
			Common.xhr.ajax('/networking/v2.0/fw/firewalls/'+$(this).parents("tr:first").data("rowData.dt").id,function(data){
				Common.render('tpls/fservice/vpc/firewall/firewall/detail.html',data.firewall,function(html){
					$("#page-main .page-content").html(html);
					//返回按钮
					$(".form-horizontal a.reload").on("click",function(){
						Common.firewall.route();
					})
				});
			});
		});
		
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
			},
			//根据vdc可用网络信息
			initAvailableNetWorks : function(){
				var vdc_id = currentChosenObj.vdc || $('select.tenant_id').children('option:selected').val();
				Common.xhr.get('/networking/v2.0/networks',{"vdcId":vdc_id},function(data){
					var dataArr = [];
					if(data){
						var networks = data.networks;
						require(['js/common/choose'],function(choose){
							var options = {
									selector: '#vm-networks',
									groupSelectedClass: 'col-sm-7',
									groupAllClass: 'col-sm-5',
									addCall: function($clone){
										//添加角色窗及对应的事件
										var dtd = $.Deferred();
										var netId = $clone.find('li:first').attr('data-id');
										//请求subnet
										Common.xhr.get('/networking/v2.0/subnets',{"networkId":netId},function(data){
											var selectData = [{id:"default",name:"默认子网"}].concat(data.subnets);
											var html = Common.uiSelect({list:selectData,className:'select-subnet'});
											$clone.append('<li class="pull-right fixedip"><select class="select-fixedip"><option>DHCP</option></select></li>');
											$clone.append('<li class="pull-right subnet">'+html+'</li>');
											dtd.resolve();
										});
										return dtd.promise();
									},
									delCall: function($clone){
										//去除角色窗及取消事件绑定
										$clone.children("li.fixedip").remove();
										$clone.children("li.subnet").remove();
									},
									allData: networks
							};
							choose.initChoose(options);
						});
						EventsHandler.subnetChange();
					}
				})
			}
		};
		var EditData = {
			//添加子网连接
			AddFirewallSubnet : function(id,cb){
				Common.render('tpls/fservice/vpc/firewall/firewall/addlinksubnet.html',function(html){
					Dialog.show({
						title: '连接子网',
						message: html,
						nl2br: false,
						buttons: [{
							label: '确定',
							action: function(dialog) {
								var valid = $(".form-horizontal").valid();
								if(!valid) return false;
								var firewallInterface = {
										"port_id": null,
										"subnet_id": $("[name='subnetId']").val(),
								};
								Common.xhr.putJSON('/networking/v2.0/fw/firewalls/'+id+'/add_firewall_interface',firewallInterface,function(data){ //需修改接口
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
				Common.render(true,'tpls/fservice/vpc/firewall/firewall/linksubnet.html',function(html){
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
									if(data == "network:firewall_interface") return "子网链接";
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
									if(row.device_owner == "network:firewall_interface") 
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
						Common.firewall.route();
					})
					//添加子网连接
					Common.on("click","#subnetTable_wrapper span.btn-add",function(){
						EditData.AddFirewallSubnet(id,function(){
							DataIniter.initSubnetList();
							EventsHandler.formValidator();
						})
					});
					//删除子网连接
					Common.on("click","#subnetTable_wrapper a.btn-delete",function(){
						var portId= $(this).attr("data");
						var subnetId= $(this).attr("datasubnet");
						Dialog.confirm('确定要删除该子网连接吗?', function(result){
					         if(result) {
					        	 var serverData = {
			            				  "firewall_id": id,
			            				  "subnet_id": subnetId,
			            				  "port_id": portId
					            	  };
					        	 Common.xhr.putJSON('/networking/v2.0/fw/firewalls/'+id+'/remove_firewall_interface',serverData,  //需修改接口
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
		
	}
	return{
		bindEvent: bindEvent
	}
})