define(['Common','bs/modal','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS("css/wizard.css");
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/sysmanagement/url/list.html',
			data:'/identity/v2.0/url/page/1/10',
			beforeRender: function(data){
				return data.result;
			},
			callback: bindEvent
		});
	};
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#URLTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">新建URL </span>'
				);
			Common.$pageContent.removeClass("loading");
		});
		var EventsHandler = {
				//表单校验
				formValidator: function(){
					$(".form-horizontal").validate({
						errorContainer: '_form',
			            rules: {
			            	'url_name': {
			                    required: true,
			                    maxlength:100
			                },
			                'url_address': {
			                	required: true,
			                    maxlength:150
			                },
			                'endpoint_name' :{
			                	required: true
			                }
			            }
			        });
				},
				//选择端点
				endpointChoose : function(){
					$(document).off("click","input[name='endpoint_name']");
					$(document).on("click","input[name='endpoint_name']",function(){
						var obj = $(this);
						var endpoint_id = obj.prev().val();
						Common.render({
							tpl:'tpls/sysmanagement/url/endpointlist.html',
							data:'/identity/v2.0/endpoints/page/1/10',
							callback: function(html){
								Modal.show({
				    	            title: '选择端点',
				    	            message: html,
				    	            closeByBackdrop: false,
				    	            nl2br: false,
				    	            buttons: [{
				    	                label: '确定',
				    	                action: function(dialog) {
				    	                	if($("#chooseEndpointTable input[type='radio']:checked").length == 0){
				    	                		Modal.warning("请选择端点");
				    	                		return;
				    	                	}
				    	                	obj.val($("#chooseEndpointTable input[type='radio']:checked").parent().parent().find("td:eq(3)").html());
				    	                	obj.prev().val($("#chooseEndpointTable input[type='radio']:checked").next().val());
				    	                	dialog.close();
				    	                }
				    	            }, {
				    	                label: '取消',
				    	                action: function(dialog) {
				    	                    dialog.close();
				    	                }
				    	            }],
				    	            onshown : function(dialog){
				    	            	Common.initDataTable($('#chooseEndpointTable'));
				    	            }
				    	        });
							}
						});
					});
				}
		}
		//增加按钮
	    $("#URLTable_wrapper span.btn-add").on("click",function(){
	    	Common.render('tpls/sysmanagement/url/add.html',function(html){
	    		Modal.show({
    	            title: '新建URL',
    	            message: html,
    	            nl2br: false,
    	            buttons: [{
    	                label: '保存',
    	                action: function(dialog) {
    	                	var valid = $(".form-horizontal").valid();
    	            		if(!valid) return false;
    	                	var serverData = {
        	                		"urlName": $(" [name='url_name']").val(),
        	                		"isPublic": $(" [name='is_public']").val(),
        	                		"urlAddress": $(" [name='url_address']").val(),
        	                		"method": $(" [name='method']").val(),
        	                		"endpointId": $(" [name='endpoint_id']").val()
        	                	};
    	                	Common.xhr.postJSON('/identity/v2.0/url',serverData,function(data){
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
    	            	EventsHandler.endpointChoose();
    	            	EventsHandler.formValidator();
    	            }
    	        });
    		});
	    });
		//编辑
	    $("#URLTable_wrapper a.btn-edit").on("click",function(){
	    	var id= $(this).attr("data");
	    	Common.xhr.ajax('/identity/v2.0/url/'+id,function(data){  //需修改接口
	    		Common.render('tpls/sysmanagement/url/edit.html',data,function(html){
	    			Modal.show({
	    	            title: '编辑URL',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
	    	            		var serverData = {
	        	                		"urlName": $(" [name='url_name']").val(),
	        	                		"isPublic": $(" [name='is_public']").val(),
	        	                		"urlAddress": $(" [name='url_address']").val(),
	        	                		"method": $(" [name='method']").val(),
	        	                		"endpointId": $(" [name='endpoint_id']").val(),
	        	                		"id":id
	        	                	};
	    	                	Common.xhr.putJSON('/identity/v2.0/url',serverData,function(data){
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
	    	            	EventsHandler.endpointChoose();
	    	            	EventsHandler.formValidator();
	    	            }
	    	        });
	    		});
	    		});
	    });
	    //删除
	     $("#URLTable_wrapper a.btn-delete").on("click",function(){
	    	 var id = $(this).attr("data");
	    	 Modal.confirm('确定要删除该URL吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/identity/v2.0/url/'+id,  //需修改接口
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
	}
	return {
		init : init
	}
})
