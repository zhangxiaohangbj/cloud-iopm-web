define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/detail.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		var hashArr = Common.hash.split('/');
	    var zoneId = hashArr[hashArr.length-1];
		Common.xhr.ajax("/v2/os-availability-zone/"+zoneId,function(zoneInfo){
			Common.render(true,'tpls/cresource/zone/detail.html',zoneInfo,function(html){
				bindEvent();
			});
		})
	};
	function bindEvent(){
		Common.$pageContent.removeClass("loading");
		$('.detail-info .nav li').on('click',function(){
			var $this = $(this);
			if(!$this.hasClass('active')){
				$('.detail-info .nav li').removeClass('active');
				$this.addClass('active');
				var data = $this.attr('data-for');
				$('.detail-info-content').find('.tab-pane').removeClass('active');
				renderTab(data);
			}
		});
		//异步渲染tab标签内容
		function renderTab(data){
			var $tab = $('.detail-info-content').find('div.'+data);
			$tab.addClass('active');
			Common.showLocalLoading($tab);
			if('snapshot' == data){
				//获取磁盘快照列表
				Common.render(false,'tpls/ccenter/block/volume/list_snapshot.html','/resources/data/volume.txt',function(html){
					$tab.empty().append(html);
				});
			}else if('monitor' == data){

			}
			Common.hideLoclLoading($tab);
		}

	}
	return {
		init: init
	}
})
