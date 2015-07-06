define(['Common','bs/modal','js/fservice/vpc/firewall/firewall','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common,Dialog,firewall){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
    	Common.render(true,'tpls/fservice/vpc/firewall/index.html',function(html){
    		bindEvent();
    	});
	};
	
	function bindEvent(){
		Common.$pageContent.removeClass("loading");
		renderFirewall();
		$('.firewall-info .nav li').on('click',function(){
			var $this = $(this);
			if(!$this.hasClass('active')){
				$('.detail-info .nav li').removeClass('active');
				$this.addClass('active');
				var data = $this.attr('data-for');
				$('.tab-content').find('.tab-pane').removeClass('active');
				if('firewall' == data){
					renderFirewall();
				}else if('policy'){
					renderPolicy();
				}else if('rule'){
					renderRule();
				}
			}
		});
		function renderFirewall(){
			var $tab = $('.tab-content').find('div.firewall');
			Common.showLocalLoading($tab);
			Common.render(false,'tpls/fservice/vpc/firewall/firewall/list.html',function(html){
				$tab.empty().append(html);
				firewall.alertFirewall();
				firewall.bindEvent();
			});
			Common.hideLocalLoading($tab);
		}
		function renderPolicy(){
			var $tab = $('.tab-content').find('div.policy');
			Common.showLocalLoading($tab);
			Common.render(false,'tpls/fservice/vpc/firewall/policy/list.html',function(html){
				$tab.empty().append(html);
//				policy.bindEvent();
			});
			Common.hideLocalLoading($tab);
		}
		function renderRule(){
			var $tab = $('.tab-content').find('div.rule');
			Common.showLocalLoading($tab);
			Common.render(false,'tpls/fservice/vpc/firewall/rule/list.html',function(html){
				$tab.empty().append(html);
//				policy.bindEvent();
			});
			Common.hideLocalLoading($tab);
		}
	}
	return{
		init:init
	}
})