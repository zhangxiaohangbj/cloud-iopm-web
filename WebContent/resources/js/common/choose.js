define(['Common','bs/modal'],function(Common,Modal){
	Common.requestCSS('css/choose.css');
	var initChoose = function(options){
		var defaults = {
				selector: "div",
				loadmore: false,
				addCall: null,
				delCall: null,
				list: [],
				groupSelectedClass: 'col-sm-6',
				groupAllClass: 'col-sm-6'
		};

		var renderOptions = $.extend({},defaults,options);
		Common.render('tpls/common/choose.html',renderOptions,function(html){
			//off click事件,防止多次bind
			$(document).off("click",renderOptions.selector+" .list-group-all .list-group-item");
			$(document).on("click",renderOptions.selector+" .list-group-all .list-group-item", function(event){
				var that = $(this),
					clone = that.clone();
				clone.find('.fa-plus-circle').removeClass('fa-plus-circle').addClass('fa-minus-circle');
				if(typeof renderOptions.addCall === 'function'){
					$.when(renderOptions.addCall(clone)).done(move(that,clone,$(renderOptions.selector+" .list-group-select")));/*.fail(Modal.error('解析出错'))*/
				}else{
					move(that,clone,$(renderOptions.selector+" .list-group-select"))
				}
			});
			$(renderOptions.selector).empty().append(html);
			
			$(document).off("click",renderOptions.selector+" .list-group-select .list-group-item .fa-minus-circle");
			$(document).on("click",renderOptions.selector+" .list-group-select .list-group-item .fa-minus-circle", function(event){
				var that = $(this).parents('.list-group-item:first'),
					clone = that.clone();
				clone.find('.fa-minus-circle').removeClass('fa-minus-circle').addClass('fa-plus-circle');
				if(typeof renderOptions.delCall === 'function'){
					$.when(renderOptions.delCall(clone)).done(move(that,clone,$(renderOptions.selector+" .list-group-all")));/*.fail(Modal.error('解析出错'))*/
				}else{
					move(that,clone,$(renderOptions.selector+" .list-group-all"))
				}
			});
			
		});
		//
		var move = function(delDom,moveDom,wrapper){
			var lastChild = wrapper.children("*:last");
			if(lastChild.length){
				lastChild.before(moveDom);
			}else{
				wrapper.append(moveDom);
			}
			delDom.remove();
		}
	};
	
	return {
		initChoose: initChoose
	}
})