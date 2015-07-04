define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/detail.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		var hashArr = Common.hash.split('/');
	    var volume_id = hashArr[hashArr.length-1];
		var tmpDetailData = {
	            name : volume_id,
	        	"id" : "6",
	            "conf":"test",
	            "servers": "2",
	            "require": "2",
	            "min": "1",
	            "max" : "5",
	            "available_zone": "WDS-dec",
	            "cool_time":"300",
	            "status":"start",
	            create_time: '2015-04-24 17:14:57'
    	};
    	Common.render(true,'tpls/fservice/autoscaling/detail.html',tmpDetailData,function(html){
    		bindEvent();
    	});
	};
	function bindEvent(){
		Common.$pageContent.removeClass("loading");
		$('.detail-info .nav li').on('click',function(){
			var $this = $(this);
			if(!$this.hasClass('active')){
				$('.detail-info .nav li').removeClass('active');
				$this.addClass('active');
				var data = $this.attr('data-for');
				$('.tab-content').find('.tab-pane').removeClass('active');
				renderTab(data);
			}
		});
		//异步渲染tab标签内容
		function renderTab(data){
			var $tab = $('.tab-content').find('div.'+data);
			$tab.addClass('active');
			Common.showLocalLoading($tab);
			if('conf' == data){
				Common.render(false,'tpls/fservice/autoscaling/confs.html','/resources/data/confs.txt',function(html){
					$tab.empty().append(html);
					Common.initDataTable($('#confTable'),
						    function($tar){
							$tar.prev().find('.left-col:first').append(
									'<span class="btn btn-add">新 建 </span>'
								);
							Common.$pageContent.removeClass("loading");
					});
				});
			}else if('server' == data){
				Common.render(false,'tpls/fservice/autoscaling/servers.html','/resources/data/servers.txt',function(html){
					$tab.empty().append(html);
				});
			}else if('rule' == data){
				Common.render(false,'tpls/fservice/autoscaling/rules.html','/resources/data/rules.txt',function(html){
					$tab.empty().append(html);
				});	
			}else if('activity' == data){
				Common.render(false,'tpls/fservice/autoscaling/activities.html','/resources/data/activities.txt',function(html){
					$tab.empty().append(html);
				});					
			}else if('task' == data){
				Common.render(false,'tpls/fservice/autoscaling/tasks.html','/resources/data/tasks.txt',function(html){
					$tab.empty().append(html);
				});	
			}
			Common.hideLocalLoading($tab);
		}
		
	}
	return {
		init: init
	}
})
