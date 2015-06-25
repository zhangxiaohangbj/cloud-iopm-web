define(['Common','bs/modal'],function(Common,Modal){
	Common.requestCSS('css/choose.css');
	var initChoose = function(options){
		var defaults = {
				selector: "div",	//父级选择器
				loadmore: false,	//是否显示加载更多
				addCall: null,		//点击添加时回调
				delCall: null,		//点击减少时回调
				allData: [],		//左侧全部区域的数据
				selectData:[],		//右侧已选择部分数据
				doneCall: null,		//执行完成后的回调
				doneData:null,		//执行完成后回调可能会用到的数据
				groupSelectedClass: 'col-sm-6',		//已选择部分的class
				groupAllClass: 'col-sm-6'		//全部区域部分的class
		};
		var renderOptions = $.extend({},defaults,options);
		Common.render('tpls/common/choose.html',renderOptions,function(html){
            debugger

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
			
			$(document).off("click",renderOptions.selector+" .list-group-select .list-group-item .fa-minus-circle");
			$(document).on("click",renderOptions.selector+" .list-group-select .list-group-item .fa-minus-circle", function(event){
				var that = $(this).parents('.list-group-item:first'),
					clone = that.clone();
				clone.find('.fa-minus-circle').removeClass('fa-minus-circle').addClass('fa-plus-circle');
				if(typeof renderOptions.delCall === 'function'){
					$.when(renderOptions.delCall(clone)).done(move(that,clone,$(renderOptions.selector+" .list-group-all")));/*.fail(Modal.error('解析出错'))*/
				}else{
					move(that,clone,$(renderOptions.selector+" .list-group-all"));
				}
			});
			if($(renderOptions.selector).length){
				$(renderOptions.selector).empty().append(html);
			}else{
				 var chooseWrapper=$('<div id="chooseWrapper"></div>');
				 chooseWrapper.css('display','none');
				 $('body').append(chooseWrapper);
				 chooseWrapper.append(html);
			}
			typeof renderOptions.doneCall === 'function' && renderOptions.doneCall(renderOptions.doneData || chooseWrapper,chooseWrapper);
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