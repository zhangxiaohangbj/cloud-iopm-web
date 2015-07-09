define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//render获取的数据
		Common.render(true,'tpls/fservice/lbaas/pool/list.html',function(){
			bindEvent();
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		var table = Common.initDataTable($('#PoolTable'),{
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
			        {"data": "cidr"},
			        {"data": "vdc_name"},
			        {"data": "ip_version"},
			        {"data": "gateway_ip"},
			        {"data": "gateway_ip"},
			        {
			        	"defaultContent":'<a class="btn-edit btn-opt pull-left" data-toggle="tooltip" title="编辑" data-act="stop" href="javascript:void(0)"><li class="glyphicon glyphicon-edit"></li></a>'
							+'<div class="dropdown">'
                 		   +'<a class="btn-opt dropdown-toggle" data-toggle="dropdown" title="更多"  aria-expanded="false" ><i class="fa fa-angle-double-right"></i></a>'
                 		   +'<ul class="dropdown-menu" style="right: 0;left: initial;">'
                 		   +'<li><a href="javascript:void(0)" class="attachIp"><i class="fa fa-gear fa-fw"></i>添加VIP</a></li>'
                 		   +'<li><a href="javascript:void(0)" class="dettachIp"><i class="fa fa-gear fa-fw"></i>关联监控</a></li>'
                 		   +'<li><a href="javascript:void(0)" class="editName"><i class="fa fa-file-text fa-fw"></i>解除监控关联</a></li>'
                 		   +'<li><a href="javascript:void(0)" class="delPool"><i class="fa fa-trash-o fa-fw"></i>删除资源池</a></li>'
                 		   +'</ul>'
             		   +'</div>'
			        }
		      ],
		      "columnDefs": [
					{
					    "targets": [1],
					    "render": function(data, type, full) {
					    	return "<a href='#fservice/lbaas/pool/detail/"+data.id+"'>"+data.name+"</a>";
					    }
					},
					{
					    "targets": [5],
					    "render": function(data, type, full) {
					    	return "IPV"+data;
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
			                },
			                'gateway_ip':{
			                	required: true,
			                    ip: true,
			                    ip_rule: true
			                },
			                'end':{
			                	ip:true,
			                	ip_rule:true,
			                	pools_end:true
			                },
			                'start':{
			                	ip:true,
			                	ip_rule:true,
			                	pools_start:true
			                }
			            }
			        });
				}
	    }
	    var EditData = {
	    }
	    
	    //创建
	    $(document).off("click","#PoolTable_wrapper span.btn-add");
	    $(document).on("click","#PoolTable_wrapper span.btn-add",function(){
    		//先获取subnet后，再render
    		Common.xhr.ajax('/networking/v2.0/subnets',function(data){
    			Common.render('tpls/fservice/lbaas/pool/add.html',data,function(html){
	    			Dialog.show({
	    	            title: '新增资源池',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '创建',
	    	                action: function(dialog) {
	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
	    	        	    	
	    	                	var serverData = {
	    	                		"pool":{
	    	                		}
	    	                	  };
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
	    	            }],
	    	            onshown : function(){
	    		    		EventsHandler.formValidator();
	    		    	}
	    	        });
	    		});
    		})
	    });
	    //编辑
	    $(document).off("click","#PoolTable_wrapper a.btn-edit");
	    $(document).on("click","#PoolTable_wrapper a.btn-edit",function(){
	    	var id = $(this).parents("tr:first").data("rowData.dt").id;
    		Common.xhr.ajax('/networking/v2.0/subnets/'+id,function(data){
    		Common.render('tpls/fservice/lbaas/pool/edit.html',data.subnet,function(html){
    			Dialog.show({
    	            title: '编辑资源池',
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
    		    		EventsHandler.formValidator();
    		    	}
    	        });
    		});
    		});
	    });
	    //删除
	    $(document).off("click","#PoolTable_wrapper a.delPool");
	     $(document).on("click","#PoolTable_wrapper a.delPool",function(){
	    	 var id = $(this).parents("tr:first").data("rowData.dt").id;
	    	 Dialog.confirm('确定要删除该资源池吗?', function(result){
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
