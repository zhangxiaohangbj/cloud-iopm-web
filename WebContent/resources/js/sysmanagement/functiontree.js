define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/sysmanagement/functiontree/list.html',
			data:'/v2.0/subnets/page/1/10',  //需修改接口
			beforeRender: function(data){
				return data.result;
			},
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#FunctionTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">新建功能树 </span>'
				);
			Common.$pageContent.removeClass("loading");
		});
		//载入默认的数据 inits,创建数据载入类
		var DataIniter = {
			//已关联的url
			getUrlList : function(id,name){
				Common.render('tpls/sysmanagement/functiontree/relatedurllist.html','/v2.0/subnets/page/1/10',function(html){  //需修改接口
    				$("#urllist").html(html);
    				Common.initDataTable($('#UrlTable'),function($tar){
    					$tar.prev().find('.left-col:first').append(
							'功能项【'+name+'】关联的URL列表：<span class="btn btn-add">关联URL </span>'
						);
    				});
    			})
			}
		}
		var EventsHandler = {
				//表单校验
				formValidator: function(){
					$(".form-horizontal").validate({
						errorContainer: '_form',
			            rules: {
			            	'tree_name': {
			                    required: true,
			                    maxlength:50
			                },
			                'tree_desc': {
			                    maxlength:100
			                },
			                'item_name': {
			                    required: true,
			                    maxlength:50
			                }
			            }
			        });
				},
				//选择url关联
				chooseUrl :function(){
					$(document).off("click","#UrlTable_wrapper span.btn-add");
					$(document).on("click","#UrlTable_wrapper span.btn-add",function(){
						var obj = $(this);
						Common.render('tpls/sysmanagement/functiontree/urllist.html','/v2.0/roles/page/10/1',function(html){ //需改接口
							Modal.show({
			    	            title: '选择关联URL',
			    	            message: html,
			    	            closeByBackdrop: false,
			    	            nl2br: false,
			    	            buttons: [{
			    	                label: '确定',
			    	                action: function(dialog) {
			    	                	var serverData = [];
			    	                	$("#chooseUrlTable input[type='checkbox']:checked").each(function(){
			    	                		serverData.push({"id":$(this).val()});
			    	                	})
			    	                	Common.xhr.putJSON('/v2.0/OS-KSADM/roles/'+id,serverData,function(data){ //需修改接口
			    	                		if(data){
			    	                			Modal.success('保存成功')
			    	                			setTimeout(function(){Modal.closeAll()},2000);
			    	                			Common.router.route();
											}else{
												Modal.warning ('保存失败')
											}
										})
			    	                	dialog.close();
			    	                }
			    	            }, {
			    	                label: '取消',
			    	                action: function(dialog) {
			    	                    dialog.close();
			    	                }
			    	            }],
			    	            onshown : function(dialog){
			    	            	Common.initDataTable($('#chooseUrlTable'));
			    	            }
			    	        });
						});
						
					});
				},
				//取消url关联
				cancelUrl : function(){
					$(document).off("click","#UrlTable_wrapper a.btn-cancel");
					$(document).on("click","#UrlTable_wrapper a.btn-cancel",function(){
	 			    	 var obj = $(this);
	 			    	 var id = $(this).attr("data");
	 			    	 Modal.confirm('确定要取消关联该URL吗?', function(result){
	 			             if(result) {
	 			            	 Common.xhr.del('/v2.0/OS-KSADM/roles/'+id,  //需修改接口
	 			                     function(data){
	 			                    	 if(data){
	 			                    		 Modal.success('取消成功')
	 			                			 setTimeout(function(){Modal.closeAll()},2000);
	 			                    		 obj.parent().parent().remove();
	 			                    	 }else{
	 			                    		 Modal.warning ('取消失败')
	 			                    	 }
	 			                     });
	 			             }else {
	 			            	 Modal.closeAll();
	 			             }
	 			         });
	 			    });
				},
				setDefaultUrl : function(){
					$(document).off("click","#UrlTable_wrapper a.btn-set-default")
					$(document).on("click","#UrlTable_wrapper a.btn-set-default",function(){
	 			    	 var obj = $(this);
	 			    	 var id = $(this).attr("data");
	 			    	 var text;
	 			    	 var old_text = obj.html();
	 			    	 if(obj.html() == "设为默认"){
	 			    		text = "取消默认";
	 			    	 }else{
	 			    		text = "设为默认";
	 			    	 }
	 			    	 Modal.confirm('确定要'+old_text+'该URL吗?', function(result){
	 			             if(result) {
	 			            	 Common.xhr.del('/v2.0/OS-KSADM/roles/'+id,  //需修改接口
	 			                     function(data){
	 			                    	 if(data){
	 			                    		 Modal.success(old_text+'成功')
	 			                			 setTimeout(function(){Modal.closeAll()},2000);
	 			                    		 obj.html(text);
	 			                    	 }else{
	 			                    		 Modal.warning (old_text+'失败')
	 			                    	 }
	 			                     });
	 			             }else {
	 			            	 Modal.closeAll();
	 			             }
	 			         });
	 			     });
				},
				//开关
				switcher:function(){
					$("#addFunctionItem input[type=\"checkbox\"], input[type=\"radio\"]").not("[data-switch-no-init]").switcher();
				},
				//添加并移动节点,移动目标节点后
				moveNode:function(treeObj,node,newNode,seq){
					var nodes;
					if(node == "root"){  //父节点为根节点
						nodes = treeObj.getNodes();
					}else
					nodes = node.children;
        			if(nodes && nodes.length > 0){
        				if(seq > nodes.length) seq = nodes.length;
            			treeObj.moveNode(nodes[seq > 0? seq-1:0], newNode, seq > 0?"next":"prev");
        			}else
        				treeObj.addNodes(node, newNode);
				}
		}
		//增加按钮
	    $("#FunctionTable_wrapper span.btn-add").on("click",function(){
	    	Common.render('tpls/sysmanagement/functiontree/add.html',function(html){
	    		Modal.show({
    	            title: '新建功能树',
    	            message: html,
    	            nl2br: false,
    	            buttons: [{
    	                label: '保存',
    	                action: function(dialog) {
    	                	var valid = $(".form-horizontal").valid();
    	            		if(!valid) return false;
    	                	var serverData = $(".form-horizontal").serializeArray();
    	                	Common.xhr.postJSON('/v2.0/OS-KSADM/roles',serverData,function(data){  //需修改接口
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
		//编辑
	    $("#FunctionTable_wrapper a.btn-edit").on("click",function(){
	    	var id= $(this).attr("data");
	    	Common.xhr.ajax('/v2.0/subnets/'+id,function(data){  //需修改接口
	    		data={
	    				"tree_name":"tree1",
	    				"tree_desc":"tree1......."
	    		}
	    		Common.render('tpls/sysmanagement/functiontree/edit.html',data,function(html){
	    			Modal.show({
	    	            title: '编辑功能树',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
	    	            		var serverData = {
		    	                	  };
	    	                	Common.xhr.putJSON('/v2.0/OS-KSADM/roles/'+id,serverData,function(data){ //需修改接口
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
	    });
	    //删除
	     $("#FunctionTable_wrapper a.btn-delete").on("click",function(){
	    	 var id = $(this).attr("data");
	    	 Modal.confirm('确定要删除该功能树吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/v2.0/OS-KSADM/roles/'+id,  //需修改接口
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
	   //管理
	    $("#FunctionTable_wrapper a.btn-edit-authority").on("click",function(){
	    	Common.render(true,{
	 			tpl:'tpls/sysmanagement/functiontree/management.html',
	 			data:'/v2.0/subnets/page/1/10',  //需修改接口
	 			beforeRender: function(data){
	 				//return data.result;
	 				return data = [
			 				{ id:1,name:"首页", open:true,isParent:true},
			 				{ id:2,name:"基础环境", open:true,
			 					children: [
			 						{ id:21,name:"设备管理"},
			 						{ id:22,name:"物理区域"},
			 						{ id:23,name:"虚拟化环境"}
			 					]},
			 				{ id:3,name:"系统管理", open:true,
			 					children: [
		 		 						{ id:31,name:"用户管理"},
		 		 						{ id:32,name:"角色管理"}
		 		 					]}
		
			 				];
	 			},
	 			callback: function(data){
	 				require(['jq/ztree'], function() {
	            		var setting = {
	            				view: {
	            					dblClickExpand: false
	            				},
	            				callback: {
	            					onClick: onClick,
	            					onRightClick: OnRightClick
	            				}
	            		};

	            		var zNodes =data;
	            		var rMenu = $("#rMenu");
	            		$.fn.zTree.init($("#functionTree"), setting, zNodes);
	            		var treeObj = $.fn.zTree.getZTreeObj("functionTree");
	                	var nodes = treeObj.getNodes();
	                	//右侧展现
	                	DataIniter.getUrlList(nodes[0].id, nodes[0].name);
	                	//左击树节点
	            		function onClick(event, treeId, treeNode, clickFlag) {
	            			DataIniter.getUrlList(treeNode.id, treeNode.name)
	            		}
	            		//右击树节点
	            		function OnRightClick(event, treeId, treeNode) {
	            			if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
	            				treeObj.cancelSelectedNode();
	            				showRMenu("root", event.clientX, event.clientY);
	            			} else if (treeNode && !treeNode.noR) {
	            				treeObj.selectNode(treeNode);
	            				showRMenu("node", event.clientX, event.clientY);
	            				DataIniter.getUrlList(treeNode.id, treeNode.name)
	            			}
	            		}

	            		function showRMenu(type, x, y) {
	            			$("#rMenu ul").show();
	            			if (type=="root") {
	            				$("#rMenu ul").hide();
	            			} else {
	            				$("#m_del").show();
	            				$("#m_check").show();
	            				$("#m_unCheck").show();
	            				rMenu.css({"top":y+"px", "left":x+"px", "visibility":"visible"});
	            			}
	            			$("body").bind("mousedown", onBodyMouseDown);
	            		}
	            		function hideRMenu() {
	            			if (rMenu) rMenu.css({"visibility": "hidden"});
	            			$("body").unbind("mousedown", onBodyMouseDown);
	            		}
	            		function onBodyMouseDown(event){
	            			if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length>0)) {
	            				rMenu.css({"visibility" : "hidden"});
	            			}
	            		}
	            		//添加子功能项
	            		$("#m_add_child").on("click",function() {
	            			hideRMenu();
	            			if (treeObj.getSelectedNodes()[0]) {
	            				var node = treeObj.getSelectedNodes()[0];
		            			Common.render('tpls/sysmanagement/functiontree/addfunctionitem.html',function(html){
		            	    		Modal.show({
		                	            title: '添加子功能项',
		                	            message: html,
		                	            nl2br: false,
		                	            buttons: [{
		                	                label: '保存',
		                	                action: function(dialog) {
		                	                	var valid = $(".form-horizontal").valid();
		                	            		if(!valid) return false;
		                	                	var serverData ={
		                	                			"item_name": $("[name='item_name']").val(),
		                	                			"seq": $("[name='seq']").val(),
		                	                			"parent_item_id" : node.id,
		                	                			"is_menu":$("[name='is_menu']:checked").val().length? 1:0
		                    					};
		                	                	Common.xhr.postJSON('/v2.0/OS-KSADM/roles',serverData,function(data){  //需修改接口
		                	                		if(data){
		                	                			Modal.success('保存成功')
		                	                			setTimeout(function(){Modal.closeAll()},1000);
		                	                			
		                	                			//添加并移动节点
		                	                			var newNode = { name:$("[name='item_name']").val(),pId:node.id};
		                	                			EventsHandler.moveNode(treeObj,node,newNode,$("[name='seq']").val());
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
		                	            	EventsHandler.switcher();
		                	            }
		                	        });
		                		});
	            			}
	            		})
	            		//添加同级功能项
	            		$("#m_add").on("click",function() {
	            			hideRMenu();
	            			if (treeObj.getSelectedNodes()[0]) {
	            				var node = treeObj.getSelectedNodes()[0];
		            			Common.render('tpls/sysmanagement/functiontree/addfunctionitem.html',function(html){
		            	    		Modal.show({
		                	            title: '添加同级功能项',
		                	            message: html,
		                	            nl2br: false,
		                	            buttons: [{
		                	                label: '保存',
		                	                action: function(dialog) {
		                	                	var valid = $(".form-horizontal").valid();
		                	            		if(!valid) return false;
		                	                	var serverData ={
		                	                			"item_name": $("[name='item_name']").val(),
		                	                			"seq": $("[name='seq']").val(),
		                	                			"parent_item_id" : node.getParentNode()? node.getParentNode().id:"root",
		                	                			"is_menu":$("[name='is_menu']:checked").val().length? 1:0
		                    					};
		                	                	Common.xhr.postJSON('/v2.0/OS-KSADM/roles',serverData,function(data){  //需修改接口
		                	                		if(data){
		                	                			Modal.success('保存成功')
		                	                			setTimeout(function(){Modal.closeAll()},1000);
		                	                			//添加并移动节点
		                	                			var newNode = { name:$("[name='item_name']").val(), pId:node.getParentNode()? node.getParentNode().id:"root"};
		                	                			EventsHandler.moveNode(treeObj,node.getParentNode()? node.getParentNode():"root",newNode,$("[name='seq']").val());
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
		                	            	EventsHandler.switcher();
		                	            }
		                	        });
		                		});
	            			}
	            		})
	            		//编辑功能项
	            		$("#m_edit").on("click",function() {
	            			hideRMenu();
	            			if (treeObj.getSelectedNodes()[0]) {
	            				var node = treeObj.getSelectedNodes()[0];
		            			Common.render('tpls/sysmanagement/functiontree/editfunctionitem.html','/v2.0/subnets/page/1/10',function(html){
		            	    		Modal.show({
		                	            title: '编辑功能项',
		                	            message: html,
		                	            nl2br: false,
		                	            buttons: [{
		                	                label: '保存',
		                	                action: function(dialog) {
		                	                	var valid = $(".form-horizontal").valid();
		                	            		if(!valid) return false;
		                	                	var serverData ={
		                	                			"item_name": $("[name='item_name']").val(),
		                	                			"seq": $("[name='seq']").val(),
		                	                			"is_menu":$("[name='is_menu']:checked").val().length? 1:0,
		                	                			"id":node.id
		                    					};
		                	                	Common.xhr.postJSON('/v2.0/OS-KSADM/roles',serverData,function(data){  //需修改接口
		                	                		if(data){
		                	                			Modal.success('保存成功')
		                	                			setTimeout(function(){Modal.closeAll()},1000);
		                	                			//添加并移动节点
		                	                			treeObj.removeNode(node);
		                	                			var newNode = { name:$("[name='item_name']").val(), pId:node.getParentNode()? node.getParentNode().id:"root"};
		                	                			EventsHandler.moveNode(treeObj,node.getParentNode()? node.getParentNode():"root",newNode,$("[name='seq']").val());
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
		                	            	EventsHandler.switcher();
		                	            }
		                	        });
		                		});
	            			}
	            		})
	            		//删除树节点
	            		$("#m_del").on("click",function() {
	            			hideRMenu();
	            			var nodes = treeObj.getSelectedNodes();
	            			if (nodes && nodes.length>0) {
	            				var msg = "确定要删除该节点?"
	            				if (nodes[0].children && nodes[0].children.length > 0) {
	            					msg = "要删除的节点是父节点，如果删除将连同子节点一起删掉。\n\n请确认！";
	            				}
	            				Modal.confirm(msg, function(result){
            			            if(result) {
            			            	 treeObj.removeNode(nodes[0]);
            			            	 Common.xhr.del('/v2.0/OS-KSADM/roles/'+nodes[0].id,  //需修改接口
            			                     function(data){
            			                    	 if(data){
            			                    		 Modal.success('删除成功')
            			                			 setTimeout(function(){Modal.closeAll()},2000);
            			                    		 treeObj.removeNode(nodes[0]);
            			                    	 }else{
            			                    		 Modal.warning ('删除失败')
            			                    	 }
            			                     });
            			             }else {
            			            	 Modal.closeAll();
            			             }
            			         });
	            			}
	            		})

	            	});
	 				//关联url
	 				EventsHandler.chooseUrl();
	 				//取消关联
	 				EventsHandler.cancelUrl();
	 			    //设置默认
	 				EventsHandler.setDefaultUrl();
	 			}
	 		});
		});
	}
	return {
		init : init
	}
})