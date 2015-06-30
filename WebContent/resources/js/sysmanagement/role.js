define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/sysmanagement/role/list.html',
			data:'/identity/v2.0/roles/page/1/10',
			beforeRender: function(data){
				return data.result;
			},
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#RoleTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">新建角色 </span>'
				);
			Common.$pageContent.removeClass("loading");
		});
		var EventsHandler = {
				//表单校验
				formValidator: function(){
					$(".form-horizontal").validate({
						errorContainer: '_form',
			            rules: {
			            	'name': {
			                    required: true,
			                    maxlength:50
			                },
			                'description': {
			                    maxlength:100
			                }
			            }
			        });
				}
		}
		//增加按钮
	    $("#RoleTable_wrapper span.btn-add").on("click",function(){
	    	Common.render('tpls/sysmanagement/role/add.html',function(html){
	    		Modal.show({
    	            title: '新建角色',
    	            message: html,
    	            nl2br: false,
    	            buttons: [{
    	                label: '保存',
    	                action: function(dialog) {
    	                	var valid = $(".form-horizontal").valid();
    	            		if(!valid) return false;
    	                	var serverData ={
    	                			"name": $("[name='name']").val(),
    	                			"description": $("[name='description']").val()
        					};
    	                	Common.xhr.postJSON('/identity/v2.0/OS-KSADM/roles',serverData,function(data){
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
    	            	EventsHandler.formValidator();
    	            }
    	        });
    		});
	    });
		//编辑用户角色
//	    $("#RoleTable_wrapper a.btn-edit").on("click",function(){
//	    	var id= $(this).attr("data");
//	    	Common.xhr.ajax('/v2.0/subnets/'+id,function(data){  //需修改接口
//	    		data={
//	    				"role_name":"role1",
//	    				"role_desc":"role1......."
//	    		}
//	    		Common.render('tpls/sysmanagement/role/edit.html',data,function(html){
//	    			Modal.show({
//	    	            title: '编辑角色',
//	    	            message: html,
//	    	            nl2br: false,
//	    	            buttons: [{
//	    	                label: '保存',
//	    	                action: function(dialog) {
//	    	                	var valid = $(".form-horizontal").valid();
//	    	            		if(!valid) return false;
//	    	            		var serverData = {
//		    	                	  };
//	    	                	Common.xhr.putJSON('/identity/v2.0/OS-KSADM/roles/'+id,serverData,function(data){ //需修改接口
//	    	                		if(data){
//	    	                			Modal.success('保存成功')
//	    	                			setTimeout(function(){Modal.closeAll()},2000);
//	    	                			Common.router.route();
//									}else{
//										Modal.warning ('保存失败')
//									}
//								})
//	    	                }
//	    	            }, {
//	    	                label: '取消',
//	    	                action: function(dialog) {
//	    	                    dialog.close();
//	    	                }
//	    	            }],
//	    	            onshown : function(){
//	    	            	EventsHandler.formValidator();
//	    	            }
//	    	        });
//	    		});
//	    		});
//	    });
	    //删除角色
	     $("#RoleTable_wrapper a.btn-delete").on("click",function(){
	    	 var id = $(this).attr("data");
	    	 Modal.confirm('确定要删除该角色吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/identity/v2.0/OS-KSADM/roles/'+id,
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
	     $("#RoleTable_wrapper a.btn-edit-authority").on("click",function(){
		    	var id= $(this).attr("data");
		    	Common.xhr.ajax('/identity/v2.0/OS-KSADM/roles/'+id,function(data){  //需修改接口
		    		data =[
	    					{ id:1, pId:0, name:"首页", checked:true},
	    					{ id:2, pId:0, name:"资源管理"},
	    					{ id:3, pId:0, name:"安全管理", open:true},
	    					{ id:31, pId:3, name:"用户管理"},
	    					{ id:32, pId:3, name:"角色管理"},
	    					{ id:33, pId:3, name:"菜单管理", open:true},
	    					{ id:321, pId:33, name:"/sysmgr/menuItemAdd.htm"},
	    					{ id:322, pId:33, name:"/sysmgr/menuItemDelete.htm"}
	    				];
		    		//功能权限树
	    			Modal.show({
	    	            title: '角色功能权限设置',
	    	            message: '<div><ul id="authorityTree" class="ztree"></ul></div>',
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	var treeObj = $.fn.zTree.getZTreeObj("authorityTree");
	    	                	var nodes = treeObj.getCheckedNodes(true);
	    	                	if(nodes.length == 0){
	    	                		Modal.warning ('请选择权限');
	    	                		return;
	    	                	}
	    	                	var serverData = [];
	    	                	for(var i = 0; i< nodes.length; i++){
	    	                		serverData.push({"id":nodes[i].id});
	    	                	}
	    	            		
	    	                	Common.xhr.putJSON('/identity/v2.0/users/'+id,serverData,function(data){  //需修改接口
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
	    	            	require(['jq/ztree'], function() {
	    	            		var setting = {
	    	            			check: {
	    	            				enable: true
	    	            			},
	    	            			data: {
	    	            				simpleData: {
	    	            					enable: true
	    	            				}
	    	            			}
	    	            		};

	    	            		var zNodes =data;
	    	            		$.fn.zTree.init($("#authorityTree"), setting, zNodes);

	    	            	});
	    	            }
	    	        });
	    		});
		    });
	}
	return {
		init : init
	}
})