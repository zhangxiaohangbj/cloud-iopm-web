define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3','bs/switcher'],function(Common,Dialog){
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
	    }, "请填写正确的网关IP");
	    //cidr校验
	    $.validator.addMethod("cidr", function(value, element) {
	    	return this.optional(element) || /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\/\d{1,2}$/.test(value);
	    }, "请填写正确的CIDR地址");
	    //根据cidr校验ip
	    $.validator.addMethod("ip_rule", function(value, element) {
	    	var optionalValue = this.optional(element);
	    	// Element is optional
	    	if (optionalValue) {
	    		return optionalValue;
	    	}
	    	var cidr = $("#addSubnet [name='cidr']").val();
	    	if(cidr == "" || cidr ==null) return true;
	    	var cidr = cidr.substring(0,cidr.lastIndexOf("."));
	    	var regx = new RegExp(cidr+"\.([1-9]\d{0,1}|1\d\d|2[0-4]\d|25[0-5])");
	    	 if(!regx.test(value)){
	    		 return false;
	    	 }else return true;
	    	
	    }, "请根据CIDR地址填写网关IP");
	    //地址池校验
	    $.validator.addMethod("pools_end", function(value, element) {
	    	var optionalValue = this.optional(element);
	    	// Element is optional
	    	if (optionalValue) {
	    		return optionalValue;
	    	}
	    	var start = $("#addSubnet [name='start']").val();
	    	if(start == "" || start ==null) return true;
	    	 if(parseInt(value) < parseInt(start)){
	    		 return false;
	    	 }else return true;
	    	
	    }, "地址池结束值应大于开始值");
	    $.validator.addMethod("pools_start", function(value, element) {
	    	var optionalValue = this.optional(element);
	    	// Element is optional
	    	if (optionalValue) {
	    		return optionalValue;
	    	}
	    	var end = $("#addSubnet [name='end']").val();
	    	if(end == "" || end ==null) return true;
	    	 if(parseInt(value) > parseInt(end)){
	    		 return false;
	    	 }else return true;
	    	
	    }, "地址池开始值应小于结束值");
	    
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
			                    ip: true,
			                    ip_rule: true
			                },
			                'end':{
			                	max:255,
			                	min:1,
			                	pools_end:true,
			                	digits:true
			                },
			                'start':{
			                	max:255,
			                	min:1,
			                	pools_start:true,
			                	digits:true
			                }
			            }
			        });
				},
				checkboxICheck : function(){
					$('input[type="checkbox"]').iCheck({
		    	    	checkboxClass: "icheckbox-info",
		    	        radioClass: "iradio-info"
		    	    })
				},
				switcher:function(){
					$("#addSubnet input[type=\"checkbox\"], input[type=\"radio\"]").not("[data-switch-no-init]").switcher();
					$("[data-switch-set]").on("click", function() {
			            var type;
			            type = $(this).data("switch-set");
			            $(this).parent().find(".btn-gray").removeClass("btn-gray");
			            $(this).addClass("btn-gray");
			            return $("#switch-" + type).switcher(type, $(this).data("switch-value"));
			        });
				},
				enable_ip :function(){
					$("#enable_ip .btn").on("click", function() {
			            var btn_val = $(this).data("switch-value");
			            $(this).parent().find(".btn-gray").removeClass("btn-gray");
			            $(this).addClass("btn-gray");
			            if(btn_val) {
			            	$("#gateway_ip").css("display","none");
			            	$("input[name='enable_ip']").val(1);
			            }else {
			            	$("#gateway_ip").css("display","");
			            	$("input[name='enable_ip']").val(0);
			            }
			        });
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
	           	    	                	    "gateway_ip": $("input[name='enable_ip']").val()? null:$("#addSubnet [name='gateway_ip']").val(),
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
		    	                			Dialog.success('保存成功')
		    	                			setTimeout(function(){Dialog.closeAll()},2000);
		    	                			Common.router.route();
										}else{
											 Dialog.warning ('保存失败')
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
		    	                			"allocation_pools": [
	           	    	                	      {
	           	    	                	        "end": $("#addSubnet [name='end']").val()? $("#addSubnet [name='end']").val():254,
	           	    	                	        "start": $("#addSubnet [name='start']").val()? $("#addSubnet [name='start']").val():1,
	           	    	                	        "id" :"",
	           	    	                	        "subnet_id":id
	           	    	                	      }
	           	    	                	    ],
	           	    	                	    "enable_dhcp": $("#addSubnet [name='enable_dhcp']:checked").length? 1:0,
	           	    	                	    "gateway_ip": $("input[name='enable_ip']").val()? null:$("#addSubnet [name='gateway_ip']").val(),
	           	    	                	    "ip_version": $("#addSubnet [name='ip_version']").val(),
	           	    	                	    "ipv6_address_mode": "",
	           	    	                	    "ipv6_ra_mode": "",
	           	    	                	    "name": $("#addSubnet [name='name']").val()
		    	                		}
		    	                	  };
	    	                	Common.xhr.putJSON('/v2.0/subnets/'+id,serverData,function(data){
	    	                		if(data){
	    	                			Dialog.success('保存成功')
	    	                			setTimeout(function(){Dialog.closeAll()},2000);
	    	                			Common.router.route();
									}else{
										Dialog.warning ('保存失败')
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
	    		EventsHandler.enable_ip();
	    		EventsHandler.switcher();
	    		EventsHandler.formValidator();
	    	});
	    });
	    //编辑子网
	    $("#SubnetTable_wrapper a.btn-opt").on("click",function(){
	    	EditData.EditSubnet($(this).attr("data"),function(){
	    		EventsHandler.enable_ip();
	    		EventsHandler.switcher();
	    		EventsHandler.formValidator();
	    	});
	    });
	    $("#SubnetTable_wrapper a.subnet-name").on("click",function(){
	    	Common.xhr.ajax('/v2.0/subnets/'+$(this).attr("data"),function(data){
	    		Common.render('tpls/ccenter/vpc/subnetDetail.html',data.subnet,function(html){
	    			$("#page-main .page-content").html(html);
	    			EventsHandler.checkboxICheck();
	    			//返回按钮
	    		    $(".form-horizontal a.reload").on("click",function(){
	    		    	Common.router.route();
	    		    })
	    		});
	    	});
	    })
	    //删除子网
	     $("#SubnetTable_wrapper a.deleteSubnet").on("click",function(){
	    	 var obj = $(this);
	    	 var id = obj.attr("data");
	    	 Dialog.confirm('确定要删除该子网吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/v2.0/subnets/'+id,
	                     function(data){
	                    	 if(data){
	                    		 Dialog.success('删除成功')
 	                			 setTimeout(function(){Dialog.closeAll()},2000);
	                    		 Common.router.route();
	                    	 }else{
	                    		 Dialog.warning ('删除失败')
	                    	 }
	                     });
	             }else {
	            	 Dialog.closeAll();
	             }
	         });
	     })
	   
	}
	return {
		init : init
	}
})
