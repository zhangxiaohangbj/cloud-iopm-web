define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var cacheData = {
			roleList: null,
			userList:null,
			vdcUserList:null
	};	//缓存数据
	var init = function(){
		Common.$pageContent.addClass("loading");
		Common.render(true,{
			tpl:'tpls/ccenter/vdc/list.html',
			data:'/v2.0/tenants/page/10/1',
			beforeRender: function(data){
				return data.result;
			},
			callback: bindEvent
		});
	};
	var bindEvent = function(){
		var userIndex = 1;//用户列表的起始页码
		var userSize = 10;//
		var userTotalSize = 0;
		//dataTables
		Common.initDataTable($('#VdcTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">创建</span>'
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
		var jsonData = {
				azJson:function(obj){
					var azList = [];
					$(obj).find("li.member").each(function(i,element){
						var id = $(element).attr("data-id");
						azList.push({"azId":id});
					});
					return azList;
				},
				quotaSetsJson:function(obj){
					return {
    					"metadata_items": $(obj + " [name='metadata_items']").val(),
    					"cores": $(obj + " [name='cores']").val(),
    					"instances": $(obj + " [name='instances']").val(),
    					"injected_file_content_bytes": $(obj +" [name='injected_file_content_bytes']").val(),
    					"disks": $(obj + " [name='disks']").val(),
    					"diskSnapshots": $(obj +" [name='diskSnapshots']").val(),
    					"diskTotalSizes": $(obj +" [name='diskTotalSizes']").val(),
    					"ram": $(obj +" [name='ram']").val(),
    					"security_group_rules": $(obj +" [name='security_group_rules']").val(),
    					"floating_ips": $(obj +" [name='floating_ips']").val(),
    					"network": $(obj +" [name='network']").val(),
    					"port": $(obj +" [name='port']").val(),
    					"route": $(obj +" [name='route']").val(),
    					"subnet": $(obj +" [name='subnet']").val(),
    					"injected_files": $(obj +" [name='injected_files']").val(),
    					"security_groups": $(obj +" [name='security_groups']").val(),
        				}
				},
				userJson:function(obj){
					var memberList = [];
					$(obj).find(".list-group-item").each(function(i,user){
						var uid = $(user).find(".member").attr("data-id");
						var loginName = $(user).find(".member").attr("data-name");
						var userRoleList = [];
						$(user).find("ul.dropdown-menu a").each(function(i,role){
							if($(role).attr('in-use') == '1' ){
								var roleId = $(role).attr("data-id");
								var roleName = $(role).attr("data-name");
								userRoleList.push({"uid":uid,"roleId":roleId,"loginName":loginName,"roleName":roleName});
							}
						});
						memberList.push({"uid":uid,"userRoleList":userRoleList});
					});
					return memberList;
				}
				/*floatIpJson:function(obj){
					var floatIpList = [];
					$(obj).find("li.member").each(function(i,element){
						var id = $(element).attr("data-id");
						floatIpList.push({"id":id});
					});
					return floatIpList;
				}*/
		}
        //初始化加载，不依赖其他模块
		var DataGetter = {
				//虚拟化环境 virtural environment
				getVe: function(){
					Common.xhr.get('/v2/virtual-env',function(veList){///v2/images
						renderData.veList = veList;
					});
				},
				//获取成员信息
				getUsers : function(index,size){
					///'cloud/am/user/page/'+index + '/'+size,resources/data/arrays.txt'
					Common.xhr.ajax('/v2.0/users/page/'+size + '/'+index,function(userList){
						renderData.userList = userList.result;
						cacheData.userList = userList.result;
						userTotalSize = userList.totalCount;
					});
				},
				//获取及对应的角色
				getRoles : function(){
					//"//v2.0/OS-KSADM/roles",'resources/data/select.txt'
					Common.xhr.ajax("/v2.0/OS-KSADM/roles/",function(roleList){
						renderData.roleList = roleList.roles;
						cacheData.roleList = roleList.roles;
					});
				}/*,
				//获取网络资源池
				getNetPool: function(){
					Common.xhr.get('/v2.0/networks',{'isExternalNetwork':true},function(netList){
						renderData.netList = netList.networks;
					});
				}*/
		}
		DataGetter.getVe();//获取所有的虚拟化环境
		DataGetter.getUsers(userIndex,userSize);//初始化用户列表
		//DataGetter.getNetPool();//获取所有的网络资源池
		DataGetter.getRoles();
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
				//网络池change事件
				/*netChange: function(){
					$('select.select-net').change(function(){
						//同步
						currentChosenObj.netId = $('select.select-net').children('option:selected');
						//重新载入可用分区数据
						DataIniter.initFloatIP();
    				});
					
				},*/
				//配额的表单验证
				vdc_form:function($form){
					if(!$form)return null;
					return $form.validate({
						errorContainer: "_form",
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
			                },
			                'vdc-name': {
			                    required: true,
			                    maxlength:50,
			                    minlength:4
			                }
						}
					})
				},
				//初始化选择用户相关的事件
				userChosen: function(){
					//选择角色
					$(document).off("click","#vdc-users ul.dropdown-menu a");
					$(document).on("click","#vdc-users ul.dropdown-menu a",function(event){
						var i = $(this).find('i');
						i.css('opacity') == 0 ? i.css('opacity',1) : i.css('opacity',0);
						$(this).attr('in-use') == '1' ? $(this).attr('in-use','0') : $(this).attr('in-use','1');
						return false;
					});
					$(document).off("click",".list-group .loadmore");
					$(document).on("click",".list-group .loadmore",function(event){
						Common.xhr.ajax('/v2.0/users/page/'+ userSize + '/'+(userIndex + 1),function(userList){
							var data = {};
							data.userList = userList.result;
							//data.roleList = cacheData.roleList;
							userTotalSize = userList.totalCount;
							
							Common.render('tpls/ccenter/vdc/loadmore.html',data,function(html){
							 $('#vdc-users .list-group-all').children("*:last").before(html);
								
								userIndex = userIndex +1;
	    					});
							if(userList.result.length < userSize){
								$('.list-group .loadmore').html('数据已全部加载');
								$(document).off("click",".list-group .loadmore");
								$(".list-group .loadmore").css("cursor","default");
							}
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
					Common.xhr.ajax('/v2/os-availability-zone/virtualEnv/' + ve_id,function(azList){
						require(['js/common/choose'],function(choose){
							var options = {
									selector: '#vdcAZ',
									allData: azList
							};
							choose.initChoose(options);
						})
					});
				}else{
					Modal.error('尚未选择所属虚拟化环境');
				};
			},
			//调用公共组件加载
			initUsers: function(){
				require(['js/common/choose'],function(choose){
					var loadmore = false;
					if(userTotalSize > userSize * userIndex){
						loadmore = true;
					}
					var options = {
							selector: '#vdc-users',
							loadmore: loadmore,
							groupSelectedClass: 'col-sm-7',
							groupAllClass: 'col-sm-5',
							addCall: function($clone){
								//添加角色窗及对应的事件
								var dtd = $.Deferred();
								Common.render('tpls/ccenter/vdc/role.html',cacheData.roleList,function(html){
									$clone.append(html);
									dtd.resolve();
								});
								return dtd.promise();
							},
							delCall: function($clone){
								//去除角色窗及取消事件绑定
								$clone.children("li:last").remove();
							},
							allData: cacheData.userList
					};
					choose.initChoose(options);
				})
			}/*,
			//根据net_id获取浮动IP
			initFloatIP : function(){
				var net_id = currentChosenObj.netId.val() || $('select.select-net').children('option:selected').val();
				if(net_id){
					Common.xhr.get('/v2.0/floatingips',{'floatingNetworkId':net_id},function(ipList){
						for(var key in ipList.floatingips ){
							var obj = ipList.floatingips[key];
							obj.name = obj.floating_ip_address;
						}
						require(['js/common/choose'],function(choose){
							var options = {
									selector: '#vdcFloatIP',
									list: ipList.floatingips
							};
							choose.initChoose(options);
						})
					});
				}else{
					Modal.error('尚未选择所属虚拟化环境');
				};
			}*/
		}
	  //增加按钮
	    $("#VdcTable_wrapper span.btn-add").on("click",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/ccenter/vdc/add.html',renderData,function(html){
				userIndex = 1;
				$('body').append(html);
				//wizard show
    			$.fn.wizard.logging = true;
    			var wizard;
    			
				//同步currentChosenObj
		    	currentChosenObj.ve = $('select.select-ve').children('option:selected');
		    	currentChosenObj.netId = $('select.select-net').find('option:selected');
		    	//载入依赖数据
		    	DataIniter.initAz();
		    	DataIniter.initUsers();
		    	//DataIniter.initFloatIP();
		    	
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
    	                submitText: "创建",
    	                submittingText: "提交中..."
    	            },
    	            submitEnabled: [1,2],
    	            validate: {
	            		0: function(){
	            			return this.el.find('form').valid();
	            		},
	            		2: function(){
	            			return this.el.find('form').valid();
	            		}
    	            }
    			});
    			//加载时载入validate
    			wizard.on('show',function(){
    				wizard.form.each(function(){
    					EventsHandler.vdc_form($(this));
    				})
    				//载入事件
    				EventsHandler.userChosen();
    				EventsHandler.veChange();
    				//EventsHandler.netChange();
    			});
    			wizard.show();
    			
    			
    			//wizard.disableNextButton();
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
    			//创建提交数据
    			wizard.on("submit", function(wizard) {
    				var vdc = wizard.serializeObject();//获取数据
    				var name = vdc['vdc-name'];//$("#editVdcBasic [name='vdc-name']").val();
    				var description = vdc['description']; //$("#editVdcBasic [name='description']").val();
    				var enabled = vdc['enabled'] == "on" ? true:false;//$("#editVdcBasic [name='enabled']:checked").length? true:false;
    				var virtualEnvId = vdc['select-ve'];//currentChosenObj.ve.val() || $('select.select-ve').children('option:selected').val();
    				var available_zones = null;//jsonData.azJson("#vdcAZ .list-group-select");
    				if(virtualEnvId){
    					available_zones = jsonData.azJson("#vdcAZ .list-group-select");
    				}
    				var quota_set = null;
    				if(vdc.metadata_items){
    					quota_set = jsonData.quotaSetsJson("#vdcQuota");
    				}
    				var members = null;
    				if(vdc['vdc-users']){
    					members = jsonData.userJson("#vdc-users .list-group-select");
    				}
    				/*var float_ips = null;
    				if(vdc['select-net']){
    					float_ips = jsonData.floatIpJson("#vdcFloatIP .list-group-select");
    				}*/
    				var vdcData={
    						"tenant":{
    							"name":name,
    							"description":description,
    							"enabled":enabled,
    							"quota_set":quota_set,
    							"available_zones":available_zones,
    							"members":members,
    							"virtualEnvId":virtualEnvId
    						}
    				};
    				Common.xhr.postJSON('/v2.0/tenants',vdcData,function(data){
    					wizard._submitting = false;
    					wizard.updateProgressBar(100);
    					closeWizard();
    					Common.router.reload();
    				})
    			});
			});
	    });
	    
	    //更新配额
	    $("ul.dropdown-menu a.updateQuota").on("click",function(){
	    	more.QuotaSets($(this).attr("data"));
	    });
	    //可用分区
	    $("ul.dropdown-menu a.vdcAz").on("click",function(){
	    	var ve_id =  $(this).attr("data-env");
	    	var vdc_id = $(this).attr("data");
	    	//先获取az后，再render
    		if(!ve_id){
    			ve_id = renderData.veList[0].id;//$('select.select-ve').children('option:selected').val();
    		}else{
    			for(var key in renderData.veList){
    				var obj = renderData.veList[key];
    				if(obj.id == ve_id){
    					obj.selected = "true";
    				}
    			}
    		} 
	    	more.AZ(ve_id,vdc_id);
	    });
	    //删除一个vdc
	    $("ul.dropdown-menu a.deleteTenant").on("click",function(){
	    	more.DeleteTenant($(this).attr("data"));
	    });
	   //编辑vdc
	    $("ul.dropdown-menu a.editTenantBasic").on("click",function(){
	    	more.EditTenantBasic($(this).attr("data"));
	    });
	    //成员管理
	    $(".members").on("click",function(){
	    	more.Member($(this).attr("data"));
	    });
	    //外部网络管理
	  /*  $("ul.dropdown-menu a.floatIP").on("click",function(){
	    	var net_id =  renderData.netList[0].id
	    	var vdc_id = $(this).attr("data");
	    	more.FloatIP(net_id,vdc_id);
	    });*/
    
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
			    	                	var valid = $(".form-horizontal").valid();
			    	            		if(!valid) return false;
			    	                	var serverData = {
				    	            			"quota_set":jsonData.quotaSetsJson("#vdcQuota")
			    	        				};
			    	                	Common.xhr.putJSON('/v2.0/9cc717d8047e46e5bf23804fc4400247/os-quota-sets/'+id,serverData,function(data){
			    	                		if(data){
					                    		 Modal.success('保存成功')
				 	                			 setTimeout(function(){Modal.closeAll()},2000);
					                    		 Common.router.route();//重新载入
					                    	 }else{
					                    		 Modal.warning ('保存失败')
					                    	 }
										});
			    	                }
			    	            }],
			    	            onshown : function(){
			    	            	EventsHandler.vdc_form($(".vdc_quota"));	
			    	            }
			    	        });
			    		});
		    		})	
		    	},
	  //可用分区管理
    	AZ : function(ve_id,vdc_id){
    		Common.xhr.ajax('/v2/os-availability-zone/virtualEnv/' + ve_id,function(eaz){
    			Common.xhr.ajax('/v2.0/az/' + vdc_id,function(vaz){
    				var data = {
    						veList:renderData.veList
    				},
    				options = {
						selector: '#vdcAZ',
						allData: eaz,
						selectData: vaz
    				};
    				require(['js/common/choose'],function(choose){
    	        		Common.render('tpls/ccenter/vdc/az.html',data,function(html){
    	        			//通过回调方式加载，保证choose执行完毕后再去modal
    	        			options.doneCall = function(html,chooseWrapper){
    	        				chooseWrapper.append(html);
    		        			$(options.selector).append(chooseWrapper.find('div:first'));
    		        			//console.log(chooseWrapper.html());
    		        			Modal.show({
    	    	    	            title: '可用分区',
    	    	    	            message: chooseWrapper.html(),
    	    	    	            nl2br: false,
    	    	    	            buttons: [{
    	    	    	                label: '保存',
    	    	    	                action: function(dialog) {
    	    	    	                	var virtualEnvId = $('select.select-ve').children('option:selected').val();
    	    	    	    				var putData={
    	    	    	    							"available_zones":jsonData.azJson("#vdcAZ .list-group-select"),
    	    	    	    							"virtualEnvId":virtualEnvId
    	    	    	    				      };
    	    	    	                	Common.xhr.putJSON('/v2.0/az/'+vdc_id,putData,function(data){
    	    	    	                		if(data){
    	    	    	                			 Modal.success('保存成功')
      				 	                			 setTimeout(function(){Modal.closeAll()},1000);
      					                    		 Common.router.route();//重新载入
    	    	    	                		}else{
    	    	    	                			Modal.warning ('保存失败');
    	    	    	                		}
    	    	    	                	});
    	    	    	                }
    	    	    	            }],
    	    	    	            onshown : function(){
    	    	    	            	EventsHandler.veChange();
    	    	    	            	chooseWrapper.remove();
    	    	    	            }
    	    	    	        });
    	        			};
    	        			options.doneData = html;
    	        			choose.initChoose(options);
    	        		})
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
	                    	 if(data.success||data.code==404){
	                    		 Modal.success('删除成功')
 	                			 setTimeout(function(){Modal.closeAll()},1000);
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
  	    	                	var valid = $(".form-horizontal").valid();
	    	            		if(!valid) return false;
  	    	                	var vdcData = {
    	                			"tenant":{
    	                				 "description": $("#editVdcBasic [name='description']").val(),
    	                			     "enabled": $("#editVdcBasic [name='enabled']:checked").length? true:false,
    	                			     "id": vdc_id,
    	                			     "name": $("#editVdcBasic [name='vdc-name']").val()
    	                			}
  	    	                	};
	  	    	              	Common.xhr.putJSON('v2.0/tenants/'+vdc_id,vdcData,function(data){
		  	    	              	if(data){
			                    		 Modal.success('保存成功')
		 	                			 setTimeout(function(){Modal.closeAll()},2000);
			                    		 Common.router.route();//重新载入
			                    	 }else{
			                    		 Modal.warning ('保存失败')
			                    	 }
								});
  	    	                	
  	    	                }
  	    	            }],
      				    onshown : function(){
      				    	EventsHandler.vdc_form($(".vdc_basic"));	
	    	            }
  	    	        });
  	    		});
    		 })		
    	 },
    	//成员管理
    	 Member : function(vdc_id){
    		 //根据vdc_id获取用户列表，包括角色  resources/data/user.txt
    		 Common.xhr.ajax("/v2.0/tenants/"+vdc_id+"/users",function(data){
			 	var userList = data.users;
	    		var loadmore = false;
				if(userTotalSize > userSize * userIndex){
					loadmore = true;
				}
				var options = {
						selector: '#vdc-users',
						loadmore: loadmore,
						groupSelectedClass: 'col-sm-7',
						groupAllClass: 'col-sm-5',
						addCall: function($clone){
							//添加角色窗及对应的事件
							var dtd = $.Deferred();
							Common.render('tpls/ccenter/vdc/role.html',cacheData.roleList,function(html){
								$clone.append(html);
								dtd.resolve();
							});
							return dtd.promise();
						},
						delCall: function($clone){
							//去除角色窗及取消事件绑定
							$clone.children("li:last").remove();
						},
						allData: cacheData.userList,
						selectData: userList
				};
				require(['js/common/choose'],function(choose){
	        		Common.render('tpls/ccenter/vdc/user.html',[],function(html){
	        			//通过回调方式加载，保证choose执行完毕后再去modal
	        			options.doneCall = function(html,chooseWrapper){
	        				chooseWrapper.append(html);
		        			$(options.selector).append(chooseWrapper.find('div:first'));
		        			if(userList && userList.length > 0){
		        				$("#vdc-users .show-selected").find("ul.list-group-item").each(function(i,element){
	        						var user = userList[i];
		        					var roles = user.roles;
		        					var allRolse = cacheData.roleList;
		        					var userData = [];
		        					userData.push('<li class="dropdown pull-right opt" >');
		        					userData.push('<div class="dropdown">');
		        					userData.push('<button class="btn btn-default dropdown-toggle ellipsis" type="button"  data-toggle="dropdown" aria-expanded="true">');
		        					userData.push(roles[0].name);
		        					userData.push('<span class="caret"></span>');
		        					userData.push('</button>');
		        					
		        					userData.push('<ul class="dropdown-menu dropdown-menu-right" role="menu" >');
		        					for(var key in allRolse){
		        						var obj = allRolse[key];
		        						var display = false;
		        						for(var j  in roles){
		        							if(obj.id == roles[j].id){
		        								display = true;
		        								break;
		        							}
		        						}
		        						if(display){
		        							userData.push('<li><a in-use="1" href="javascript:void(0);" data-id="',obj.id,'" data-name="',obj.name,'"><i class="fa fa-check fa-fw" style="opacity:1;"></i>',obj.name,'</a></li>')
		        						}else{
		        							userData.push('<li><a href="javascript:void(0);"data-id="',obj.id,'" data-name="',obj.name,'"><i class="fa fa-check fa-fw"></i>',obj.name,'</a></li>')
		        						}
		        					}
		        					userData.push('</ul>');
		        					
		        					userData.push('</div>');
		        					userData.push('</li>');
		        					$(element).append(userData.join(""));
	        				  });
		        			}
		        			Modal.show({
	    	    	            title: '成员管理',
	    	    	            message: chooseWrapper.html(),
	    	    	            nl2br: false,
	    	    	            buttons: [{
	    	    	                label: '保存',
	    	    	                action: function(dialog) {
	    	    	                	var userRolesData= {
	    	    	                			"memberList":jsonData.userJson("#vdc-users .list-group-select")
	    	    	                	}
	    	    	                	Common.xhr.postJSON('/v2.0/tenants/'+vdc_id+'/userroles',userRolesData,function(data){
	    	    	                		if(data){
	    	    	                			 Modal.success('保存成功')
		   		 	                			 setTimeout(function(){Modal.closeAll()},2000);
		   			                    		 Common.router.route();//重新载入
	    	    	                		}else{
	    	    	                			 Modal.warning ('保存失败')
	    	    	                		}
	    	    	    				})
	    	    	                }
	    	    	            }],
	    	    	            onshown : function(){
	    	    	            	EventsHandler.userChosen();
	    	    	            	chooseWrapper.remove();
	    	    	            },
	    	    	            onhide : function(){
	    	    	            	userIndex = 1;
	    	    	            }
	    	    	        });
	        			};
	        			options.doneData = html;
	        			choose.initChoose(options);
	        		})
	        	});    			
    		 });    		
    	 }/*,
    	//外部网络
    	FloatIP: function(net_id,vdc_id){		
    		Common.xhr.get('/v2.0/floatingips',{'floatingNetworkId':net_id},function(ipList){
    			for(var key in ipList.floatingips ){
					var obj = ipList.floatingips[key];
					obj.name = obj.floating_ip_address;
				}
    			Common.xhr.get('/v2.0/floatingips',{'vdcId':vdc_id},function(vdcIpList){
    				for(var key in vdcIpList.floatingips ){
    					var obj = vdcIpList.floatingips[key];
    					obj.name = obj.floating_ip_address;
    				}
    				var data = {
    						netList:renderData.netList		
    				},
    				options = {
    						selector: '#vdcFloatIP',
							allData: ipList.floatingips,
							selectData: vdcIpList.floatingips
	    			};
    				
    				require(['js/common/choose'],function(choose){
    	        		
    	        		Common.render('tpls/ccenter/vdc/floatIP.html',data,function(html){
    	        			//通过回调方式加载，保证choose执行完毕后再去modal
    	        			options.doneCall = function(html,chooseWrapper){
    	        				chooseWrapper.append(html);
    		        			$(options.selector).append(chooseWrapper.find('div:first'));
    		        			//console.log(chooseWrapper.html());
    		        			Modal.show({
    	    	    	            title: '外部网络',
    	    	    	            message: chooseWrapper.html(),
    	    	    	            nl2br: false,
    	    	    	            buttons: [{
    	    	    	                label: '保存',
    	    	    	                action: function(dialog) {
    	    	    	    				var putData={
    	    	    	    							"floatingips":jsonData.floatIpJson("#vdcAZ .list-group-select")
    	    	    	    				      };
    	    	    	                	Common.xhr.putJSON('/v2.0/az/'+vdc_id,putData,function(data){
    	    	    	                		if(data){
    	    	    	                			 Modal.success('保存成功')
      				 	                			 setTimeout(function(){Modal.closeAll()},1000);
      					                    		 Common.router.route();//重新载入
    	    	    	                		}else{
    	    	    	                			Modal.warning ('保存失败');
    	    	    	                		}
    	    	    	                	});
    	    	    	                
    	    	    	                }
    	    	    	            }],
    	    	    	            onshown : function(){
    	    	    	            	EventsHandler.netChange();
    	    	    	            	chooseWrapper.remove();
    	    	    	            }
    	    	    	        });
    	        			};
    	        			options.doneData = html;
    	        			choose.initChoose(options);
    	        		})
    	        	});
    			})
    		})		
    	 },*/
	   }
	}	
	return {
		init : init
	}
})
