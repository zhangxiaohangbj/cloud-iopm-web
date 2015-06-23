define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/sysmanagement/user/list.html',
			data:'/v2.0/users/page/10/1',
			beforeRender: function(data){
				return data.result;
			},
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#UserTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">新建用户 </span>'
				);
			Common.$pageContent.removeClass("loading");
		});
		//载入默认的数据 inits,创建数据载入类
//		var DataIniter = {
//			//vdc列表
//			initVdcList : function(){
//				Common.xhr.ajax('/v2.0/tenants',function(data){
//					var tenants = data.tenants;
//					var id = $('select.tenant_id').attr("data");
//					if(id!=null){
//						for (var i=0;i<tenants.length;i++) {
//							if (tenants[i].id==id) {
//								tenants[i].selected="selected";
//							}
//						}
//					}				
//					var html = Common.uiSelect(tenants);
//			    	$('select.tenant_id').html(html);
//			    	
//				})
//			}
//		}
		//载入后的事件
		var EventsHandler = {
			//选择部门
			organChoose : function(){
				$(document).off("click","input[name='organ_id']");
				$(document).on("click","input[name='organ_id']",function(){
					Modal.show({
	    	            title: '选择部门',
	    	            message: "",
	    	            closeByBackdrop: false,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '确定',
	    	                action: function(dialog) {
	    	                	 dialog.close();
	    	                }
	    	            }, {
	    	                label: '取消',
	    	                action: function(dialog) {
	    	                    dialog.close();
	    	                }
	    	            }],
	    	            onshown : function(dialog){
	    	    			dialog.setData("formvalid",EventsHandler.formValidator());
	    	            }
	    	        });
				});
			},	
			//选择VDC
			chooseVDC :function(){
				$(document).off("click","span.chooseVDC");
				$(document).on("click","span.chooseVDC",function(){
					var obj = $(this);
					var vdc_id = obj.prev().val();
					Common.render({
						tpl:'tpls/sysmanagement/user/vdclist.html',
						data:'/v2.0/tenants',    //需修改接口
						beforeRender: function(data){
							data.vdc_id = vdc_id;
							return data;
						},
						callback: function(html){
							Modal.show({
			    	            title: '选择VDC',
			    	            message: html,
			    	            closeByBackdrop: false,
			    	            nl2br: false,
			    	            buttons: [{
			    	                label: '确定',
			    	                action: function(dialog) {
			    	                	if($("#chooseVDCTable input[type='radio']:checked").length == 0){
			    	                		Modal.warning("请选择VDC");
			    	                		return;
			    	                	}
			    	                	obj.parent().find(".vdc").html($("#chooseVDCTable input[type='radio']:checked").parent().next().html());
			    	                	obj.parent().find("[name='vdc']").val($("#chooseVDCTable input[type='radio']:checked").next().val());
			    	                	dialog.close();
			    	                }
			    	            }, {
			    	                label: '取消',
			    	                action: function(dialog) {
			    	                    dialog.close();
			    	                }
			    	            }],
			    	            onshown : function(dialog){
			    	            	Common.initDataTable($('#chooseVDCTable'));
			    	            }
			    	        });
						}
					})
				});
			},
			//选择角色
			chooseRole :function(){
				$(document).off("click","span.chooseRole");
				$(document).on("click","span.chooseRole",function(){
					var obj = $(this);
					Common.render('tpls/sysmanagement/user/rolelist.html','/v2.0/roles/page/10/1',function(html){
						Modal.show({
		    	            title: '选择角色',
		    	            message: html,
		    	            closeByBackdrop: false,
		    	            nl2br: false,
		    	            buttons: [{
		    	                label: '确定',
		    	                action: function(dialog) {
		    	                	var role_text = "";
		    	                	var role_id = "";
		    	                	$("#chooseRoleTable input[type='checkbox']:checked").each(function(){
		    	                		role_text += $(this).parent().next().html()+",";
		    	                		role_id += $(this).next().val()+",";
		    	                	})
		    	                	obj.parent().find(".role").html(role_text.substring(0,role_text.length-1));
		    	                	obj.parent().find("[name='role']").val(role_id.substring(0,role_id.length-1));
		    	                	dialog.close();
		    	                }
		    	            }, {
		    	                label: '取消',
		    	                action: function(dialog) {
		    	                    dialog.close();
		    	                }
		    	            }],
		    	            onshown : function(dialog){
		    	            	Common.initDataTable($('#chooseRoleTable'));
//		    	    			dialog.setData("formvalid",EventsHandler.formValidator());
		    	            }
		    	        });
					});
					
				});
			},
			//权限信息添加行
			addAuthority :function(){
				$(document).off("click","span.addAuthority");
				$(document).on("click","span.addAuthority",function(){
					$("#authorityInfo tbody").append('<tr><td><span class="vdc"></span><span class="btn btn-primary chooseVDC">选择</span></td>'
							+'<td><span class="role"></span><span class="btn btn-primary chooseRole">选择</span></td>'
							+'<td><a class="btn-delete" data-toggle="tooltip" title="删除" href="javascript:void(0)" style="margin: 0 8px;">'
							+'<i class="fa fa-trash-o fa-fw"></i></a></td></tr>');
					EventsHandler.chooseVDC();
					EventsHandler.chooseRole();
				})
			},
			//权限信息删除行
			delAuthority :function(){
				$(document).off("click","a.btn-delete");
				$(document).on("click","a.btn-delete",function(){
					$(this).parent().parent().remove();
				})
			},
			//配额的表单验证
			user_form:function($form){
				if(!$form)return null;
				return $form.validate({
					errorContainer: "_form",
					rules:{
						'name': {
		                    required: true,
		                    maxlength:50
		                },
		                'password': {
		                    required: true,
		                    maxlength:50
		                },
		                'password_again': {
		                    required: true,
		                    maxlength:50,
		                    equalTo:'#password'
		                },
		                'phone': {
		                    maxlength:50
		                },
		                'email': {
		                	email:true,
		                    maxlength:50
		                },
		                'trueName': {
		                    maxlength:50
		                },
		                'organId': {
		                    required: true,
		                    maxlength:36
		                }
					},
					messages: {
						'password_again': {
		                    equalTo:'请与密码保持一致'
		                }
					}
				})
			}
			
		}
		var jsonData = {
				authorityJson:function(obj){
					var authorityList = [];
					$(obj+" tbody").find("tr").each(function(i,element){
						var vdc_id = $(element).find("[name='vdc']").val();
						var role_id = $(element).find("[name='role']").val();
						var role_ids = role_id.split(",");
						for(var i = 0; i<role_ids.length;i++){
							authorityList.push({"scopeId":vdc_id,"roleId":role_ids[i],"scopeType":"tenant"});
						}
					});
					return authorityList;
				},
				roleJson:function(obj){
					var roleList = [];
					$(obj+" tbody").find("tr").each(function(i,element){
						var vdc_id = $(element).find("[name='vdc']").val();
						var role_id = $(element).find("[name='role']").val();
						var role_ids = role_id.split(",");
						var roles = [];
						for(var i = 0; i<role_ids.length;i++){
							roles.push({"id":role_ids[i]})
						}
						roleList.push({"id":vdc_id,"roles":roles});
					});
					return roleList;
				}
		}
		//增加按钮
	    $("#UserTable_wrapper span.btn-add").on("click",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/sysmanagement/user/add.html','',function(html){
				$('body').append(html);
				//wizard show
    			$.fn.wizard.logging = true;
    			var wizard;
    			
		    	//载入依赖数据
		    	
		    	//载入事件
    			EventsHandler.organChoose();
    			EventsHandler.addAuthority();
				EventsHandler.chooseVDC();
				EventsHandler.chooseRole();
				EventsHandler.delAuthority();
    			
    			wizard = $('#create-user-wizard').wizard({
    				keyboard : false,
    				contentHeight : 526,
    				contentWidth : 900,
    				showCancel: true,
    				backdrop: 'static',
    				buttons: {
    	                cancelText: "取消",
    	                nextText: "下一步",
    	                backText: "上一步",
    	                submitText: "确定",
    	                submittingText: "提交中..."
    	            },
    	            validate: {
	            		0: function(){
	            			return this.el.find('form').valid();
	            		}
    	            }
    			});
    			//加载时载入validate
    			wizard.on('show',function(){
    				wizard.form.each(function(){
    					//表单校验
    					EventsHandler.user_form($(this));
    				})
    				
    			});
    			//确认信息卡片被选中的监听
    			wizard.cards.confirm.on('selected',function(card){
    				//获取上几步中填写的值
//    				var serverData = wizard.serializeObject()
//    				$('.name-confirm').text(serverData.name)
    				$("#editUserBasic input[type='text']").each(function(){
						$("#confirm label[name='"+$(this).attr("name")+"']").html($(this).val());
                	});
					$("#editUserBasic select").each(function(){
						$("#confirm label[name='"+$(this).attr("name")+"']").html($(this).find("option:selected").html());
                	});
					$("#confirm .table tbody").html($("#authorityInfo tbody").html());
					$("#confirm .table .chooseVDC").remove();
					$("#confirm .table .chooseRole").remove();
					$("#confirm .table tr").each(function(){
						$(this).find("td:last").remove();
					})
				});
    			//展现wizard
    			wizard.show();
    			
    			//wizard.disableNextButton();
    			//关闭弹窗
				var closeWizard = function(){
    				$('div.wizard').remove();
    				$('div.modal-backdrop').remove();
    			}
				//关闭后移出dom
    			wizard.on('closed', function() {
    				closeWizard();
    				
    			});
    			//创建提交数据
    			wizard.on("submit", function(wizard) {
    				var postData={
        					"name": $(" [name='name']").val(),
        					"password": $(" [name='password']").val(),
        					"status": $(" [name='status']").val(),
        					"phone": $(" [name='phone']").val(),
        					"email": $( " [name='email']").val(),
        					"trueName": $( " [name='trueName']").val(),
        					"organId": $( " [name='organId']").val()
            				};
    				postData.userRoleList = jsonData.authorityJson("#authorityInfo");
    				Common.xhr.postJSON('/v2.0/users',postData,function(data){
    					wizard._submitting = false;
    					wizard.updateProgressBar(100);
    					closeWizard();
    					Common.router.reload();
    				})
    			});
			});
	    });
		//编辑用户信息
	    $("#UserTable_wrapper a.btn-edit").on("click",function(){
	    	var id= $(this).attr("data");
	    	Common.xhr.ajax('/v2.0/users/'+id,function(data){  //需修改接口
	    		Common.render('tpls/sysmanagement/user/edit.html',data,function(html){
	    			Modal.show({
	    	            title: '用户信息编辑',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
	    	            		var serverData = {
	    	        					"name": $(" [name='name']").val(),
	    	        					"password": $(" [name='password']").val(),
	    	        					"status": $(" [name='status']").val(),
	    	        					"phone": $(" [name='phone']").val(),
	    	        					"email": $( " [name='email']").val(),
	    	        					"trueName": $( " [name='trueName']").val(),
	    	        					"organId": $( " [name='organId']").val()
	    	            				};
	    	                	Common.xhr.putJSON('/v2.0/users/'+id,serverData,function(data){
	    	                		if(data){
	    	                			Modal.success('保存成功')
	    	                			setTimeout(function(){Modal.closeAll()},2000);
	    	                			Common.router.route();
									}else{
										Modal.warning ('保存失败')
									}
								})
	    	                }
	    	            }, {
	    	                label: '取消',
	    	                action: function(dialog) {
	    	                    dialog.close();
	    	                }
	    	            }],
	    	            onshown : function(){
	    	            	EventsHandler.organChoose();
	    	            	EventsHandler.user_form($(".form-horizontal"));
	    	            }
	    	        });
	    		});
	    		});
	    });
	    //删除用户
	     $("#UserTable_wrapper a.btn-delete").on("click",function(){
	    	 var id = $(this).attr("data");
	    	 Modal.confirm('确定要删除该用户吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/v2.0/users/'+id,
	                     function(data){
	                    	 if(data){
	                    		 Modal.success('删除成功')
	                			 setTimeout(function(){Modal.closeAll()},2000);
	                    		 Common.router.route();
	                    	 }else{
	                    		 Modal.warning ('删除失败')
	                    	 }
	                     });
	             }else {
	            	 Modal.closeAll();
	             }
	         });
	     });
	     //权限设置
	     $("#UserTable_wrapper a.btn-edit-role").on("click",function(){
		    	var id= $(this).attr("data");
		    	Common.xhr.ajax('/v2.0/users/tenants/'+id,function(data){  //需修改接口
		    		Common.render('tpls/sysmanagement/user/editrole.html',data,function(html){
		    			Modal.show({
		    	            title: '用户权限设置',
		    	            message: html,
		    	            nl2br: false,
		    	            buttons: [{
		    	                label: '保存',
		    	                action: function(dialog) {
		    	                	var serverData = jsonData.roleJson("#authorityInfo");
		    	                	Common.xhr.postJSON('/v2.0/users/tenants/'+id,serverData,function(data){
		    	                		if(data){
		    	                			Modal.success('保存成功')
		    	                			setTimeout(function(){Modal.closeAll()},2000);
		    	                			Common.router.route();
										}else{
											Modal.warning ('保存失败')
										}
									})
		    	                }
		    	            }, {
		    	                label: '取消',
		    	                action: function(dialog) {
		    	                    dialog.close();
		    	                }
		    	            }],
		    	            onshown : function(){
		    	            	EventsHandler.addAuthority();
		    					EventsHandler.chooseVDC();
		    					EventsHandler.chooseRole();
		    					EventsHandler.delAuthority();
		    	            }
		    	        });
		    		});
		    		});
		    });
	}
	return {
		init:init
	}
})