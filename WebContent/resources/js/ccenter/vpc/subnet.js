define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	Common.requestCSS('css/dialog.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//需要修改为真实数据源
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
	    var EventsHandler = {
	    		//表单校验
				formValidator: function(){
					$(".form-horizontal").validate({
			            rules: {
			            	'name': {
			                    required: true,
			                    minlength: 4,
			                    maxlength:15
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
	    		//编辑云主机名称弹框
	    	AddSubnet : function(cb){
	    		Common.render('tpls/ccenter/vpc/addSubnet.html','',function(html){
	    			Dialog.show({
	    	            title: '子网创建',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '创建',
	    	                action: function(dialog) {
	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
	    	                	var serverData = {
	    	        					"name": $("#addSubnet [name='name']").val(),
	    	        					"cidr":  $("#addSubnet [name='cidr']").val(),
	    	        					"ip_version": $("#addSubnet [name='ip_version']").val(),
	    	        					"gateway_ip": $("#addSubnet [name='gateway_ip']").val(),
	    	        					"enable_dhcp":$("#addSubnet [name='enable_dhcp']:checked").length? 1:0
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
	    		
	    	},
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
	    	        					"ip_version": $("#addSubnet [name='ip_version']").val(),
	    	        					"gateway_ip": $("#addSubnet [name='gateway_ip']").val(),
	    	        					"enable_dhcp":$("#addSubnet [name='enable_dhcp']:checked").length? 1:0
	    	        				};
	    	                	Common.xhr.putJSON('/v2.0/subnets/subnetid1',serverData,function(data){
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
