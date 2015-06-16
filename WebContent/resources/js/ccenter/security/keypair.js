define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var current_vdc_id = '9cc717d8047e46e5bf23804fc4400247';
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/ccenter/security/keypairlist.html',
			data:'/'+current_vdc_id+'/os-keypairs',
			beforeRender: function(data){
				return data.result;
			},
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#KeypairTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add keypair-add">创建密钥对</span><span class="btn btn-add keypair-import">导入密钥对</span><span class="btn btn-danger keypair-delete">删除密钥对</span> '
				);
			
			Common.$pageContent.removeClass("loading");
		});
		
		//$("[data-toggle='tooltip']").tooltip();
		//载入默认的数据 inits,创建数据载入类
		var DataIniter = {
				
				
		};
		
		//载入后的事件
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
			                'public_key':{
			                	required: true
			                }
			            }
			        });
				},
		
				genPrivateKey: function(kp){
					var aLink = document.createElement('a');
     			    var blob = new Blob([kp.keypair.private_key]);
     			    var evt = document.createEvent("HTMLEvents");
     			    evt.initEvent("click", false, false);
     			    aLink.download = kp.keypair.name+".pem";
     			    aLink.href = URL.createObjectURL(blob);
     			    aLink.dispatchEvent(evt);
				}
		}
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
		var renderData = {};
		
		//增加按钮
		//创建密钥对
		$("#KeypairTable_wrapper span.keypair-add").on("click",function(){
	    	
			//需要修改为真实数据源	
			Common.render('tpls/ccenter/security/addkeypair.html','',function(html){	
				Modal.show({
    	            title: '创建密钥对',
    	            message: html,
    	            closeByBackdrop: false,
    	            nl2br: false,
    	            buttons: [{
    	                label: '保存',
    	                action: function(dialog) {
    	                	var valid = $(".form-horizontal").valid();
    	            		if(!valid) return false;
    	            		var name = $("input.name").val();
    	                	var postData={"keypair":{"name":name}};
    	                	//alert("Value: " + postData.toString());
    	                	Common.xhr.postJSON('/'+current_vdc_id+'/os-keypairs',postData,function(data){
    	                		if(data){
    	                			dialog.close();
    	                			
    	                			var data1 = data;
    	                			Common.render('tpls/ccenter/security/downloadkeypair.html',data1,function(html){
    	                				Modal.show({
    	                    	            title: '下载密钥对',
    	                    	            message: html,
    	                    	            closeByBackdrop: false,
    	                    	            nl2br: false,
    	                    	            buttons: [{
    	                    	                label: '关闭',
    	                    	                action: function(dialog) {
    	                    	                    dialog.close();
    	                    	                }
    	                    	            }],
    	                    	            onshown: function(){
    	                    	            	//生成私钥文件并提供下载
    	    	                				$("#downloadPrivateKey a.genPrivateKey").on("click",function(){
    	    	                					EventsHandler.genPrivateKey(data);
    	    	                				});
    	    	                				EventsHandler.genPrivateKey(data);
    	                    	            }
    	                				});
    	                				
    	                				
    	                			});
 	                			    
    	                			Common.router.route();
								}else{
									Modal.alert('密钥对['+id+']创建失败');
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
    	    			dialog.setData("formvalid",EventsHandler.formValidator());
    	            },
    	            onhide : function(dialog){
    	            	debugger;
    	            	var valid = dialog.getData("formvalid");
    	            	valid.hideErrors();
    	            }
    	        });
    		
			});
			
	    	
		});
		
		//导入密钥对
		$("#KeypairTable_wrapper span.keypair-import").on("click",function(){
	    	
			//需要修改为真实数据源	
			Common.render('tpls/ccenter/security/importkeypair.html','',function(html){	
				Modal.show({
    	            title: '导入密钥对',
    	            message: html,
    	            closeByBackdrop: false,
    	            nl2br: false,
    	            buttons: [{
    	                label: '保存',
    	                action: function(dialog) {
    	                	var valid = $(".form-horizontal").valid();
    	            		if(!valid) return false;
    	            		var name = $("input.name").val();
    	            		var publicKey = $("textarea.publickey");
    	                	var postData={"keypair":$("#import-keypair").serializeObject()};
//    	                	alert("Value: " + JSON.stringify(postData));
    	                	Common.xhr.postJSON('/'+current_vdc_id+'/os-keypairs',postData,function(data){
    	                		if(data){
    	                			dialog.close();
    	                			Modal.success('密钥对['+name+']导入成功');
    	            				setTimeout(function(){Modal.closeAll()},3000);
    	                			Common.router.route();
								}else{
									Modal.alert('密钥对['+id+']导入失败');
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
    	    			dialog.setData("formvalid",EventsHandler.formValidator());
    	            },
    	            onhide : function(dialog){
    	            	debugger;
    	            	var valid = dialog.getData("formvalid");
    	            	valid.hideErrors();
    	            }
    	        });
    		
			});
			
	    	
		});
		
		//密钥对详情
		$("#KeypairTable_wrapper a.keypair-name").on("click",function(){
	    	var id = $(this).attr("data");
			//需要修改为真实数据源	
			Common.render(true,'tpls/ccenter/security/keypairdetail.html','/'+current_vdc_id+'/os-keypairs/'+id,function(data){	
//				alert("Value: " + JSON.stringify(data));
				$("a.reload").on("click",function(){
    		    	Common.router.route();
    		  });
			});
			
	    	
		});
		
		//单条记录删除
		$("#KeypairTable_wrapper a.keypair-del").on("click",function(){
			var id = $(this).attr("data");
			Common.xhr.del('/'+current_vdc_id+'/os-keypairs/'+id,function(data){
				if(data){
					Modal.success('密钥对['+id+']删除成功');
					setTimeout(function(){Modal.closeAll()},3000);
					Common.router.route();
				}else{
					Modal.alert('密钥对['+id+']删除失败');
				}
			});
		});
		
		//多条记录删除
		$("#KeypairTable_wrapper span.keypair-delete").on("click",function(){
			Common.$pageContent.addClass("loading");
			$("#KeypairTable").find("tbody input[type='checkbox']:checked").each(function(){
				id = $(this).attr("myval");
				Common.xhr.del('/'+current_vdc_id+'/os-keypairs/'+id,function(data){
					if(data){
						Modal.success('密钥对['+id+']删除成功');
						setTimeout(function(){Modal.closeAll()},3000);
						Common.router.route();
					}else{
						Modal.alert('密钥对['+id+']删除失败');
					}
				});
			});
			
			Common.$pageContent.removeClass("loading");

		});
	}	
	return {
		init : init
	}
})
