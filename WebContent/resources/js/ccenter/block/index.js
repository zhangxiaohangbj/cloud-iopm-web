define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var current_vdc_id = '9cc717d8047e46e5bf23804fc4400247';
	var wizard;
	var init = function(){
		Common.$pageContent.addClass("loading");
		Common.render(true,{
			tpl:'tpls/ccenter/block/volume/list.html',
			//data:'/v2.0/tenants/page/10/1',
			//data:'/resources/data/volume.txt',
			data: '/v2/' + current_vdc_id + '/volumes/1/20',
			beforeRender: function(data){
				return data.result;
				//return data;//.result;
			},
			callback: bindEvent
		});
	};
	var bindEvent = function(){
		//dataTables
		Common.initDataTable($('#VolumeTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">新建</span>'
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
				vdc: null,	//当前选择的vdc的id
				az: null,	//当前可用分区
				netId: null
		};
        //初始化加载，不依赖其他模块
		var DataGetter = {
				getVdc:function(){
					//管理员和普通租户的逻辑在此判断
					Common.xhr.ajax('/v2.0/tenants',function(vdcDatas){
						renderData.vdcList = vdcDatas.tenants;
					});
				}
		};
		DataGetter.getVdc();
		//载入默认的数据 inits
		var DataIniter = {
				//载入可用分区
				initAvailableZone: function(){
					var dtd = $.Deferred();
					var vdc_id = currentChosenObj.vdc || $('select.tenant_id').children('option:selected').val();
					if(vdc_id){
						Common.xhr.ajax('/v2/' + vdc_id +'/os-availability-zone',function(result){
							var selectData = [];
							var data = result["availabilityZoneInfo"]
							selectData.push({name:"", id:""})
							for(var i=0;i<data.length;i++){
								
								if(data[i]["zoneState"]["available"]){
									selectData.push({"name":data[i]["zoneName"]});
								}

							}
							var html = Common.uiSelect(selectData);
					    	$('select.availability_zone').html(html);
					    	//同步currentChosenObj
					    	currentChosenObj.az = $('select.availability_zone').children('option:selected');
					    	dtd.resolve();
						});
					}else{
						Modal.error('尚未选择所属vdc');
						dtd.resolve();
					}
					return dtd.promise();
				},
				//根据可用分区获取所属虚拟化环境
				initVirtualEnvir: function(){
					var dtd = $.Deferred();
					var vdc_id = currentChosenObj.vdc || $('select.tenant_id').children('option:selected').val();
					Common.xhr.ajax('/resources/data/arrays.txt',function(data){
						data = {
								name: 'OpenStack',
								id: 'virtual_envir_id'
						}
						$('.virtual_envir').attr('data-id',data.id).html(data.name);
						console.log(2);
						dtd.resolve();
					});
					return dtd;
				},
				//根据虚拟化环境获取卷类型
				initVolumeType: function(){
					var envir_id = $('.virtual_envir').attr('data-id');
					if(envir_id){
						///resources/data/select.txt
						Common.xhr.ajax('/v2/' + current_vdc_id + '/types', function(data){
							var  html = Common.uiSelect(data.volume_types);
							$('select.volume_type').html(html);
						});
					}
				},
				//初始化配额信息
				initQuato: function(vdc_id){
					vdc_id = vdc_id || currentChosenObj.vdc || $('select.tenant_id').find('option:selected').val();
					if(vdc_id){
						//获取vdc的配额
						Common.xhr.ajax('/v2.0/'+current_vdc_id+'/os-quota-sets/'+vdc_id,function(quotas){
							if(!quotas) return;
							quotas = quotas.quota_set || {};
							//获取vdc的配额使用情况
							Common.xhr.ajax('/v2.0/'+vdc_id+'/limits',function(quotaUsages){
								var getMathRound = function(used,total){
									if(total == 0) return 100;
									return Math.round((parseInt(used)/parseInt(total))*100);
								}
								var getClass = function(rate){
									return rate <= 30 ? 'progress-bar-success' : rate >= 80 ? 'progress-bar-danger' : 'progress-bar-info';
								}
								if($('#size').val()){
									quotaUsages.gigabytes = parseInt(quotaUsages.gigabytes) + parseInt($('#size').val());
								}
								var rateDiskNums = getMathRound(quotaUsages.volumes, quotas.volumes || 0),
								rateDiskTotalSizes = getMathRound(quotaUsages.gigabytes, quotas.gigabytes || 0),
								styleDiskNums = getClass(rateDiskNums),styleDiskTotalSizes = getClass(rateDiskTotalSizes);
								var renderData = [
											        {
											        	name: 'DiskTotalSizes',title: '容量',total: quotas.gigabytes, used: quotaUsages.gigabytes, rate: rateDiskTotalSizes, style: styleDiskTotalSizes
											        },
											        {
											        	name: 'diskNums',title: '磁盘数量',total: quotas.volumes, used: quotaUsages.volumes, rate: rateDiskNums, style: styleDiskNums
											        }
											 ];
								//生成html数据
								Common.render('tpls/common/quota.html',renderData,function(html){
									$('div.quotas').html(html);
									EventsHandler.checkNextWizard();
								});
								
							})
						})
					}else{
						Modal.error('尚未选择vdc');
					}
				},
				//初始化用户创建的vm列表
				initUserVms: function(){
					Common.xhr.ajax('/resources/data/specs.txt',function(data){
						var dataArr = [];
						$.each(data,function(i,item){
							dataArr.push('<div class="col-sm-9"><label data-id="'+item.name+'"><input type="checkbox">'+item.name+'</label></div>')
						})
						$('.vm-list').html(dataArr.join(''));
						EventsHandler.initCheckBox();
					});
				}
		};
		//载入后的事件
		var EventsHandler = {
				//vdc切换
				vdcChange: function(){
					$('select.tenant_id').change(function(){
						var current = $(this).children('option:selected');
				    	currentChosenObj.vdc = current.val();//同步currentChosenObj
				    	DataIniter.initAvailableZone();//重新加载可用域的数据
				    	DataIniter.initQuato();//重新加载配额数据
					});
				},
				//挂载磁盘
				initCheckBox : function(){
					$('input[type="checkbox"],input[type="radio"]').iCheck({
				    	checkboxClass: "icheckbox-info"
				    })
				},
				//input propertychange
				inputListener: function(){
					$('#size').on('blur',function(){
						if($(this).parents('form:first').validate().element('#size')){
							DataIniter.initQuato();//重新加载配额数据
						}
					})
				},
				checkNextWizard: function(){
					$('.form-group .progress-bar').each(function(){
						var info = $(this).parent().prev(),
							dataAll = parseInt(info.attr('data-all')),
							dataUsed = parseInt(info.attr('data-used'));
						if(parseInt($(this).attr('aria-valuenow')) > 100 || dataAll < dataUsed || dataAll == 0){
							wizard.disableNextButton();
							Modal.error(info.find('.quota-key').html()+'超出配额');
						}else{
							wizard.enableNextButton();
						}
					})
				}
		};
	  //增加按钮
	    $("#VolumeTable_wrapper span.btn-add").on("click",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/ccenter/block/volume/add.html',renderData,function(html){
				$('body').append(html);
				//wizard show
    			$.fn.wizard.logging = true;
    			
				//同步currentChosenObj
		    	currentChosenObj.vdc = $('select.tenant_id').children('option:selected').val();
		    	//载入依赖数据
		    	$.when(DataIniter.initAvailableZone()).done(function(){
		    		$.when(DataIniter.initVirtualEnvir()).done(function(){
		    			DataIniter.initVolumeType();
		    		});
		    	});
		    	DataIniter.initQuato();
		    	DataIniter.initUserVms();
		    	
		    	//
    			wizard = $('#create-volume-wizard').wizard({
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
    	            },
    	            validate: {
	            		0: function(){
	            			return this.el.find('form').valid();
	            		}
    	            }
    			});
    			//加载时载入validate
    			wizard.on('show',function(){
    				wizard.form.each(function(){
    					$(this).validate({
                            errorContainer: '_form',
                            /*errorPlacement: function(error, element) {
                            	debugger
                                if ( $(element).is(":radio") )
                                	$(element).appendTo( $(element).parent().next().next() );
                                else if ( $(element).is(":checkbox") )
                                	$(element).appendTo ( $(element).next() );
                                else
                            	alert($(error).html());
                            	//alert($(element).parent().html());
                            	$(error).appendTo( $(element).parents('.form-group:first') );
                            },*/
                            rules: {
    			            	'name': {
    			                    required: true,
    			                    minlength: 4,
    			                    maxlength:15
    			                },
    			                'size': {
    			                    required: true,
    			                    number:true,
    			                    max:1024
    			                }
    			            }
    					});
    				})
    				//载入事件
    		    	EventsHandler.vdcChange();
    				EventsHandler.inputListener();
    			});
    			var getMountVm = function(){
    				var data = [];
    				$('div.vm-list').find('.icheckbox-info').each(function(){
    					if($(this).hasClass('checked')){
    						data.push($(this).parent().attr('data-id'))
    					}
    				});
    				return data;
    			}
    			wizard.cards.mount.on('selected',function(card){
					//获取磁盘名字的值
					$('.mount_volume_name').text($('input[name="name"]').val())
    			});
    			//确认信息卡片被选中的监听
    			wizard.cards.confirm.on('selected',function(card){
    				//debugger
    				//获取上几步中填写的值
    				var serverData = wizard.serializeObject();
    				console.log(serverData);
    				if(serverData.availability_zone == "") {
    					serverData.availability_zone = null;
    				}
    				$('.query-volume-name').text(serverData.name);
    				$('.query-volume-size').text(serverData.size+"GB");
    				$('.query-volume-type').text($('select.volume_type').children('option:selected').text());
    				$('.query-volume-vdc').text($('select.tenant_id').children('option:selected').text());
    				$('.query-volume-az').text(serverData.availability_zone || "");
    				$('.query-volume-ve').text($('.virtual_envir').html());
    				$('.query-volume-desc').text(serverData.description);
    				//挂载磁盘
    				var vmList = getMountVm();
    				if(vmList.length){
    					var dataArr= [];
    					dataArr.push('<div class="wizard-input-section"><div class="form-group">');
    					$.each(vmList,function(i,item){
    						
    						dataArr.push('<label class="control-label col-sm-5">'+item+'</label>');
    					})
    					dataArr.push('</div></div>');
    					$('.query-info-mount').append(dataArr.join(''));
    				}
				});
    			
    			wizard.show();
    			
    			wizard.on("submit", function(wizard) {
    				var volume = wizard.serializeObject();
    				if(volume.availability_zone == "") {
    					volume.availability_zone = null;
    				}
    				var serverData = {volume:volume};
    				Common.xhr.postJSON('/v2/' + current_vdc_id + '/volumes',serverData,function(data){
    					wizard._submitting = false;
    					wizard.updateProgressBar(100);
    					closeWizard();
    					Common.router.reload();
    				})
    			});
    			
    			//重置CurrentChosenObj对象
    			var resetCurrentChosenObj = function(){
    				for(var key in currentChosenObj){
    					currentChosenObj[key] = null;
    				}
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
	    var moreAction = {
    		editMount: function(){
    			$('.dropdown-menu a.edit_mount').on('click',function(){
    				var tr = $(this).parent('tr:first'),
    					id = tr.attr("data-id"),
    					name = tr.find('.volume_name').text();
    				Common.render(false,'tpls/ccenter/block/volume/edit_mount.html','/resources/data/specs.txt',function(html){
    					Modal.show({
    	    	            title: '挂载'+name+'磁盘到云主机',
    	    	            message: html,
    	    	            closeByBackdrop: false,
    	    	            nl2br: false,
    	    	            buttons: [{
    	    	                label: '确定',
    	    	                action: function(Modal) {
    	    	                	Common.xhr.postJSON('/v2.0/networks',postData,function(data){
	    	    	                		if(data){
	    	    	                			Modal.close();
	    	    	                			Modal.success('保存成功')
	    	     	                			setTimeout(function(){Modal.closeAll()},3000);
	    	    	                			Common.router.route();
	    									}else{
	    										alert("保存失败");
	    									}
	    	    	    				});
    	    	                	 }
    	    	            	},
    	    	            	{
    	    	                label: '取消',
    	    	                action: function(Modal) {
    	    	                    Modal.close();
    	    	                	}
    	    	            	}],
    	    	            	onshown : function(){
    	        	            	EventsHandler.initCheckBox();
    	        	            }
    					});
    				})
    			})
    		},
    		//删除
    		deleteVolume: function(){
    			$("#networkTable_wrapper a.delete").on("click",function(){
    				var id = $(this).parent('tr:first').attr("data-id");
	       	    	 Modal.confirm('确定要删除该磁盘吗?', function(result){
	       	             if(result) {
	       	            	 /*Common.xhr.del('/v2.0/networks/'+id,"",
	       	                     function(data){
	       	                    	 if(data){
	        	                			Modal.success('删除成功')
	        	                			setTimeout(function(){Modal.closeAll()},3000);
	       	                    		Common.router.route();
	       	                    	 }else{
	       	                    		Modal.success('删除失败')
	       	 	                		setTimeout(function(){Modal.closeAll()},3000);
	       	                    	 }
	       	                     });*/
	       	             }else {
	       	            	 //Modal.close();
	       	             }
	       	         });
	       		})
    		}
	    };
	    for(var key in moreAction){
	    	if(typeof moreAction[key] === 'function'){
	    		moreAction[key]();
	    	}
	    }
	};
	return {
		init : init
	}
})
