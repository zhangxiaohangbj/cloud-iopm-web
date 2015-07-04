define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','jq/form'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var current_vdc_id = Common.cookies.getVdcId();
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/ccenter/image/list.html',
			data:'/image/v2/'+current_vdc_id+'/images?isDeleted=false',
			beforeRender: function(data){
				return data;
			},
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		//dataTables
		Common.initDataTable($('#imageTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">新 建</span>'
			);
			//这个必须添加，不然就是隐藏的效果，看不到页面
			Common.$pageContent.removeClass("loading");
		});
		$("[data-toggle='tooltip']").tooltip();
		
		var renderData = {};
        //初始化加载，不依赖其他模块
		var DataGetter = {
		}
		
		//事件处理
		var EventsHandler = {
    		//表单校验
			formValidator: function(){
				$(".form-horizontal").validate({
		            rules: {
		            	'name': {
		                    required: true,
		                    maxlength:255
		                },
		                'description': {
		                    maxlength:255
		                },
		                'copyFrom': {
		                	required: true,
		                    maxlength:255
		                },
		                'diskFormat': {
		                	required: true
		                },
		                'minDisk': {
		                	required: true
		                },
		                'minRam': {
		                	required: true
		                }
		            }
		        });
			},
			initSpinbox : function(){
				require(['bs/spinbox'],function(){
    				$('#setMinDisk').spinbox({
    					value: 0,
    					min: 0
    				});
    				$('#setMinRam').spinbox({
    					value: 0,
    					min: 0
    				});
    			})
			},
			initImageResource : function(){
				$(document).off("change","#imageSource");
				$(document).on("change","#imageSource",function(){
					var value = $(this).val();
					if("file" == value){
						$("#fileDiv").removeClass("hidden");
						$("#copyFromDiv").addClass("hidden");
					}else if("address" == value){
						$("#copyFromDiv").removeClass("hidden");
						$("#fileDiv").addClass("hidden");
					}
				});
			}
	    }
		
		//弹窗初始化
	    var EditData = {
	    	//创建弹框
	    	Add : function(cb){
	    		//需要修改为真实数据源
				Common.render('tpls/ccenter/image/add.html',renderData,function(html){
					Modal.show({
	    	            title: '新建镜像',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
	    	            		Modal.confirm('确定要保存吗?', function(result){
	    	            			if(result) {
	    	            				debugger;
	    	            				var imageSource = $("#imageSource").val();
	    	            				if("file" == imageSource){
	    	            					$("#editImage").removeAttr("method");
	    	            					$("#editImage").removeAttr("enctype");
	    	            					$("#editImage").removeAttr("action");
	    	            					
	    	            					$("#editImage").attr("method", "post");
	    	            					$("#editImage").attr("enctype", "multipart/form-data");
	    	            					$("#editImage").attr("action", "image/v2/"+current_vdc_id+"/images/upload");
	    	            					
	    	            					if($("#isPublic_checkbox").prop("checked")){
		    	            					$("#isPublic").attr("value",'1');
		    	            				}else{
		    	            					$("#isPublic").attr("value",'0');
		    	            				}
		    	            				if($("#isProtected_checkbox").prop("checked")){
		    	            					$("#isProtected").attr("value",'1');
		    	            				}else{
		    	            					$("#isProtected").attr("value",'0');
		    	            				}
		    	            				
		    	            				$("#editImage").ajaxSubmit(function () {
		    	            					Modal.alert("保存成功",function(){
//		    	    	                			dialog.close();
//		    	    	                			Common.router.reload();
	    	    	                			});
		    	            				});
	    	            				}else if("address" == imageSource){
	    	            					$("#editImage").removeAttr("method");
	    	            					$("#editImage").removeAttr("enctype");
	    	            					$("#editImage").removeAttr("action");
	    	            					
	    	            					var pageData = $("#editImage").serializeObject();
		    	            				if(pageData.isPublic_checkbox){
		    	            					pageData["isPublic"] = true;
		    	            				}else{
		    	            					pageData["isPublic"] = false;
		    	            				}
		    	            				if(pageData.isPublic_checkbox){
		    	            					pageData["isProtected"] = true;
		    	            				}else{
		    	            					pageData["isProtected"] = false;
		    	            				}
//		    	            				
		    	            				var properties = {};
		    	            				properties["description"] = pageData.description
		    	            				pageData["properties"] = properties;
//		    	            				
		    	            				delete pageData["description"];
		    	            				delete pageData["imageSource"];
		    	            				debugger;
		    	            				Common.xhr.postJSON('/image/v2/'+current_vdc_id+'/images',pageData,function(data){
		    	    	                		if(data){
		    	    	                			Modal.alert("保存成功",function(){
			    	    	                			dialog.close();
			    	    	                			Common.router.reload();
		    	    	                			});
		    									}else{
		    										Modal.alert("保存失败",function(){
			    	    	                			
		    	    	                			});
		    									}
		    								});
	    	            				}
	    	            			}
	    	            		});
	    	                }
	    	            }, {
	    	                label: '取消',
	    	                action: function(dialog) {
	    	                    dialog.close();
	    	                }
	    	            }],
	    	            onshown : cb
	    	        });
				})
	    	},
	    	
	    	//编辑弹框
	    	Edit : function(id,cb){
	    		Common.xhr.ajax('/image/v2/'+current_vdc_id+'/images/'+id,function(data){
	    			Common.render('tpls/ccenter/image/edit.html',data,function(html){
						Modal.show({
		    	            title: '编辑镜像',
		    	            message: html,
		    	            nl2br: false,
		    	            buttons: [{
		    	                label: '保存',
		    	                action: function(dialog) {
		    	                	var valid = $(".form-horizontal").valid();
		    	            		if(!valid) return false;
		    	            		Modal.confirm('确定要保存吗?', function(result){
		    	            			if(result) {
		    	            				debugger;
		    	            				var pageData = $("#editImage").serializeObject();
		    	            				if(pageData.isPublic){
		    	            					pageData.isPublic = true;
		    	            				}else{
		    	            					pageData.isPublic = false;
		    	            				}
		    	            				if(pageData.isProtected){
		    	            					pageData.isProtected = true;
		    	            				}else{
		    	            					pageData.isProtected = false;
		    	            				}
		    	            				
		    	            				var properties = {};
		    	            				properties["description"] = pageData.description
		    	            				
		    	            				pageData["properties"] = properties;
		    	            				
		    	            				delete pageData["description"];
		    	            				delete pageData["copyFrom"];
		    	            				delete pageData["imageSource"];
		    	            				debugger;
		    	            				Common.xhr.putJSON('/image/v2/'+current_vdc_id+'/images/'+id,pageData,function(data){
		    	    	                		if(data){
		    	    	                			Modal.alert("保存成功",function(){
			    	    	                			dialog.close();
			    	    	                			Common.router.reload();
		    	    	                			});
		    									}else{
		    										Modal.alert("保存失败",function(){
			    	    	                			
		    	    	                			});
		    									}
		    								});
		    	            			}
		    	            		});
		    	                }
		    	            }, {
		    	                label: '取消',
		    	                action: function(dialog) {
		    	                    dialog.close();
		    	                }
		    	            }],
		    	            onshown : cb
		    	        });
					})
	    		});
	    	}
	    }
		
		//新建
		$("#imageTable_wrapper span.btn-add").on("click",function(){
	    	EditData.Add(function(){
	    		EventsHandler.formValidator();
	    		EventsHandler.initSpinbox();
	    		EventsHandler.initImageResource();
	    	});
	    });
		
	    //编辑
	    $("#imageTable_wrapper a.btn-opt").on("click",function(){
	    	EditData.Edit($(this).attr("data"),function(){
	    		EventsHandler.formValidator();
	    		EventsHandler.initSpinbox();
//	    		$("#diskFormat").val(data.diskFormat);
//	    		alert(data.diskFormat);
//	    		$("#diskFormat").find("option[value='"+data.diskFormat+"']").attr("selected",true);
	    	});
	    });
	    
	    //删除
	    $("#imageTable_wrapper a.delete").on("click",function(){
	    	var id = $(this).attr("data");
	    	Modal.confirm('确定要删除吗?', function(result){
	    		if(result) {
	    			Common.xhr.del('/image/v2/'+current_vdc_id+'/images/'+id,"",function(data){
    					if(data){
                			Modal.alert("删除成功",function(){
	                			Common.router.reload();
                			});
						}else{
							Modal.alert("删除失败",function(){
	                			
                			});
						}
					})
	    		}
	    	});
	    })
	}	
	return {
		init : init
	}
})
