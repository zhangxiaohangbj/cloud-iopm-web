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
		var DataIniter = {
			initFunctionItem: function(){
				var treeid = $("select[name='functiontree']").val();
				Common.xhr.ajax('/identity/v2.0/functiontree/rootnodes/'+treeid,function(data){
					var setting = {
	            			check: {
	            				enable: true
	            			},
	            			data: {
	            				simpleData: {
	            					enable: true
	            				},
	            				key:{
	            					name:"itemName"
	            				}
	            			},
	            			async: {
            					enable: true,  //异步加载
            					url: getUrl,
            					dataType: "json",
            					type:"get",
            					dataFilter: filter
            				}
	            		};

	            		var zNodes =data;
	            		//异步加载节点必须有isParent
	            		for(var i = 0; i<zNodes.length; i++){
	            			zNodes[i].isParent = true;
	                	}
	            		$.fn.zTree.init($("#authorityTree"), setting, zNodes);
	            		function getUrl(treeId, treeNode) {
	            			return "identity/v2.0/functiontree/childrennodes/"+treeNode.id;
	            		}
	            		function filter(treeId, parentNode, childNodes) {
	            			if (!childNodes) return null;
	            			for (var i=0, l=childNodes.length; i<l; i++) {
	            				childNodes[i].isParent = true;
	            			}
	            			return childNodes;
	            		}
				})
			}
		}
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
				},
				changeTree: function(){
					$("select[name='functiontree']").on("change",function(){
						DataIniter.initFunctionItem();
					})
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
    	                			"role":{
	    	                			"name": $("[name='name']").val(),
	    	                			"description": $("[name='description']").val()
    	                			}
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
		    	//查询角色权限，判断功能项是否勾选
		    	
		    	Common.render('tpls/sysmanagement/role/addfunctionitem.html','/identity/v2.0/functiontrees', function(html){
			    		//功能权限树
		    			Modal.show({
		    	            title: '角色功能权限设置',
		    	            message: html,
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
		    	            		DataIniter.initFunctionItem();
		    	            	});
		    	            	EventsHandler.changeTree();
		    	            }
		    	        });
					}
				);
		    	
		    });
	}
	return {
		init : init
	}
})