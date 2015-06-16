define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	Common.requestCSS('css/dialog.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,'tpls/ccenter/vpc/floatingip.html','/v2.0/floatingips',function(){
			bindEvent();
		});
	};
	
	var bindEvent = function(){
		Common.initDataTable($('#networkTable'),function($tar){
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
		
	}	
	return {
		init : init
	}
})
