define(function(){
	var initChoose = function(leftOption,rightOption){
		var leftClick = leftOption.clickSelector ? $(leftOption.appendWrapper).find(leftOption.clone).find(leftOption.clickSelector)
												 : $(leftOption.appendWrapper).find(leftOption.clone);
		if(!leftClick.length) return;
		//选择可用网络绑定点击事件,先移出之前绑定的事件，防止多次执行
		$(document).off("click",leftClick.selector);
		$(document).on("click",leftClick.selector, function(event){
			var cloneDom = leftOption.clickSelector ? $(this).parents(leftOption.clone+":first") : $(this),
				clone = cloneDom.clone();
			clone.find('.fa-plus-circle').removeClass('fa-plus-circle').addClass('fa-minus-circle');
			typeof leftOption.callback === 'function' && leftOption.callback(clone);
			var lastChild = $(rightOption.appendWrapper).children(cloneDom.selector+":last");
			if(lastChild.length){
				lastChild.after(clone);
			}else{
				$(rightOption.appendWrapper).append(clone);
			}
			cloneDom.remove();
		});
		var rightClick = rightOption.clickSelector ? $(rightOption.appendWrapper).find(rightOption.clone).find(rightOption.clickSelector)
				 : $(rightOption.appendWrapper).find(rightOption.clone);
		//移回左侧
		$(document).off("click",rightClick.selector);
		$(document).on("click",rightClick.selector,function(event){
			//debugger
			var cloneDom = rightOption.clickSelector ? $(this).parents(rightOption.clone+":first") : $(this);
			var clone = cloneDom.clone();
			clone.find('.fa-minus-circle').removeClass('fa-minus-circle').addClass('fa-plus-circle');
			typeof rightOption.callback === 'function' && rightOption.callback(clone);
			var lastChild = $(leftOption.appendWrapper).children(rightOption.clone+":last");
			if(lastChild.length){
				lastChild.after(clone);
			}else{
				$(leftOption.appendWrapper).append(clone);
			}
			cloneDom.remove();
		});
	};
	return {
		initChoose: initChoose
	}
})