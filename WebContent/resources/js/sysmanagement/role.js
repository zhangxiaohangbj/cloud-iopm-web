define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/sysmanagement/role/list.html',
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		var table = Common.initDataTable($('#RoleTable'), {
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":"identity/v2.0/roles/page/", //ajax源，后端提供的分页接口
	    	  /*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
		      "columns": [
			        {
			        	"orderable": false,
			        	"defaultContent":"<label><input type='checkbox'></label>"
			        },
			        {"data": "name"},
			        {"data": "description"},
			        {
			        	"defaultContent":'<a class="btn-delete" data-toggle="tooltip" title="删除" href="javascript:void(0)" style="margin: 0 8px;"><i class="fa fa-trash-o fa-fw"></i></a>'
							+'<a class="btn-edit-authority" data-toggle="tooltip" title="权限设置" href="javascript:void(0)" style="margin: 0 8px;">权限设置</a>'
			        }
		      ]
		    },
		    function($tar){
		    	var $tbMenu = $tar.prev('.tableMenus');
		    	$tbMenu.length && $tbMenu.empty().html($('.table-menus').html());
				Common.$pageContent.removeClass("loading");
		});
		Common.on('click','.dataTables_filter .btn-query',function(){
			table.search($('.global-search').val()).draw();
		});
		var DataIniter = {
			initFunctionItem: function(roleid){
				var treeid = $("select[name='functiontree']").val();
				Common.xhr.ajax('identity/v2.0/functiontree/'+treeid+'/functionitem/root/childrenfunctionitemUrl/role/'+roleid,function(data){
					var setting = {
	            			check: {
	            				enable: true,
	            				chkboxType: { "Y": "p", "N": "s" }  //Y属性定义 checkbox 被勾选后影响父节点； N 属性定义 checkbox 取消勾选后影响子节点
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

	        			var dataNodes = data.functionItemNodes;
            			for (var i=0, l = dataNodes.length; i<l; i++) {
            				dataNodes[i].isParent = true;
            				dataNodes[i].checked = dataNodes[i].isSelect;
            			}
            			var dataurlNodes = data.urlNodes;
            			for (var i=0, l = dataurlNodes.length; i<l; i++) {
            				dataurlNodes[i].itemName = dataurlNodes[i].urlAddress;
            				dataurlNodes[i].checked = dataurlNodes[i].isSelect;
            				dataNodes.push(dataurlNodes[i]);
            			}
            			
	            		var zNodes =dataNodes;
	            		$.fn.zTree.init($("#authorityTree"), setting, zNodes);
	            		function getUrl(treeId, treeNode) {
	            			return "identity/v2.0/functiontree/"+treeid+"/functionitem/"+treeNode.id+"/childrenfunctionitemUrl/role/"+roleid;
	            		}
	            		function filter(treeId, parentNode, childNodes) {
	            			if (!childNodes) return null;
	            			var treeNodes = childNodes.functionItemNodes;
	            			for (var i=0, l = treeNodes.length; i<l; i++) {
	            				treeNodes[i].isParent = true;
	            				treeNodes[i].checked = treeNodes[i].isSelect;
	            			}
	            			var urlNodes = childNodes.urlNodes;
	            			for (var i=0, l = urlNodes.length; i<l; i++) {
	            				urlNodes[i].itemName = urlNodes[i].urlAddress;
	            				urlNodes[i].checked = urlNodes[i].isSelect;
	            				treeNodes.push(urlNodes[i]);
	            			}
	            			return treeNodes;
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
				changeTree: function(data){
					$("select[name='functiontree']").on("change",function(){
						DataIniter.initFunctionItem(data);
					})
				}
		}
		//增加按钮
		$(document).off("click","#RoleTable_wrapper span.btn-add");
	    $(document).on("click","#RoleTable_wrapper span.btn-add", function(){
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
	    $(document).off("click","#RoleTable_wrapper a.btn-delete");
	     $(document).on("click","#RoleTable_wrapper a.btn-delete", function(){
	    	 var id = $(this).parents("tr:first").data("rowData.dt").id;
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
	     $(document).off("click", "#RoleTable_wrapper a.btn-edit-authority");
	     $(document).on("click","#RoleTable_wrapper a.btn-edit-authority",function(){
	    	 var id = $(this).parents("tr:first").data("rowData.dt").id;
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
		    	                	var nodes = treeObj.transformToArray(treeObj.getNodes());
		    	                	if(nodes.length == 0){
		    	                		Modal.warning ('请选择权限');
		    	                		return;
		    	                	}
		    	                	var serverData = {},functionItemNodes = [], urlNodes = [];
		    	                	for(var i = 0; i< nodes.length; i++){
		    	                		if(nodes[i].isParent == true) 
		    	                			functionItemNodes.push({"id":nodes[i].id,"isSelect":nodes[i].checked});
		    	                		else urlNodes.push({"id":nodes[i].id,"isSelect":nodes[i].checked});
		    	                	}
		    	                	serverData.functionItemNodes = functionItemNodes;
		    	                	serverData.urlNodes = urlNodes;
		    	                	Common.xhr.postJSON('/identity/v2.0/role/'+id+'/functionitemurl',serverData,function(data){  //需修改接口
		    	                		if(data){
		    	                			Modal.success('保存成功')
		    	                			setTimeout(function(){Modal.closeAll()},2000);
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
			    	            		DataIniter.initFunctionItem(id);
			    	            	});
			    	            	EventsHandler.changeTree(id);
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