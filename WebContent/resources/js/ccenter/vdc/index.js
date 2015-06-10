define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/ccenter/vm.html',
			data:'/9cc717d8047e46e5bf23804fc4400247/servers/page/1/10',
			beforeRender: function(data){
				return data.result;
			},
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		alert('bind event');
		//dataTables
		Common.initDataTable($('#VmTable'),function($tar){
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
