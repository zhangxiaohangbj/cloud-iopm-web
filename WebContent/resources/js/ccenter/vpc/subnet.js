define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	Common.requestCSS('css/dialog.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//render获取的数据
		Common.render(true,'tpls/ccenter/vpc/subnet.html','/v2.0/subnets/page/1/10',function(){
			bindEvent();
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#SubnetTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">创 建</span>'
				);
			Common.$pageContent.removeClass("loading");
		});
		$("[data-toggle='tooltip']").tooltip();
		
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
	    //ip校验
	    $.validator.addMethod("ip", function(value, element) {
	    	return this.optional(element) || /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(value);
	    }, "请填写正确的ip");
	    //cidr校验
	    $.validator.addMethod("cidr", function(value, element) {
	    	return this.optional(element) || /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\/\d{1,2}$/.test(value);
	    }, "请填写正确的CIDR地址");
	    
	    var EventsHandler = {
	    		//表单校验
				formValidator: function(){
					$(".form-horizontal").validate({
			            rules: {
			            	'name': {
			                    required: true,
			                    maxlength:255
			                },
			                'cidr': {
			                    required: true,
			                    maxlength:64,
			                    cidr: true
			                },
			                'gateway_ip':{
			                	required: true,
			                    ip: true
			                }
			            }
			        });
				},
				checkboxICheck : function(){
					$('input[type="checkbox"]').iCheck({
		    	    	checkboxClass: "icheckbox-info",
		    	        radioClass: "iradio-info"
		    	    })
				}
	    }
	    var EditData = {
	    	//创建子网弹框
	    	AddSubnet : function(cb){
	    		//先获取vpc后，再render
	    		Common.xhr.ajax('/v2.0/networks',function(data){
	    			Common.render('tpls/ccenter/vpc/addSubnet.html',data,function(html){
		    			Dialog.show({
		    	            title: '子网创建',
		    	            message: html,
		    	            nl2br: false,
		    	            buttons: [{
		    	                label: '创建',
		    	                action: function(dialog) {
		    	                	var valid = $(".form-horizontal").valid();
		    	            		if(!valid) return false;
//		    	                	var serverData = {
//		    	                			"id":"subnetid5",
//		    	        					"name": $("#addSubnet [name='name']").val(),
//		    	        					"cidr":  $("#addSubnet [name='cidr']").val(),
//		    	        					"ip_version": $("#addSubnet [name='ip_version']").val(),
//		    	        					"gateway_ip": $("#addSubnet [name='gateway_ip']").val(),
//		    	        					"enable_dhcp":$("#addSubnet [name='enable_dhcp']:checked").length? 1:0
//		    	        				};
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
		    	                }
		    	            }],
		    	            onshown : cb
		    	        });
		    		});
	    		})
	    		
	    	},
	    	//编辑子网弹框
	    	EditSubnet : function(id,cb){
	    		Common.xhr.ajax('/v2.0/subnets/'+id,function(data){
	    		Common.render('tpls/ccenter/vpc/editSubnet.html',data.subnet,function(html){
	    			Dialog.show({
	    	            title: '子网编辑',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
	    	            		var serverData = {
	    	            			"subnet":{
	    	        					"gateway_ip": $("#addSubnet [name='gateway_ip']").val(),
	    	        					"enable_dhcp": $("#addSubnet [name='enable_dhcp']:checked").length? 1:0
	    	            				}
	    	        				};
	    	                	Common.xhr.putJSON('/v2.0/subnets/'+id,serverData,function(data){
	    	                		if(data){
	    	                			alert("保存成功");
	    	                			dialog.close();
									}else{
										alert("保存失败");
									}
								})
	    	                }
	    	            }],
	    	            onshown : cb
	    	        });
	    		});
	    		});
	    	}
	    }
	    
	  //创建子网
	    $("#SubnetTable_wrapper span.btn-add").on("click",function(){
	    	EditData.AddSubnet(function(){
	    		EventsHandler.checkboxICheck();
	    		EventsHandler.formValidator();
	    	});
	    });
	    //编辑子网
	    $("#SubnetTable_wrapper a.btn-opt").on("click",function(){
	    	EditData.EditSubnet($(this).attr("data"),function(){
	    		EventsHandler.checkboxICheck();
	    		EventsHandler.formValidator();
	    	});
	    });
	    $("#SubnetTable_wrapper a.subnet-name").on("click",function(){
	    	Common.xhr.ajax('/v2.0/subnets/'+$(this).attr("data"),function(data){
	    		Common.render('tpls/ccenter/vpc/subnetDetail.html',data.subnet,function(html){
	    			$("#page-main .page-content").html(html);
	    			EventsHandler.checkboxICheck();
	    		});
	    	});
	    })
	    //删除子网
	     $("#SubnetTable_wrapper a.deleteSubnet").on("click",function(){
	    	 var obj = $(this);
	    	 var id = obj.attr("data");
	    	 Dialog.confirm('确定要删除该子网吗?', function(result){
	             if(result) {
	            	 $.ajax({
	                     'type': 'DELETE',
	                     'url': '/v2.0/subnets/'+id,
	                     'contentType': 'application/json',
	                     'success': function(data){
	                    	 if(data){
	                    		 alert("删除成功");
	                    		 location.reload();
	                    	 }else{
	                    		 alert("删除失败");
	                    	 }
	                     }
	                 });
	             }else {
	            	 Dialog.close();
	             }
	         });
	     })
	   
	}
	return {
		init : init
	}
})
