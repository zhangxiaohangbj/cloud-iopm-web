define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	Common.requestCSS('css/dialog.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
        Common.xhr.ajax('/cloud/v2/123/flavors/detail', function(data){
            debugger;
            Common.render(true,'tpls/ccenter/vmtype/list.html',data,function(){
                bindEvent();

            });
        })

	};
	
	var bindEvent = function(){
		//dataTables
		Common.initDataTable($('#vmtypeTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
				'<span class="btn btn-add">创建主机类型</span>'
				);
            $tar.prev().find('.left-col:first').append(
                '<span class="btn btn-add">删除主机类型</span>'
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
        //初始化加载，不依赖其他模块
		var DataGetter = {
				//虚拟化环境 virtural environment
				getVe: function(){
					Common.xhr.ajax('/resources/data/select.txt',function(veList){///v2/images
						renderData.veList = veList;
					});
				},
				//根据虚拟化环境获取可用az
				getAz:  function(){
					Common.xhr.ajax('/resources/data/select.txt',function(azList){
						renderData.azList = azList;
					});
				},
				//获取成员信息及对应的角色
				getUsers : function(){
					Common.xhr.ajax('/resources/data/select.txt',function(userList){
						renderData.userList = userList;
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
		DataGetter.getIps();
	  //增加按钮
	    $("#vmtypeTable_wrapper span.btn-add").on("click",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/ccenter/vdc/add.html',renderData,function(html){
				$('body').append(html);
				//wizard show
    			$.fn.wizard.logging = true;
    			var wizard;
    			
    			//维护当前select的值
    			var currentChosenObj = {
    					ve: null,	//当前虚拟化环境
    					az: null,
    					netId: null
    			};
    			//载入默认的数据 inits,创建数据载入类
    			var DataIniter = {
    				//根据ve获取可用分区
    				initAz : function(){
    					var ve_id = currentChosenObj.ve.val() || $('select.select-ve').children('option:selected').val();
    					if(ve_id){
    						/*Common.xhr.ajax('/v2/'+vdc_id+'/os-availability-zone',function(data){
    							var selectData = [];
    							for(var i=0;i<data.length;i++){
    								selectData[i] = {"name":data[i]["zoneName"]};
    							}
    							var html = Common.uiSelect(selectData);
    					    	$('select.select-available-zone').html(html);
    					    	//同步currentChosenObj
    					    	currentChosenObj.az = $('select.select-available-zone').children('option:selected');
    						});*/
    						EventsHandler.azEvent();
    					}else{
    						Modal.danger('尚未选择所属虚拟化环境');
    					}
    				}
    			}
    			//载入后的事件
    			var EventsHandler = {
    					//虚拟化环境change事件
    					veChange: function(){
    						//同步
    						currentChosenObj.ve = $('select.select-ve').children('option:selected');
    						//重新载入可用分区数据
    						DataIniter.initAz();
    					},
    					//初始化可用分区所需的事件
    					azEvent: function(){
    						//滑过出现添加图标
    						$(document).off("mouseover mouseout",".chose-az a.list-group-item");
    						$(document).on("mouseover mouseout",".chose-az a.list-group-item",function(event){
    							if(event.type == "mouseover"){
    								$(this).find('.fa').show();
    							 }else if(event.type == "mouseout"){
    								 $(this).find('.fa').hide();
    							 }
    						});
    					}
    			}
				//同步currentChosenObj
		    	currentChosenObj.ve = $('select.select-ve').children('option:selected');
		    	currentChosenObj.netId = $('select.select-net').find('option:selected');
		    	//载入依赖数据
		    	DataIniter.initAz();
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
			});
	    });
	    
	    //更新配额
	    $("ul.dropdown-menu a.updateQuota").on("click",function(){
	    	more.QuotaSets($(this).attr("data"));
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
			    	                			alert("保存成功");
			    	                			
			    	                			dialog.close();
											}else{
												alert("保存失败");
											}
										})
			    	                }
			    	            }],
			    	            onshown : function(){}
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
