define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,'tpls/ccenter/vpc/floatingip/list.html','/v2.0/floatingips',function(){
			bindEvent();
		});
	};
	
	var bindEvent = function(){
		Common.initDataTable($('#floatingipTable'),function($tar){
			//这个必须添加，不然就是隐藏的效果，看不到页面
			Common.$pageContent.removeClass("loading");
		});
		$("[data-toggle='tooltip']").tooltip();
    	//载入默认的数据 inits,创建数据载入类
		var DataIniter = {
				//vdc列表
				initVdcList : function(){
					Common.xhr.ajax('/v2.0/tenants',function(data){
						var tenants = data.tenants;
						var id = $('select.tenant_id').attr("data");
						if(id!=null){
							for (var i=0;i<tenants.length;i++) {
								if (tenants[i].id==id) {
									tenants[i].selected="selected";
								}
							}
						}				
						var html = Common.uiSelect(tenants);
				    	$('select.tenant_id').html(html);
				    	
					})
				},
		};
		var EventsHandler = {
	    		//表单校验
				formValidator: function(){
					return $(".form-horizontal").validate({
			            rules: {
			            	'name': {
			            		required: true,
			                    minlength: 4,
			                    maxlength:255
			                }
			            }
			        });
				},
				switcher:function(){
					$(".col-sm input[type=\"checkbox\"], input[type=\"radio\"]").not("[data-switch-no-init]").switcher();
				},
		}
		//删除子网
		$("#floatingipTable_wrapper a.btn-edit").on("click",function(){
	    	 var id = $(this).attr("data")
	    	 Dialog.confirm('确定要解除绑定吗?', function(result){
	             if(result) {
	            	 var data = {"floatingip":{"id":id}};
	            	 Common.xhr.putJSON('/v2.0/floatingips/'+id,data,
	                     function(data){
	                    	 if(data){
 	                			Dialog.success('解除成功')
 	                			setTimeout(function(){Dialog.closeAll()},3000);
	                    		Common.router.route();
	                    	 }else{
	                    		Dialog.success('解除失败')
	 	                		setTimeout(function(){Dialog.closeAll()},3000);
	                    	 }
	                     });
	             }else {
	            	 //Dialog.close();
	             }
	         });
		});
		
	}	
	return {
		init : init
	}
})
