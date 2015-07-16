define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//render获取的数据
		Common.render(true,'tpls/fservice/vpc/subnet/list.html',function(){
			bindEvent();
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		var table = Common.initDataTable($('#SubnetTable'),{
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":"networking/v2.0/subnets/page/", //ajax源，后端提供的分页接口
		      "columns": [
			        {
			        	"orderable": false,
			        	"defaultContent":"<label><input type='checkbox'></label>"
			        },
			        {"data": "network_name"},
			        {"data": {}},
			        {"data": "cidr"},
			        {"data": "virtualEnvName"},
			        {"data": "vdc_name"},
			        {"data": "ip_version"},
			        {"data": "gateway_ip"},
			        {
			        	"defaultContent":'<a class="btn-edit pull-left" data-toggle="tooltip" title="编辑" data-act="stop" href="javascript:void(0)"><li class="glyphicon glyphicon-edit"></li></a>'
							+'<a href="javascript:void(0)" class="deleteSubnet" style="margin: 0 8px;"><i class="fa fa-trash-o fa-fw"></i></a>'
			        }
		      ],
		      "columnDefs": [
					{
					    "targets": [2],
					    "render": function(data, type, full) {
					    	return "<a href='#fservice/vpc/subnet/detail/"+data.id+"'>"+data.name+"</a>";
					    }
					},
					{
					    "targets": [6],
					    "render": function(data, type, full) {
					    	return "IPV"+data;
					    }
					}
                ]
		    },
			function($tar){
		    	var $tbMenu = $tar.prev('.tableMenus');
		    	$tbMenu.length && $tbMenu.empty().html($('.table-menus').html());
		    	Common.$pageContent.removeClass("loading");
		});
		Common.on('click','.dataTables_filter .btn-query',function(){
			table.search($('.global-search').val()).draw();
		});
		$("[data-toggle='tooltip']").tooltip();
		
		//icheck
//	    $('input[type="checkbox"]').iCheck({
//	    	checkboxClass: "icheckbox-info",
//	        radioClass: "iradio-info"
//	    }).on('ifChecked',function(e){
//	    	if(e.target.className == 'selectAll'){
//	    		$('.table-primary').find('input[type=checkbox]').iCheck('check');
//	    	}
//	    }).on('ifUnchecked',function(e){
//	    	if(e.target.className == 'selectAll'){
//	    		$('.table-primary').find('input[type=checkbox]').iCheck('uncheck');
//	    	}
//	    });
	    //ip校验
	    $.validator.addMethod("ip", function(value, element) {
	    	return this.optional(element) || /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(value);
	    }, "请填写正确的IP地址");
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
	    	cidr = cidr.substring(0,cidr.lastIndexOf("."));
	    	var regx = new RegExp(cidr+"\.([1-9]\d{0,1}|1\d\d|2[0-4]\d|25[0-5])");
	    	 if(!regx.test(value)){
	    		 return false;
	    	 }else return true;
	    	
	    }, "请根据CIDR地址填写IP地址");
	    //地址池校验
	    $.validator.addMethod("pools_end", function(value, element) {
	    	var optionalValue = this.optional(element);
	    	// Element is optional
	    	if (optionalValue) {
	    		return optionalValue;
	    	}
	    	var start = $("#addSubnet [name='start']").val();
	    	if(start == "" || start ==null) return true;
	    	 if(parseInt(value.substring(value.lastIndexOf(".")+1)) < parseInt(start.substring(start.lastIndexOf(".")+1))){
	    		 return false;
	    	 }else return true;
	    	
	    }, "请输入正确的地址池结束值");
	    $.validator.addMethod("pools_start", function(value, element) {
	    	var optionalValue = this.optional(element);
	    	// Element is optional
	    	if (optionalValue) {
	    		return optionalValue;
	    	}
	    	var end = $("#addSubnet [name='end']").val();
	    	if(end == "" || end ==null) return true;
	    	
	    	 if(parseInt(value.substring(value.lastIndexOf(".")+1)) > parseInt(end.substring(end.lastIndexOf(".")+1))){
	    		 return false;
	    	 }else return true;
	    	
	    }, "请输入正确的地址池开始值");
	    
	    var EventsHandler = {
	    		//表单校验
				formValidator: function(){
					$(".form-horizontal").validate({
						errorContainer:"_form",
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
			                	ip:true,
			                	ip_rule:true,
			                	pools_end:true
			                },
			                'start':{
			                	ip:true,
			                	ip_rule:true,
			                	pools_start:true
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
				},
				enable_ip :function(){
					$("#enable_ip span").on("click", function() {
			            if($("[name='enable_ip']:checked").length) {
			            	$("#gateway_ip").css("display","");
			            }else {
			            	$("#gateway_ip").css("display","none");
			            }
			        });
				}
	    }
	    var EditData = {
	    	//创建子网弹框
	    	AddSubnet : function(cb){
	    		//先获取vpc后，再render
	    		Common.xhr.ajax('/networking/v2.0/networks',function(data){
	    			Common.render('tpls/fservice/vpc/subnet/add.html',data,function(html){
		    			Dialog.show({
		    	            title: '子网创建',
		    	            message: html,
		    	            nl2br: false,
		    	            buttons: [{
		    	                label: '创建',
		    	                action: function(dialog) {
		    	                	var valid = $(".form-horizontal").valid();
		    	            		if(!valid) return false;
		    	            		var end = $("#addSubnet [name='end']").val(), start = $("#addSubnet [name='start']").val();
		    	            		var cidr = $("#addSubnet [name='cidr']").val();
		    	            		cidr = cidr.substring(0,cidr.lastIndexOf("."));
		    	            		if(!end){
		    	            			end=cidr+".255";
		    	            		}
		    	            		if(!start){
		    	            			start=cidr+".1";
		    	            		}
		    	        	    	
		    	                	var serverData = {
		    	                		"subnet":{
		    	                			"allocation_pools": [
	           	    	                	      {
	           	    	                	        "end": end,
	           	    	                	        "start": start
	           	    	                	      }
	           	    	                	    ],
	           	    	                	    "cidr":  $("#addSubnet [name='cidr']").val(),
	           	    	                	    "enable_dhcp": $("#addSubnet [name='enable_dhcp']:checked").length? 1:0,
	           	    	                	    "gateway_ip": $("[name='enable_ip']:checked").length? $("#addSubnet [name='gateway_ip']").val():null,
	           	    	                	    "ip_version": $("#addSubnet [name='ip_version']").val(),
	           	    	                	    "ipv6_address_mode": "",
	           	    	                	    "ipv6_ra_mode": "",
	           	    	                	    "name": $("#addSubnet [name='name']").val(),
	           	    	                	    "network_id": $("#addSubnet [name='network_id']").val(),
	           	    	                	    "shared": 0,
	           	    	                	    "tenant_id": "9cc717d8047e46e5bf23804fc4400247"
		    	                		}
		    	                	  };
		    	                	Common.xhr.postJSON('/networking/v2.0/subnets',serverData,function(data){
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
	    		Common.xhr.ajax('/networking/v2.0/subnets/'+id,function(data){
	    		Common.render('tpls/fservice/vpc/subnet/edit.html',data.subnet,function(html){
	    			Dialog.show({
	    	            title: '子网编辑',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
	    	            		var end = $("#addSubnet [name='end']").val(), start = $("#addSubnet [name='start']").val();
	    	            		var cidr = $("#addSubnet [name='cidr']").val();
	    	            		cidr = cidr.substring(0,cidr.lastIndexOf("."));
	    	            		if(!end){
	    	            			end=cidr+".255";
	    	            		}
	    	            		if(!start){
	    	            			start=cidr+".1";
	    	            		}
	    	            		var serverData = {
		    	                		"subnet":{
		    	                			"allocation_pools": [
	           	    	                	      {
	           	    	                	        "end": end,
	           	    	                	        "start": start,
	           	    	                	        "id" :"",
	           	    	                	        "subnet_id":id
	           	    	                	      }
	           	    	                	    ],
	           	    	                	    "enable_dhcp": $("#addSubnet [name='enable_dhcp']:checked").length? 1:0,
	           	    	                	    "gateway_ip": $("[name='enable_ip']:checked").length? $("#addSubnet [name='gateway_ip']").val():null,
	           	    	                	    "ip_version": $("#addSubnet [name='ip_version']").val(),
	           	    	                	    "ipv6_address_mode": "",
	           	    	                	    "ipv6_ra_mode": "",
	           	    	                	    "name": $("#addSubnet [name='name']").val(),
	           	    	                	    "cidr": $("#addSubnet [name='cidr']").val()
		    	                		}
		    	                	  };
	    	                	Common.xhr.putJSON('/networking/v2.0/subnets/'+id,serverData,function(data){
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
	    $(document).off("click","#SubnetTable_wrapper span.btn-add");
	    $(document).on("click","#SubnetTable_wrapper span.btn-add",function(){
	    	EditData.AddSubnet(function(){
	    		EventsHandler.switcher();
	    		EventsHandler.enable_ip();
	    		EventsHandler.formValidator();
	    	});
	    });
	    //编辑子网
	    $(document).off("click","#SubnetTable_wrapper a.btn-edit");
	    $(document).on("click","#SubnetTable_wrapper a.btn-edit",function(){
	    	var id = $(this).parents("tr:first").data("rowData.dt").id;
	    	EditData.EditSubnet(id,function(){
	    		EventsHandler.switcher();
	    		EventsHandler.enable_ip();
	    		EventsHandler.formValidator();
	    	});
	    });
	    //删除子网
	    $(document).off("click","#SubnetTable_wrapper a.deleteSubnet");
	     $(document).on("click","#SubnetTable_wrapper a.deleteSubnet",function(){
	    	 var id = $(this).parents("tr:first").data("rowData.dt").id;
	    	 Dialog.confirm('确定要删除该子网吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/networking/v2.0/subnets/'+id,
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
