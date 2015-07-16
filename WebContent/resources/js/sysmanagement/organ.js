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
		Common.xhr.ajax('/identity/v2.0/organ/rootnodes',function(data){
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
						},
						keep:{
        					parent:true  //即使该节点的子节点被全部删除或移走，依旧保持父节点状态
        				},
						key: {
							name:'organName'
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
			if(!data || data.length == 0)
    			zNodes = [{id:0, pid:"root", organName:"根节点"}];
    		//异步加载节点必须有isParent
    		for(var i = 0; i<zNodes.length; i++){
    			zNodes[i].isParent = true;
        	}
			var rMenu = $("#rMenu");
			$.fn.zTree.init($("#organTree"), setting, zNodes);
			var treeObj = $.fn.zTree.getZTreeObj("organTree");
			
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
			function getUrl(treeId, treeNode) {
    			return "identity/v2.0/organ/"+treeNode.id+"/childrennodes";
    		}
    		function filter(treeId, parentNode, childNodes) {
    			if (!childNodes) return null;
    			for (var i=0, l=childNodes.length; i<l; i++) {
    				childNodes[i].isParent = true;
    			}
    			return childNodes;
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
	        	                			"organName": $("[name='organ_name']").val(),
	        	                			"seq": $("[name='seq']").val(),
	        	                			"parentOrganId" : node.id
	            					};
	        	                	Common.xhr.postJSON('/identity/v2.0/organ',serverData,function(data){
	        	                		if(data){
	        	                			Modal.success('保存成功')
	        	                			setTimeout(function(){Modal.closeAll()},1000);
	        	                			
	        	                			//添加并移动节点
	        	                			var newNode = {id:data.id,organName:data.organName,pId:data.parentOrganId,isParent:true};
	        	                			EventsHandler.moveNode(treeObj,node,newNode,data.seq);
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
	        	                			"organName": $("[name='organ_name']").val(),
	        	                			"seq": $("[name='seq']").val(),
	        	                			"parentOrganId" : node.getParentNode()? node.getParentNode().id:"root"
	            					};
	        	                	Common.xhr.postJSON('/identity/v2.0/organ',serverData,function(data){
	        	                		if(data){
	        	                			Modal.success('保存成功')
	        	                			setTimeout(function(){Modal.closeAll()},1000);
	        	                			//添加并移动节点
	        	                			var newNode = {id:data.id,organName:data.organName,pId:data.parentOrganId,isParent:true};
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
	    			Common.render('tpls/sysmanagement/organ/edit.html','/identity/v2.0/organ/'+node.id,function(html){
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
	        	                			"organName": $("[name='organ_name']").val(),
	        	                			"seq": $("[name='seq']").val(),
	        	                			"id":node.id
	            					};
	        	                	Common.xhr.putJSON('/identity/v2.0/organ',serverData,function(data){
	        	                		if(data){
	        	                			Modal.success('保存成功')
	        	                			setTimeout(function(){Modal.closeAll()},1000);
	        	                			//添加并移动节点
	        	                			var newNode = {id:data.id,organName:data.organName,pId:data.parentOrganId,isParent:true};
	        	                			EventsHandler.moveNode(treeObj,node.getParentNode()? node.getParentNode():"root",newNode,data.seq);
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
					var msg = "确定要删除该节点? 注意：只有末级节点才可以删除，请确认当前节点是否末级节点！"
					Modal.confirm(msg, function(result){
			            if(result) {
			            	 Common.xhr.del('/identity/v2.0/organ/'+nodes[0].id,
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
			                	required: true,
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
					if(!nodes) treeObj.reAsyncChildNodes(node, "refresh"); //如果没有加载子节点，直接异步加载
					else if(nodes.length > 0){
        				if(seq > nodes.length) seq = nodes.length;
        				newNode = treeObj.addNodes(node == "root"? null:node, newNode);
            			treeObj.moveNode(nodes[seq > 0? seq-1:0], newNode[0], seq > 0?"next":"prev");
        			}else
        				treeObj.addNodes(node == "root"? null:node, newNode);
				}
		}
		
	}
	return {
		init : init
	}
})