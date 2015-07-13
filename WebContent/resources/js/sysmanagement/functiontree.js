define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/sysmanagement/functiontree/list.html',
			data:'/identity/v2.0/functiontrees',
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
				Common.render('tpls/sysmanagement/functiontree/relatedurllist.html','/identity/v2.0/functiontree/functionitemwithurl/'+id,
					function(html){
    				$("#urllist").html(html);
    				Common.initDataTable($('#UrlTable'),function($tar){
    					$tar.prev().find('.left-col:first').append(
							'功能项【'+name+'】关联的URL列表：<span class="btn btn-add" data="'+id+'" name="'+name+'">关联URL </span>'
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
			                },
			                'seq': {
			                	digits: true
			                }
			            }
			        });
				},
				//选择url关联
				chooseUrl :function(){
					$(document).off("click","#UrlTable_wrapper span.btn-add");
					$(document).on("click","#UrlTable_wrapper span.btn-add",function(){
						var obj = $(this);
						Common.render('tpls/sysmanagement/functiontree/urllist.html',{"functionItemId":obj.attr("data")},function(html){
							Modal.show({
			    	            title: '选择关联URL',
			    	            message: html,
			    	            closeByBackdrop: false,
			    	            nl2br: false,
			    	            size: {
			    	                width: '800px',
			    	                maxHeight: '100%'
			    	            },
			    	            position: 'top',
			    	            buttons: [{
			    	                label: '确定',
			    	                action: function(dialog) {
			    	                	var urlIds = "";
			    	                	$("#chooseUrlTable tbody div.checked").each(function(){
			    	                		urlIds += $(this).find("input[type='checkbox']").val()+",";
			    	                	})
			    	                	serverData = {
			    	                		"functionItemId":obj.attr("data"),
			    	                		"urlIds":urlIds.substring(0,urlIds.length-1)
			    	                	}
			    	                	Common.xhr.postJSON('/identity/v2.0/functiontree/functionitem/functionitemurl',serverData,function(data){
			    	                		if(data){
			    	                			Modal.success('保存成功')
			    	                			setTimeout(function(){Modal.closeAll()},2000);
			    	                			DataIniter.getUrlList(obj.attr("data"), obj.attr("name"));
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
			    	            	var urltable = Common.initDataTable($('#chooseUrlTable'),{
				    	      		      "processing": true,  //加载效果，默认false
				    	    		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
				    	    		      "ordering": false,   //禁用所有排序
				    	    		      "sAjaxSource":"identity/v2.0/url/page/", //ajax源，后端提供的分页接口
				    	    		      "columns": [
				    	    			        {
				    	    			        	"data":"id",
				    	    			        	"orderable": false
				    	    			        },
				    	    			        {"data": "urlName"},
				    	    			        {"data": "endpoint.url"},
				    	    			        {"data": "urlAddress"},
				    	    			        {"data": "method"}
				    	    		      ],
				    	    		      "columnDefs": [
			    	    		 		            {
			    	    		 		            	"targets": [0],
			    	    		 		            	"render":function(data, type,full){
			    	    		 		            		return "<label><input type='checkbox' value='"+data+"'></label>";
			    	    		 		            	}
			    	    		 		            }
			    	    		 		      ]
				    	    		    },
				    	    		    function($tar){
				    	    		    	var $tbMenu = $tar.prev('.tableMenus');
				    	    		    	$tbMenu.length && $tbMenu.empty().html($('.table-menus').html());
				    	    				Common.$pageContent.removeClass("loading");
				    	    		});
			    	            	Common.on('click','.dataTables_filter .btn-query',function(){
			    	            		urltable.search($('.global-search').val()).draw();
			    	        		});
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
	 			    	 var treeObj = $.fn.zTree.getZTreeObj("functionTree");
	 			    	 var node = treeObj.getSelectedNodes()[0];
	 			    	 Modal.confirm('确定要取消关联该URL吗?', function(result){
	 			             if(result) {
	 			            	var serverData = {
		    	                		"functionItemId":$("#UrlTable_wrapper span.btn-add").attr("data"),
		    	                		"urlIds":id
		    	                	}
	 			            	 Common.xhr.del('/identity/v2.0/functiontree/functionitem/functionitemurl', JSON.stringify(serverData),
	 			                     function(data){
	 			                    	 if(data){
	 			                    		 Modal.success('取消成功')
	 			                			 setTimeout(function(){Modal.closeAll()},2000);
	 			                    		 obj.parents("tr:first").remove();
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
	 			    	 var text, functionItemId;
	 			    	 var old_text = obj.html();
	 			    	 if(old_text == "设为默认"){
	 			    		text = "取消默认";
	 			    	 }else{
	 			    		text = "设为默认";
	 			    	 }
	 			    	functionItemId = $("#UrlTable_wrapper span.btn-add").attr("data");
	 			    	 Modal.confirm('确定要'+old_text+'该URL吗?', function(result){
	 			             if(result) {
	 			            	if(old_text == "设为默认"){
	 			            		var serverData = {
			    	                		"functionItemId" : functionItemId,
			    	                		"defaultUrlId":id
			    	                	}
	 			            		 Common.xhr.post('/identity/v2.0/functiontree/functionitem/defaulturl',JSON.stringify(serverData),
 		 			                     function(data){
 		 			                    	 if(data){
 		 			                    		 Modal.success(old_text+'成功')
 		 			                			 setTimeout(function(){Modal.closeAll()},2000);
 		 			                    		 obj.html(text);
 		 			                    	 }else{
 		 			                    		 Modal.warning (old_text+'失败')
 		 			                    	 }
 		 			                     });
	 		 			    	 }else{
	 		 			    		Common.xhr.del('/identity/v2.0/functiontree/functionitem/'+functionItemId+'/defaulturl',
 		 			                     function(data){
 		 			                    	 if(data){
 		 			                    		 Modal.success(old_text+'成功')
 		 			                			 setTimeout(function(){Modal.closeAll()},2000);
 		 			                    		 obj.html(text);
 		 			                    	 }else{
 		 			                    		 Modal.warning (old_text+'失败')
 		 			                    	 }
 		 			                     });
	 		 			    	 }
	 			            	 
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
        				newNode = treeObj.addNodes(node, newNode);
            			treeObj.moveNode(nodes[seq > 0? seq-1:0], newNode[0], seq > 0?"next":"prev");
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
    	                	var serverData = {
    	                		"treeDesc": $(" [name='tree_desc']").val(),
    	                		"treeName": $(" [name='tree_name']").val()
    	                	};
    	                	Common.xhr.postJSON('/identity/v2.0/functiontree',serverData,function(data){
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
	    	Common.xhr.ajax('/identity/v2.0/functiontree/'+id,function(data){
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
	    	            				"id": id,
	        	                		"treeDesc": $(" [name='tree_desc']").val(),
	        	                		"treeName": $(" [name='tree_name']").val()
	        	                	};
	    	                	Common.xhr.putJSON('/identity/v2.0/functiontree',serverData,function(data){
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
	            	 Common.xhr.del('/identity/v2.0/functiontree/'+id,
	                     function(data){
	                    		 Modal.success('删除成功')
	                			 setTimeout(function(){Modal.closeAll()},2000);
	                    		 Common.router.route();
	                     });
	             }else {
	            	 Modal.closeAll();
	             }
	         });
	     });
	   //管理
	    $("#FunctionTable_wrapper a.btn-edit-authority").on("click",function(){
	    	var id = $(this).attr("data");
	    	Common.render(true,{
	 			tpl:'tpls/sysmanagement/functiontree/management.html',
	 			callback: function(){
	 				var rMenu, treeObj;
	 				Common.xhr.ajax("/identity/v2.0/functiontree/rootnodes/"+id,function(data){
	 					require(['jq/ztree'], function() {
		            		var setting = {
		            				view: {
		            					showLine: false
		            				},
		            				callback: {
		            					onClick: onClick,
		            					onRightClick: OnRightClick
		            				},
		            				data:{
		            					simpleData: {
	    	            					enable: true
	    	            				},
	    	            				keep:{
	    	            					parent:true  //即使该节点的子节点被全部删除或移走，依旧保持父节点状态
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

		            		var zNodes = data;
		            		if(!data || data.length == 0)
		            			zNodes = [{id:0, pid:"root", itemName:"根节点"}];
		            		//异步加载节点必须有isParent
		            		for(var i = 0; i<zNodes.length; i++){
		            			zNodes[i].isParent = true;
		                	}
		            		rMenu = $("#rMenu");
		            		$.fn.zTree.init($("#functionTree"), setting, zNodes);
		            		treeObj = $.fn.zTree.getZTreeObj("functionTree");
		                	var nodes = treeObj.getNodes();
		                	//右侧展现
		                	if(data && data.length > 0)
		                	DataIniter.getUrlList(nodes[0].id, nodes[0].itemName);
		                	//左击树节点
		            		function onClick(event, treeId, treeNode, clickFlag) {
		            			if(data && data.length > 0)
		            			DataIniter.getUrlList(treeNode.id, treeNode.itemName)
		            		}
		            		//右击树节点
		            		function OnRightClick(event, treeId, treeNode) {
		            			if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
		            				treeObj.cancelSelectedNode();
		            				showRMenu("root", event.clientX, event.clientY);
		            			} else if (treeNode && !treeNode.noR) {
		            				treeObj.selectNode(treeNode);
		            				showRMenu("node", event.clientX, event.clientY);
		            				if(data && data.length > 0)
		            				DataIniter.getUrlList(treeNode.id, treeNode.itemName);
		            			}
		            		}
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
	 					});
	 				})

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
		                	                			"itemName": $("[name='item_name']").val(),
		                	                			"seq": $("[name='seq']").val(),
		                	                			"parentItemId" : node.id,
		                	                			"isMenu":$("[name='is_menu']:checked").length? 1:0,
		                	                			"treeId":id
		                    					};
		                	                	Common.xhr.postJSON('/identity/v2.0/functiontree/functionitem',serverData,function(data){
		                	                		if(data){
		                	                			Modal.success('保存成功');
		                	                			//添加并移动节点
		                	                			var newNode = {id:data.id, itemName:data.itemName,pId:data.parentItemId,isParent:true};
		                	                			EventsHandler.moveNode(treeObj,node,newNode,data.seq);
		                	                			
		                	                			setTimeout(function(){Modal.closeAll()},1000);
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
		                	                			"itemName": $("[name='item_name']").val(),
		                	                			"seq": $("[name='seq']").val(),
		                	                			"parentItemId" : node.getParentNode()? node.getParentNode().id:"root",
		                	                			"isMenu":$("[name='is_menu']:checked").length? 1:0,
		                	                			"treeId":id
		                    					};
		                	                	Common.xhr.postJSON('/identity/v2.0/functiontree/functionitem',serverData,function(data){
		                	                		if(data){
		                	                			Modal.success('保存成功')
		                	                			setTimeout(function(){Modal.closeAll()},1000);
		                	                			//添加并移动节点
		                	                			var newNode = {id:data.id, itemName:data.itemName,pId:data.parentItemId,isParent:true};
		                	                			EventsHandler.moveNode(treeObj,node.getParentNode()? node.getParentNode():"root",newNode,data.seq);
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
		            			Common.render('tpls/sysmanagement/functiontree/editfunctionitem.html','/identity/v2.0/functiontree/functionitem/'+node.id,function(html){
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
		                	                			"itemName": $("[name='item_name']").val(),
		                	                			"seq": $("[name='seq']").val(),
		                	                			"isMenu":$("[name='is_menu']:checked").val().length? 1:0,
		                	                			"id":node.id
		                    					};
		                	                	Common.xhr.postJSON('/identity/v2.0/functiontree/functionitem',serverData,function(data){
		                	                		if(data){
		                	                			Modal.success('保存成功')
		                	                			setTimeout(function(){Modal.closeAll()},1000);
		                	                			//添加并移动节点
		                	                			var newNode = { id:data.id, itemName:data.itemName,pId:data.parentItemId,isParent:true};
		                	                			EventsHandler.moveNode(treeObj,node.getParentNode()? node.getParentNode():"root",
		                	                					newNode,data.seq);
		                	                			treeObj.removeNode(node);
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
            			            	 Common.xhr.del('/identity/v2.0/functiontree/functionitem/'+nodes[0].id,
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

//	            	});
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