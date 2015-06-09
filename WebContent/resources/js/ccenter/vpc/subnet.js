define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//需要修改为真实数据源
		Common.render(true,'tpls/ccenter/vpc/subnet.html','/resources/data/subnet.txt',function(){
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
			            	'subnet-name': {
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
	    	        					"name": $("#subnet-name").val(),
	    	        					"imageRef": 'ed18e2ce-a574-4ff0-8a00-6ef9d7dc4c2b',//$("#image-id").val(),
	    	        					"flavorRef": '3',//$("#select-specs").val(),
	    	        					"networks": [{
	    	        						"uuid": 'af8c1f42-b21c-4d13-bc92-1852e22f4f98',//$("#chosen-network").val(),
	    	        						"fixed_ip": '192.168.0.115'//$("#select-net-ip").val()
	    	        					}]
	    	        				};
	    	                	Common.xhr.ajax('/resources/data/arrays.txt',function(data){
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
	    		Common.xhr.ajax('/resources/data/editsubnet.txt',function(data){
	    		Common.render('tpls/ccenter/vpc/editSubnet.html',data,function(html){
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
	    	        					"name": $("#subnet-name").val(),
	    	        					"imageRef": 'ed18e2ce-a574-4ff0-8a00-6ef9d7dc4c2b',//$("#image-id").val(),
	    	        					"flavorRef": '3',//$("#select-specs").val(),
	    	        					"networks": [{
	    	        						"uuid": 'af8c1f42-b21c-4d13-bc92-1852e22f4f98',//$("#chosen-network").val(),
	    	        						"fixed_ip": '192.168.0.115'//$("#select-net-ip").val()
	    	        					}]
	    	        				};
	    	                	Common.xhr.ajax('/resources/data/arrays.txt',function(data){
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
	    	Common.requestCSS('css/dialog.css');
	    	EditData.AddSubnet(function(){
	    		EventsHandler.checkboxICheck();
	    		EventsHandler.formValidator();
	    	});
	    });
	    //编辑子网
	    $("#SubnetTable_wrapper a.btn-opt").on("click",function(){
	    	Common.requestCSS('css/dialog.css');
	    	EditData.EditSubnet($(this).attr("data"),function(){
	    		EventsHandler.checkboxICheck();
	    		EventsHandler.formValidator();
	    	});
	    });
	    $("#SubnetTable_wrapper a.subnet-name").on("click",function(){
	    	Common.requestCSS('css/dialog.css');
	    	Common.xhr.ajax('/resources/data/editsubnet.txt',function(data){
	    		Common.render('tpls/ccenter/vpc/subnetDetail.html',data,function(html){
	    			$("#page-main .page-content").html(html);
	    			EventsHandler.checkboxICheck();
	    		});
	    });
	    })
	}
	return {
		init : init
	}
})
