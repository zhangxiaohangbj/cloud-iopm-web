define(['Common','bs/modal','js/fservice/security/firewall/firewall','js/fservice/security/firewall/policy','js/fservice/security/firewall/rule','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common, Dialog, firewall, policy, rule){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		var hashArr = Common.hash.split('/');
	    var tabActive = hashArr[hashArr.length-1];
	    
    	Common.render(true,'tpls/fservice/security/firewall/index.html',function(html){
    		bindEvent(tabActive);
    	});
	};
	
	function bindEvent(tabActive){
		Common.$pageContent.removeClass("loading");
		if(tabActive){
			$('.firewall-info .nav li').removeClass('active');
			$('.firewall-info .nav li[data-for="'+tabActive+'"]').addClass('active');
			$('.tab-content').find('.tab-pane').removeClass('active');
			$('.tab-content').find('div.' + tabActive).addClass('active');
			if(tabActive == "firewall"){
				renderFirewall();
			}
			if(tabActive == "policy"){
				renderPolicy();
			}
			if(tabActive == "rule"){
				renderRule();
			}
		}else{
			renderFirewall();
		}
		$('.firewall-info .nav li').on('click',function(){
			var $this = $(this);
			if(!$this.hasClass('active')){
				var data = $this.attr('data-for');
				window.location.hash='#fservice/security/firewall/tab/'+data;
			}
		});
		function renderFirewall(){
			var $tab = $('.tab-content').find('div.firewall');
			Common.showLocalLoading($tab);
			Common.render(false,'tpls/fservice/security/firewall/firewall/list.html',function(html){
				$tab.empty().append(html);
				firewall.bindEvent();
			});
//			Common.hideLocalLoading($tab);
		}
		function renderPolicy(){
			var $tab = $('.tab-content').find('div.policy');
			Common.showLocalLoading($tab);
			Common.render(false,'tpls/fservice/security/firewall/policy/list.html',function(html){
				$tab.empty().append(html);
				policy.bindEvent();
			});
//			Common.hideLocalLoading($tab);
		}
		function renderRule(){
			var $tab = $('.tab-content').find('div.rule');
			Common.showLocalLoading($tab);
			Common.render(false,'tpls/fservice/security/firewall/rule/list.html',function(html){
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