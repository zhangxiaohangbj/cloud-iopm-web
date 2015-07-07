define(['Common','bs/modal','js/fservice/vpc/firewall/firewall','js/fservice/vpc/firewall/policy','js/fservice/vpc/firewall/rule','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common, Dialog, firewall, policy, rule){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		var hashArr = Common.hash.split('/');
	    var tabActive = hashArr[hashArr.length-1];
	    
    	Common.render(true,'tpls/fservice/vpc/firewall/index.html',function(html){
    		bindEvent(tabActive);
    	});
	};
	
	function bindEvent(tabActive){
		Common.$pageContent.removeClass("loading");
		renderFirewall();
		renderPolicy();
		renderRule();
		if(tabActive){
			$('.firewall-info .nav li').removeClass('active');
			$('.firewall-info .nav li[data-for="'+tabActive+'"]').addClass('active');
			$('.tab-content').find('.tab-pane').removeClass('active');
			$('.tab-content').find('div.' + tabActive).addClass('active');
		}
		$('.firewall-info .nav li').on('click',function(){
			var $this = $(this);
			if(!$this.hasClass('active')){
				$('.firewall-info .nav li').removeClass('active');
				$this.addClass('active');
				var data = $this.attr('data-for');
				$('.tab-content').find('.tab-pane').removeClass('active');
				var $tab = $('.tab-content').find('div.' + data);
				$tab.addClass('active');
			}
		});
		function renderFirewall(){
			var $tab = $('.tab-content').find('div.firewall');
			Common.showLocalLoading($tab);
			Common.render(false,'tpls/fservice/vpc/firewall/firewall/list.html',function(html){
				$tab.empty().append(html);
				firewall.bindEvent();
			});
//			Common.hideLocalLoading($tab);
		}
		function renderPolicy(){
			var $tab = $('.tab-content').find('div.policy');
			Common.showLocalLoading($tab);
			Common.render(false,'tpls/fservice/vpc/firewall/policy/list.html',function(html){
				$tab.empty().append(html);
				policy.bindEvent();
			});
//			Common.hideLocalLoading($tab);
		}
		function renderRule(){
			var $tab = $('.tab-content').find('div.rule');
			Common.showLocalLoading($tab);
			Common.render(false,'tpls/fservice/vpc/firewall/rule/list.html',function(html){
				$tab.empty().append(html);
				rule.bindEvent();
			});
//			Common.hideLocalLoading($tab);
		}
	}
	return{
		init:init
	}
})