define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/daterangepicker'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		var hashArr = Common.hash.split('/');
	    var vdc_id = hashArr[hashArr.length-1];
	    var start = null;
	    var end = null;
	    if(hashArr.length == 6){
	    	vdc_id = hashArr[hashArr.length-3];
	    	start = decodeURIComponent(hashArr[hashArr.length-2]);
	    	end = decodeURIComponent(hashArr[hashArr.length-1]);
	    }
	    //debugger;
	    var vdcInfo;
	    var vdc = function (id){
			Common.xhr.get('/v2.0/tenants/'+id,function(data){///v2/images
				vdcInfo = data.tenants;
			});
		}
	    vdc(vdc_id);
		Common.$pageContent.addClass("loading");
		Common.render(true,{
			tpl:'tpls/ccenter/vdc/usage.html',
			data:'/v2.0/'+Common.cookies.getVdcId()+'/os-simple-tenant-usage/' + vdc_id +'?start='+start+'&end='+end,
			beforeRender: function(data){
				var usageData = {
						vdc_name:vdcInfo.name,
						usageList:data.tenant_usage.server_usages
				}
				return usageData;
			},
			callback: bindEvent
		});
	};
	var bindEvent = function(){
		Common.initDataTable($('#UsageTable'),function($tar){
			$tar.prev().hide();
			Common.$pageContent.removeClass("loading");
		});
		 $('#time_text').daterangepicker(null, function(start, end, label) {
	            console.log(start.toISOString(), end.toISOString(), label);
	      });
		 $("#submit_usage").on("click",function(){
			 var time = $.trim($("#time_text").val());
		     if(time == null || time == "")return;
			 var hashArr = Common.hash;
			 var start =  encodeURIComponent($.trim(time.split("-")[0]));
		     var end = encodeURIComponent($.trim(time.split("-")[1]));
		     //Common.router.route(Common.hash +'/' +start +'/'+end);
		     window.location.href= Common.hash +'/' +start +'/'+end;
		 })
	}	
	return {
		init : init
	}
})
