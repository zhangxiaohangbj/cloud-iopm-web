define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//render获取的数据
		Common.render(true,'tpls/fservice/lbaas/member/list.html',function(){
			bindEvent();
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		var table = Common.initDataTable($('#MemberTable'),{
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":"networking/v2.0/subnets/page/", //ajax源，后端提供的分页接口
		      "columns": [
			        {
			        	"orderable": false,
			        	"defaultContent":"<label><input type='checkbox'></label>"
			        },
			        {"data": {}},
			        {"data": "name"},
			        {"data": "ip_version"},
			        {"data": "vdc_name"},
			        {"data": "ip_version"},
			        {
			        	"defaultContent":'<a class="btn-edit pull-left" data-toggle="tooltip" title="编辑" data-act="stop" href="javascript:void(0)"><li class="glyphicon glyphicon-edit"></li></a>'
							+'<a href="javascript:void(0)" class="deleteMember" style="margin: 0 8px;"><i class="fa fa-trash-o fa-fw"></i></a>'
			        }
		      ],
		      "columnDefs": [
					{
					    "targets": [1],
					    "render": function(data, type, full) {
					    	return "<a href='#fservice/lbaas/member/detail/"+data.id+"'>"+data.name+"</a>";
					    }
					}
                ]
		    },
			function($tar){
		    	var $tbMenu = $tar.prev('.tableMenus');
		    	$tbMenu.length && $tbMenu.empty().html($('.table-menus').html());
				Common.$pageContent.removeClass("loading");
		});
		Common.on("click",'.dataTables_filter .btn-query',function(){
			table.search($('.global-search').val()).draw();
		})
		$("[data-toggle='tooltip']").tooltip();
		
	    var EventsHandler = {
	    		//表单校验
				formValidator: function(){
					$(".form-horizontal").validate({
						errorContainer:"_form",
			            rules: {
			            	'name': {
			                    required: true,
			                    maxlength:255
			                },
			                'cidr': {
			                    required: true,
			                    maxlength:64,
			                    cidr: true
			                }
			            }
			        });
				},
				Spinbox : function(){
					require(['bs/spinbox'],function(){
	    				$('#weight').spinbox({
		    					value: 1,
		    					min: 1,
		    					max: 256
	    				});
	    				$("#protocol_port").spinbox({
	    					value: 1,
	    					min: 1,
	    					max: 65535
	    				})
	    			})
				}
	    }
	    
	    //创建
	    $(document).off("click","#MemberTable_wrapper span.btn-add");
	    $(document).on("click","#MemberTable_wrapper span.btn-add",function(){
    		Common.xhr.ajax('/networking/v2.0/subnets',function(data){  //查询资源池列表
    			Common.render('tpls/fservice/lbaas/member/add.html',data,function(html){
	    			Dialog.show({
	    	            title: '新增成员',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
	    	            		var data = $("#addNetwork").serializeArray();
	    	                	var serverData = {
	    	                		"member":{
	    	                		}
	    	                	  };
	    	                	for(var i=0;i<data.length;i++){
	    	                		serverData.member[data[i]["name"]] = data[i]["value"];
	    						}
	    	                	Common.xhr.postJSON('/networking/v2.0/subnets',serverData,function(data){
	    	                		if(data){
	    	                			Dialog.success('保存成功')
	    	                			setTimeout(function(){Dialog.closeAll()},2000);
	    	                			table.draw();
									}else{
										 Dialog.warning ('保存失败')
									}
								})
	    	                }
	    	            },
	    	            {
	    	            	label: '取消',
	    	            	action: function(dialog){
	    	            		dialog.close();
	    	            	}
	    	            }],
	    	            onshown : function(){
	    	            	EventsHandler.Spinbox();
	    		    		EventsHandler.formValidator();
	    		    	}
	    	        });
	    		});
    		})
	    });
	    //编辑
	    $(document).off("click","#MemberTable_wrapper a.btn-edit");
	    $(document).on("click","#MemberTable_wrapper a.btn-edit",function(){
	    	var id = $(this).parents("tr:first").data("rowData.dt").id;
    		Common.xhr.ajax('/networking/v2.0/subnets',function(data){
    		Common.render('tpls/fservice/lbaas/member/edit.html',data,function(html){
    			Dialog.show({
    	            title: '编辑成员',
    	            message: html,
    	            nl2br: false,
    	            buttons: [{
    	                label: '保存',
    	                action: function(dialog) {
    	                	var valid = $(".form-horizontal").valid();
    	            		if(!valid) return false;
    	            		var serverData = {
	    	                		"pool":{
	    	                		}
	    	                	  };
    	                	Common.xhr.putJSON('/networking/v2.0/subnets/'+id,serverData,function(data){
    	                		if(data){
    	                			Dialog.success('保存成功')
    	                			setTimeout(function(){Dialog.closeAll()},2000);
    	                			table.draw();
								}else{
									Dialog.warning ('保存失败')
								}
							})
    	                }
    	            }],
    	            onshown : function(){
    	            	EventsHandler.Spinbox();
    		    		EventsHandler.formValidator();
    		    	}
    	        });
    		});
    		});
	    });
	    //删除
	    $(document).off("click","#MemberTable_wrapper a.deleteMember");
	     $(document).on("click","#MemberTable_wrapper a.deleteMember",function(){
	    	 var id = $(this).parents("tr:first").data("rowData.dt").id;
	    	 Dialog.confirm('确定要删除该成员吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/networking/v2.0/subnets/'+id,
	                     function(data){
	                    	 if(data){
	                    		 Dialog.success('删除成功')
 	                			 setTimeout(function(){Dialog.closeAll()},2000);
	                    		 table.draw();
	                    	 }else{
	                    		 Dialog.warning ('删除失败')
	                    	 }
	                     });
	             }else {
	            	 Dialog.closeAll();
	             }
	         });
	     })
	}
	return {
		init : init
	}
})
