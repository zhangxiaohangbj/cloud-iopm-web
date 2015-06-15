define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3','bs/switcher'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	Common.requestCSS('css/dialog.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//render获取的数据
		Common.render(true,'tpls/ccenter/security/securitygroup.html','/v2.0/security-groups/page/1/10',function(){
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
		};
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
		//增加按钮
		$("#SecuritygroupTable_wrapper span.btn-add").on("click",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/ccenter/security/addsecuritygroup.html','',function(html){
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
		    			Common.render('tpls/ccenter/security/addrule.html',function(html){
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
			    	                	var postData={"security_group":{}};
			    	                	var security_group_rules = {};
			    	                	for(var i=0;i<data.length;i++){
			    	                		security_group_rules[data[i]["name"]]=data[i]["value"];
			    	                		
			    						}
			    	                	var security_group_rules_array=new Array();
			    	                	security_group_rules_array[0] = security_group_rules;
			    	                	postData.security_group["security_group_rules"] = security_group_rules_array;
			    	                	postData.security_group["id"]=id;
			    	                	Common.xhr.putJSON('/v2.0/security-groups/'+id,postData,function(data){ //需修改接口
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
		    		Common.render(true,'tpls/ccenter/security/securityrule.html','/v2.0/security-groups/'+id,function(html){ //需修改接口
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
				    			$("[name='ethertype']").on("change",function(){
				    		    	var value=$("[name='ethertype']").val();
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
				    		    })
				    			EventsHandler.formValidator();
				    		})
				    	});
					    //删除规则
					    $("#SecurityruleTable_wrapper a.btn-delete").on("click",function(){
					    	var id= $(this).attr("data");
					    	Dialog.confirm('确定要删除该规则吗?', function(result){
					             if(result) {
					            	 Common.xhr.del('/v2.0/security-groups/'+id,  //需修改接口
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