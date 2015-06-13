define(function(){
	var initChoose = function(leftOption,rightOption){
		//选择可用网络绑定点击事件,先移出之前绑定的事件，防止多次执行
		$(document).off("click",leftOption.clickSelector);
		$(document).on("click",leftOption.clickSelector, function(event){
			var cloneDom = leftOption.clone ? $(this)+leftOption.clone : $(this),
				clone = cloneDom.clone();
			clone.find('.fa-plus-circle').removeClass('fa-plus-circle').addClass('fa-minus-circle');
			typeof leftOption.callback === 'function' && leftOption.callback(clone);
			$(rightOption.appendWrapper).append(clone);
			cloneDom.remove();
		});
		//移回左侧
		$(document).off("click",rightOption.clickSelector);
		$(document).on("click",rightOption.clickSelector,function(event){
			//debugger
			var cloneDom = rightOption.clone ? $(this).parents(rightOption.clone) : $(this);
			var clone = cloneDom.clone();
			clone.find('.fa-minus-circle').removeClass('fa-minus-circle').addClass('fa-plus-circle');
			typeof rightOption.callback === 'function' && rightOption.callback(clone);
			$(leftOption.appendWrapper).append(clone);
			cloneDom.remove();
		});
	};
	return {
		initChoose: initChoose
	}
})