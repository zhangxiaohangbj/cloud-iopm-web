define(function(){
	var init = function(){
		PubView.activeSideBar(2, 1);	//左侧导航选中
		$('.page-content').addClass("loading");
		//需要修改为真实数据源
		require(['template','text!'+PubVars.contextPath+'/resources/data/arrays.txt','text!'+PubVars.contextPath+'/resources/tpls/cservice/db.tpl'],function(template,data,tpl){
			try{
				if(data){
					data = JSON.parse(data);
				}
				var render = template.compile(tpl);
				$('.page-content').html(render(data));
			}catch(e){
				$('.page-content').html('<p class="error-tips text-danger">数据解析出错，请稍后再试…</p>');
			}
			bindEvent();
		})
	}
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
			//dataTables
		Initializer.initDataTable($('#DbTable'),function($tar){
				$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">接 入</span>'+
					'<span class="btn btn-more">更 多</span>'
				);
				$tar.prev().find('.right-col:first').append(
					  '<select  class="select-envir form-control" data-initialize="iselect">'+
					  	  '<option selected>请选择环境</option>'+  
					  	  '<option>cow</option>'+
				          '<option>bull</option>'+
				          '<option>ASD</option>'+
				          '<option>Ble</option>'+
			          '</select>'
				);
				$('.page-content').removeClass("loading");
			});
			
			//tooltip
			require(['bs/tooltip'],function(){
				$("[data-toggle='tooltip']").tooltip();
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
		}
	return {
		init : init
	}
})