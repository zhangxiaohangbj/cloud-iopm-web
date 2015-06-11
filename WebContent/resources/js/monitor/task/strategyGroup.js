define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	Common.requestCSS('css/dialog.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/monitor/task/strategyGroup/list.html',
			data:'/cloud/task/strategy-group',
			beforeRender: function(data){
				return data;
			},
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		//dataTables
		Common.initDataTable($('#strategyGroupTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">新 建</span>'
				);
			//这个必须添加，不然就是隐藏的效果，看不到页面
			Common.$pageContent.removeClass("loading");
		});
		$("[data-toggle='tooltip']").tooltip();
		//增加按钮
	    $("#strategyGroupTable_wrapper span.btn-add").on("click",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/monitor/task/strategyGroup/add.html','',function(html){
				Modal.show({
    	            title: '新建策略分组',
    	            message: html,
    	            nl2br: false,
    	            buttons: [{
    	                label: '保存',
    	                action: function(dialog) {
    	                	var name = $("input[name='name']").val();
    	    				var memo = $("textarea[name='memo']").val();
    	                	Common.xhr.postJSON('/cloud/task/strategy-group',{name:name,memo:memo},function(data){
    	                		if(data){
    	                			alert("保存成功");
    	                			dialog.close();
    	                			Common.router.reload();
								}else{
									alert("保存失败");
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
    	            	//$("#editNetwork input[name='server-name']").val(name);
    	            }
    	        });
    		
			})
	    });
	}	
	return {
		init : init
	}
})
