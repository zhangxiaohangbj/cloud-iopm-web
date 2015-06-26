define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//render
		Common.render(true,{
			tpl:'tpls/sysmanagement/user/list.html',
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#UserTable'),{
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":"v2.0/users/page/", //ajax源，后端提供的分页接口
		      /*fnServerData是与服务器端交换数据时被调用的函数
		       * sSource： 就是sAjaxSource中指定的地址，接收数据的url需要拼装成 v2.0/users/page/10/1 格式
		       *      aoData[4].value为每页显示条数，aoData[3].value/aoData[4].value+1为请求的页码数
		       * aoData：请求参数，其中包含search 输入框中的值
		       * */
		      "fnServerData": function( sSource, aoData, fnCallback ) {
		    	    $.ajax( {   
		    	        "url": sSource + aoData[4].value+"/"+(aoData[3].value/aoData[4].value+1), 
		    	        "data":aoData,
		    	        "dataType": "json",   
		    	        "success": function(resp) {
		    	        	/*渲染前预处理后端返回的数据为DataTables期望的格式,
		    	        	 * 后端返回数据格式 {"pageNo":1,"pageSize":5,"orderBy":null,"order":null,"autoCount":true,"result":[{"id":"07da487da17b4354a4b5d8e2b2e41485","name":"wzz"}],
		    	        	 * "totalCount":31,"first":1,"orderBySetted":false,"totalPages":7,"hasNext":true,"nextPage":2,"hasPre":false,"prePage":1}
		    	        	 * DataTables期望的格式 {"draw": 2,"recordsTotal": 11,"recordsFiltered": 11,"data": [{"id": 1,"firstName": "Troy"}]}
							*/
		    	        	resp.data = resp.result;
		    	        	resp.recordsTotal = resp.totalCount;
		    	        	resp.recordsFiltered = resp.totalCount;
		    	            fnCallback(resp);   //fnCallback：服务器返回数据后的处理函数，需要按DataTables期望的格式传入返回数据 
		    	        }   
		    	    });   
		      },
	    	  /*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
		      "columns": [
			        {"data": ""},
			        {"data": "name"},
			        {"data": "trueName"},
			        {"data": "phone"},
			        {"data": "email"},
			        {"data": "status"}
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
					    "targets": [5],
					    "data": "status",
					    "render": function(data, type, full) {
					    	if(data == "normal") return "正常";
					    	if(data == "locked") return "已锁定";
					    	if(data == "delete") return "已删除";
					    	if(data == "disabled") return "已禁用";
					    	if(data == "reset_pwd") return "密码重置";
					    }
					},
                     {
                       "targets": [6],
                       "data": "id",
                       "render": function(data, type, full) {
                         return '<a class="btn-edit" data-toggle="tooltip" title="编辑" href="javascript:void(0)" data="'+data+'" data-act="stop" style="margin: 0 8px;"><li class="glyphicon glyphicon-edit"></li></a>'
							+'<a class="btn-delete" data-toggle="tooltip" title="删除" href="javascript:void(0)" data="'+data+'" style="margin: 0 8px;"><i class="fa fa-trash-o fa-fw"></i></a>'
							+'<a class="btn-edit-role" data-toggle="tooltip" title="权限设置" href="javascript:void(0)" data="'+data+'" style="margin: 0 8px;">权限设置</a>';
                       }
                     }
                ]
		    },
		    function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">新建用户 </span>'
				);
			Common.$pageContent.removeClass("loading");
		});
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
					$("#authorityInfo tbody").append('<tr><td><span class="vdc"></span><input type="hidden" name="vdc"/><span class="btn btn-primary chooseVDC">选择</span></td>'
							+'<td><span class="role"></span><input type="hidden" name="role"/><span class="btn btn-primary chooseRole">选择</span></td>'
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
		$(document).off("click","#UserTable_wrapper span.btn-add");
	    $(document).on("click","#UserTable_wrapper span.btn-add",function(){
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
		$(document).off("click","#UserTable_wrapper a.btn-edit");
		$(document).on("click","#UserTable_wrapper a.btn-edit",function(){
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
			$(document).off("click","#UserTable_wrapper a.btn-delete");
			$(document).on("click","#UserTable_wrapper a.btn-delete",function(){
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
			})
			//权限设置
			$(document).off("click","a.btn-edit-role");
			$(document).on("click","a.btn-edit-role",function(){
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