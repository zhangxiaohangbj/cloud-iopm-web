define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/ccenter/vdc/list.html',
			data:'/v2.0/tenants/page/10/1',
			beforeRender: function(data){
				//debugger;
				return data.result;
			},
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		//dataTables
		Common.initDataTable($('#VdcTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">接 入</span>'
				);
			Common.$pageContent.removeClass("loading");
		});
	}	
	return {
		init : init
	}
})
