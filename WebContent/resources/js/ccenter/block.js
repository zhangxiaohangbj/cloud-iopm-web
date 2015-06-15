define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var cacheData = {};	//缓存数据
	var init = function(){
		Common.$pageContent.addClass("loading");
		Common.render(true,{
			tpl:'tpls/ccenter/block/volume/list.html',
			//data:'/v2.0/tenants/page/10/1',
			data:'/resources/data/volume.txt',
			beforeRender: function(data){
				return data;//.result;
			},
			callback: bindEvent
		});
	};
	var bindEvent = function(){
		//dataTables
		Common.initDataTable($('#VolumeTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">创建磁盘</span>'
				);
			Common.$pageContent.removeClass("loading");
		});
		//icheck
	    $('input[type="checkbox"]').iCheck({
	    	checkboxClass: "icheckbox-info",
	        radioClass: "iradio-info"
	    }).on('ifChecked',function(e){
	    	if(e.target.className == 'selectAll'){
	    		$('.table-primary').find('input[type=checkbox]').iCheck('check');
	    	}
	    }).on('ifUnchecked',function(e){
	    	if(e.target.className == 'selectAll'){
	    		$('.table-primary').find('input[type=checkbox]').iCheck('uncheck');
	    	}
	    });
	    var renderData = {};
	    var azList=[];
	  //维护当前select的值
		var currentChosenObj = {
				ve: null,	//当前虚拟化环境
				az: null,
				netId: null
		};
        //初始化加载，不依赖其他模块
		var DataGetter = {};
		//载入后的事件
		var EventsHandler = {};
		//载入默认的数据 inits,创建数据载入类
		var DataIniter = {};
	  //增加按钮
	    $("#VolumeTable_wrapper span.btn-add").on("click",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/ccenter/vdc/add.html',renderData,function(html){
				$('body').append(html);
				//wizard show
    			$.fn.wizard.logging = true;
    			var wizard;
    			
				//同步currentChosenObj
		    	currentChosenObj.ve = $('select.select-ve').children('option:selected');
		    	currentChosenObj.netId = $('select.select-net').find('option:selected');
		    	//载入依赖数据
		    	DataIniter.initAz();
		    	//载入事件
		    	EventsHandler.userChosen();
				EventsHandler.veChange();
		    	//
    			wizard = $('#create-vdc-wizard').wizard({
    				keyboard : false,
    				contentHeight : 526,
    				contentWidth : 900,
    				showCancel: true,
    				backdrop: 'static',
    				buttons: {
    	                cancelText: "取消",
    	                nextText: "下一步",
    	                backText: "上一步",
    	                submitText: "提交",
    	                submittingText: "提交中..."
    	            }
    			});
    			wizard.show();
    			//重置CurrentChosenObj对象
    			var resetCurrentChosenObj = function(){
    				for(var key in currentChosenObj){
    					currentChosenObj[key] = null;
    				}
    				currentChosenObj.nums = 1;
    			}
    			//关闭弹窗
				var closeWizard = function(){
    				$('div.wizard').remove();
    				$('div.modal-backdrop').remove();
    				resetCurrentChosenObj();
    			}
				//关闭后移出dom
    			wizard.on('closed', function() {
    				closeWizard();
    			});
			});
	    });
	    
	}
	return {
		init : init
	}
})
