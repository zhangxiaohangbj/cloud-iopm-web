define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	Common.requestCSS('css/dialog.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//render获取的数据
		Common.render(true,'tpls/ccenter/security/securitygroup/list.html','/v2.0/security-groups/page/1/10',function(){
			bindEvent();
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#SecuritygroupTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">创 建</span>'
				);
			Common.$pageContent.removeClass("loading");
		});
		$("[data-toggle='tooltip']").tooltip();
    	//载入默认的数据 inits,创建数据载入类
		var DataIniter = {
				//vdc列表
				initVdcList : function(){
					Common.xhr.ajax('/v2.0/tenants',function(data){
						var tenants = data.tenants;
						var id = $('select.tenant_id').attr("data");
						if(id!=null){
							for (var i=0;i<tenants.length;i++) {
								if (tenants[i].id==id) {
									tenants[i].selected="selected";
								}
							}
						}				
						var html = Common.uiSelect(tenants);
				    	$('select.tenant_id').html(html);
				    	
					})
				},
				//安全组列表
				initSecurityGroupList : function(){
					Common.xhr.ajax('/v2.0/security-groups',function(data){
						var securitygroups = data.security_groups;
						var id = $('select.remote_group_id').attr("data");
						if(id!=null){
							for (var i=0;i<securitygroups.length;i++) {
								if (securitygroups[i].id==id) {
									securitygroups[i].selected="selected";
								}
							}
						}				
						var html = Common.uiSelect(securitygroups);
				    	$('select.remote_group_id').html(html);
				    	
					})
				}
				
		};
		//cidr校验
	    $.validator.addMethod("cidr", function(value, element) {
	    	return this.optional(element) || /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\/\d{1,2}$/.test(value);
	    }, "请填写正确的CIDR地址");
	    //端口范围校验
	    $.validator.addMethod("port_max", function(value, element) {
	    	var optionalValue = this.optional(element);
	    	// Element is optional
	    	if (optionalValue) {
	    		return optionalValue;
	    	}
	    	var start = $("[name='port_range_min']").val();
	    	if(start == "" || start ==null) return true;
	    	 if(parseInt(value) < parseInt(start)){
	    		 return false;
	    	 }else return true;
	    	
	    }, "请输入正确的端口最大值");
	    $.validator.addMethod("port_min", function(value, element) {
	    	var optionalValue = this.optional(element);
	    	// Element is optional
	    	if (optionalValue) {
	    		return optionalValue;
	    	}
	    	var end = $("[name='port_range_max']").val();
	    	if(end == "" || end ==null) return true;
	    	
	    	 if(parseInt(value) > parseInt(end)){
	    		 return false;
	    	 }else return true;
	    	
	    }, "请输入正确的端口最小值");
		var EventsHandler = {
	    		//表单校验
				formValidator: function(){
					$(".form-horizontal").validate({
			            rules: {
			            	'name': {
			                    required: true,
			                    maxlength:255
			                },
			                'port_range_min':{
			                	digits:true,
			                	port_min:true
			                },
			                'port_range_max':{
			                	digits:true,
			                	port_max:true
			                },
			                'remote_ip_prefix':{
			                	cidr:true
			                },
			                'remote_group_id':{
			                	maxlength:36
			                }
			            }
			        });
				}
		}
		//增加按钮
		$("#SecuritygroupTable_wrapper span.btn-add").on("click",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/ccenter/security/securitygroup/add.html','',function(html){
				Dialog.show({
    	            title: '新建安全组',
    	            message: html,
    	            closeByBackdrop: false,
    	            nl2br: false,
    	            buttons: [{
    	                label: '保存',
    	                action: function(dialog) {
    	                	var valid = $(".form-horizontal").valid();
    	            		if(!valid) return false;
    	                	var data = $("#addSecuritygroup").serializeArray();
    	                	var postData={"security_group":{}};
    	                	for(var i=0;i<data.length;i++){
    	                		postData.security_group[data[i]["name"]] = data[i]["value"];
    						}
    	                	postData.security_group["is_deleted"] = 0;
    	                	Common.xhr.postJSON('/v2.0/security-groups',postData,function(data){
    	                		if(data){
    	                			Dialog.success('保存成功')
     	                			setTimeout(function(){Dialog.closeAll()},3000);
    	                			Common.router.route();
								}else{
									Dialog.warning("保存失败");
								}
    	    				});
    	                }
    	            }, {
    	                label: '取消',
    	                action: function(dialog) {
    	                    dialog.close();
    	                }
    	            }],
    	            onshown : function(dialog){
    	    			DataIniter.initVdcList();
    	    			dialog.setData("formvalid",EventsHandler.formValidator());
    	            }
    	        });
    		
			})
		});
		//删除安全组,接口为物理删除，非逻辑删
		 $("#SecuritygroupTable_wrapper a.deleteSecurityGroup").on("click",function(){
	    	 var id = $(this).attr("data");
	    	 Dialog.confirm('确定要删除该安全组吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/v2.0/security-groups/'+id,
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
		var EditData = {
		    	//添加规则
				AddSecurityRule : function(id,cb){
		    			Common.render('tpls/ccenter/security/securitygroup/addrule.html',function(html){
			    			Dialog.show({
			    	            title: '添加规则',
			    	            message: html,
			    	            nl2br: false,
			    	            buttons: [{
			    	                label: '确定',
			    	                action: function(dialog) {
			    	                	var valid = $(".form-horizontal").valid();
			    	            		if(!valid) return false;
			    	            		var data = $("#addSecurityRule").serializeArray();
			    	                	var postData={"security_group_rule":{}};
			    	                	for(var i=0;i<data.length;i++){
			    	                		postData.security_group_rule[data[i]["name"]]=data[i]["value"];
			    						}
			    	                	postData.security_group_rule["security_group_id"] = id;
			    	                	Common.xhr.postJSON('/v2.0/security-group-rules',postData,function(data){ //接口保存失败
			    	                		if(data){
			    	                			Dialog.success('保存成功')
			    	                			setTimeout(function(){Dialog.closeAll()},2000);
			    	                			EditData.GetRuleList(id);
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
		    	//获取规则列表
		    	GetRuleList :function(id){
		    		var param = {"security_group_id":id};
		    		Common.xhr.get('/v2.0/security-group-rules',param,function(data){  //获取规则列表接口，参数未起作用
		    			Common.render(true,'tpls/ccenter/security/securitygroup/rulelist.html',data,function(html){
				    		Common.initDataTable($('#SecurityruleTable'),function($tar){
				    			$tar.prev().find('.left-col:first').append(
				    					'<span class="btn btn-add">添加规则</span>'
				    				);
				    		});
				    		$("a.reload").on("click",function(){
			    		    	Common.router.route();
			    		    })
				    		//添加规则
					    	$("#SecurityruleTable_wrapper span.btn-add").on("click",function(){
					    		EditData.AddSecurityRule(id,function(){
					    			$("[name='port_range']").on("change",function(){
					    		    	var value=$("[name='port_range']").val();
					    		    	if(value == 1){
					    		    		$("#port").html('<input type="text" class="" name="port_range_min" value=""> ~ <input'
					    		    					+' type="text" class="" name="port_range_max" value="">');
					    		    	}else{
					    		    		$("#port").html('<input type="text" class="" name="port_range_min" value="">');
					    		    	}
					    		    })
					    			$("[name='remote']").on("change",function(){
					    		    	var value=$("[name='remote']").val();
					    		    	$("div.remote").css("display","none");
					    		    	$("div."+value).css("display","");
					    		    	if(!$('select.remote_group_id').html()){
					    		    		DataIniter.initSecurityGroupList();
					    		    	}
					    		    })
					    			EventsHandler.formValidator();
					    		})
					    	});
						    //删除规则,删除为物理删除，非逻辑删
						    $("#SecurityruleTable_wrapper a.btn-delete").on("click",function(){
						    	var id= $(this).attr("data");
						    	Dialog.confirm('确定要删除该规则吗?', function(result){
						             if(result) {
						            	 Common.xhr.del('/v2.0/security-group-rules/'+id,
						                     function(data){
						                    	 if(data){
						                    		 Dialog.success('删除成功')
						                			 setTimeout(function(){Dialog.closeAll()},2000);
						                    		 EditData.GetRuleList(id);
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
		    		})
		    		
		    	}
		}
		//连接子网
	    $("#SecuritygroupTable_wrapper span.securityrule").on("click",function(){
	    	var id = $(this).attr("data");
	    	EditData.GetRuleList(id);
	    })
	}
	return {
		init:init
	}
})