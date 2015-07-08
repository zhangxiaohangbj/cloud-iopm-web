define(['Common','bs/modal','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS("css/wizard.css");
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/sysmanagement/url/list.html',
			callback: bindEvent
		});
	};
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		var table = Common.initDataTable($('#URLTable'),{
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":"identity/v2.0/url/page/", //ajax源，后端提供的分页接口
		      "columns": [
			        {
			        	"orderable": false,
			        	"defaultContent":"<label><input type='checkbox'></label>"
			        },
			        {"data": "urlName"},
			        {"data": "urlAddress"},
			        {"data": "method"},
			        {"data": "endpoint.url"},
			        {"data": "isPublic"},
			        {
			        	"defaultContent":'<a class="btn-edit" data-toggle="tooltip" title="编辑" href="javascript:void(0)" data-act="stop"><li class="glyphicon glyphicon-edit"></li></a>'
							+'<a class="btn-delete" data-toggle="tooltip" title="删除" href="javascript:void(0)" style="margin: 0 8px;"><i class="fa fa-trash-o fa-fw"></i></a>'
			        }
		      ],
		      "columnDefs": [
		            {
		            	"targets": [5],
		            	"render":function(data, type,full){
		            		if(data == true) return "是";
		            		else return "否";
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
			table.search($('.global-search').val()).draw();
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
							beforeRender: function(data){
								data.endpoint_id=endpoint_id;
								return data;
							},
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
		$(document).off("click", "#URLTable_wrapper span.btn-add");
	    $(document).on("click","#URLTable_wrapper span.btn-add",function(){
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
    	                			table.draw();
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
		$(document).off("click","#URLTable_wrapper a.btn-edit");
	    $(document).on("click","#URLTable_wrapper a.btn-edit",function(){
	    	var id= $(this).parents("tr:first").data("rowData.dt").id;
	    	Common.xhr.ajax('/identity/v2.0/url/'+id,function(data){
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
	    	                			table.draw();
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
	    $(document).off("click","#URLTable_wrapper a.btn-delete");
	     $(document).on("click","#URLTable_wrapper a.btn-delete", function(){
	    	 var id= $(this).parents("tr:first").data("rowData.dt").id;
	    	 Modal.confirm('确定要删除该URL吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/identity/v2.0/url/'+id,
	                     function(data){
	                    	 if(data){
	                    		 Modal.success('删除成功')
	                			 setTimeout(function(){Modal.closeAll()},2000);
	                    		 table.draw();
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
