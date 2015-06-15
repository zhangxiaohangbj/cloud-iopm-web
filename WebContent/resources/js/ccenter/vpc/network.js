define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	Common.requestCSS('css/dialog.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,'tpls/ccenter/vpc/network.html','/v2.0/networks',function(){
			bindEvent();
		});
	};
	
	var bindEvent = function(){
		Common.initDataTable($('#networkTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">创 建</span>'
				);
			//这个必须添加，不然就是隐藏的效果，看不到页面
			Common.$pageContent.removeClass("loading");
		});
		$("[data-toggle='tooltip']").tooltip();
    	//载入默认的数据 inits,创建数据载入类
		var DataIniter = {
				//vdc列表
				initVdcList : function(){
					Common.xhr.ajax('/v2.0/tenants',function(data){
						var tenants = data.tenants;
						var id = $('select.tenant_id').attr("data");
						if(id!=null){
							for (var i=0;i<tenants.length;i++) {
								if (tenants[i].id==id) {
									tenants[i].selected="selected";
								}
							}
						}				
						var html = Common.uiSelect(tenants);
				    	$('select.tenant_id').html(html);
				    	
					})
				},
		};
	    //cidr校验
	    $.validator.addMethod("cidr", function(value, element) {
	    	return this.optional(element) || /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\/\d{1,2}$/.test(value);
	    }, "请填写正确的CIDR地址");
		var EventsHandler = {
	    		//表单校验
				formValidator: function(){
					return $(".form-horizontal").validate({
			            rules: {
			            	'name': {
			            		required: true,
			                    minlength: 4,
			                    maxlength:255
			                },
			                'cidr': {
			                    required: true,
			                    maxlength:64,
			                    cidr: true
			                }
			            }
			        });
				},
				switcher:function(){
					$(".col-sm input[type=\"checkbox\"], input[type=\"radio\"]").not("[data-switch-no-init]").switcher();
				},
	    }
		//增加按钮
		$("#networkTable_wrapper span.btn-add").on("click",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/ccenter/vpc/addnetwork.html','',function(html){
				Dialog.show({
    	            title: '新建VPC',
    	            message: html,
    	            closeByBackdrop: false,
    	            nl2br: false,
    	            buttons: [{
    	                label: '保存',
    	                action: function(dialog) {
    	                	var valid = $(".form-horizontal").valid();
    	            		if(!valid) return false;
    	                	var data = $("#addNetwork").serializeArray();
    	                	var postData={"network":{}};
    	                	for(var i=0;i<data.length;i++){
    	                		postData.network[data[i]["name"]] = data[i]["value"];
    						}
    	                	postData.network["admin_state_up"] =  postData.network["admin_state_up"] ==null?false:true;
    	                	postData.network["shared"] =  postData.network["shared"] ==null?false:true;
    	                	postData.network["router:external"] =  postData.network["router:external"] ==null?false:true;               			
    	                	Common.xhr.postJSON('/v2.0/networks',postData,function(data){
    	                		if(data){
    	                			dialog.close();
    	                			Dialog.success('保存成功')
     	                			setTimeout(function(){Dialog.closeAll()},3000);
    	                			Common.router.route();
								}else{
									alert("保存失败");
								}
    	    				});
    	                }
    	            }, {
    	                label: '取消',
    	                action: function(dialog) {
    	                    dialog.close();
    	                }
    	            }],
    	            onshown : function(dialog){
    	    			EventsHandler.switcher();
    	    			DataIniter.initVdcList();
    	    			dialog.setData("formvalid",EventsHandler.formValidator());
    	            },
    	            onhide : function(dialog){
    	            	debugger;
    	            	var valid = dialog.getData("formvalid");
    	            	valid.hideErrors();
    	            }
    	        });
    		
			})
		});
		//编辑网络
		$("#networkTable_wrapper a.btn-edit").on("click",function(){
			var id = $(this).attr("data");
			Common.render(false,'tpls/ccenter/vpc/editnetwork.html','/v2.0/networks/'+id,function(html){
				Dialog.show({
    	            title: '编辑网络',
    	            message: html,
    	            closeByBackdrop: false,
    	            nl2br: false,
    	            buttons: [{
    	                label: '保存',
    	                action: function(dialog) {
    	                	var valid = $(".form-horizontal").valid();
    	            		if(!valid) return false;
    	                	var data = $("#editNetwork").serializeArray();
    	                	var postData={"network":{}};
    	                	for(var i=0;i<data.length;i++){
    	                		postData.network[data[i]["name"]] = data[i]["value"];
    						}
    	                	postData.network["admin_state_up"] =  postData.network["admin_state_up"] ==null?false:true;
    	                	postData.network["shared"] =  postData.network["shared"] ==null?false:true;
    	                	postData.network["router:external"] =  postData.network["router:external"] ==null?false:true;               			
    	                	Common.xhr.putJSON('/v2.0/networks/'+id,postData,function(data){
    	                		if(data){
    	                			dialog.close();
    	                			Dialog.success('修改成功')
     	                			setTimeout(function(){Dialog.closeAll()},3000);
    	                			Common.router.route();
								}else{
									alert("保存失败");
								}
    	    				});
    	                }
    	            }, {
    	                label: '取消',
    	                action: function(dialog) {
    	                    dialog.close();
    	                }
    	            }],
    	            onshown : function(){
    	            	EventsHandler.switcher();
    	    			DataIniter.initVdcList();    			
    	    			EventsHandler.formValidator();
    	            }
    	        });
			});
		});
		//删除子网
		$("#networkTable_wrapper a.btn-delete").on("click",function(){
	    	 var id = $(this).attr("data")
	    	 Dialog.confirm('确定要删除该网络吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/v2.0/networks/'+id,"",
	                     function(data){
	                    	 if(data){
 	                			Dialog.success('删除成功')
 	                			setTimeout(function(){Dialog.closeAll()},3000);
	                    		Common.router.route();
	                    	 }else{
	                    		Dialog.success('删除失败')
	 	                		setTimeout(function(){Dialog.closeAll()},3000);
	                    	 }
	                     });
	             }else {
	            	 //Dialog.close();
	             }
	         });
		});
		//明细
	    $("#networkTable_wrapper a.network-name").on("click",function(){
	    	var id = $(this).attr("data");
	    	Common.render(true,'tpls/ccenter/vpc/networkdetail.html','/v2.0/networks/'+id,function(html){
	    		Common.render(false,'tpls/ccenter/vpc/networkdetailsubnetlist.html','/v2.0/subnets?network_id='+id,function(html){
	    			EventsHandler.switcher();
					$('#subnetTableDiv').html(html);
					 $("a.reload").on("click",function(){
		    		    	Common.router.route();
		    		  });
				});
	    	});
	    })
		
	}	
	return {
		init : init
	}
})
