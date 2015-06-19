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
	     $("#RoleTable_wrapper a.btn-edit-authority").on("click",function(){
		    	
		    });
	}
	return {
		init : init
	}
})