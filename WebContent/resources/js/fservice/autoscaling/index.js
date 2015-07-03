define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var current_vdc_id = Common.cookies.getVdcId();
	var current_user_id = Common.cookies.getUid();
	var default_vdc_id = Common.cookies.getUser().defaultVdcId;
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,'tpls/fservice/autoscaling/list.html',"/resources/data/asgs.txt",function(html){
			bindEvent();
		});
		
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#VmTable'),
		    function($tar){
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
					Common.xhr.get('/image/v2/'+current_vdc_id+'/images',{'imageType':'image'},function(imageList){
						renderData.imageList = imageList;
					});
				},
				//快照列表,
				getSnapshot :  function(uid){
					Common.xhr.get('/image/v2/'+current_vdc_id+'/images',{'imageType':'snapshot'},function(snapShotList){
						renderData.snapshotList = snapShotList;
					});
				},
				//云硬盘列表
				getDisk : function(uid){
					Common.xhr.ajax('/block-storage/v2/'+current_vdc_id+'/bootable-volumes',function(diskList){
						renderData.diskList = diskList;
					});
				},
				//云硬盘快照列表
				getDiskSnapShot: function(uid){
					Common.xhr.ajax('/block-storage/v2/'+current_vdc_id+'/bootable-snapshots',function(diskSnapList){
						renderData.diskSnapList = diskSnapList;
					});
				},
				//vdc列表,获取完vdc列表后，需要去加载可用域的数据以及可用网络的数据和安全组的数据
				getVdc:function(){
					//管理员和普通租户的逻辑在此判断
					Common.xhr.ajax('/identity/v2.0/users/tenants/'+current_user_id,function(vdcDatas){
						for(var i=0;i<vdcDatas.length;i++){
							if(vdcDatas[i]["id"]==default_vdc_id){
								vdcDatas[i]["selected"]=true;
							}
						}
						renderData.vdcList = vdcDatas;
					});
				},
				//虚机规格
				getSpecs: function(){
					Common.xhr.ajax('/compute/v2/'+current_vdc_id+'/flavors/detail',function(flavors){
    					if(flavors&&flavors["error"]){
    						Modal.error(flavors.message)
    					}
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
						if(!data) {
							data = {};
						}
						data = data["availabilityZoneInfo"]||{};
						for(var i=0;i<data.length;i++){
							if(data[i]["zoneState"]["available"]){
								selectData.push({"name":data[i]["zoneName"]});
							}
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
			initQuatos : function(vdc_id,specs){
				vdc_id = vdc_id || currentChosenObj.vdc || $('select.tenant_id').find('option:selected').val();
				var curSpecs = {core:0,memory:0,nums:0};
				if(specs){
					//用于支持变更规格的情况，如果不输入，则认为是新建实例，否则认为是变更，在统计配额时应当减去当前配置
					curSpecs.core=specs.core;
					curSpecs.memory=specs.memory;
					curSpecs.nums=specs.nums;
				}
				if(vdc_id){
					//获取vdc的配额
					Common.xhr.ajax('/compute/v2/'+current_vdc_id+'/os-quota-sets/'+vdc_id,function(quotas){
						if(!quotas) {
							quotas = {};
						}
						quotas = quotas.quota_set||{};
						//获取vdc的配额使用情况
						Common.xhr.ajax('/compute/v2/'+vdc_id+'/limits',function(quotaUsages){
							//当前配额 等于 当前vdc下总配额 减去  当前选中规格的额度
							var current = currentChosenObj.specs;
							if(current && current.length){
								quotaUsages.cores = parseInt(quotaUsages.cores) + parseInt(current.attr('data-core')) - curSpecs.core;
								quotaUsages.ram = parseInt(quotaUsages.ram) + parseInt(current.attr('data-memory')) - curSpecs.memory;
								quotaUsages.instances = parseInt(quotaUsages.instances) + parseInt(currentChosenObj.nums) - curSpecs.nums;
							};
							var getMathRound = function(used,total){
								if(total==0||total==null||total==""){
									return 100;
								}
								return Math.round((parseInt(used)/parseInt(total))*100);
							}
							var getClass = function(rate){
								return rate <= 30 ? 'progress-bar-success' : rate >= 80 ? 'progress-bar-danger' : 'progress-bar-info';
							}
							var rateCore = getMathRound(quotaUsages.cores,quotas.cores),
							rateMemory = getMathRound(quotaUsages.ram,quotas.ram),
							rateNums = getMathRound(quotaUsages.instances,quotas.instances),
							styleCore = getClass(rateCore),styleMemory = getClass(rateMemory),styleNums=getClass(rateNums);
							var renderData = [
							        {
							        	name: 'core',title: '虚拟内核数量',total: quotas.cores, used: quotaUsages.cores, rate: rateCore, style: styleCore
							        },
							        {
							        	name: 'memory',title: '内存总计',total: quotas.ram, used: quotaUsages.ram, rate: rateMemory, style: styleMemory
							        },
							        {
							        	name: '',title: '云主机数量',total: quotas.instances, used: quotaUsages.instances, rate: rateNums, style: styleNums, className: 'nums'
							        }
							 ];
							//生成html数据
							Common.render('tpls/common/quota.html',renderData,function(html){
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
				Common.xhr.get('/networking/v2.0/networks',{"vdcId":vdc_id},function(data){
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
										Common.xhr.get('/networking/v2.0/subnets',{"networkId":netId},function(data){
											var selectData = [{id:"default",name:"默认子网"}].concat(data.subnets);
											var html = Common.uiSelect({list:selectData,className:'select-subnet'});
											$clone.append('<li class="pull-right fixedip"><select class="select-fixedip"><option>DHCP</option></select></li>');
											$clone.append('<li class="pull-right subnet">'+html+'</li>');
											dtd.resolve();
										});
										return dtd.promise();
									},
									delCall: function($clone){
										//去除角色窗及取消事件绑定
										$clone.children("li.fixedip").remove();
										$clone.children("li.subnet").remove();
									},
									allData: networks
							};
							choose.initChoose(options);
						});
						EventsHandler.subnetChange();
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
					//更新dom内容-info
					info.attr('data-used',used);
					info.find('span.quota-desc').html(total+'中的'+used+'已使用');
					//更新进度条
					progressBar.width(useRate+"%");
					progressBar.attr('aria-valuenow',useRate);
					progressBar.html(useRate+'%');
				});
				EventsHandler.checkNextWizard();
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
					//更新dom内容-info
					info.attr('data-used',used);
					info.find('span.quota-desc').html(total+'中的'+used+'已使用');
					//更新进度条
					progressBar.width(useRate+"%");
					progressBar.attr('aria-valuenow',useRate);
					progressBar.html(useRate+'%');
					this.updateQuotaSpecs(nData - oData);
				}
			},
			//载入安全组
			initSecurityGroup : function(){
				Common.xhr.get('/networking/v2.0/security-groups',{"vdcId":currentChosenObj.vdc},function(data){
			    	var dataArr = [];
					if(data && data.security_groups){
						for(var i=0,l=data.security_groups.length;i<l;i++){
							if(data.security_groups[i].name=='default'){
								dataArr.push('<label data-id="'+data.security_groups[i].id+'" data-name="'+data.security_groups[i].name+'"><input type="checkbox" checked>'+data.security_groups[i].name+'</></label>');
							}else{
								dataArr.push('<label data-id="'+data.security_groups[i].name+'" data-name="'+data.security_groups[i].name+'"><input type="checkbox">'+data.security_groups[i].name+'</label>');
							}
						}
						$('div.security-group').html(dataArr.join(''));
						EventsHandler.initCheckBox();
					}
				})
			},
			//密钥对
			initKeyPairs: function(){
				Common.xhr.ajax("/compute/v2/"+current_vdc_id+'/os-keypairs',function(keypairs){
					var keypairData = []
					if(keypairs&&keypairs["keypair"]){
						for(var i=0;i<keypairs["keypair"].length;i++){
							keypairData[i] = {value:keypairs["keypair"][i].name};
						}
					}
					var html = Common.uiSelect(keypairData);
			    	$('select.keypairs').html(html);
				});
			},
			//外部网络
			initExtNetwork: function(serverId){
				Common.xhr.getSync("/compute/v2/"+currentChosenObj.vdc+'/servers/'+serverId+'/list-floating-pools',function(data){
            		var poolList = []; 
					if(data){
						for (var i=0;i<data.length;i++) {
							poolList.push({"value":data[i].id,"name":data[i].name});
						}
					}
					var html = Common.uiSelect(poolList);
			    	$('select.ip-pools').html(html);
				});
			},
			
			//浮动IP
			initFloatingIp: function(serverId){
				var poolId = $('select.ip-pools').val();
        		Common.xhr.ajax("/compute/v2/"+currentChosenObj.vdc+'/servers/'+serverId+'/list-unallocated-floating-ips?network_id='+poolId,function(data){
            		var ipList = []; 
					if(data){
						for (var i=0;i<data.length;i++) {
							ipList.push({"value":data[i].id,"name":data[i].floating_ip_address});
						}
					}
					var html = Common.uiSelect(ipList);
			    	$('select.floating-ips').html(html);
			    	
				});
			},
			//网卡
			initNetworkInterface:function(serverId){
				Common.xhr.ajax("/compute/v2/"+currentChosenObj.vdc+'/servers/'+serverId+'/list-network-interfaces',function(data){
					var ncList = []; 
					if(data){
						for (var i=0;i<data.length;i++) {
							ncList.push({"value":data[i].port_id,"name":data[i].ip_address});
						}
					}
					var html = Common.uiSelect(ncList);
			    	$('select.network-interface').html(html);
			    	
				});
			}
			
		};
		
		//server name校验
	    $.validator.addMethod("serverName", function(value, element) {
	    	var optionalValue = this.optional(element);
	    	if(/[^\d]{1}[\u4e00-\u9fa5a-zA-Z0-9-]{3,}$/.test(value)&&value.indexOf("_")==-1){
	    		return true;
	    	}
	    	return false;
	    }, "名称至少包含4个字符，首字母不能是数字，不能包含下划线'_'");
		
		//载入后的事件
		var EventsHandler = {
				//基本信息所需事件
				bindBasicWizard : function(){
					//basic-1：动态获取镜像或者快照
					
					//获取默认选中的镜像id
    				$('#imageRef').val($('.image-list').find('.selected:first').attr('data-con'));
    				//处理镜像列表点击事件
	    			wizard.el.find(".wizard-card .image-source a").click(function() {
	    				var source = $(this).attr('data-image');
	    				$(this).parent().siblings('.active').removeClass('active');
	    				$(this).parent().addClass('active');
	    				$(this).parents('ul:first').siblings('div').each(function(){
	    					if($(this).attr('data-con') == source){
	    						$(this).removeClass('hide').addClass('show');
	    						//默认选中第一条
	    						$(this).parent().find('[data-con='+source+']').find('*:first').addClass('selected');
	    	    				$('#imageRef').val($(this).find('.selected:first').attr('data-con'));
	    					}else{
	    						$(this).removeClass('show').addClass('hide');
	    						$(this).find('.selected').removeClass('selected');
	    					}
	    				})
	    			});
	    			//basic 2：点击镜像列表添加选中
	    			wizard.el.find(".wizard-card .image-list .btn").click(function(){
	    				$(this).parents('.form-group:first').find('.selected').removeClass('selected');
	    				$(this).addClass('selected');
	    				var data = $(this).attr("data-con");
	    				$('#imageRef').val(data);
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
	    				$(document).off("changed.bs.spinbox","#setVmNums");
	    				$(document).on("changed.bs.spinbox","#setVmNums",function(event){
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
				    	DataIniter.initSecurityGroup();
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
				subnetChange : function(){
					//选择可用网络绑定点击事件,先移出之前绑定的事件，防止多次执行
					$(document).off("change","#vm-networks .select-subnet");
					$(document).on("change","#vm-networks .select-subnet",function(event){
						var that = $(this),
						subnetId = that.children('option:selected').val();
						if(subnetId){
							if(subnetId!='default'){
								Common.xhr.get('/networking/v2.0/subnets/'+subnetId+'/availableips',function(data){
									var selectData = [];
									for(var i=0;i<data.availableips.length;i++){
										selectData[i] = {id:data.availableips[i],name:data.availableips[i]};
									}
									var html = Common.uiSelect(selectData);
									that.parents('.list-group-item:first').find('select.select-fixedip').html(html);
								});
							}else{
								var selectData = [{id:"dhcp",name:"DHCP"}];
								var html = Common.uiSelect(selectData);
								that.parents('.list-group-item:first').find('select.select-fixedip').html(html);
							}
						}
					});
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
				},
				//表单校验
				snapshotFormValidator: function(){
					return $(".form-horizontal").validate({
			            rules: {
			            	'name': {
			            		required: true,
			                    minlength: 4,
			                    maxlength:255
			                },
			                'imageRef':{
			                	required: true,
			                    minlength: 1,
			                    ignore: ""
			                },
			                'public_key':{
			                	required: true
			                }
			            }
			        });
				},
		};
		
		//重置CurrentChosenObj对象
		var resetCurrentChosenObj = function(){
			for(var key in currentChosenObj){
				currentChosenObj[key] = null;
			}
			currentChosenObj.nums = 1;
		}
		
		//增加按钮
		$(document).off("click","#VmTable_wrapper span.btn-add");
	    $(document).on("click","#VmTable_wrapper span.btn-add",function(){
	    	//需要修改为真实数据源
			Common.render('tpls/fservice/vm/add.html',renderData,function(html){
				
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
    	            submitEnabled: [2,3,4],
    	            validate: {
	            		0: function(){
	            			return this.el.find('form').valid();
	            		}
    	            }
    			});
    			//加载时载入validate
    			wizard.on('show',function(){
    				$('input[id="name"]').focus();
    				wizard.form.each(function(){
    					$(this).validate({
    						ignore: "",
                            errorContainer: '_form',
                            rules: {
    			            	'name': {
    			                    required: true,
    			                    minlength: 4,
    			                    maxlength:15,
    			                    serverName: true
    			                },
    			                'imageRef': {
    			                    required: true,
    			                    minlength: 1
    			                }
    			            }
    					});
    				})
    			});
    			
    			//云主机名称 聚焦
    			wizard.cards.basic.on('selected',function(card){
    				setTimeout(function(){
    					$('input[id="name"]').focus();
    				},500)
    			});
    			
    			var getSecruityGroup = function(){
    				var data = [];
    				$('div.security-group').find('.icheckbox-info').each(function(){
    					if($(this).hasClass('checked')){
    						data.push({"id":$(this).parent().attr('data-id'),"name":$(this).parent().attr('data-name')})
    					}
    				});
    				return data;
    			}
    			
    			//确认信息卡片被选中的监听
    			wizard.cards.confirm.on('selected',function(card){
    				//获取上几步中填写的值
    				var serverData = wizard.serializeObject();
    				//取网络相关的数据
    				$('#vm-networks .list-group-select').children().each(function(i,item){
    					var network_uuid = $(item).find('li:first').attr('data-id');
    					var fixedIp = $(item).find('select.select-fixedip').children('option:selected').val();
    					$('.network-confirm').text("网络："+network_uuid+"            IP:"+fixedIp)
    				});
    				var sgGroupStr = ""
    				var sgGroup = getSecruityGroup();
    				for(var i=0;i<sgGroup.length;i++){
    					if(sgGroupStr==""){
    						sgGroupStr = sgGroup[i]["name"];
    					}else{
    						sgGroupStr = sgGroupStr + "," + sgGroup[i]["name"];
    					}
    				}
    				$('.name-confirm').text(serverData.name);
    				$('.image-confirm').text(serverData.imageRef);
    				$('.vdc-confirm').text(serverData.tenant_id);
    				$('.az-confirm').text(serverData.availability_zone);
    				$('.vmtype-confirm').text(serverData.flavorRef);
    				$('.num-confirm').text(serverData.min_count);
    				$('.keyname-confirm').text(serverData.key_name);
    				$('.securitygroup-confirm').text(sgGroupStr);
    				$('.userdata-confirm').text(serverData.user_data);
    				$('.diskconfig-confirm').text(serverData.auto_disk_config);
    				
				});
    			wizard.cards.detail.on('selected',function(card){
    				EventsHandler.checkNextWizard();
    			})
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
    			
                //下一步中进行数据的初始化
//                wizard.on("nextclick", function(wizard) {
//                    wizard.getActiveCard().enable()
//                    var index = wizard.getActiveCard().index;
//                    switch (index){
//                        case 6:
//                        	alert(6)
//                            break;
//                    }
//                });
    			
    			wizard.on("submit", function(wizard) {
    				
    				var serverData = {server:wizard.serializeObject()};
    				//取网络相关的数据
    				var networkData = [];
    				$('#vm-networks .list-group-select').children().each(function(i,item){
    					var network = {};
    					network.uuid = $(item).find('li:first').attr('data-id');
    					var fixedIp = $(item).find('select.select-fixedip').children('option:selected').val();
    					if(fixedIp!='DHCP'){
    						network.fixed_ip = fixedIp;
    					}
    					networkData.push(network);
    				});
    				serverData.server["networks"]=networkData;
    				serverData.server["security_groups"]=getSecruityGroup();
    				//提交请求
    				Common.xhr.postJSON(
    						"/compute/v2/"+current_vdc_id+'/servers/'+currentChosenObj.vdc,
    						serverData,
		    				function(data){
		    					wizard._submitting = false;
		    					wizard.updateProgressBar(100);
		    					closeWizard();
		    					Common.router.reload();
		    				},
		    				function(data){
		    					wizard.submitError();
		    					wizard.reset();
		    				})
    			});

			})
	    });
	}	
	return {
		init : init
	}
})
