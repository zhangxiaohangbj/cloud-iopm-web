define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','jq/ztree'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/sysmanagement/organ/list.html',
			callback: function(){
            	bindEvent();
			}
		});
	};
	var bindEvent = function(){
		Common.xhr.ajax('/identity/v2.0/roles/page/1/10',function(data){
			data =[
				{ id:1, pId:0, name:"浪潮集团", checked:true,open:true},
				{ id:2, pId:1, name:"浪潮软件"},
				{ id:21,pId:2,name:"IOP研发中心"},
				{ id:22,pId:2,name:"大数据事业部"},
				{ id:23,pId:2,name:"技术中心"},
				{ id:3, pId:1, name:"浪潮通软"},
				{ id:4, pId:1, name:"浪潮通信"}
			];
			var setting = {
					view: {
						showLine: false
					},
					callback: {
						onRightClick: OnRightClick
					},
					data:{
						simpleData: {
							enable: true
						}
					}
			};
	
			var zNodes =data;
			var rMenu = $("#rMenu");
			$.fn.zTree.init($("#organTree"), setting, zNodes);
			var treeObj = $.fn.zTree.getZTreeObj("organTree");
			treeObj.expandAll(true); //展开所有节点
			Common.$pageContent.removeClass("loading");
			//右击树节点
			function OnRightClick(event, treeId, treeNode) {
				if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
					treeObj.cancelSelectedNode();
					showRMenu("root", event.clientX, event.clientY);
				} else if (treeNode && !treeNode.noR) {
					treeObj.selectNode(treeNode);
					showRMenu("node", event.clientX, event.clientY);
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
			//添加子节点
			$("#m_add_child").on("click",function() {
				hideRMenu();
				if (treeObj.getSelectedNodes()[0]) {
					var node = treeObj.getSelectedNodes()[0];
	    			Common.render('tpls/sysmanagement/organ/add.html',function(html){
	    	    		Modal.show({
	        	            title: '添加子节点',
	        	            message: html,
	        	            nl2br: false,
	        	            buttons: [{
	        	                label: '保存',
	        	                action: function(dialog) {
	        	                	var valid = $(".form-horizontal").valid();
	        	            		if(!valid) return false;
	        	                	var serverData ={
	        	                			"organ_name": $("[name='organ_name']").val(),
	        	                			"seq": $("[name='seq']").val(),
	        	                			"parent_item_id" : node.id
	            					};
	        	                	Common.xhr.postJSON('/v2.0/OS-KSADM/roles',serverData,function(data){  //需修改接口
	        	                		if(data){
	        	                			Modal.success('保存成功')
	        	                			setTimeout(function(){Modal.closeAll()},1000);
	        	                			
	        	                			//添加并移动节点
	        	                			var newNode = { name:$("[name='organ_name']").val(),pId:node.id};
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
	        	            }
	        	        });
	        		});
				}
			})
			//添加同级节点
			$("#m_add").on("click",function() {
				hideRMenu();
				if (treeObj.getSelectedNodes()[0]) {
					var node = treeObj.getSelectedNodes()[0];
	    			Common.render('tpls/sysmanagement/organ/add.html',function(html){
	    	    		Modal.show({
	        	            title: '添加同级节点',
	        	            message: html,
	        	            nl2br: false,
	        	            buttons: [{
	        	                label: '保存',
	        	                action: function(dialog) {
	        	                	var valid = $(".form-horizontal").valid();
	        	            		if(!valid) return false;
	        	                	var serverData ={
	        	                			"organ_name": $("[name='organ_name']").val(),
	        	                			"seq": $("[name='seq']").val(),
	        	                			"parent_item_id" : node.getParentNode()? node.getParentNode().id:"root"
	            					};
	        	                	Common.xhr.postJSON('/v2.0/OS-KSADM/roles',serverData,function(data){  //需修改接口
	        	                		if(data){
	        	                			Modal.success('保存成功')
	        	                			setTimeout(function(){Modal.closeAll()},1000);
	        	                			//添加并移动节点
	        	                			var newNode = { name:$("[name='organ_name']").val(), pId:node.getParentNode()? node.getParentNode().id:"root"};
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
	        	            }
	        	        });
	        		});
				}
			})
			//编辑节点
			$("#m_edit").on("click",function() {
				hideRMenu();
				if (treeObj.getSelectedNodes()[0]) {
					var node = treeObj.getSelectedNodes()[0];
	    			Common.render('tpls/sysmanagement/organ/edit.html','/v2.0/subnets/page/1/10',function(html){  //需修改接口
	    	    		Modal.show({
	        	            title: '编辑节点',
	        	            message: html,
	        	            nl2br: false,
	        	            buttons: [{
	        	                label: '保存',
	        	                action: function(dialog) {
	        	                	var valid = $(".form-horizontal").valid();
	        	            		if(!valid) return false;
	        	                	var serverData ={
	        	                			"organ_name": $("[name='organ_name']").val(),
	        	                			"seq": $("[name='seq']").val(),
	        	                			"id":node.id
	            					};
	        	                	Common.xhr.postJSON('/v2.0/OS-KSADM/roles',serverData,function(data){  //需修改接口
	        	                		if(data){
	        	                			Modal.success('保存成功')
	        	                			setTimeout(function(){Modal.closeAll()},1000);
	        	                			//添加并移动节点
	        	                			treeObj.removeNode(node);
	        	                			var newNode = { name:$("[name='organ_name']").val(), pId:node.getParentNode()? node.getParentNode().id:"root"};
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
		})
		
		var EventsHandler = {
				//表单校验
				formValidator: function(){
					$(".form-horizontal").validate({
						errorContainer: '_form',
			            rules: {
			            	'organ_name': {
			                    required: true,
			                    maxlength:100
			                },
			                'seq': {
			                	digits: true
			                }
			            }
			        });
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
		
	}
	return {
		init : init
	}
})