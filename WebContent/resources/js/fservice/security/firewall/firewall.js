define('js/fservice/security/firewall/firewall', ['Common','bs/modal','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common, Dialog){
	var current_vdc_id = Common.cookies.getVdcId();
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		var table = Common.initDataTable($('#FirewallTable'),{
			"processing": true,  //加载效果，默认false
			"serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
			"ordering": false,   //禁用所有排序
			"sAjaxSource":"networking/v2.0/fw/firewalls/page/", //ajax源，后端提供的分页接口
			/*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
			"columns": [
				        {"orderable": false,"defaultContent":"<label><input type='checkbox'></label>"},
				        {"data": {}},
				        {"data": "firewallPolicyName"},
				        {"data": "routerNames"},
				        {"data": "status"},
				        {"data": "admin_state_up"},
				        {"data": {}},
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
                		 return '<a href="#fservice/security/firewall/firewall/detail/'+data.id+'" class="firewall-name" data="'+data.id+'">'+data.name+"</a>";
                	 }
                 },
                 {
                	 "targets":[4],
                	 "render":function(data, type, full){
                		 if(data == "ACTIVE"){return "运行中";}
                		 if(data == "DOWN"){return "未激活";}
                		 if(data == "BUILD"){return "创建中";}
                		 if(data == "ERROR"){return "错误";}
                		 if(data == "PENDING_CREATE"){return "创建中";}
                		 if(data == "PENDING_UPDATE"){return "更新中";}
                		 if(data == "PENDING_DELETE"){return "删除中";}
                		 if(data == "UNRECOGNIZED"){return "未知";}
                	 }
                 },
                 {
                	 "targets":[5],
                	 "render":function(data, type, full){
                		 if(data == true){
                			 return "可用";
                		 }else {
                			 return "禁用";
                		 }
                	 }
                 },
                 {
                	 "targets": [6],
	                 "render": function(data, type, full) {
	            		 var html = '<a class="btn-opt editFirewall" href="javascript:void(0)" data="'+data.id+'" data-name="'+data.name+'" data-toggle="tooltip" title="编辑防火墙" style="margin: 0;"><i class="fa fa-edit fa-fw"></i></a>'
	                     		    +'<a class="btn-opt deleteFirewall" href="javascript:void(0)" data="'+data.id+'" data-name="'+data.name+'" data-toggle="tooltip" title="删除防火墙" style="margin: 0;"><i class="fa fa-trash-o fa-fw"></i></a>';
	            		 return html;
	            	 }	
                 
                 
                 }
                 ]
			},
			function($tar){
		    	var $tbMenu = $tar.prev('.tableMenus');
		    	$tbMenu.length && $tbMenu.empty().html($('.table-menus').html());
		    	
				var $tab = $('.tab-content').find('div.firewall');
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
			            }
			        }
			    });
			},
			switcher:function(){
				$(".col-sm input[type=\"checkbox\"], input[type=\"radio\"]").not("[data-switch-no-init]").switcher();
			},
			tabSwitch: function(){
				$('.edit-info .nav li').on('click',function(){
					var $this = $(this);
					if(!$this.hasClass('active')){
						$('.edit-info .nav li').removeClass('active');
						$this.addClass('active');
						var data = $this.attr('data-for');
						$('.edit-info .tab-content').find('.tab-pane').removeClass('active');
						var $tab = $('.edit-info .tab-content').find('div.' + data);
						$tab.addClass('active');
					}
				});
			}
		}
		
		Common.on('click','.dataTables_filter .btn-query',function(){
			table.search($('.global-search').val()).draw();
		});
		
		Common.on("click","#FirewallTable_wrapper span.btn-add",function(){
			Common.render('tpls/fservice/security/firewall/firewall/add.html','',function(html){
				Dialog.show({
				    title: '防火墙创建',
				    message: html,
				    closeByBackdrop: false,
				    nl2br: false,
				    buttons: [{
				        label: '创建',
				        action: function(dialog) {
				        	var valid = $(".form-horizontal").valid();
				    		if(!valid){ 
				    			return false;
				    		}
				    		var routerIds = []
				    		$('#routers .list-group-select').children().each(function(i,item){
		    					var routerId = $(item).find('li:first').attr('data-id');
		    					routerIds.push(routerId);
		    				});
				        	var firewallData = {
			        			"firewall": {
			        				"tenant_id": current_vdc_id,
			        				"router_ids": routerIds,
			        				"name":  $("#editFirewall [name='name']").val(),
			        				"description":  $("#editFirewall [name='description']").val(),
			        				"firewall_policy_id": $("#editFirewall [name='firewall_policy_id']").val(),
			        				"shared":$("#editFirewall [name='shared']:checked").length?true:false,
			        				"admin_state_up":$("#editFirewall [name='admin_state_up']:checked").length?true:false
			        			}
				        	};
				        	Common.xhr.postJSON('/networking/v2.0/fw/firewalls',firewallData,function(data){
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
			        	DataIniter.initPolicyList();
			        	DataIniter.initRouters("null");
			        	EventsHandler.formValidator();
			        	EventsHandler.switcher();
			        	EventsHandler.tabSwitch();
			        }
			    });
			});
		});
		//编辑防火墙
		Common.on("click","#FirewallTable_wrapper a.editFirewall", function(){
			var id= $(this).parents("tr:first").data("rowData.dt").id;
			Common.xhr.ajax('/networking/v2.0/fw/firewalls/'+id,function(data){
				Common.render('tpls/fservice/security/firewall/firewall/edit.html', data.firewall, function(html){
					Dialog.show({
				        title: '编辑防火墙',
				        message: html,
				        closeByBackdrop: false,
				        nl2br: false,
				        buttons: [{
				            label: '确定',
				            action: function(dialog) {
				            	var valid = $(".form-horizontal").valid();
					    		if(!valid){ 
					    			return false;
					    		}
					    		var routerIds = []
					    		$('#routers .list-group-select').children().each(function(i, item){
			    					var routerId = $(item).find('li:first').attr('data-id');
			    					routerIds.push(routerId);
			    				});
					        	var firewallData = {
				        			"firewall": {
				        				"router_ids": routerIds,
				        				"name":  $("#editFirewall [name='name']").val(),
				        				"description":  $("#editFirewall [name='description']").val(),
				        				"firewall_policy_id": $("#editFirewall [name='firewall_policy_id']").val(),
				        				"admin_state_up":$("#editFirewall [name='admin_state_up']:checked").length?true:false
				        			}
					        	};
				            	Common.xhr.putJSON('/networking/v2.0/fw/firewalls/'+id, firewallData, function(data){
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
				        	DataIniter.initPolicyList(data.firewall.firewall_policy_id);
				        	DataIniter.initRouters(id);
				        	EventsHandler.formValidator();
				        	EventsHandler.switcher();
				        	EventsHandler.tabSwitch();
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
		//载入默认的数据 inits,创建数据载入类
		var DataIniter = {
			initPolicyList : function(selectId){
				var data = {vdcId: current_vdc_id};
				Common.xhr.get('/networking/v2.0/fw/firewall_policies',data,function(data){
					if(data){
						var policies = data.firewall_policies;
						if(!!selectId){
							for (var i = 0; i < policies.length; i++) {
								if (policies[i].id == selectId) {
									policies[i].selected = "selected";
								}
							}
						}
						
						var html = Common.uiSelect(policies);
						$("#editFirewall [name='firewall_policy_id']").html(html);
					}
				});
			},
			initRouters : function(firewallPolicyId){
				Common.xhr.get('/networking/v2.0/fw/firewalls/'+firewallPolicyId+'/routers', {vdcId: current_vdc_id}, function(data){
					var routers = data.routers;
					require(['js/common/choose'],function(choose){
						var options = {
							selector: '#routers',
							allData: data.notassociate,
							selectData: data.associate
						};
						choose.initChoose(options);
					});
				});
			}
		};
		
	}
	return{
		bindEvent: bindEvent
	}
})