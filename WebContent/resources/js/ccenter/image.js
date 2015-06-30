define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','jq/form'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/ccenter/image/list.html',
			data:'/image/v2/9cc717d8047e46e5bf23804fc4400247/images?isDeleted=false',
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
		                'locations': {
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
	    	            				/*
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
	    	            				pageData["containerFormat"] = "BARE";
	    	            				pageData["status"] = "queued";
	    	            				pageData["imageType"] = "image";
	    	            				
	    	            				delete pageData["description"];
	    	            				delete pageData["locations"];
	    	            				delete pageData["imageSource"];
	    	            				debugger;
	    	            				Common.xhr.postJSON('/image/v2/9cc717d8047e46e5bf23804fc4400247/images',pageData,function(data){
	    	    	                		if(data){
	    	    	                			Modal.alert("保存成功",function(){
		    	    	                			dialog.close();
		    	    	                			Common.router.reload();
	    	    	                			});
	    									}else{
	    										Modal.alert("保存失败",function(){
		    	    	                			
	    	    	                			});
	    									}
	    								});*/
	    	            				$("#editImage").attr("action", "image/v2/9cc717d8047e46e5bf23804fc4400247/images/upload");
	    	            				$("#editImage").ajaxSubmit(function () {
	    	            					Modal.alert("保存成功",function(){
//	    	    	                			dialog.close();
//	    	    	                			Common.router.reload();
    	    	                			});
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
	    	},
	    	
	    	//编辑弹框
	    	Edit : function(id,cb){
	    		Common.xhr.ajax('/image/v2/9cc717d8047e46e5bf23804fc4400247/images/'+id,function(data){
	    			debugger;
	    			Common.render('tpls/ccenter/image/add.html',data,function(html){
	    				debugger;
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
		    	            				delete pageData["locations"];
		    	            				delete pageData["imageSource"];
		    	            				debugger;
		    	            				Common.xhr.putJSON('/image/v2/9cc717d8047e46e5bf23804fc4400247/images/'+id,pageData,function(data){
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
		    	            onshown : cb(data)
		    	        });
					})
	    		});
	    	}
	    }
		
		//新建
		$("#imageTable_wrapper span.btn-add").on("click",function(){
	    	EditData.Add(function(){
	    		EventsHandler.formValidator();
	    	});
	    });
		
	    //编辑
	    $("#imageTable_wrapper a.btn-opt").on("click",function(){
	    	EditData.Edit($(this).attr("data"),function(data){
	    		EventsHandler.formValidator();
	    		alert(data.diskFormat+"<1>"+$("#diskFormat"));
	    		$("#diskFormat").val(data.diskFormat);
//	    		$("#diskFormat").find("option[text='"+data.diskFormat+"']").attr("selected",true);
	    	});
	    });
	    
	    //删除
	    $("#imageTable_wrapper a.delete").on("click",function(){
	    	debugger;
	    	var id = $(this).attr("data");
	    	Modal.confirm('确定要删除吗?', function(result){
	    		if(result) {
	    			Common.xhr.del('/image/v2/9cc717d8047e46e5bf23804fc4400247/images/'+id,"",function(data){
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
