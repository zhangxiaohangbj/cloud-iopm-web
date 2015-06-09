define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	require(['css!'+PubView.rqBaseUrl+'/css/dialog.css']);
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.xhr.ajax('/v2.0/networks',function(data){
			var serversData = {"data":data}
			Common.render(true,'tpls/ccenter/vpc/network.html',serversData,function(){
				bindEvent();
			});
		})
	};
	
	var bindEvent = function(){
		Common.initDataTable($('#networkTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">创 建</span>'
				);
			//这个必须添加，不然就是隐藏的效果，看不到页面
			Common.$pageContent.removeClass("loading");
		});
		$("[data-toggle='tooltip']").tooltip();
		//增加按钮
	    $("#networkTable_wrapper span.btn-add").on("click",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/ccenter/vpc/addnetwork.html','',function(html){
    			Modal.show({
    	            title: '新建VPC',
    	            message: html,
    	            nl2br: false,
    	            buttons: [{
    	                label: '保存',
    	                action: function(dialog) {
    	                	Common.xhr.ajax('/resources/data/arrays.txt',function(data){
    	                		if(data){
    	                			alert("保存成功");
    	                			dialog.close();
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
