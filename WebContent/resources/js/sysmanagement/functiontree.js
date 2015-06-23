define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
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
	            				edit: {
	            					enable: true,
	            					editNameSelectAll: true,
	            					showRemoveBtn: true,
	            					showRenameBtn: true
	            				},
	            				callback: {
	            					onClick: onClick
	            				}
	            		};

	            		var zNodes =data;
	            		var code;
	            		$.fn.zTree.init($("#functionTree"), setting, zNodes);
	            		var treeObj = $.fn.zTree.getZTreeObj("functionTree");
	                	var nodes = treeObj.getNodes();
	                	DataIniter.getUrlList(nodes[0].id, nodes[0].name);
	                	
	            		function onClick(event, treeId, treeNode, clickFlag) {
	            			DataIniter.getUrlList(treeNode.id, treeNode.name)
	            		}
	            		

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