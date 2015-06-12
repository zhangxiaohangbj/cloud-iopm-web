define(['Common','bs/modal','bs/wizard','bs/tooltip','jq/form/validator','jq/form/validator/addons/bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/ccenter/vm/list.html',
			data:'/9cc717d8047e46e5bf23804fc4400247/servers/page/1/10',
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
					'<span class="btn btn-add">接 入</span>'
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
					Common.xhr.ajax('/resources/data/image.txt',function(imageList){///v2/images
						renderData.imageList = imageList;
					});
				},
				//快照列表,
				getSnapshot :  function(uid){
					Common.xhr.ajax('/resources/data/image.txt',function(snapShotList){
						renderData.snapshotList = snapShotList;
					});
				},
				//云硬盘列表
				getDisk : function(uid){
					Common.xhr.ajax('/resources/data/image.txt',function(diskList){
						renderData.diskList = diskList;
					});
				},
				//云硬盘快照列表
				getDiskSnapShot: function(uid){
					Common.xhr.ajax('/resources/data/image.txt',function(diskSnapList){
						renderData.diskSnapList = diskSnapList;
					});
				},
				//vdc列表,获取完vdc列表后，需要去加载可用域的数据以及可用网络的数据和安全组的数据
				getVdc:function(){
					//管理员和普通租户的逻辑在此判断
					Common.xhr.ajax('/v2.0/tenants',function(vdcPage){
						renderData.vdcList = vdcPage.result;
					});
				},
				//虚机规格
				getSpecs: function(){
					Common.xhr.ajax('/cloud/v2/{tenant_id}/flavors/detail',function(specsList){
						renderData.specsList = specsList;
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
				vdc: null,	//当前vdc
				az: null,
				specs: null,	//当前选中规格
				prevSpecs: null,//上一个选中规格
				prevNums:null,	//上一个虚机数量
				nums: 1	//当前虚机数量
		};
		var wizard;
    	
    	//载入默认的数据 inits,创建数据载入类
		var DataIniter = {
			//根据vdc获取可用域数据
			initAvailableZone : function(){
				var vdc_id = currentChosenObj.vdc.val() || $('select.select-vdc').children('option:selected').val();
				if(vdc_id){
					Common.xhr.ajax('/v2/'+vdc_id+'/os-availability-zone',function(data){
						var selectData = [];
						for(var i=0;i<data.length;i++){
							selectData[i] = {"name":data[i]["zoneName"]};
						}
						var html = Common.uiSelect(selectData);
				    	$('select.select-available-zone').html(html);
				    	//同步currentChosenObj
				    	currentChosenObj.az = $('select.select-available-zone').children('option:selected');
					});
				}else{
					Modal.danger('尚未选择所属vdc');
				}
			},
			//init云主机规格的详细信息popver
			initPopver : function(){
				var current = currentChosenObj.specs || $('select.select-specs').find('option:selected');
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
				vdc_id = vdc_id || currentChosenObj.vdc.val() || $('select.select-vdc').find('option:selected').val();
				if(vdc_id){
					//先获取数据，进行加工后再去render
					Common.xhr.ajax('/resources/data/quota.txt',function(quotas){
						//当前配额 等于 当前vdc下总配额 减去  当前选中规格的额度
				    	var current = currentChosenObj.specs;
				    	if(current && current.length){
				    		quotas.core.used = parseInt(quotas.core.used) + parseInt(current.attr('data-core'));
    				    	quotas.memory.used = parseInt(quotas.memory.used) + parseInt(current.attr('data-memory'));
				    	};
				    	var getMathRound = function(used,total){
				    		return Math.round((parseInt(used)/parseInt(total))*100);
				    	}
				    	var getClass = function(rate){
				    		return rate <= 30 ? 'progress-bar-success' : rate >= 80 ? 'progress-bar-danger' : 'progress-bar-info';
				    	}
				    	var rateCore = getMathRound(quotas.core.used,quotas.core.total),
				    		rateMemory = getMathRound(quotas.memory.used,quotas.memory.total),
				    		rateNums = getMathRound(quotas.nums.used,quotas.nums.total),
				    		styleCore = getClass(rateCore),styleMemory = getClass(rateMemory),styleNums=getClass(rateNums);
				    	var renderData = {
				    			core: {
				    				total: quotas.core.total, used: quotas.core.used, rate: rateCore, style: styleCore
				    			},
				    			memory: {
				    				total: quotas.memory.total, used: quotas.memory.used, rate: rateMemory, style: styleMemory
				    			},
				    			nums: {
				    				total: quotas.nums.total, used: quotas.nums.used, rate: rateNums, style: styleNums
				    			}
				    	}
				    	//生成html数据
						Common.render('tpls/ccenter/vm/quota.html',renderData,function(html){
    						$('div.quotas').html(html);
    					});
					})
				}else{
					Modal.danger('尚未选择vdc');
				}
			},
			//根据vdc可用网络信息
			initAvailableNetWorks : function(){
				var vdc_id = currentChosenObj.vdc.val() || $('select.select-vdc').children('option:selected').val();
				Common.xhr.ajax('/v2.0/networks',function(networks){
					var dataArr = [];
					if(networks && networks.length){
						for(var i=0,l=networks.length;i<l;i++){
							dataArr.push('<a href="javascript:void(0);" data-index="'+(i+1)+'" class="list-group-item">');
							dataArr.push(''+networks[i].name+' (<span>'+networks[i].id+'</span>)');
							dataArr.push('<i class="fa fa-plus-circle fa-fw"></i></a>');
						}
						$('div.available-network').html(dataArr.join(''));
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
						Modal.danger($(this).find('.quota-key').html()+"超出配额");
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
						Modal.danger($(this).find('.quota-key').html()+'超出配额');
					}
				}
			},
			//载入安全组
			initSecurityGroup : function(){
				Common.xhr.ajax('/resources/data/select.txt',function(data){
			    	var dataArr = [];
					if(data && data.length){
						for(var i=0,l=data.length;i<l;i++){
							dataArr.push('<label><input type="checkbox">'+data[i].name+'</></label>');
						}
						$('div.security-group').html(dataArr.join(''));
						EventsHandler.initCheckBox();
					}
				})
			},
			//选中网络后初始化子网和IP
			initSubNet: function(){
				var networkId = currentChosenObj.networkId;
				if(networkId){
					Common.xhr.ajax('/v2.0/subnets',function(data){
						var selectData = {}
						for(var i=0;i<data.length;i++){
							selectData[i] = {"name":data[i]["zoneName"],"id":""}
						}
						var html = Common.uiSelect(selectData);
				    	$('select.select-available-zone').html(html);
				    	//同步currentChosenObj
				    	currentChosenObj.az = $('select.select-available-zone').children('option:selected');
					});
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
	    				$(this).parents('.form-group:first').find('input[name=image-id]').val(data);
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
					$('select.select-vdc').change(function(){
    					var current = $(this).children('option:selected');
				    	currentChosenObj.vdc = current;//同步currentChosenObj
				    	DataIniter.initAvailableZone();//重新加载可用域的数据
				    	DataIniter.initQuatos();//重新加载配额数据
				    	DataIniter.initAvailableNetWorks();//重新获取可用网络数据
    				});
				},
				//规格change
				specsChange : function(){
					$('select.select-specs').change(function(){
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
					//滑过出现添加图标
					$(document).off("mouseover mouseout",".available-network a.list-group-item");
					$(document).on("mouseover mouseout",".available-network a.list-group-item",function(event){
						if(event.type == "mouseover"){
							$(this).find('.fa').show();
						 }else if(event.type == "mouseout"){
							 $(this).find('.fa').hide();
						 }
					});
					//选择可用网络绑定点击事件,先移出之前绑定的事件，防止多次执行
					$(document).off("click",".available-network .list-group-item");
					$(document).on("click",".available-network .list-group-item",function(event){
						var clone = $(this).clone();
						clone.find('i').hide();
						$(this).remove();
						wizard.el.find('.chosen-network').append(clone);
						//网卡 指定子网和指定ip置为可用,
						$('input[name=network-card-name],select[name=select-sub-network],select[name=select-net-ip]').prop('disabled',false);
					});
					//载入拖拽效果
					require(['jq/dragsort'], function() {
						 $(".available-network,.chosen-network").dragsort({defaultSelector:"a", dragBetween: true,  placeHolderTemplate: "<a class='list-group-item'></a>",dragEnd: function(){
							 debugger
							 //拖下来
							 if($(this).parent().attr('data-listidx') == "1"){
								 $(this).find('i').hide();
								 currentChosenObj.networkId = $(this).find('span').html();
								 DataIniter.initSubNet()
							 }
							 
						 } });
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
				},
				//表单校验
				formValidator: function(){
					$(".form-horizontal").validate({
			            rules: {
			            	'server-name': {
			                    required: true,
			                    minlength: 4,
			                    maxlength:15
			                }
			            }
			        });
				},
				oninput: function(){
					$('.form-horizontal input[type=text],.form-horizontal input[type=password]').on('input propertychange',function(){
						var id = $(this).attr('id');
						if($("#"+id) && $("#"+id).length){
							if($(this).prop("disabled") == false && !$(".form-horizontal").validate().element("#"+id)){
								wizard.disableNextButton();
							}else{
								wizard.enableNextButton();
							}
						}
					});
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
		    	currentChosenObj.vdc = $('select.select-vdc').children('option:selected');
		    	currentChosenObj.specs = $('select.select-specs').find('option:selected');
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
    	            }
    			});
		    	
		    	
    			DataIniter.initAvailableZone();
    			DataIniter.initPopver();
    			DataIniter.initQuatos();
    			DataIniter.initSecurityGroup();
    			DataIniter.initAvailableNetWorks();
    			
    			//展现wizard，禁用下一步按钮
    			
    			wizard.show();
    			wizard.disableNextButton();
    			
    			EventsHandler.bindBasicWizard();
    			EventsHandler.vdcChange();
    			EventsHandler.specsChange();
				//spinbox
				EventsHandler.VmNumsSpinbox();
				EventsHandler.securitySetting();
				EventsHandler.formValidator();
				EventsHandler.oninput();
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
    				var serverData = {"server":{
    					"name": $("#server-name").val(),
    					"imageRef": 'ed18e2ce-a574-4ff0-8a00-6ef9d7dc4c2b',//$("#image-id").val(),
    					"flavorRef": '3',//$("#select-specs").val(),
    					"networks": [{
    						"uuid": 'af8c1f42-b21c-4d13-bc92-1852e22f4f98'//,//$("#chosen-network").val(),
    						//"fixed_ip": '192.168.0.115'//$("#select-net-ip").val()
    					}]
    				}};
//    				var fixed_ip = $("#select-net-ip").val();
//    				if(fixed_ip!=null&&fixed_ip!="DHCP"){
//    					serverData["networks"]={
//	    						"uuid": $("#chosen-network").val()
//    					}
//    				}
    				Common.xhr.postJSON('/9cc717d8047e46e5bf23804fc4400247/servers',serverData,function(data){
    					wizard._submitting = false;
    					wizard.updateProgressBar(100);
    					closeWizard();
    					Common.router.route();
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
	    	            	$("#editVmName input[name='server-name']").val(name);
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
	    			$("[name='select-specs']").val(data.vcd_id);
	    			
		    		DataIniter.initPopver();
		    		DataIniter.initQuatos(data.vcd_id);  //data:vcd_id
		    		EventsHandler.specsChange();
		    	});
	    	})
	    });
	}	
	return {
		init : init
	}
})
