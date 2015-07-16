define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3','bs/switcher'],function(Common,Dialog){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,'tpls/fservice/vpc/floatingip/list.html',function(){
			bindEvent();
		});
	};
	
	var bindEvent = function(){
		var table = Common.initDataTable($('#floatingipTable'),{
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":"networking/v2.0/floatingips/page/", //ajax源，后端提供的分页接口
		      "columns": [
			        {
			        	"orderable": false,
			        	"defaultContent":"<label><input type='checkbox'></label>"
			        },
			        {"data": "floating_ip_address"},
			        {"data": "network_name"},
			        {"data": "vdc_name"},
			        {"data": "router_name"},
			        {"data": "fixed_ip_address"},
			        {"data": "status"},
			        {
			        	"defaultContent":'<a class="btn-edit" data-toggle="tooltip" title="解除绑定" href="javascript:void(0)" data-act="stop"><li class="glyphicon glyphicon-edit"></li></a>'
							+'<a class="btn-delete" data-toggle="tooltip" title="释放浮动IP" href="javascript:void(0)" style="margin: 0 8px;"><i class="fa fa-trash-o fa-fw"></i></a>'
			        }
		      ],
		      "columnDefs": [
					{
					    "targets": [6],
					    "render": function(data, type, full) {
					    	if(data == "ACTIVE") return "运行中";
					    	else return "停止";
					    }
					}
                ]
		    },
			function($tar){
		    	var $tbMenu = $tar.prev('.tableMenus');
		    	$tbMenu.length && $tbMenu.empty().html($('.table-menus').html());
				//这个必须添加，不然就是隐藏的效果，看不到页面
				Common.$pageContent.removeClass("loading");
		});
		Common.on('click','.dataTables_filter .btn-query',function(){
			table.search($('.global-search').val()).draw();
		});
		$("[data-toggle='tooltip']").tooltip();
		//维护当前select的值以及云主机数量，为更新配额以及vdc相关的数据用
		var currentChosenObj = {
				vdc_id: null,	//当前vdc
				network_id: null,
				subnet_id: null,	
		};
    	//载入默认的数据 inits,创建数据载入类
		var DataIniter = {
				//vdc列表
				initVdcList : function(){
					Common.xhr.ajax('/identity/v2.0/tenants',function(data){
						var tenants = data.tenants;			
						var html = Common.uiSelect(tenants);
				    	$('select.tenant_id').html(html);
				    	//同步currentChosenObj
				    	currentChosenObj.vdc_id = $('select.tenant_id').children('option:selected');
				    	$('select.tenant_id').change();
					})
				},
				initNetworkList : function(){
					var vdc_id = currentChosenObj.vdc || $('select.tenant_id').children('option:selected').val();
					Common.xhr.get('/networking/v2.0/networks',{"tenant_id":vdc_id,isExternalNetwork:true},function(data){
						var networks = data.networks;	
						var html = Common.uiSelect(networks);
				    	$('select.floating_network_id').html(html);
				    	currentChosenObj.network_id = $('select.floating_network_id').children('option:selected');
				    	$('select.floating_network_id').change();
					})
				},
				initSubnetList : function(){
					var network_id = currentChosenObj.network_id || $('select.floating_network_id').children('option:selected').val();
					if(network_id==null||network_id==""){
						$('select.subnet_id').html("");
						currentChosenObj.subnet_id = null;
				    	$('select.subnet_id').change();
						return;
					}
					Common.xhr.get('/networking/v2.0/subnets',{"network_id":network_id},function(data){
						var subnets = data.subnets;
						var html = Common.uiSelect(subnets);
				    	$('select.subnet_id').html(html);
				    	currentChosenObj.subnet_id = $('select.subnet_id').children('option:selected');
				    	$('select.subnet_id').change();
					})
				},
				initFloatingIpList : function(){
					var subnet_id = currentChosenObj.subnet_id || $('select.subnet_id').children('option:selected').val();
					var network_id = currentChosenObj.network_id || $('select.floating_network_id').children('option:selected').val();
					if(network_id==null||network_id==""||subnet_id==null||subnet_id==""){
						$('select.floating_ip_address').html("");
						return;
					}
					Common.xhr.get('/networking/v2.0/floatingips/avaliable',{"network_id":network_id,"subnet_id":subnet_id,},function(data){	
						var floatingips = data.floatingips;
						var selectData = [];
						for(var i=0;i<floatingips.length;i++){
							selectData[i] = {"name":floatingips[i]["floating_ip_address"]};
						}
						var html = Common.uiSelect(selectData);
				    	$('select.floating_ip_address').html(html); 	
					})
				}
		};
		var EventsHandler = {
	    		//表单校验
				formValidator: function(){
					return $(".form-horizontal").validate({
			            rules: {
			            	'tenant_id': {
			            		required: true
			                },
			                'floating_network_id': {
			            		required: true
			                },
			                'subnet_id': {
			            		required: true
			                },
			                'floating_ip_address': {
			            		required: true
			                }
			            }
			        });
				},
				switcher:function(){
					$(".col-sm input[type=\"checkbox\"], input[type=\"radio\"]").not("[data-switch-no-init]").switcher();
				},
				vdcChange:function(){
					$('select.tenant_id').change(function(){
    					var current = $(this).children('option:selected');
				    	currentChosenObj.vdc_id = current.val();//同步currentChosenObj
				    	DataIniter.initNetworkList();
    				});
				},
				networkChange:function(){
					$('select.floating_network_id').change(function(){
    					var current = $(this).children('option:selected');
				    	currentChosenObj.network_id = current.val();//同步currentChosenObj
				    	DataIniter.initSubnetList();
    				});
				},
				subnetChange:function(){
					$('select.subnet_id').change(function(){
    					var current = $(this).children('option:selected');
				    	currentChosenObj.subnet_id = current.val();//同步currentChosenObj
				    	DataIniter.initFloatingIpList();
    				});
				}
		}

		//解除绑定
		$(document).off("click","#floatingipTable_wrapper a.btn-edit");
		$(document).on("click","#floatingipTable_wrapper a.btn-edit",function(){
	    	 var id = $(this).parents("tr:first").data("rowData.dt").id;
	    	 Dialog.confirm('确定要解除绑定吗?', function(result){
	             if(result) {
	            	 var data = {"floatingip":{"id":id}};
	            	 Common.xhr.putJSON('/networking/v2.0/floatingips/'+id,data,
	                     function(data){
	                    	 if(data){
 	                			Dialog.success('解除成功')
 	                			setTimeout(function(){Dialog.closeAll()},3000);
	                    		Common.router.route();
	                    	 }else{
	                    		Dialog.success('解除失败')
	 	                		setTimeout(function(){Dialog.closeAll()},3000);
	                    	 }
	                     });
	             }else {
	            	 //Dialog.close();
	             }
	         });
		});
		//删除floatingip
		$(document).off("click","#floatingipTable_wrapper a.btn-delete");
		$(document).on("click","#floatingipTable_wrapper a.btn-delete",function(){
			 var id = $(this).parents("tr:first").data("rowData.dt").id;
	    	 Dialog.confirm('确定要删除浮动IP吗?', function(result){
	             if(result) {
	            	 var data = {"floatingip":{"id":id}};
	            	 Common.xhr.del('/networking/v2.0/floatingips/'+id,
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
		//增加按钮
		$(document).off("click","#floatingipTable_wrapper span.btn-add");
		$(document).on("click","#floatingipTable_wrapper span.btn-add",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/fservice/vpc/floatingip/add.html','',function(html){
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
    	                	var data = $("#addFloatingIp").serializeArray();
    	                	var postData={"floatingip":{}};
    	                	for(var i=0;i<data.length;i++){
    	                		postData.floatingip[data[i]["name"]] = data[i]["value"];
    						}
    	                	delete postData.floatingip["subnet_id"];		
    	                	Common.xhr.postJSON('/networking/v2.0/floatingips',postData,function(data){
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
    	    			EventsHandler.vdcChange();
    	    			EventsHandler.networkChange();
    	    			EventsHandler.subnetChange();
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
		
	}	
	return {
		init : init
	}
})
