define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/ccenter/vdc/list.html',
			data:'/v2.0/tenants/page/10/1',
			beforeRender: function(data){
				return data.result;;
			},
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		//dataTables
		Common.initDataTable($('#VdcTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">接 入</span>'
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
	    
	    //更新配额
	    $("ul.dropdown-menu a.updateQuota").on("click",function(){
	    	require(['css!'+PubView.rqBaseUrl+'/css/dialog.css']);
	    	EditData.EditVmName($(this).attr("data"));
	    });
    
	    //更多
	    var more = {
		    	//配额管理
		    	QuotaSets : function(id){
		    		//先获取QuotaSets后，再render
		    		Common.xhr.ajax('/v2.0/1/os-quota-sets/' + id,function(data){
		    			Common.render('tpls/ccenter/vdc/quota.html',data,function(html){
			    			Dialog.show({
			    	            title: '子网创建',
			    	            message: html,
			    	            nl2br: false,
			    	            buttons: [{
			    	                label: '保存',
			    	                action: function(dialog) {/*
			    	                	var valid = $(".form-horizontal").valid();
			    	            		if(!valid) return false;
//			    	                	var serverData = {
//			    	                			"id":"subnetid5",
//			    	        					"name": $("#addSubnet [name='name']").val(),
//			    	        					"cidr":  $("#addSubnet [name='cidr']").val(),
//			    	        					"ip_version": $("#addSubnet [name='ip_version']").val(),
//			    	        					"gateway_ip": $("#addSubnet [name='gateway_ip']").val(),
//			    	        					"enable_dhcp":$("#addSubnet [name='enable_dhcp']:checked").length? 1:0
//			    	        				};
			    	                	var serverData = {
			    	                		"subnet":{
			    	                			"allocation_pools": [
		           	    	                	      {
		           	    	                	        "end": $("#addSubnet [name='end']").val()? $("#addSubnet [name='end']").val():254,
		           	    	                	        "start": $("#addSubnet [name='start']").val()? $("#addSubnet [name='start']").val():1
		           	    	                	      }
		           	    	                	    ],
		           	    	                	    "cidr":  $("#addSubnet [name='cidr']").val(),
		           	    	                	    "enable_dhcp": $("#addSubnet [name='enable_dhcp']:checked").length? 1:0,
		           	    	                	    "gateway_ip": $("#addSubnet [name='gateway_ip']").val(),
		           	    	                	    "ip_version": $("#addSubnet [name='ip_version']").val(),
		           	    	                	    "ipv6_address_mode": "",
		           	    	                	    "ipv6_ra_mode": "",
		           	    	                	    "name": $("#addSubnet [name='name']").val(),
		           	    	                	    "network_id": $("#addSubnet [name='network_id']").val(),
		           	    	                	    "shared": 0,
		           	    	                	    "tenant_id": "vdcid1"
			    	                		}
			    	                	  };
			    	                	Common.xhr.postJSON('/v2.0/subnets',serverData,function(data){
			    	                		if(data){
			    	                			alert("保存成功");
			    	                			dialog.close();
											}else{
												alert("保存失败");
											}
										})
			    	                */}
			    	            }],
			    	            onshown : function(){}
			    	        });
			    		});
		    		})
		    		
		    	}
	}	
	return {
		init : init
	}
})
