define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/daterangepicker'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		//debugger;
		Common.$pageContent.addClass("loading");
		Common.render(true,{
			tpl:'tpls/aservice/cae/version.html',
			data:'resources/data/versionList.txt',
			beforeRender: function(data){
				//debugger;
				return data.data;
			},
			callback: bindEvent
		});
	};
	var bindEvent = function(){
		//dataTables
		Common.initDataTable($('#appVersionTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">创建应用版本</span>'
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
	  //增加按钮
		$(document).off("#appVersionTable_wrapper span.btn-add");
		$(document).on("click","#appVersionTable_wrapper span.btn-add",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/ccenter/vdc/add.html',null,function(html){
				$('body').append(html);
				//wizard show
    			$.fn.wizard.logging = true;
    			var wizard;
		    	
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
    	                submitText: "创建",
    	                submittingText: "提交中..."
    	            }
    			});
    			wizard.show();
    			//关闭弹窗
				var closeWizard = function(){
    				$('div.wizard').remove();
    				$('div.modal-backdrop').remove();
    			}
				//关闭后移出dom
    			wizard.on('closed', function() {
    				closeWizard();
    				
    			});
    			//创建提交数据
    			wizard.on("submit", function(wizard) {});
			});
	    });
	}	
	return {
		init : init
	}
})
