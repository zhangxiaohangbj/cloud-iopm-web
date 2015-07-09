define('js/fservice/vpc/firewall/policy', ['Common','bs/modal','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common, Dialog){
	var current_vdc_id = Common.cookies.getVdcId();
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#PolicyTable'),{
			"processing": true,  //加载效果，默认false
			"serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
			"ordering": false,   //禁用所有排序
			"sAjaxSource":"networking/v2.0/fw/firewall_policies/page/", //ajax源，后端提供的分页接口
			/*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
			"columns": [
				        {"orderable": false,"defaultContent":"<label><input type='checkbox'></label>"},
				        {"data": {}},
				        {"data": "firewall_rules"},
				        {"data": "audited"},
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
	            		 return '<a href="#fservice/vpc/firewall/policy/detail/'+data.id+'" class="policy_name" data="'+data.id+'">'+data.name+"</a>";
	            	 }
                 },
                 {
                	 "targets":[2],
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
                	 "targets":[3],
                	 "render":function(data, type, full){
                		 if(data == true){
                			 return "已审核";
                		 }else {
                			 return "未审核";
                		 }
                	 }
                 },
                 {
                	 "targets": [4],
                	 "data" :"id",
                	 "render": function(data, type, full) {
                		 var html = '<a class="editPolicy" data-toggle="tooltip" title="编辑策略" href="javascript:void(0)">编辑策略</a>';
                		 html += '<div class="dropdown">'
                			 +'<a class="btn-opt dropdown-toggle" data-toggle="dropdown" title="更多" aria-expanded="false"><li class="fa fa-angle-double-right"></li></a>'
                			 +'<ul class="dropdown-menu" style="right: 0;left: initial;">'
                			 +'<li><a href="javascript:void(0)" class="insertRule" data="'+data.id+'"><i class="fa fa-pencil fa-fw"></i>插入规则</a></li>'
                			 +'<li><a href="javascript:void(0)" class="removeRule" data="'+data.id+'"><i class="fa fa-pencil fa-fw"></i>移除规则</a></li>'
                			 +'<li><a href="javascript:void(0)" class="deletePolicy" data="'+data.id+'"><i class="fa fa-trash-o fa-fw"></i>删除策略</a></li>'
                			 +'</ul></div>';
                		 return html;
                	 }
                 }
                 ]
			},
			function($tar){
				$tar.prev().find('.left-col:first').append('<span class="btn btn-add">创建策略</span>');
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
			            'description': {
			                maxlength:1024
			            },
			            'firewall_rule_id': {
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
			},
			insertExclusive: function(){
				$('#insertFirewallRule [name="insert_before"]').on('change', function(value){
					var value = $(this).val();
					if(value){
						$('#insertFirewallRule [name="insert_after"]').val("");
					}
				})
				$('#insertFirewallRule [name="insert_after"]').on('change', function(value){
					var value = $(this).val();
					if(value){
						$('#insertFirewallRule [name="insert_before"]').val("");
					}
				})
			}
		}
		
		 //载入默认的数据 inits,创建数据载入类
		var DataIniter = {
			//规则列表
			initUnUseRules : function(){
				var data = {firewallPolicyId: null, vdcId: current_vdc_id};
				Common.xhr.get('/networking/v2.0/fw/firewall_rules',data,function(data){
					if(data){
						var rules = data.firewall_rules;
						var addChooseDiv = $("#firewallRules");
						var insert_firewall_rule_id = $("#insertFirewallRule [name='firewall_rule_id']")
						if(addChooseDiv){
							require(['js/common/choose'],function(choose){
								var options = {
										selector: '#firewallRules',
										allData: rules
								};
								choose.initChoose(options);
							});
						}
						if(insert_firewall_rule_id){
							var html = Common.uiSelect(rules);
							insert_firewall_rule_id.html(html);
						}
					}
				});
			},
			initUsedRules : function(firewallPolicyId){
				var data = {firewallPolicyId: firewallPolicyId, vdcId: current_vdc_id};
				Common.xhr.get('/networking/v2.0/fw/firewall_rules',data,function(data){
					var rules = data.firewall_rules;
					var insert_after = $("#insertFirewallRule [name='insert_after']")
					var insert_before = $("#insertFirewallRule [name='insert_before']")
					var remove_firewall_rule_id = $("#removeFirewallRule [name='firewall_rule_id']")
					if(insert_after && insert_before){
						var datas = []
						datas.push({"id":"", "name":""});
						for(var i = 0; i < rules.length; i++){
							datas.push(rules[i]);
						}
						var html = Common.uiSelect(datas);
						insert_after.html(html);
						insert_before.html(html);
					}
					if(remove_firewall_rule_id){
						var html = Common.uiSelect(rules);
						remove_firewall_rule_id.html(html);
					}
			    	
				});
			}
			
		};
		
		//创建策略
		Common.on("click","#PolicyTable_wrapper span.btn-add",function(){
			Common.render('tpls/fservice/vpc/firewall/policy/add.html','',function(html){
				Dialog.show({
				    title: '策略创建',
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
				    		var firewallRuleIds = []
				    		$('#firewallRules .list-group-select').children().each(function(i,item){
		    					var ruleId = $(item).find('li:first').attr('data-id');
		    					firewallRuleIds.push(ruleId);
		    				});
				        	var policyData = {
			        			"firewall_policy": {
			        				"tenant_id": current_vdc_id,
		    						"name": $("#addFirewallPolicy [name='name']").val(),
		    						"description": $("#addFirewallPolicy [name='description']").val(),
		    						"shared": $("#addFirewallPolicy [name='shared']:checked").length? true:false,
    								"audited": $("#addFirewallPolicy [name='audited']:checked").length? true:false,
									"firewall_rules": firewallRuleIds
		    						
			        			}
				        	};
				        	Common.xhr.postJSON('/networking/v2.0/fw/firewall_policies',policyData,function(data){
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
			        	DataIniter.initUnUseRules();
			        	EventsHandler.formValidator();
			        	EventsHandler.switcher();
			        	EventsHandler.tabSwitch();
			        }
			    });
			});
		});
		
		//编辑策略
		Common.on("click","#PolicyTable_wrapper a.editPolicy", function(){
			var id= $(this).parents("tr:first").data("rowData.dt").id;
			Common.xhr.ajax('/networking/v2.0/fw/firewall_policies/'+id,function(data){
				Common.render('tpls/fservice/vpc/firewall/policy/edit.html', data.firewall_policy, function(html){
					Dialog.show({
				        title: '编辑策略',
				        message: html,
				        closeByBackdrop: false,
				        nl2br: false,
				        buttons: [{
				            label: '确定',
				            action: function(dialog) {
				            	var valid = $(".form-horizontal").valid();
				        		if(!valid) return false;
				            	var policyData = {
			            			"firewall_policy": {
			    						"name": $("#editFirewallPolicy [name='name']").val(),
			    						"description": $("#editFirewallPolicy [name='description']").val(),
			    						"shared": $("#editFirewallPolicy [name='shared']:checked").length? true:false,
	    								"audited": $("#editFirewallPolicy [name='audited']:checked").length? true:false
				        			}
				            	};
				            	Common.xhr.putJSON('/networking/v2.0/fw/firewall_policies/'+id,policyData,function(data){
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
		//删除策略
		Common.on("click","#PolicyTable_wrapper a.deletePolicy",function(){
			var id= $(this).parents("tr:first").data("rowData.dt").id;
			Dialog.confirm('确定要删除该策略吗?', function(result){
				if(result) {
					Common.xhr.del('/networking/v2.0/fw/firewall_policies/'+id,
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
		//插入规则
		Common.on("click","#PolicyTable_wrapper a.insertRule", function(){
			var id= $(this).parents("tr:first").data("rowData.dt").id;
			Common.render('tpls/fservice/vpc/firewall/policy/insert_rule.html', function(html){
				Dialog.show({
			        title: '插入规则',
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
			            	var ruleStrategy = {
		            			"firewall_rule_id": $("#insertFirewallRule [name='firewall_rule_id']").val(),
		            			"insert_after": $("#insertFirewallRule [name='insert_after']").val(),
		            			"insert_before": $("#insertFirewallRule [name='insert_before']").val()
			            	};
			            	Common.xhr.putJSON('/networking/v2.0/fw/firewall_policies/'+id+'/insert_rule',ruleStrategy,function(data){
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
			        	DataIniter.initUnUseRules();
			        	DataIniter.initUsedRules(id);
			        	EventsHandler.insertExclusive();
			        	EventsHandler.formValidator();
			        }
			    });
			})
		});
		//移除规则
		Common.on("click","#PolicyTable_wrapper a.removeRule", function(){
			var id= $(this).parents("tr:first").data("rowData.dt").id;
			Common.render('tpls/fservice/vpc/firewall/policy/remove_rule.html', function(html){
				Dialog.show({
			        title: '移除规则',
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
			            	var ruleStrategy = {
		            			"firewall_rule_id": $("#removeFirewallRule [name='firewall_rule_id']").val()
			            	};
			            	Common.xhr.putJSON('/networking/v2.0/fw/firewall_policies/'+id+'/remove_rule', ruleStrategy, function(data){
			            		if(data){
			            			Dialog.success('保存成功')
			            			setTimeout(function(){Dialog.closeAll()}, 2000);
			            			Common.router.route();
								}else{
									 Dialog.warning ('保存失败')
								}
							})
			            }
			        }],
			        onshown : function(){
			        	DataIniter.initUsedRules(id);
			        	EventsHandler.formValidator();
			        }
			    });
			})
		});
		
	}
	return{
		bindEvent: bindEvent
	}
})