define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	//Common.requestCSS('css/dialog.css');
	var cacheData = {};	//缓存数据
	var init = function(){
		Common.$pageContent.addClass("loading");
		Common.render(true,{
			tpl:'tpls/ccenter/vdc/list.html',
			data:'/v2.0/tenants/page/10/1',
			//data:'/resources/data/select.txt',
			beforeRender: function(data){
				return data.result;
			},
			callback: bindEvent
		});
	};
	var bindEvent = function(){
		//dataTables
		Common.initDataTable($('#VdcTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">接 入</span>'
				);
			Common.$pageContent.removeClass("loading");
		});
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
	    var azList=[];
	  //维护当前select的值
		var currentChosenObj = {
				ve: null,	//当前虚拟化环境
				az: null,
				netId: null
		};
        //初始化加载，不依赖其他模块
		var DataGetter = {
				//虚拟化环境 virtural environment
				getVe: function(){
					Common.xhr.ajax('v2/virtual-env',function(veList){///v2/images
						renderData.veList = veList;
					});
				},
				//根据虚拟化环境获取可用az
				getAz:  function(){
					Common.xhr.ajax('/resources/data/select.txt',function(azList){
						renderData.azList = azList;
					});
				},
				//获取成员信息
				getUsers : function(){
					Common.xhr.ajax('/resources/data/arrays.txt',function(userList){
						renderData.userList = userList;
					});
				},
				//获取及对应的角色
				getRoles : function(){
					Common.xhr.ajax('/resources/data/select.txt',function(roleList){
						renderData.roleList = roleList;
						cacheData.roleList = roleList;
					});
				},
				//获取网络资源池
				getNetPool: function(){
					Common.xhr.ajax('/resources/data/select.txt',function(netList){
						renderData.netList = netList;
					});
				},
				//根据网络资源池获取等待分配的IP列表
				getIps:function(){
					Common.xhr.ajax('/resources/data/select.txt',function(ipList){
						renderData.ipList = ipList;
					});
				}
		}
		DataGetter.getVe();
		DataGetter.getAz();
		DataGetter.getUsers();
		DataGetter.getNetPool();
		DataGetter.getRoles();
		DataGetter.getIps();		
		//载入后的事件
		var EventsHandler = {
				//虚拟化环境change事件
				veChange: function(){
					$('select.select-ve').change(function(){
						//同步
						currentChosenObj.ve = $('select.select-ve').children('option:selected');
						//重新载入可用分区数据
						DataIniter.initAz();
    				});
					
				},
				//点击加号，添加可用分区
				azAddEvent:function(){
					require(['js/common/domchoose'],function(domchoose){
						var leftOption = {
								appendWrapper: '.az-all',
								clone: 'a.list-group-item'
							},
							rightOption = {
								appendWrapper: '.az-chosen',
								clone: 'a.list-group-item',//相对clickSelector获取元素
								clickSelector: 'i.fa-minus-circle'
							};
						domchoose.initChoose(leftOption,rightOption);
					});
				},
				//配额的表单验证
				vdc_quota_form:function(){
					return $(".vdc_quota").validate({
						rules:{
							'metadata_items': {
			                    required: true,
			                    digits:true
			                },
			                'cores': {
			                    required: true,
			                    digits:true
			                },
			                'instances': {
			                    required: true,
			                    digits:true
			                },
			                'injected_files': {
			                    required: true,
			                    digits:true
			                },
			                'injected_file_content_bytes': {
			                    required: true,
			                    digits:true
			                },
			                'disks': {
			                    required: true,
			                    digits:true
			                },
			                'diskSnapshots': {
			                    required: true,
			                    digits:true
			                },
			                'diskTotalSizes': {
			                    required: true,
			                    digits:true
			                },
			                'ram': {
			                    required: true,
			                    digits:true
			                },
			                'security_groups': {
			                    required: true,
			                    digits:true
			                },
			                'security_group_rules': {
			                    required: true,
			                    digits:true
			                },
			                'floating_ips': {
			                    required: true,
			                    digits:true
			                },
			                'network': {
			                    required: true,
			                    digits:true
			                },
			                'port': {
			                    required: true,
			                    digits:true
			                },
			                'route': {
			                    required: true,
			                    digits:true
			                },
			                'subnet': {
			                    required: true,
			                    digits:true
			                }
						}
					})
				},
				//vdc 基本信息表单
				vdc_basic_form:function(){
					return $(".vdc_basic").validate({
						   rules: {
				            	'name': {
				                    required: true,
				                    maxlength:10
				                }
				            }
					})
				},
				//初始化选择用户相关的事件
				userChosen: function(){
					require(['js/common/domchoose'],function(domchoose){
						var leftOption = {
								appendWrapper: '.all-users',
								clone: 'ul.list-group-item'//相对clickSelector获取元素
								//clickSelector: 'ul.list-group-item',
							},
							rightOption = {
								appendWrapper: '.choosen-users',
								clone: 'ul.list-group-item',//相对clickSelector获取元素
								clickSelector: 'i.fa-minus-circle',
								callback: function($this){
									$this.find('ul.dropdown-menu a').each(function(i){
										if(i != 0){
											$(this).find('i').css('opacity',0);
										}
									});
								}
							};
						domchoose.initChoose(leftOption,rightOption);
					})
					//选择角色
					$(document).off("click",".choosen-users ul.dropdown-menu a");
					$(document).on("click",".choosen-users ul.dropdown-menu a",function(event){
						var i = $(this).find('i');
						i.css('opacity') == 0 ? i.css('opacity',1) : i.css('opacity',0);
						return false;
					});
					$('.list-group .loadmore').on('click',function(){
						Common.xhr.ajax('/resources/data/arrays.txt',function(userList){
							var data = {};
							data.userList = userList;
							data.roleList = cacheData.roleList;
							Common.render('tpls/ccenter/vdc/loadmore.html',data,function(html){
								if(html){
									$('.all-users').find('ul.list-group-item:last').after(html);
								}else{
									$('.list-group .loadmore').html('数据已全部加载');
									$('.list-group .loadmore').off('click');
								}
	    					});
						});
					});
				}
		}
		//载入默认的数据 inits,创建数据载入类
		var DataIniter = {
			//根据ve_id获取可用分区
			initAz : function(){
				var ve_id = currentChosenObj.ve.val() || $('select.select-ve').children('option:selected').val();
				if(ve_id){
					Common.xhr.ajax('/v2/os-availability-zone/virtualEnv/' + ve_id,function(data){
						$("#vdcAZ").find(".list-group-all").empty();
						var listview=[];
						for(var i=0;i<data.length;i++){
							listview.push('<a href="javascript:void(0);" class="list-group-item">'+data[i]["name"]+'<i data-id = '+data[i]["id"]+' class="fa fa-plus-circle fa-fw" style="float: right;"></i></a>')
						}
						$("#vdcAZ").find(".list-group-all").html(listview.join(""));
						EventsHandler.azAddEvent();
					});
					
				}else{
					Modal.danger('尚未选择所属虚拟化环境');
				}
			}
		}
	  //增加按钮
	    $("#VdcTable_wrapper span.btn-add").on("click",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/ccenter/vdc/add.html',renderData,function(html){
				$('body').append(html);
				//wizard show
    			$.fn.wizard.logging = true;
    			var wizard;
    			
				//同步currentChosenObj
		    	currentChosenObj.ve = $('select.select-ve').children('option:selected');
		    	currentChosenObj.netId = $('select.select-net').find('option:selected');
		    	//载入依赖数据
		    	DataIniter.initAz();
		    	//载入事件
		    	EventsHandler.userChosen();
				EventsHandler.veChange();
		    	//
    			wizard = $('#create-vdc-wizard').wizard({
    				keyboard : false,
    				contentHeight : 526,
    				contentWidth : 900,
    				showCancel: true,
    				backdrop: 'static',
    				buttons: {
    	                cancelText: "取消",
    	                nextText: "下一步",
    	                backText: "上一步",
    	                submitText: "提交",
    	                submittingText: "提交中..."
    	            }
    			});
    			wizard.show();
    			//重置CurrentChosenObj对象
    			var resetCurrentChosenObj = function(){
    				for(var key in currentChosenObj){
    					currentChosenObj[key] = null;
    				}
    				currentChosenObj.nums = 1;
    			}
    			//关闭弹窗
				var closeWizard = function(){
    				$('div.wizard').remove();
    				$('div.modal-backdrop').remove();
    				resetCurrentChosenObj();
    			}
				//关闭后移出dom
    			wizard.on('closed', function() {
    				closeWizard();
    			});
			});
	    });
	    
	    //更新配额
	    $("ul.dropdown-menu a.updateQuota").on("click",function(){
	    	more.QuotaSets($(this).attr("data"));
	    });
	    //可用分区
	    $("ul.dropdown-menu a.vdcAz").on("click",function(){
	    	more.AZ($(this).attr("data-env"),$(this).attr("data"));
	    });
	    //删除一个vdc
	    $("ul.dropdown-menu a.deleteTenant").on("click",function(){
	    	more.DeleteTenant($(this).attr("data"));
	    });
	   //编辑vdc
	    $("ul.dropdown-menu a.editTenantBasic").on("click",function(){
	    	more.EditTenantBasic($(this).attr("data"));
	    });
	    //删除一个vdc
	    $("ul.dropdown-menu a.deleteTenant").on("click",function(){
	    	more.DeleteTenant($(this).attr("data"));
	    });
	   //编辑vdc
	    $("ul.dropdown-menu a.editTenantBasic").on("click",function(){
	    	more.EditTenantBasic($(this).attr("data"));
	    });
    
	    //更多
	    var more = {
		    	//配额管理
		    	QuotaSets : function(id){
		    		//先获取QuotaSets后，再render
		    		Common.xhr.ajax('/v2.0/9cc717d8047e46e5bf23804fc4400247/os-quota-sets/' + id,function(data){
		    			Common.render('tpls/ccenter/vdc/quota.html',data.quota_set,function(html){
		    				Modal.show({
			    	            title: '配额',
			    	            message: html,
			    	            nl2br: false,
			    	            buttons: [{
			    	                label: '保存',
			    	                action: function(dialog) {
			    	                	var valid = $(".vdc_quota").valid();
			    	            		if(!valid) return false;
			    	                	var serverData = {
				    	            			"quota_set":{
				    	        					"metadata_items": $("#vdcQuota [name='metadata_items']").val(),
				    	        					"cores": $("#vdcQuota [name='cores']").val(),
				    	        					"instances": $("#vdcQuota [name='instances']").val(),
				    	        					"injected_file_content_bytes": $("#vdcQuota [name='injected_file_content_bytes']").val(),
				    	        					"disks": $("#vdcQuota [name='disks']").val(),
				    	        					"diskSnapshots": $("#vdcQuota [name='diskSnapshots']").val(),
				    	        					"diskTotalSizes": $("#vdcQuota [name='diskTotalSizes']").val(),
				    	        					"ram": $("#vdcQuota [name='ram']").val(),
				    	        					"security_group_rules": $("#vdcQuota [name='security_group_rules']").val(),
				    	        					"floating_ips": $("#vdcQuota [name='floating_ips']").val(),
				    	        					"network": $("#vdcQuota [name='network']").val(),
				    	        					"port": $("#vdcQuota [name='port']").val(),
				    	        					"route": $("#vdcQuota [name='route']").val(),
				    	        					"subnet": $("#vdcQuota [name='subnet']").val(),
				    	        					"injected_files": $("#vdcQuota [name='injected_files']").val(),
				    	        					"security_groups": $("#vdcQuota [name='security_groups']").val(),
				    	            				}
			    	        				};
			    	                	Common.xhr.putJSON('/v2.0/9cc717d8047e46e5bf23804fc4400247/os-quota-sets/'+id,serverData,function(data){
			    	                		if(data){
					                    		 Modal.success('保存成功')
				 	                			 setTimeout(function(){Dialog.closeAll()},2000);
					                    		 Common.router.route();//重新载入
					                    	 }else{
					                    		 Modal.warning ('保存失败')
					                    	 }
										});
			    	                }
			    	            }],
			    	            onshown : function(dialog){
			    	            	dialog.setData('vdc_quota_form', EventsHandler.vdc_quota_form());	
			    	            },
			    				onhide : function(dialog){
			    					dialog.getData("vdc_quota_form").hideErrors();
			    	            }
		    				
			    	        });
			    		});
		    		})	
		    	},
	  //可用分区管理
    	AZ : function(env_id,vdc_id){
    		//先获取az后，再render
    		Common.xhr.ajax('/v2/os-availability-zone/virtualEnv/' + env_id,function(eaz){
    			Common.xhr.ajax('/v2.0/az/' + vdc_id,function(vaz){
    				var data = {
    						eazList:eaz,
    						vazList:vaz,
    						veList:renderData.veList
    				}
    				Common.render('tpls/ccenter/vdc/az.html',data,function(html){
        				Modal.show({
    	    	            title: '可用分区',
    	    	            message: html,
    	    	            nl2br: false,
    	    	            buttons: [{
    	    	                label: '保存',
    	    	                action: function(dialog) {}
    	    	            }],
    	    	            onshown : function(){}
    	    	        });
    	    		});
    			})		
    		})		
    	 },
    	//删除一个租户
    	DeleteTenant : function(vdc_id){
    		Modal.confirm('确定要删除该虚拟数据中心吗?', function(result){
	             if(result) {
	            	 Common.xhr.del('/v2.0/tenants/' + vdc_id,
	                     function(data){
	                    	 if(data){
	                    		 Modal.success('删除成功')
 	                			 setTimeout(function(){Dialog.closeAll()},2000);
	                    		 Common.router.route();//重新载入
	                    	 }else{
	                    		 Modal.warning ('删除失败')
	                    	 }
	                     });
	             }else {
	            	 Modal.closeAll();
	             }
	         });	
    	 },
    	//编辑租户的基本信息
    	 EditTenantBasic : function(vdc_id){
    		 Common.xhr.ajax('v2.0/tenants/' + vdc_id,function(data){
    			 Common.render('tpls/ccenter/vdc/edit.html',data.tenants,function(html){
      				Modal.show({
  	    	            title: '虚拟数据中心信息',
  	    	            message: html,
  	    	            nl2br: false,
  	    	            buttons: [{
  	    	                label: '保存',
  	    	                action: function(dialog) {
  	    	                	var vdcData = {
    	                			"tenant":{
    	                				 "description": $("#editVdcBasic [name='description']").val(),
    	                			     "enabled": $("#editVdcBasic [name='enabled']:checked").length? true:false,
    	                			     "id": vdc_id,
    	                			     "name": $("#editVdcBasic [name='name']").val()
    	                			}
  	    	                	};
	  	    	              	Common.xhr.putJSON('v2.0/tenants/'+vdc_id,vdcData,function(data){
		  	    	              	if(data){
			                    		 Modal.success('保存成功')
		 	                			 setTimeout(function(){Dialog.closeAll()},2000);
			                    		 Common.router.route();//重新载入
			                    	 }else{
			                    		 Modal.warning ('保存失败')
			                    	 }
								});
  	    	                	
  	    	                }
  	    	            }],
      				    onshown : function(dialog){
	    	            	dialog.setData('vdc_basic_form', EventsHandler.vdc_basic_form());	
	    	            },
	    				onhide : function(dialog){
	    					dialog.getData("vdc_basic_form").hideErrors();
	    	            }
  	    	        });
  	    		});
    		 })		
    	 }
	   }
	}	
	return {
		init : init
	}
})
