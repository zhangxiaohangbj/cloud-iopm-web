define([],function(Modal){
	var init = function(){
		var def = $.Deferred();
		//需要修改为真实数据源
		require(['template', 'text!tpls/index.html'],function(template, tpl){
			try{
				var render = template.compile(tpl);
				$('.page-content').html(render());
				def.resolve(true);
			}catch(e){
				$('.page-content').html('<p class="error-tips text-danger">数据解析出错，请稍后再试…</p>');
				def.resolve(false);
			}
		});
		return def.promise();
	};
	return {
		init : init
	};
});