define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var current_vdc_id = '9cc717d8047e46e5bf23804fc4400247';
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/ccenter/vm/list.html',
			data:'/'+current_vdc_id+'/servers/page/1/10',
			beforeRender: function(data){
				return data.result;
			},
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#VmTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">新 建 </span>'
				);
			Common.$pageContent.removeClass("loading");
		});
		
		//$("[data-toggle='tooltip']").tooltip();
		
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
				//镜像列表,type:类型
				getImage: function(type){
					Common.xhr.get('/v2/images',{'imageType':'image'},function(imageList){
						renderData.imageList = imageList;
					});
				},
				//快照列表,
				getSnapshot :  function(uid){
					Common.xhr.get('/v2/images',{'imageType':'snapshot'},function(snapShotList){
						renderData.snapshotList = snapShotList;
					});
				},
				//云硬盘列表
				getDisk : function(uid){
					Common.xhr.ajax('/v2/'+current_vdc_id+'/bootable-volumes',function(diskList){
						renderData.diskList = diskList;
					});
				},
				//云硬盘快照列表
				getDiskSnapShot: function(uid){
					Common.xhr.ajax('/v2/'+current_vdc_id+'/bootable-snapshots',function(diskSnapList){
						renderData.diskSnapList = diskSnapList;
					});
				},
				//vdc列表,获取完vdc列表后，需要去加载可用域的数据以及可用网络的数据和安全组的数据
				getVdc:function(){
					//管理员和普通租户的逻辑在此判断
					Common.xhr.ajax('/v2.0/tenants',function(vdcDatas){
						renderData.vdcList = vdcDatas.tenants;
					});
				},
				//虚机规格
				getSpecs: function(){
					Common.xhr.ajax('/v2/'+current_vdc_id+'/flavors/detail',function(flavors){
						var flavorsData = flavors['flavors'];
						for(var i=0;i<flavorsData.length;i++){
							flavorsData[i]["ephemeral"] = flavorsData[i]["OS-FLV-EXT-DATA:ephemeral"]
						}
						renderData.specsList = flavorsData;
					});
				}
		}
		DataGetter.getImage();
		DataGetter.getSnapshot();
		DataGetter.getDisk();
		DataGetter.getDiskSnapShot();
		DataGetter.getSpecs();
		DataGetter.getVdc();
		
		//维护当前select的值以及云主机数量，为更新配额以及vdc相关的数据用
		var currentChosenObj = {
				vdc: current_vdc_id,	//当前vdc
				az: null,
				specs: null,	//当前选中规格
				prevSpecs: null,//上一个选中规格
				prevNums:null,	//上一个虚机数量
				nums: 1,	//当前虚机数量
				subnets: null  //当前选中的子网
		};
		var wizard;
    	
    	//载入默认的数据 inits,创建数据载入类
		var DataIniter = {
			//根据vdc获取可用域数据
			initAvailableZone : function(){
				var vdc_id = currentChosenObj.vdc || $('select.tenant_id').children('option:selected').val();
				if(vdc_id){
					Common.xhr.ajax('/v2/'+vdc_id+'/os-availability-zone',function(data){
						var selectData = [];
						for(var i=0;i<data["availabilityZoneInfo"].length;i++){
							selectData[i] = {"name":data["availabilityZoneInfo"][i]["zoneName"]};
						}
						var html = Common.uiSelect(selectData);
				    	$('select.availability_zone').html(html);
				    	//同步currentChosenObj
				    	currentChosenObj.az = $('select.availability_zone').children('option:selected');
					});
				}else{
					Modal.error('尚未选择所属vdc');
				}
			},
			//init云主机规格的详细信息popver
			initPopver : function(){
				var current = currentChosenObj.specs || $('select.flavorRef').find('option:selected');
				var	rootDisk = current.attr('data-root-disk'),
					tmpDisk = current.attr('data-tmp-disk'),
					memory = current.attr('data-memory'),
					core = current.attr('data-core');
				var tpl = '<div class="popver-tips"><p>名称：'+current.html()+'</p><p>根磁盘：'+rootDisk+',  临时磁盘： '+tmpDisk+'</p><p>内存：'+memory+'  核数 :'+core+'</p></div>',
					popoverOptions = {
	    				html: true,
	    				content: tpl,
	    				trigger: 'hover',
	    				delay: {
	    					hide: 500
	    				}
	    			};
				$('[data-toggle="popover"]').popover(popoverOptions);
			},
			//vdc的可用配额
			initQuatos : function(vdc_id){
				vdc_id = vdc_id || currentChosenObj.vdc || $('select.tenant_id').find('option:selected').val();
				if(vdc_id){
					//获取vdc的配额
					Common.xhr.ajax('/v2.0/'+current_vdc_id+'/os-quota-sets/'+vdc_id,function(quotas){
						quotas = quotas.quota_set
						//获取vdc的配额使用情况
						Common.xhr.ajax('/v2.0/'+vdc_id+'/limits',function(quotaUsages){
							//当前配额 等于 当前vdc下总配额 减去  当前选中规格的额度
							var current = currentChosenObj.specs;
							if(current && current.length){
								quotaUsages.cores = parseInt(quotaUsages.cores) + parseInt(current.attr('data-core'));
								quotaUsages.ram = parseInt(quotaUsages.ram) + parseInt(current.attr('data-memory'));
							};
							var getMathRound = function(used,total){
								return Math.round((parseInt(used)/parseInt(total))*100);
							}
							var getClass = function(rate){
								return rate <= 30 ? 'progress-bar-success' : rate >= 80 ? 'progress-bar-danger' : 'progress-bar-info';
							}
							var rateCore = getMathRound(quotaUsages.cores,quotas.cores),
							rateMemory = getMathRound(quotaUsages.ram,quotas.ram),
							rateNums = getMathRound(quotaUsages.instances,quotas.instances),
							styleCore = getClass(rateCore),styleMemory = getClass(rateMemory),styleNums=getClass(rateNums);
							var renderData = {
									core: {
										total: quotas.cores, used: quotaUsages.cores, rate: rateCore, style: styleCore
									},
									memory: {
										total: quotas.ram, used: quotaUsages.ram, rate: rateMemory, style: styleMemory
									},
									nums: {
										total: quotas.instances, used: quotaUsages.instances, rate: rateNums, style: styleNums
									}
							}
							//生成html数据
							Common.render('tpls/ccenter/vm/quota.html',renderData,function(html){
								$('div.quotas').html(html);
							});
						})
					})
				}else{
					Modal.error('尚未选择vdc');
				}
			},
			//根据vdc可用网络信息
			initAvailableNetWorks : function(){
				var vdc_id = currentChosenObj.vdc || $('select.tenant_id').children('option:selected').val();
				Common.xhr.get('/v2.0/networks',{"vdcId":vdc_id},function(data){
					var dataArr = [];
					if(data){
						var networks = data.networks;
						require(['js/common/choose'],function(choose){
							var options = {
									selector: '#vm-networks',
									groupSelectedClass: 'col-sm-7',
									groupAllClass: 'col-sm-5',
									addCall: function($clone){
										//添加角色窗及对应的事件
										var dtd = $.Deferred();
										var netId = $clone.find('li:first').attr('data-id');
										//请求subnet
										Common.xhr.ajax('resources/data/select.txt',function(subNetList){
											var html = Common.uiSelect({list:subNetList,className:'select-subnet'});
											$clone.append('<li class="pull-right subip"><select class="select-subip"><option>默认DHCP</option></select></li>');
											$clone.append('<li class="pull-right subnet">'+html+'</li>');
											dtd.resolve();
										});
										return dtd.promise();
									},
									delCall: function($clone){
										//去除角色窗及取消事件绑定
										$clone.children("li.subip").remove();
										$clone.children("li.subnet").remove();
									},
									list: networks
							};
							choose.initChoose(options);
						});
						EventsHandler.networkChosen();
					}
				})
			},
			//更新配额信息：内存和内核数
			updateQuotaSpecs : function(change){
				$('div.quotas').children('.specs').each(function(){
					var key = $(this).attr('data'),
						info = $(this).find('.progress-info'),
						progressBar = $(this).find('.progress-bar'),
						total = parseInt(info.attr('data-all')),
						used = parseInt(info.attr('data-used')),
						oData = currentChosenObj.prevSpecs ? parseInt(currentChosenObj.prevSpecs.attr('data-'+key)): 0;
						nData = parseInt(currentChosenObj.specs.attr('data-'+key)) || 0;
					//切换后的使用值
					used = used + (change != null ? change*(nData - oData) : currentChosenObj.nums*(nData - oData));
					//使用率
					var useRate = Math.round(used/total*100);
					if(useRate <= 100){
						//更新dom内容-info
						info.attr('data-used',used);
						info.find('span.quota-desc').html(total+'中的'+used+'已使用');
						//更新进度条
						progressBar.width(useRate+"%");
						progressBar.attr('aria-valuenow',useRate);
						progressBar.html(useRate+'%');
					}else{
						Modal.error($(this).find('.quota-key').html()+"超出配额");
					}
				})
			},
			//更新配额值,虚机数
			updateQuotaNums : function(){
				var $this = $('div.quotas').children('.nums');
					key = $this.attr('data'),
					info = $this.find('.progress-info'),
					progressBar = $this.find('.progress-bar'),
					total = parseInt(info.attr('data-all')),
					used = parseInt(info.attr('data-used')),
					oData = parseInt(currentChosenObj.prevNums) || 0;
					nData = parseInt(currentChosenObj.nums) || 0;
				if(nData != oData){
					used = used + nData - oData;
					//更新vm个数，需要计算占用的core和memory
					var useRate = Math.round(used/total*100);
					if(useRate <= 100){
						//更新dom内容-info
						info.attr('data-used',used);
						info.find('span.quota-desc').html(total+'中的'+used+'已使用');
						//更新进度条
						progressBar.width(useRate+"%");
						progressBar.attr('aria-valuenow',useRate);
						progressBar.html(useRate+'%');
						this.updateQuotaSpecs(nData - oData);
					}else{
						Modal.error($(this).find('.quota-key').html()+'超出配额');
					}
				}
			},
			//载入安全组
			initSecurityGroup : function(){
				Common.xhr.get('/v2.0/security-groups',{"vdcId":current_vdc_id},function(data){
			    	var dataArr = [];
					if(data && data.security_groups){
						for(var i=0,l=data.security_groups.length;i<l;i++){
							if(data.security_groups[i].name=='default'){
								dataArr.push('<label><input type="checkbox" checked>'+data.security_groups[i].name+'</></label>');
							}else{
								dataArr.push('<label><input type="checkbox">'+data.security_groups[i].name+'</></label>');
							}
						}
						$('div.security-group').html(dataArr.join(''));
						EventsHandler.initCheckBox();
					}
				})
			},
			//选中网络后初始化子网
			initSubNet: function(){
				var networkId = currentChosenObj.networkId;
				if(networkId){
					Common.xhr.get('/v2.0/subnets',{"networkId":networkId},function(data){
						var selectData = [{id:"default",name:"默认子网"}].concat(data.subnets);
						var html = Common.uiSelect(selectData);
				    	$('select.select-sub-network').html(html);
				    	//同步currentChosenObj
				    	currentChosenObj.subnets = $('select.select-sub-network').children('option:selected');
				    	//设置dhcp
				    	$('select.fixed_ip').html(Common.uiSelect([{id:"dhcp",name:"DHCP"}]));
					});
				}
			},
			//选中子网后初始化IP
			initFixedIp: function(){
				var subnetId = currentChosenObj.subnets.val();
				if(subnetId){
					Common.xhr.get('/v2.0/subnets/'+subnetId+'/availableips',function(data){
						var selectData = [{id:"dhcp",name:"DHCP"}];
						for(var i=1;i<data.availableips.length;i++){
							selectData[i] = {id:data.availableips[i],name:data.availableips[i]};
						}
						var html = Common.uiSelect(selectData);
				    	$('select.fixed_ip').html(html);
					});
				
				}
			},
			//密钥对
			initKeyPairs: function(){
				var vdc_id = currentChosenObj.vdc || $('select.tenant_id').children('option:selected').val();
				if(vdc_id){
					Common.xhr.ajax('/'+vdc_id+'/os-keypairs',function(keypairs){
						var html = Common.uiSelect(keypairs);
				    	$('select.keypairs').html(html);
					});
				}else{
					Modal.error('尚未选择所属vdc');
				}
			}
			
		};
		//载入后的事件
		var EventsHandler = {
				//基本信息所需事件
				bindBasicWizard : function(){
					//basic-1：动态获取镜像或者快照
	    			wizard.el.find(".wizard-card .image-source a").click(function() {
	    				var source = $(this).attr('data-image');
	    				$(this).parent().siblings('.active').removeClass('active');
	    				$(this).parent().addClass('active');
	    				$(this).parents('ul:first').siblings('div').each(function(){
	    					if($(this).attr('data-con') == source){
	    						$(this).removeClass('hide').addClass('show');
	    					}else{
	    						$(this).removeClass('show').addClass('hide');
	    					}
	    				})
	    			});
	    			//basic 2：点击镜像列表添加选中
	    			wizard.el.find(".wizard-card .image-list .btn").click(function(){
	    				$(this).parents('.form-group:first').find('.selected').removeClass('selected');
	    				$(this).addClass('selected');
	    				var data = $(this).attr("data-con");
	    				$(this).parents('.form-group:first').find('input[name=imageRef]').val(data);
	    			})
				},
				//详细信息 -绑定云主机数量spinbox
				VmNumsSpinbox : function(){
					require(['bs/spinbox'],function(){
	    				$('#setVmNums').spinbox({
		    					value: 1,
		    					min: 1,
		    					max: 5
	    				});
	    				$('#setVmNums').on('changed.bs.spinbox', function () {
	    					//同步currentChosenObj 第一次会执行两次，待解决
							currentChosenObj.prevNums = currentChosenObj.nums;
    				    	currentChosenObj.nums = $(this).spinbox('value');
    				    	//更新配额信息
							DataIniter.updateQuotaNums();
						})
	    			})
				},
				//vdc切换，需要加载可用域 可用网络，配额的数据
				vdcChange : function(){
					$('select.tenant_id').change(function(){
    					var current = $(this).children('option:selected');
				    	currentChosenObj.vdc = current.val();//同步currentChosenObj
				    	DataIniter.initAvailableZone();//重新加载可用域的数据
				    	DataIniter.initQuatos();//重新加载配额数据
				    	DataIniter.initAvailableNetWorks();//重新获取可用网络数据
				    	DataIniter.initKeyPairs();//加载可用密钥对
    				});
				},
				//规格change
				specsChange : function(){
					$('select.flavorRef').change(function(){
						var current = $(this).find('option:selected');
						//同步currentChosenObj
						currentChosenObj.prevSpecs = currentChosenObj.specs;
				    	currentChosenObj.specs = current;
						//重新加载详细信息提示
						DataIniter.initPopver();
						DataIniter.updateQuotaSpecs();
					})
				},
				//可用网络选择事件
				networkChosen : function(){
					//选择可用网络绑定点击事件,先移出之前绑定的事件，防止多次执行
					$(document).off("change","#vm-networks .select-subnet");
					$(document).on("change","#vm-networks .select-subnet",function(event){
						var that = $(this),
							subnet_id = that.children('option:selected').val();
						if(subnet_id){
							Common.xhr.ajax('resources/data/select.txt',function(ipList){
								var html = Common.uiSelect(ipList);
								that.parents('.list-group-item:first').find('select.select-subip').html(html);
							});
						}
					});
					//载入拖拽效果
					/*require(['jq/dragsort'], function() {
						 $(".available-network,.networks").dragsort({defaultSelector:"a", dragBetween: true,  placeHolderTemplate: "<a class='list-group-item'></a>",dragEnd: function(){
							 //拖下来
							 if($(this).parent().attr('data-listidx') == "1"){
								 $(this).find('i').hide();
								 currentChosenObj.networkId = $(this).find('span').html();
								 DataIniter.initSubNet();
							 }
							 
						 } });
					})*/
				},
				subnetChange : function(){
					$('select.select-sub-network').change(function(){
    					var current = $(this).children('option:selected');
				    	currentChosenObj.subnets = current;//同步currentChosenObj
						DataIniter.initFixedIp();
					})
				},
				//访问安全事件
				securitySetting : function(){
					wizard.el.find('ul.security-type a').click(function(){
	    				$(this).parent().siblings('.active').removeClass('active');
	    				$(this).parent().addClass('active');
	    				var name = $(this).html(),dataType = $(this).attr('data-type'),
	    					pwdCon = $(this).parents('.security-type:first').next();
	    				pwdCon.find('label[for=login-key]').html(name+':');
	    				pwdCon.find('div[data-for='+dataType+']').siblings('div').hide();
	    				pwdCon.find('div[data-for='+dataType+']').show();
					})
				},
				//初始化安全组的绑定checkbox
				initCheckBox : function(){
					$('input[type="checkbox"],input[type="radio"]').iCheck({
				    	checkboxClass: "icheckbox-info",
				        radioClass: "iradio-info"
				    })
				}
		};
		
		//重置CurrentChosenObj对象
		var resetCurrentChosenObj = function(){
			for(var key in currentChosenObj){
				currentChosenObj[key] = null;
			}
			currentChosenObj.nums = 1;
		}
		
		//增加按钮
	    $("#VmTable_wrapper span.btn-add").on("click",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/ccenter/vm/add.html',renderData,function(html){
				
				$('body').append(html);
				//同步currentChosenObj
		    	currentChosenObj.vdc = $('select.tenant_id').children('option:selected').val();
		    	currentChosenObj.specs = $('select.flavorRef').find('option:selected');
		    	//wizard show
    			$.fn.wizard.logging = true;
    			wizard = $('#create-server-wizard').wizard({
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
    				wizard.form.validate({
    						errorContainer: '_form',
    			            rules: {
    			            	'name': {
    			                    required: true,
    			                    minlength: 4,
    			                    maxlength:15
    			                }
    			            }
    				});
    			});
    			//确认信息卡片被选中的监听
    			wizard.cards.basic.on('selected',function(card){
    				//获取上几步中填写的值
				});
    			DataIniter.initAvailableZone();
    			DataIniter.initPopver();
    			DataIniter.initQuatos();
    			DataIniter.initSecurityGroup();
    			DataIniter.initAvailableNetWorks();
    			
    			//展现wizard，
    			
    			wizard.show();
    			EventsHandler.bindBasicWizard();
    			EventsHandler.vdcChange();
    			EventsHandler.specsChange();
    			EventsHandler.subnetChange();
				//spinbox
				EventsHandler.VmNumsSpinbox();
				EventsHandler.securitySetting();
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
    			
    			wizard.on("submit", function(wizard) {
//    				var serverData = {"server":{
//    					"name": $("#name").val(),
//    					"imageRef": 'ed18e2ce-a574-4ff0-8a00-6ef9d7dc4c2b',//$("#imageRef").val(),
//    					"flavorRef": '3',//$("#flavorRef").val(),
//    					"networks": [{
//    						"uuid": 'af8c1f42-b21c-4d13-bc92-1852e22f4f98'//,//$("#networks").val(),
//    						//"fixed_ip": '192.168.0.115'//$("#fixed_ip").val()
//    					}]
//    				}};
    				var serverData = {server:wizard.serializeObject()};
    				serverData.server.networks=[{
						"uuid": 'af8c1f42-b21c-4d13-bc92-1852e22f4f98'
						//"fixed_ip": '192.168.0.115'//$("#fixed_ip").val()
					}]
    				var fixed_ip = $("#fixed_ip").val();
    				if(fixed_ip!=null&&fixed_ip!="DHCP"){
    					serverData.server.networks=[{
	    						"uuid": 'af8c1f42-b21c-4d13-bc92-1852e22f4f98',
	    						"fixed_ip": '192.168.0.115'//$("#fixed_ip").val()
    					}]
    				}
    				Common.xhr.postJSON('/'+current_vdc_id+'/servers',serverData,function(data){
    					wizard._submitting = false;
    					wizard.updateProgressBar(100);
    					closeWizard();
    					Common.router.reload();
    				})
    			});

			})
	    });
	  //更多按钮
	    var EditData = {
	    		//编辑云主机名称弹框
	    	EditVmName : function(name){
	    		Common.render('tpls/ccenter/vm/vmname.html','',function(html){
	    			Modal.show({
	    	            title: '编辑云主机',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	Common.xhr.ajax('/resources/data/arrays.txt',function(data){
	    	                		if(data){
	    	                			alert("保存成功");
	    	                			dialog.close();
									}else{
										alert("保存失败");
									}
								})
	    	                }
	    	            }, {
	    	                label: '取消',
	    	                action: function(dialog) {
	    	                    dialog.close();
	    	                }
	    	            }],
	    	            onshown : function(){
	    	            	$("#editVmName input[name='name']").val(name);
	    	            }
	    	        });
	    		});
	    		
	    	},
	    	//编辑安全组弹框
	    	EditVmSecurity : function(id,cb){
				//取云主机列表
				Common.xhr.ajax('/resources/data/arrays.txt',function(data){
					
			    	//生成html数据
					Common.render('tpls/ccenter/vm/security.html',data,function(html){
						Modal.show({
		    	            title: '编辑安全组',
		    	            message: html,
		    	            nl2br: false,
		    	            buttons: [{
		    	                label: '保存',
		    	                action: function(dialog) {
		    	                	Common.xhr.ajax('/resources/data/arrays.txt',function(data){
		    	                		if(data){
		    	                			alert("保存成功");
								    		dialog.close();
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
		    	            onshown : cb  //Modal show后回调
		    	        });
					});
				})
	    	},
	    	//编辑虚拟机大小弹框
	    	EditVmType : function(id,cb){
	    		Common.render('tpls/ccenter/vm/vmdetail.html',renderData,function(html){
		    		Modal.show({
	    	            title: '编辑虚拟机大小',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	Common.xhr.ajax('/resources/data/arrays.txt',function(data){
	    	                		if(data){
	    	                			alert("保存成功");
	    	                			resetCurrentChosenObj();
							    		dialog.close();
									}else{
										alert("保存失败");
									}
	    	                	});
	    	                }
	    	            }, {
	    	                label: '取消',
	    	                action: function(dialog) {
	    	                	resetCurrentChosenObj();
	    	                    dialog.close();
	    	                }
	    	            }],
	    	            onshown : cb  //Modal show后回调
	    	        });
	    		});
	    	}
	    };
	    //修改云主机名称
	    $("ul.dropdown-menu a.editName").on("click",function(){
	    	require(['css!'+PubView.rqBaseUrl+'/css/dialog.css']);
	    	EditData.EditVmName($(this).attr("data"));
	    });
	    //编辑安全组
	    $("ul.dropdown-menu a.editSecurity").on("click",function(){
	    	require(['css!'+PubView.rqBaseUrl+'/css/dialog.css']);
	    	EditData.EditVmSecurity($(this).attr("data"),function(){
	    		//全部安全组双击事件
	    		$("#edit_vm_security .security-left").on("dblclick",function(){
	    			$(this).remove();
	    			$("ul[name='choosedSecurity']").append('<li class="p3"><span class="security-left">'+$(this).html()+'</span></li>');
	    		});
	    		//已选安全组双击事件
	    		$("#edit_vm_security .security-right").on("dblclick",function(){
	    			$(this).remove();
	    			$("ul[name='allSecurity']").append('<li class="p3"><span class="security-left">'+$(this).html()+'</span></li>');
	    		});
	    		//安全组search  
	    		$('#edit_vm_security .form-control').on('keypress',function(event){  
	    			var obj = $(this);
	    		    if(event.keyCode == "13") 
	    		    	Common.xhr.ajax('/resources/data/arrays.txt',function(data){
	    		    		var res = data.data;
	    		    		var text = "";
		    		    	for(var i = 0;i<res.length;i++){
		    		    		text += '<li class="p3"><span class="security-left">'+res[i].name+'</span></li>';
		    		    	}
		    		    	obj.parent().next().find("ul").html(text);
	    		    	});
	    		});
	    	});
	    });
	    //修改虚拟机大小
	    $("ul.dropdown-menu a.editVmType").on("click",function(){
	    	require(['css!'+PubView.rqBaseUrl+'/css/dialog.css']);
	    	//获取云主机个数,规格等信息
	    	Common.xhr.ajax('/resources/data/arrays.txt',function(data){
	    		data.nums = 1;
	    		data.vcd_id = "58c41046-408e-b959-d63147471w";
	    		data.vcd_name = "micro-2 (1vCPU / 1G)";
	    		currentChosenObj.nums = data.nums;  //data:云主机个数
	    		EditData.EditVmType($(this).attr("data"),function(){
	    			$("#editVmDetail div.col-sm:first").html(data.vcd_name);
	    			$("[name='flavorRef']").val(data.vcd_id);
	    			
		    		DataIniter.initPopver();
		    		DataIniter.initQuatos(data.vcd_id);  //data:vcd_id
		    		EventsHandler.specsChange();
		    	});
	    	})
	    });
	    
	    //删除云主机
	    $("ul.dropdown-menu a.delete").on("click",function(){
	    	var serverName = $(this).parents('tr:first').find('td.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	require(['css!'+PubView.rqBaseUrl+'/css/dialog.css']);
	    	Modal.confirm("你已经选择了 【"+serverName+"】 。 请确认您的选择。终止的云主机均无法恢复。",function(result){
	            if(result) {
	                Common.xhr.del('/'+current_vdc_id+'/servers/'+serverId,function(data){
	                	if(data.success||data.code==404){
	                		Modal.success("云主机【"+serverName+"】已终止！");
	                	}else{
	                		Modal.error("云主机【"+serverName+"】终止失败！");
	                	}
	                	Common.router.reload();
	                });	    		
	            }
	    	});
	    });
	}	
	return {
		init : init
	}
})
