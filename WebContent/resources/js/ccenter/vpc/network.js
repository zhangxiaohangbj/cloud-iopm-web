define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,'tpls/ccenter/vpc/network/list.html',function(){
			bindEvent();
		});
	};
	
	var bindEvent = function(){
		Common.initDataTable($('#networkTable'),{
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":"networking/v2.0/networks/page/", //ajax源，后端提供的分页接口
		      "fnServerData": function( sSource, aoData, fnCallback ) {
		    	    $.ajax( {   
		    	        "url": sSource + (aoData[3].value/aoData[4].value+1) +"/"+aoData[4].value, 
		    	        "data":aoData,
		    	        "dataType": "json",   
		    	        "success": function(resp) {
		    	        	resp.data = resp.result;
		    	        	resp.recordsTotal = resp.totalCount;
		    	        	resp.recordsFiltered = resp.totalCount;
		    	            fnCallback(resp);   //fnCallback：服务器返回数据后的处理函数，需要按DataTables期望的格式传入返回数据 
		    	        }   
		    	    });   
		      },
	    	  /*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
		      "columns": [
			        {
			        	"orderable": false,
			        	"defaultContent":"<label><input type='checkbox'></label>"
			        },
			        {"data": "name"},
			        {"data": "virtualEnvName"},
			        {"data": "router:external"},
			        {"data": "cidr"},
			        {"data": "shared"},
			        {"data": "status"},
			        {"data": "admin_state_up"},
			        {
			        	"defaultContent":'<a class="btn-edit" data-toggle="tooltip" title="编辑网络" href="javascript:void(0)" data-act="stop"><li class="glyphicon glyphicon-edit"></li></a>'
							+'<a class="btn-delete" data-toggle="tooltip" title="删除网络" href="javascript:void(0)" style="margin: 0 8px;"><i class="fa fa-trash-o fa-fw"></i></a>'
			        }
		      ],
		      /*
		       * columnDefs 属性操作自定义列
		       * targets ： 表示具体需要操作的目标列，下标从 0 开始
		       * data: 表示我们需要的某一列数据对应的属性名
		       * render: 返回需要显示的内容。在此我们可以修改列中样式，增加具体内容
		       *  属性列表： data，之前属性定义中对应的属性值； type，未知；full,全部数据值可以通过属性列名获取 
		       * */
		      "columnDefs": [
					{
					    "targets": [3],
					    "render": function(data, type, full) {
					    	if(data == true) return "外部网络";
					    	else return "内部网络";
					    }
					},
					{
					    "targets": [5],
					    "render": function(data, type, full) {
					    	if(data == true) return "共享";
					    	else return "非共享";
					    }
					},
					{
					    "targets": [6],
					    "render": function(data, type, full) {
					    	if(data == "ACTIVE") return "运行中";
					    	else return "停止";
					    }
					},
					{
					    "targets": [7],
					    "render": function(data, type, full) {
					    	if(data == true) return "可用";
					    	else return "禁用";
					    }
					}
                ]
		    },
			function($tar){
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
					Common.xhr.ajax('/identity/v2.0/tenants',function(data){
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
						errorContainer:"_form",
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
		$(document).off("click","#networkTable_wrapper span.btn-add");
		$(document).on("click","#networkTable_wrapper span.btn-add",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/ccenter/vpc/network/add.html',function(html){
				Dialog.show({
    	            title: '新建私有网络',
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
    	                	Common.xhr.postJSON('/networking/v2.0/networks',postData,function(data){
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
    	            	var valid = dialog.getData("formvalid");
    	            	valid.hideErrors();
    	            }
    	        });
    		
			})
		});
		//编辑网络
		$(document).off("click","#networkTable_wrapper a.btn-edit");
		$(document).on("click","#networkTable_wrapper a.btn-edit",function(){
			var rowData = $(this).parents("tr:first").data("rowData.dt");
			var id = rowData.id;
			Common.render(false,'tpls/ccenter/vpc/network/edit.html','/networking/v2.0/networks/'+id,function(html){
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
    	                	Common.xhr.putJSON('/networking/v2.0/networks/'+id,postData,function(data){
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
		$(document).off("click","#networkTable_wrapper a.btn-delete");
		$(document).on("click","#networkTable_wrapper a.btn-delete",function(){
			var rowData = $(this).parents("tr:first").data("rowData.dt");
	    	 var id = rowData.id;
	    	 Dialog.confirm('确定要删除该网络吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/networking/v2.0/networks/'+id,"",
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
	    	Common.render(true,'tpls/ccenter/vpc/network/detail.html','/networking/v2.0/networks/'+id,function(html){
	    		Common.render(false,'tpls/ccenter/vpc/network/subnetlist.html','/networking/v2.0/subnets?network_id='+id,function(html){
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
