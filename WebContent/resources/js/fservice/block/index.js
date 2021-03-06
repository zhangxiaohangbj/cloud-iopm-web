define(['Common','bs/modal','rq/text!tpls/fservice/block/volume/list-opts.html', 'jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal, optsTpl){
	Common.requestCSS('css/wizard.css');
	var current_vdc_id = Common.cookies.getVdcId();
	var current_user_id = Common.cookies.getUid();
	var default_vdc_id = Common.cookies.getUser().defaultVdcId;
	var volumeStatus = {
			available: "可用", 
			attaching: "挂载中", 
			backing_up: "备份", 
			creating: "正在创建", 
			deleting: "正在删除", 
			downloading: "下载中", 
			uploading: "上传中", 
			error: "错误", 
			error_deleting: "删除错误", 
			deleted: "已删除", 
			error_restoring: "恢复错误", 
			in_use: "使用中", 
			restoring_backup: "恢复中", 
			unrecognized: "未知"	
		};
	var wizard;
	var init = function(){
		Common.$pageContent.addClass("loading");
		Common.render(true,{
			tpl:'tpls/fservice/block/volume/list.html',
			callback: bindEvent
		});
	};
	
	//quatos  getClass  
	var renderQuatos = function(options){
		function _renderQuatos(options) {
			var quatos = options.quatos || [];
			var vdcId = options.vdcId;
			var size = $(options.valueNode).val();
			size = /\d+/.test(size) ? parseInt(size) : 0;
			Common.xhr.ajax('/compute/v2/' + vdcId + '/os-quota-sets/' + vdcId,function(allQuotas){
				allQuotas = (allQuotas && allQuotas.quota_set) || {};
				Common.xhr.ajax('/compute/v2/' + vdcId + '/limits',function(allQuotaUsages){
					var datas = [];
					var message = "";
					for(var i=0; i<quatos.length; i++) {
						var q = quatos[i];
						var type = q.type || "count";
						var total = allQuotas[q.name];
						var newUse = type == "count" ? (size>0 ? 1 : 0) : size;
						var used = allQuotaUsages[q.name] + Number(newUse);
						var rate = 100;
						if(total != 0) {
							rate = Math.round((parseInt(used)/parseInt(total))*100);
						}
						var style = rate <= 30 ? 'progress-bar-success' : rate >= 80 ? 'progress-bar-danger' : 'progress-bar-info';
						datas.push({
							name: q.name, title: q.title, total: total, used: used, rate: rate, style: style
						})
						if(rate > 100) {
							message = q.name + "(" + used + ")超出配额(" + total + ")";
							if(i > 0) {
								message = "\n" + message;
							}
						}
					}
					//生成html数据
					Common.render('tpls/common/quota.html', datas, function(html){
						$(options.domNode).html(html);
						if(options.callback) {
							options.callback(message);
						}
					});
				});
			});
		}
		$(options.valueNode).blur(function(){
			_renderQuatos(options);
		});
		_renderQuatos(options);
	}
	
	
	var bindEvent = function(){
		//dataTables
		
		var table = Common.initDataTable($('#VolumeTable'),{
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":'block-storage/v2/' + current_vdc_id + '/volumes/', //ajax源，后端提供的分页接口
	    	  /*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
		      "columns": [
			        {"data": ""},
			        {"data": {}},
			        {"data": "size"},
			        {"data": "status"},
			        {"data": "vmId"},
			        {"data": "volume_type"},
			        {"data": "vdcName"},
			        {"data": "availability_zone"},
			        {"data": "attach_status"},//是否只读未实现
			        {"data": "description"},
			        {"data": {}}
			        
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
					    "targets": [0],
					    "orderable": false,
					    "render": function() {
					      return "<label><input type='checkbox'></label>";
					    }
					},
					{
					    "targets": [1],
					    "render": function(data, type, full) {
					      return '<a class="volume_name" href="#fservice/block/detail/'+data.id+'">'+data.name+"</a>";
					    }
					},
					{
					    "targets": [2],
					    "render": function(data, type, full) {
					      return data+"GB";
					    }
					},
					{
					    "targets": [3],
					    "data": "status",
					    "render": function(data, type, full) {
					    	if(data == "in-use"){
					    		return '<span data="'+data.id+' class="text-success">使用中</span>';
					    	}else if(data == "available"){
					    		return '<span data="'+data.id+' class="text-success">可用</span>';
					    	}else if(data == "creating"){
					    		return '<span data="'+data.id+' class="text-info">正在创建</span>';
					    	}else if(data == "deleting"){
					    		return '<span data="'+data.id+' class="text-danger">正在删除</span>';
					    	}else if(data == "error"){
					    		return '<span data="'+data.id+' class="text-danger">错误</span>';
					    	}else if(data == "error_deleting"){
					    		return '<span data="'+data.id+' class="text-danger">删除错误</span>';
					    	}else if(data == "deleted"){
					    		return '<span data="'+data.id+' class="text-danger">已删除</span>';
					    	}else if(data == "attaching"){
					    		return '<span data="'+data.id+' class="text-info">挂载中</span>';
					    	}else if(data == "backing_up"){
					    		return '<span data="'+data.id+' class="text-info">正在备份</span>';
					    	}else if(data == "downloading"){
					    		return '<span data="'+data.id+' class="text-info">下载中</span>';
					    	}else if(data == "uploading"){
					    		return '<span data="'+data.id+' class="text-info">上传中</span>';
					    	}else if(data == "error_restoring"){
					    		return '<span data="'+data.id+' class="text-danger">恢复错误</span>';
					    	}else{
					    		return '<span data="'+data.id+' class="text-danger">未知</span>';
					    	}
					    	//return volumeStatus[data] || "";
					    }
					},
					{
					    "targets": [8],
					    "data": "attach_status",
					    "render": function(data, type, full) {
					    	return data == 'rw' ? "否" : '是';
					    }
					},
                   {
                     "targets": [10],
                     "data": "id",
                     "render": function(data, type, full) {
                    	 return Common.template(optsTpl, {
  							opts:[
 							      {title: "创建快照", clazz: "btn-opt"}
 							],
 							moreOpts:[
 							    {title: "挂载到虚机", clazz: "edit_mount"},
 							    {title: "从虚机卸载", clazz: "detach_mount"},
 							    {title: "扩展容量", clazz: "extend_size"},
 							    {title: "设置为只读", clazz: "make_r"},
 							    {title: "设置为读写", clazz: "make_rw"},
 							    {title: "备份", clazz: "backup"},
 							    {title: "删除", clazz: "delete"}
 							],
 							data: data
 							
 						});
                     }
                   }
              ]
		    },
		    function($tar){
		    	var $tbMenu = $tar.prev('.tableMenus');
		    	$tbMenu.length && $tbMenu.empty().html($('.table-menus').html());
				Common.$pageContent.removeClass("loading");
		});
		
		Common.on('click','.dataTables_filter .btn-query',function(){
			table.search($('.global-search').val()).draw();
		});
		
		//websocket
		var sendMsg = {
				type: "volume",
				action: "status"
			};
		Common.addWebsocketListener(sendMsg, function(data){
			var id = data.id;
			var status = data.status;
			var operate = $("span[data="+id+"]");
			if(status=="AVAILABLE"){
				operate.html("可使用");
				operate.attr("class","text-success");
			}
			if(status=="CREATING"){
				operate.html("创建中");
				operate.attr("class","text-warning");
			}
			if(status=="ERROR"){
				operate.html("错误");
				operate.attr("class","text-warning");
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
		//管理员和普通租户的逻辑在此判断
		Common.xhr.ajax('/identity/v2.0/users/tenants/'+current_user_id,function(vdcDatas){
			for(var i=0;i<vdcDatas.length;i++){
				if(vdcDatas[i]["id"]==default_vdc_id){
					vdcDatas[i]["selected"]=true;
				}
			}
			renderData.vdcList = vdcDatas;
		});
		
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
						return false;
					}
					return dtd.promise();
				},
				//根据可用分区获取所属虚拟化环境
				initVirtualEnvir: function(){
					var dtd = $.Deferred();
					var vdc_id = currentChosenObj.vdc || $('select.tenant_id').children('option:selected').val();
					Common.xhr.ajax('/identity/v2.0/tenants/'+vdc_id,function(data){
						$('.virtual_envir').attr('data-id',data.tenant.virtualEnvId).html(data.tenant.virtualEnvName);
						dtd.resolve();
					});
					return dtd;
				},
				//根据虚拟化环境获取卷类型
				initVolumeType: function(){
					var envir_id = $('.virtual_envir').attr('data-id');
					if(envir_id){
						///resources/data/select.txt
						Common.xhr.ajax('/block-storage/v2/' + current_vdc_id + '/types', function(data){
							var volumeTypes = data.volume_types;
							volumeTypes = [{id:null, name:""}].concat(volumeTypes);
							var  html = Common.uiSelect(volumeTypes);
							$('select.volume_type').html(html);
						});
					}
				},
				
				//初始化配额信息
				initQuato: function(vdc_id){
					vdc_id = vdc_id || currentChosenObj.vdc || $('select.tenant_id').find('option:selected').val();
					if(vdc_id){
						renderQuatos({
							vdcId : vdc_id,
							valueNode : '#size',
							quatos : [{name: "volumes", title: "磁盘数量", type: "count"},
							          {name: "gigabytes", title: "容量", type: "mount"}],
							domNode : 'div.quotas',
							callback : EventsHandler.checkNextWizard
						})
					
					}else{
						Modal.error('尚未选择vdc');
						return false;
					}
				},
				//初始化用户创建的vm列表
				initUserVms: function(){
					Common.xhr.ajax('/compute/v2/' + current_vdc_id + '/servers/page/1/200',function(data){
						var dataArr = [];
						$.each(data.result,function(i,item){
							dataArr.push('<div class="col-sm-6"><label data-id="'+item.id+'" data-name="'+item.name+'"><input name="user_vms" type="radio">'+item.name+'</label></div>')
						})
						$('.vm-list').html(dataArr.join(''));
						EventsHandler.initRadioBox();
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
				initRadioBox : function(){
					$('input[type="checkbox"],input[type="radio"]').iCheck({
				    	checkboxClass: "icheckbox-info",
				    	radioClass: "iradio-info"
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
		Common.on("click", "#VolumeTable_wrapper span.btn-add", function(){

	    	//需要修改为真实数据源
			Common.render('tpls/fservice/block/volume/add.html',renderData,function(html){
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
    				DataIniter.initQuato();
    		    	DataIniter.initUserVms();
    			});
    			var getMountVm = function(){
    				var data = {};
    				$('div.vm-list').find('.iradio-info').each(function(){
    					if($(this).hasClass('checked')){
    						data.id = $(this).parent().attr('data-id');
    						data.name =  $(this).parent().attr('data-name');
    						return false;
    					}
    				});
    				return data.id ? data : null;
    			}
    			wizard.cards.mount.on('selected',function(card){
					//获取磁盘名字的值
					$('.mount_volume_name').text($('input[name="name"]').val())
    			});
    			//确认信息卡片被选中的监听
    			wizard.cards.confirm.on('selected',function(card){
    				//获取上几步中填写的值
    				var serverData = wizard.serializeObject();
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
    				var attachment = getMountVm();
    				if(attachment != {}){
    					var dataArr= [];
    					dataArr.push('<div class="wizard-input-section"><div class="form-group">');
    					dataArr.push('<label class="control-label col-sm-5">'+attachment.name+'</label>');
    					dataArr.push('</div></div>');
    					$('.query-info-mount').append(dataArr.join(''));
    				}
				});
    			
    			wizard.show();
    			wizard.on("submit", function(wizard) {
    				var attachInfos = getMountVm(),
    					formData = wizard.serializeObject();
    				delete formData.user_vms;
    				var postData = {
    						volume: formData,
    						volumeAttach: attachInfos.id
    				}
    				if(postData.volume.availability_zone == "") {
    					postData.volume.availability_zone = null;
    				}
    				var serverData = {volume:postData};
    				Common.xhr.postJSON('block-storage/v2/' + current_vdc_id + '/volumes/create',postData,function(data){
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
	    		
	    	createShapshot: function(){
	    		Common.on('click','.snapshot-menu', function(){
	    			var rowdata = $(this).parents("tr:first").data("rowData.dt");
    				var id = rowdata.id;
    				var name = rowdata.name;
    				var snapshotDialog;
	       	    	Common.render({
    					tpl:'tpls/fservice/block/volume/create-snapshot.html',
						data: {volume:rowdata},
						callback: function(html) {
							Modal.show({
	    	    	            title: '创建'+name+' 的快照',
	    	    	            message: html,
	    	    	            closeByBackdrop: false,
	    	    	            nl2br: false,
	    	    	            onshow: function(dialog) {
	    	    	            	snapshotDialog = dialog;
	    	    	                dialog.getButton('os-snapshot-btn').disable();
	    	    	            },
	    	    	            buttons: [{
	    	    	            	id: 'os-snapshot-btn',
	    	    	                label: '确定',
	    	    	                disabled : true,
	    	    	                action: function(dialog) {
	    	    	                	var url = 'block-storage/v2/' + current_vdc_id + '/snapshots';
	    	    	                	var newSize = {
    	    	                		    "snapshot": {
    	    	                		    	"volume_id": id,
    	    	                		    	"name": $("#snapshot_name").val(),
    	    	                		    	"description": $("#snapshot_desc").val(),
    	    	                		        "force": true
    	    	                		    }
    	    	                		};
	    	    	                	Common.xhr.postJSON(url , newSize, function(data){
		    	    	                		if(data){
		    	    	                			dialog.close();
		    	    	                			Modal.success('创建成功')
		    	     	                			setTimeout(function(){Modal.closeAll()},3000);
		    	    	                			Common.router.route();
		    									}else{
		    										Modal.error("创建失败");
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
    	    	            		$("#snapshot_name").on("change", function(){
    	    	            			(!!$(this).val())?snapshotDialog.getButton('os-snapshot-btn').enable()
    	    	            					:snapshotDialog.getButton('os-snapshot-btn').disable();
    	    	            		});
    	    	            		renderQuatos({
    									vdcId : current_vdc_id,
    									valueNode : '#snapshot_size',
    									quatos : [{name: "gigabytes", title: "容量", type: "mount"},
    									          {name: "snapshots", title: "快照数量", type: "count"}],
    									domNode : 'div.snapshot-quotas',
    									callback: function(msg) {
    										if(msg || !$("#snapshot_name").val()) {
    											snapshotDialog.getButton('os-snapshot-btn').disable();
    										} else {
    											snapshotDialog.getButton('os-snapshot-btn').enable();
    										}
    									}
    								})
    	        	            }
	    					});
						}
    				})
	    		});
	    	},
	    	attachVolume: function(){
    			Common.on('click','.dropdown-menu a.edit_mount',function(){
    				var rowdata = $(this).parents("tr:first").data("rowData.dt");
    				var id = rowdata.id,
    				name = rowdata.name;

    				Common.render({
    					tpl:'tpls/fservice/block/volume/edit_mount.html',
						data:'/compute/v2/' + current_vdc_id + '/servers/page/1/200',
						beforeRender: function(data){
							return {servers:data.result, volName:name};
						},
						callback: function(html) {
							Modal.show({
	    	    	            title: '挂载'+name+'磁盘到云主机',
	    	    	            message: html,
	    	    	            closeByBackdrop: false,
	    	    	            nl2br: false,
	    	    	            buttons: [{
	    	    	                label: '确定',
	    	    	                disabled: true,
	    	    	                action: function(dialog) {
	    	    	                	var postData = {
	    	    	                			"volumeAttachment": {
	    	    	                			    "volumeId": id
	    	    	                			  }
	    	    	                			};
	    	    	                	var serverId = $("[name='mountServerId']:checked").val();
	    	    	                	var url = '/compute/v2/' + current_vdc_id + '/servers/' + serverId + '/os-volume_attachments';
	    	    	                	Common.xhr.postJSON(url, postData, function(data){
		    	    	                		if(data){
		    	    	                			dialog.close();
		    	    	                			Modal.success('挂载成功');
		    	     	                			setTimeout(function(){Modal.closeAll()},3000);
		    	    	                			Common.router.route();
		    									}else{
		    										Modal.error("挂载失败");
		    									}
		    	    	    				});
	    	    	                	 }
	    	    	            	},
	    	    	            	{
		    	    	                label: '取消',
		    	    	                action: function(dialog) {
		    	    	                	dialog.close();
	    	    	                	}
	    	    	            	}],
	    	    	            	onrealized : function(){
	    	        	            	EventsHandler.initRadioBox();
	    	        	            }
	    					});
						}
    				})
    			})
    		},
    		detachVolume: function(){
    			Common.on('click','.dropdown-menu a.detach_mount',function(){
    				var rowdata = $(this).parents("tr:first").data("rowData.dt");
    				var id = rowdata.id,
    				name = rowdata.name;
    				var url = '/compute/v2/' + current_vdc_id + '/volumes/'
    					+ id + '/os-volume_attachments';
    				Common.xhr.get(url, {}, function(data){
                		if(data){
                			Modal.confirm('确定要卸载"' + name + '"吗?', function(result){
               	             if(result) {
               	            	 var detachUrl = "/compute/v2/" + current_vdc_id + "/servers/" + data.serverId + "/os-volume_attachments/" + data.id;
               	            	 Common.xhr.del(detachUrl, function(data){
           	                    	 if(data){
           	                    		 Modal.success('磁盘卸载成功')
            	                			 setTimeout(function(){Modal.closeAll()},3000);
           	                    		 Common.router.route();//重新载入
           	                    	 }else{
           	                    		 Modal.warning ('磁盘卸载失败')
           	                    	 }
           	                     });
               	             }else {
               	            	 Modal.closeAll();
               	             }
               	         	});
						}else{
							Modal.warning("尚未挂载到任何主机");
						}
    				});
    			})
    		},
    		//删除
    		deleteVolume: function(){
    			Common.on('click','.dropdown-menu a.delete',function(){
    				var rowdata = $(this).parents("tr:first").data("rowData.dt");
    				var id = rowdata.id;
	       	    	 Modal.confirm('确定要删除该磁盘吗?', function(result){
	       	             if(result) {
	       	            	 Common.xhr.del("block-storage/v2/" + current_vdc_id + "/volumes/" + id, "",
	       	                     function(data){
	       	                    	 if(data){
	        	                			Modal.success('删除成功')
	        	                			setTimeout(function(){Modal.closeAll()},3000);
	       	                    		Common.router.route();
	       	                    	 }else{
	       	                    		Modal.success('删除失败')
	       	 	                		setTimeout(function(){Modal.closeAll()},3000);
	       	                    	 }
	       	                     });
	       	             }
	       	         });
	       		})
    		},
    		extendSize : function() {

    			Common.on('click','.dropdown-menu a.extend_size',function(){
    				var rowData = $(this).parents("tr:first").data("rowData.dt"); 
    				var	id = rowData.id;
    				var	name = rowData.name,
    					size = rowData.size;
    				var extendValidate;
	       	    	Common.render({
    					tpl:'tpls/fservice/block/volume/extend-size.html',
						data: {volName:name,size:size},
						callback: function(html) {
							Modal.show({
	    	    	            title: '扩展'+name+'磁盘的大小',
	    	    	            message: html,
	    	    	            closeByBackdrop: false,
	    	    	            nl2br: false,
	    	    	            buttons: [{
	    	    	            	id: 'os-extend-btn',
	    	    	                label: '确定',
	    	    	                action: function(dialog) {
	    	    	                	if(extendValidate.valid()){
	    	    	                		var url = 'block-storage/v2/' + current_vdc_id + '/volumes/' + id + '/action';
		    	    	                	var newSize = {
	    	    	                		    "os-extend": {
	    	    	                		        "new_size": $("#extend_size").val()
	    	    	                		    }
	    	    	                		};
		    	    	                	Common.xhr.postJSON(url , newSize, function(data){
			    	    	                		if(data){
			    	    	                			Modal.success('保存成功');
			    	     	                			setTimeout(function(){
			    	     	                				Common.router.route();
			    	     	                				},1500);
			    									}else{
			    										Modal.error("保存失败");
			    									}
			    	    	    				});
	    	    	                	}
	    	    	                  }
	    	    	            	}, {
	    	    	            		label: '取消',
	    	    	            		action: function(dialog) {
	    	    	            			dialog.close();
	    	    	                	}
	    	    	            	}],
	    	    	            	onrealized: function(){
	    	    	            		extendValidate = $('#extend_volume_size').validate({
	 	    	    	                	rules: {
	 	    	    	                		'extend_size': {
	 	    	    	                			required: true,
	 	    	    	                			integer: true
	 	    	    	                		}
	 	    	    	                	}
	 	    	    	                });
	    	    	            		renderQuatos({
	    									vdcId : current_vdc_id,
	    									valueNode : '#extend_size',
	    									quatos : [{name: "gigabytes", title: "容量", type: "mount"}],
	    									domNode : 'div.quotas-size'
	    								})
	    	        	            },
	    	        	            onhide: function(){
	    	        	            	extendValidate && extendValidate.hideErrors();
	    	        	            }
	    	        	            
	    					});
							
						}
						
    				})
	       		})
    		},
    		setReadonly: function(){
    			Common.on('click','.dropdown-menu a.make_rw,.dropdown-menu a.make_r',function(){
    				var id = $(this).parents("tr:first").data("rowData.dt").id;
    				var confirmTips = this.className == 'make_rw' ? '读写' : '只读',
    					requestVal = this.className == 'make_rw' ? 'False' : 'True';
    				if(id){
    					Modal.confirm('确定要设置为'+confirmTips+'?', function(result){
    	       	             if(result) {
    	       	            	var url = 'block-storage/v2/' + current_vdc_id + '/volumes/' + id + '/action',
    	       	            		postData = {
    	       	            			"os-update-readonly": {
    	       	            				"readonly": requestVal
    	       	            			}
    	       	            		};
    	       	            	Common.xhr.postJSON(url , postData, function(data){
	    	                		if(data){
	    	                			Modal.success('操作成功');
	     	                			setTimeout(function(){
	     	                				Common.router.route();
	     	                				},1500);
									}else{
										Modal.error("保存失败");
									}
	    	    				});
    	       	             }
    	       	         });
    				}else{
    					Modal.error('缺少必要的执行参数');
    				}
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

