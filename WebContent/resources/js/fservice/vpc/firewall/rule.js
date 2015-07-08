define('js/fservice/vpc/firewall/rule', ['Common','bs/modal','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common, Dialog){
	var current_vdc_id = Common.cookies.getVdcId();
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#RuleTable'),{
			"processing": true,  //加载效果，默认false
			"serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
			"ordering": false,   //禁用所有排序
			"sAjaxSource":"networking/v2.0/fw/firewall_rules/page/", //ajax源，后端提供的分页接口
			/*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
			"columns": [
				        {"orderable": false,"defaultContent":"<label><input type='checkbox'></label>"},
				        {"data": {}},
				        {"data": "protocol"},
				        {"data": "source_ip_address"},
				        {"data": "source_port"},
				        {"data": "destination_ip_address"},
				        {"data": "destination_port"},
				        {"data": "action"},
				        {"data": "enabled"},
				        {"data": "firewallPolicyName"},
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
                		 return '<a href="#fservice/vpc/firewall/rule/detail/'+data.id+'" class="rule_name" data="'+data.id+'">'+data.name+"</a>";
                	 }
                 },
                 {
                	 "targets":[7],
                	 "render":function(data, type, full){
                		 if(data == 'ALLOW') return ' <span class="text-success">允许</span>';
                		 if(data == 'DENY') return ' <span class="text-danger">拒绝</span>';
                		 if(data == 'UNRECOGNIZED') return ' <span class="text-warning">未确认</span>';
                		 return '<span class="text-danger">未知</span>';
                	 }
                 },
                 {
                	 "targets":[8],
                	 "render":function(data, type, full){
                		 if(data == true){
                			 return "可用";
                		 }else {
                			 return "禁用";
                		 }
                	 }
                 },
                 {
                	 "targets": [10],
                	 "data": "id",
                	 "render": function(data, type, full) {
                		 var html = '<a class="btn-opt editFirewallRule" href="javascript:void(0)" data="{{item.id}}" data-toggle="tooltip" title="编辑规则" style="margin: 0;"><i class="fa fa-edit fa-fw"></i></a>'
                         		   +'<a class="btn-opt deleteFirewallRule" href="javascript:void(0)" data="{{item.id}}" data-name="{{item.name}}" data-toggle="tooltip" title="删除规则" style="margin: 0;"><i class="fa fa-trash-o fa-fw"></i></a>';
                		 return html;
                	 }
                 }
                 ]
			},
			function($tar){
				$tar.prev().find('.left-col:first').append('<span class="btn btn-add">创建规则</span>');
				var $tab = $('.tab-content').find('div.policy');
				Common.hideLocalLoading($tab);
			}
		);
		$.validator.addMethod("ip", function(value, element) {
	    	return this.optional(element) || /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(value);
	    }, "请填写正确的IP地址");
		$.validator.addMethod("port", function(value, element) {
			if(value.indexOf(":") > -1){
				var strs = value.split(":");
				if(strs.length>2){
					return false;
				}
				if(isNaN(strs[0]) || strs[0] < 0 || strs[0] > 65535 || isNaN(strs[1]) || strs[1] < 0 || strs[1] > 65535){
					return false;
				}
				return true;
				
			}else{
				if(isNaN(value)){
					return false;
				}
				if(value < 0 || value>65535){
					return false;
				}
				return true;
			}
	    }, "请填写正确的端口");
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
			            'source_ip_address': {
			                ip:true
			            },
			            'source_port': {
			                port:true
			            },
			            'destination_ip_address': {
			            	ip:true
			            },
			            'destination_port': {
			            	port:true
			            }
			        }
			    });
			},
			switcher:function(){
				$(".col-sm input[type=\"checkbox\"], input[type=\"radio\"]").not("[data-switch-no-init]").switcher();
			}
		}
		//创建规则
		Common.on("click","#RuleTable_wrapper span.btn-add",function(){
			Common.render('tpls/fservice/vpc/firewall/rule/add.html','',function(html){
				Dialog.show({
				    title: '规则创建',
				    message: html,
				    closeByBackdrop: false,
				    nl2br: false,
				    buttons: [{
				        label: '创建',
				        action: function(dialog) {
				        	var valid = $(".form-horizontal").valid();
				    		if(!valid) return false;
				        	var ruleData = {
			        			"firewall_rule": {
			        				"tenant_id": current_vdc_id,
		    						"name":  $("#addFirewallRule [name='name']").val(),
		    						"description":  $("#addFirewallRule [name='description']").val(),
		    						"protocol":  $("#addFirewallRule [name='protocol']").val(),
		    						"source_ip_address":  $("#addFirewallRule [name='source_ip_address']").val(),
		    						"source_port":  $("#addFirewallRule [name='source_port']").val(),
		    						"destination_ip_address":  $("#addFirewallRule [name='destination_ip_address']").val(),
		    						"destination_port":  $("#addFirewallRule [name='destination_port']").val(),
		    						"ip_version":  $("#addFirewallRule [name='ip_version']").val(),
		    						"shared": $("#addFirewallRule [name='shared']:checked").length? true:false,
		    						"action": $("#addFirewallRule [name='action']:checked").length? "ALLOW":"DENY",
    								"enabled": $("#addFirewallRule [name='enabled']:checked").length? true:false
		    						
			        			}
				        	};
				        	Common.xhr.postJSON('/networking/v2.0/fw/firewall_rules',ruleData,function(data){
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
			});
		});
		//编辑规则
		Common.on("click","#RuleTable_wrapper a.editFirewallRule", function(){
			var id= $(this).parents("tr:first").data("rowData.dt").id;
			Common.xhr.ajax('/networking/v2.0/fw/firewall_rules/'+id,function(data){
				Common.render('tpls/fservice/vpc/firewall/rule/edit.html', data.firewall_rule, function(html){
					Dialog.show({
				        title: '编辑规则',
				        message: html,
				        closeByBackdrop: false,
				        nl2br: false,
				        buttons: [{
				            label: '确定',
				            action: function(dialog) {
				            	var valid = $(".form-horizontal").valid();
				        		if(!valid) return false;
				            	var ruleData = {
				            			"firewall_rule": {
				    						"name":  $("#addFirewallRule [name='name']").val(),
				    						"description":  $("#addFirewallRule [name='description']").val(),
				    						"protocol":  $("#addFirewallRule [name='protocol']").val(),
				    						"source_ip_address":  $("#addFirewallRule [name='source_ip_address']").val(),
				    						"source_port":  $("#addFirewallRule [name='source_port']").val(),
				    						"destination_ip_address":  $("#addFirewallRule [name='destination_ip_address']").val(),
				    						"destination_port":  $("#addFirewallRule [name='destination_port']").val(),
				    						"shared": $("#addFirewallRule [name='shared']:checked").length? true:false,
				    						"action": $("#addFirewallRule [name='action']:checked").length? "ALLOW":"DENY",
		    								"enabled": $("#addFirewallRule [name='enabled']:checked").length? true:false
				    						
					        			}
				            	};
				            	Common.xhr.putJSON('/networking/v2.0/fw/firewall_rules/'+id,ruleData,function(data){
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
		//删除规则
		Common.on("click","#RuleTable_wrapper a.deleteFirewallRule",function(){
			var id= $(this).parents("tr:first").data("rowData.dt").id;
			Dialog.confirm('确定要删除该规则吗?', function(result){
				if(result) {
					Common.xhr.del('/networking/v2.0/fw/firewall_rules/'+id,
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
		
		
	}
	return{
		bindEvent: bindEvent
	}
})