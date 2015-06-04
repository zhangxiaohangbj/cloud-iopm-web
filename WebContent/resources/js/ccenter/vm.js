define(['Common','bs/modal','bs/wizard','bs/tooltip'],function(Common,Dialog){
	require(['css!'+PubView.rqBaseUrl+'/css/wizard.css']);
	var init = function(){
		Common.Deferred();
		Common.$pageContent.addClass("loading");
		//需要修改为真实数据源
		Common.render('tpls/ccenter/vm.html','/resources/data/arrays.txt',function(){
			 bindEvent();
	    	 Common.resolve(true);
		});
	};
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
			//dataTables
		Common.initDataTable($('#VmTable'),function($tar){
			$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">接 入</span>'
				);
			$tar.prev().find('.right-col:first').append(
				  '<select  class="select-envir form-control" data-initialize="iselect">'+
				  	  '<option selected>请选择环境</option>'+  
				  	  '<option>cow</option>'+
			          '<option>bull</option>'+
			          '<option>ASD</option>'+
			          '<option>Ble</option>'+
		          '</select>'
			);
			Common.$pageContent.removeClass("loading");
		});
		
		$("[data-toggle='tooltip']").tooltip();
		
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
	    //增加按钮
	    $(document).on("click","span.btn-add",function(){
	    	//需要修改为真实数据源
			Common.render(true,'tpls/ccenter/add.html',function(html){
				//维护当前select的值以及云主机数量，为更新配额以及vdc相关的数据用
				var currentChosenObj = {
						vdc: null,	//当前vdc
						az: null,
						specs: null,	//当前选中规格
						prevSpecs: null,//上一个选中规格
						prevNums:null,	//上一个虚机数量
						nums: 1	//当前虚机数量
				}
				
				if($('#create-server-wizard').length == 0){
    				$('body').append(html);
    			}
    			$.fn.wizard.logging = true;
    			var wizard = $('#create-server-wizard').wizard({
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
    			//载入默认的数据 inits,创建数据载入类
    			var DataIniter = (function(){
    				//镜像获取方法
    				var initImage =function(type){
    					Common.render(true,'tpls/ccenter/image.html','/resources/data/arrays.txt',function(html){
    						wizard.el.find(".wizard-card .image-list").html(html);
				    		//绑定basic所需事件
    				    	EventsBind.bindBasicWizard();
    					})
    				};
    				//虚拟数据中心获取,如果是管理员，获取所有的vdc，否则只获取租户默认在的vdc
    				var initVdc = function(cb){
    					//是管理员用户则获取所有的vdc
    					if(true){
    						Common.xhr.ajax('/resources/data/arrays.txt',function(data){
    							var html = '<option>input-section1</option>'+
										   '<option>input-section2</option>'+
										   '<option>input-section3</option>'+
										   '<option>input-section4</option>'+
										   '<option>input-section5</option>';
						    	$('select.select-vdc').html(html);
						    	//同步currentChosenObj
						    	currentChosenObj.vdc = $('select.select-vdc').children('option:selected');
						    	//绑定change事件
						    	EventsBind.vdcChange();
						    	cb && typeof cb === 'function' && cb();
							})
						}else{
							//取当前租户所在的vdc
    						var html = '<option>input-section5</option>';
    					    $('select.select-vdc').html(html);
    					    $('select.select-vdc').prop("disabled",true);
    					    //同步currentChosenObj
    				    	currentChosenObj.vdc = $('select.select-vdc').children('option:selected');
						}
    				};
    				//根据vdc获取可用域数据
    				var initAvailableZone = function(){
    					var vdc_id = currentChosenObj.vdc.val() || $('select.select-vdc').children('option:selected').val();
    					if(vdc_id){
    						Common.xhr.ajax('/resources/data/arrays.txt',function(data){
        						var html = '<option>input-section1</option>'+
    			    				    	'<option>input-section2</option>'+
    			    				    	'<option>input-section3</option>'+
    			    				    	'<option>input-section4</option>';
    					    	$('select.select-available-zone').html(html);
    					    	//同步currentChosenObj
    					    	currentChosenObj.az = $('select.select-available-zone').children('option:selected');
    						});
    					}else{
    						Dialog.danger('尚未选择所属vdc');
    					}
    				};
    				//云主机规格
    				var initVmSpecs = function(cb){
    					Common.xhr.ajax('/resources/data/arrays.txt',function(data){
    						var html = '<optgroup class="" label="micro">'+
			        					'<option  data-root-disk="15G" data-tmp-disk="0" data-memory="512MB" data-core="1" value="8abaa0f9-30e1">micro-1 (1vCPU / 512M)</option>'+
			        					'<option data-root-disk="15G" data-tmp-disk="0" data-memory="1024" data-core="1"  value="3332c026-533a">micro-2 (1vCPU / 1G)</option>'+
			     						'</optgroup>'+
				                        '<optgroup class="" label="standard">'+
						                    '<option data-root-disk="45G" data-tmp-disk="0" data-memory="10240" data-core="12"  value="8aaf699a-c760">standard-12 (12vCPU / 24G)</option>'+
						                    '<option data-root-disk="45G" data-tmp-disk="0" data-memory="20480" data-core="12"  value="d200524b-f8b1">standard-16 (16vCPU / 32G)</option>'+
						                 '</optgroup>'+
						                 '<optgroup class="" label="memory">'+
						                    '<option data-root-disk="45G" data-tmp-disk="0" data-memory="10240" data-core="12"   value="aa5987fe-6bf4">memory-8 (8vCPU / 32G)</option>'+
						                    '<option data-root-disk="45G" data-tmp-disk="0" data-memory="20480" data-core="12"   value="8e49d971-a306">memory-12 (12vCPU / 48G)</option>'+
						                 '</optgroup>'+
						                 '<optgroup class="" label="compute">'+
						                    '<option data-root-disk="45G" data-tmp-disk="0" data-memory="10240" data-core="12"   value="270a6d65-d1da">compute-8 (8vCPU / 8G)</option>'+
						                    '<option data-root-disk="45G" data-tmp-disk="0" data-memory="20480" data-core="12"   value="215ea357-2d56">compute-12 (12vCPU / 12G)</option>'+
						                 '</optgroup>';
					    	$('select.select-specs').html(html);
					    	//同步currentChosenObj
					    	currentChosenObj.specs = $('select.select-specs').find('option:selected');
					    	//云主机规格数据加载完成后绑定事件
					    	EventsBind.specsChange();
					    	cb && typeof cb === 'function' && cb();
						});
    				};
    				//init云主机规格的详细信息popver
    				var initPopver = function(){
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
    					var _$popover = $('[data-toggle="popover"]').data('bs.popover');
    					if(_$popover){
    						_$popover.options.content=tpl;
    					}else{
    						$('[data-toggle="popover"]').popover(popoverOptions);
    					}
    				};
    				//vdc的可用配额
    				var initQuotos = function(vdc_id){
    					vdc_id = vdc_id || currentChosenObj.vdc.val() || $('select.select-vdc').find('option:selected').val();
    					if(vdc_id){
    						//先获取数据，进行加工后再去render
    						Common.xhr.ajax('/resources/data/quota.txt',function(quotas){
    							//当前配额 等于 当前vdc下总配额 减去  当前选中规格的额度
	    				    	var current = currentChosenObj.specs;//$('select.select-specs').find('option:selected');
	    				    	if(current.length){
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
    							Common.render(true,'tpls/ccenter/quota.html',renderData,function(html){
            						wizard.el.find('div.quotas').html(html);
            					});
    						})
    					}else{
    						Dialog.danger('尚未选择vdc');
    					}
    				};
    				//根据vdc可用网络信息
    				var initAvailableNetWorks = function(){
    					var vdc_id = currentChosenObj.vdc.val() || $('select.select-vdc').children('option:selected').val();
    					Common.xhr.ajax('/resources/data/networks.txt',function(networks){
    						var dataArr = [];
    						if(networks && networks.length){
    							for(var i=0,l=networks.length;i<l;i++){
    								dataArr.push('<a href="javascript:void(0);" data-index="'+(i+1)+'" class="list-group-item">');
    								dataArr.push(''+networks[i].name+' (<span>'+networks[i].id+'</span>)');
    								dataArr.push('<i class="fa fa-plus-circle fa-fw"></i></a>');
    							}
    							$('div.available-network').html(dataArr.join(''));
	    				    	EventsBind.networkChosen();
    						}
    					})
    				};
    				//更新配额信息：内存和内核数
    				var updateQuotaSpecs = function(change){
    					if(change == 0){
    						return;
    					}
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
    							Dialog.danger($(this).find('.quota-key').html()+"超出配额");
    						}
    					})
    				};
    				//更新配额值,虚机数
    				var updateQuotaNums = function(){
    					var $this = $('div.quotas').children('.nums');
    						key = $this.attr('data'),
							info = $this.find('.progress-info'),
							progressBar = $this.find('.progress-bar'),
							total = parseInt(info.attr('data-all')),
							used = parseInt(info.attr('data-used')),
							oData = parseInt(currentChosenObj.prevNums) || 0;
							nData = parseInt(currentChosenObj.nums) || 0;
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
							Dialog.danger($(this).find('.quota-key').html()+'超出配额');
						}
    				};
    				//载入安全组
    				var initSecurityGroup = function(){
    					Common.xhr.ajax('/resources/data/networks.txt',function(data){
    						var html = '<label><input type="checkbox" class="selectAll"> Security Group1</label>'+
										'<label><input type="checkbox" class="selectAll"> Security Group2</label>'+
										'<label><input type="checkbox" class="selectAll"> Security Group3</label>'+
										'<label><input type="checkbox" class="selectAll"> Security Group4</label>';
					    	$('div.security-group').html(html);
					    	EventsBind.initCheckBox();
    					})
    				};
    				return {
    					initImage : initImage,
    					initVdc : initVdc,
    					initAvailableZone : initAvailableZone,
    					initVmSpecs : initVmSpecs,
    					initPopver : initPopver,
    					initQuotos : initQuotos,
    					updateQuotaSpecs : updateQuotaSpecs,
    					updateQuotaNums : updateQuotaNums,
    					initSecurityGroup : initSecurityGroup,
    					initAvailableNetWorks : initAvailableNetWorks
    				}
    			})();
    			//init1：获取镜像的数据
    			DataIniter.initImage('image');
    			
    			//init2:载入详细设置里面的数据，可用域,可用网络
				setTimeout(function(){
					//载入vdc,完成之后回调方法中去初始化可用域以及可用网络的数据
					DataIniter.initVdc(function(){
						//数据中心数据得到后，去加载可用域的数据以及可用网络的数据
    					DataIniter.initAvailableZone();
    					//可用网络
    					DataIniter.initAvailableNetWorks();
    					//安全组
    					DataIniter.initSecurityGroup();
					});
					//初始化云主机规格,完成后去绑定popver提示
					DataIniter.initVmSpecs(function(){
						//执行配额的初始化操作,因为需要在配额中减去当前规格所需的资源，所以在此初始化配额
				    	DataIniter.initQuotos();
				    	//载入规格详细信息提示popver
				    	DataIniter.initPopver();
					});
				},200);
				
				var EventsBind = {
						//基本信息所需事件
						bindBasicWizard : function(){
							//basic-1：动态获取镜像或者快照
			    			wizard.el.find(".wizard-card .image-source a").click(function() {
			    				var type = $(this).attr("data-image");
			    				$(this).parent().siblings('.active').removeClass('active');
			    				$(this).parent().addClass('active');
			    				DataIniter.initImage(type);
			    			});
			    			//basic 2：点击镜像列表添加选中
			    			wizard.el.find(".wizard-card .image-list .btn").click(function(){
			    				$(this).siblings('.selected').removeClass('selected');
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
			    					//第一次会执行两次，待解决
			    					//同步currentChosenObj
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
		    					//同步currentChosenObj
	    				    	currentChosenObj.vdc = current;
		    					//重新加载可用域的数据
	    				    	DataIniter.initAvailableZone();
	    				    	//重新加载配额数据
	    				    	DataIniter.initQuotos();
	    				    	//重新获取可用网络数据
	    				    	DataIniter.initAvailableNetWorks();
	    				    	
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
							$(document).on("mouseover mouseout","a.list-group-item",function(event){
								if(event.type == "mouseover"){
									$(this).find('.fa').show();
								 }else if(event.type == "mouseout"){
									 $(this).find('.fa').hide();
								 }
							})
							//选择可用网络绑定点击事件
							wizard.el.find(".available-network .list-group-item").click(function(){
								if("true" != $(this).attr('has-chosen')){
									var clone = $(this).clone();
									clone.find('i').removeClass('fa-plus-circle').addClass('fa-minus-circle').css('display','none');
    								wizard.el.find('.chosen-network').append(clone);
    								$(this).attr('has-chosen',"true");
    								//网卡 指定子网和指定ip置为可用,先挨个执行，需添加共用方法，ReviewDom(['.class','#ddd'],'css-key','css-value')
    								$('input[name=network-card-name]').prop('disabled',false);
    								$('select[name=select-sub-network]').prop('disabled',false);
    								$('select[name=select-net-ip]').prop('disabled',false);
								}else{
									alert('已选择');
								}
							});
							//删除已选网络点击事件
							$(document).on("click",".chosen-network a.list-group-item i",function(event){
								var index = $(this).parent().attr('data-index');
								wizard.el.find(".available-network a[data-index="+index+"]").attr("has-chosen","false");
								$(this).parent().remove();
								//如果没有已选，则网卡 指定子网和指定ip置为disabled
								if(wizard.el.find('.chosen-network').children().length == 0){
									$('input[name=network-card-name]').prop('disabled',true);
    								$('select[name=select-sub-network]').prop('disabled',true);
    								$('select[name=select-net-ip]').prop('disabled',true);
								}
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
				}
				//spinbox
				EventsBind.VmNumsSpinbox();
				EventsBind.securitySetting();

    			wizard.on('closed', function() {
    				$('div.wizard').remove();
    				$('div.modal-backdrop').remove();
    			});

    			wizard.on("submit", function(wizard) {
    				var submit = {
    					"hostname": $("#new-server-fqdn").val()
    				};
    				
    				this.log('seralize()');
    				this.log(this.serialize());
    				this.log('serializeArray()');
    				this.log(this.serializeArray());
    		
    				setTimeout(function() {
    					wizard.trigger("success");
    					wizard.hideButtons();
    					wizard._submitting = false;
    					wizard.showSubmitCard("success");
    					wizard.updateProgressBar(0);
    				}, 2000);
    			});
    			
			});
	    });
	    
	  //更多按钮
	    var EditData = {
	    		//编辑云主机名称弹框
	    	EditVmName : function(name){
	    		Dialog.show({
	    	            title: '编辑云主机',
	    	            message: '<form class="form-horizontal"><div class="form-group"><label for="server-name" class="control-label col-sm-2">'+
	    	            		'<span style="color: red;">* </span>名称：</label><div class="col-sm-7 col-sm">'+
								'<input type="text" class="wizard-form-control" id="server-name" name="server-name" value="'+name+'"></div></div></form>',
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	Common.xhr.ajax('/resources/data/arrays.txt',function(data){
	    	                		if(data){
	    	                			dialog.success("保存成功");
							    		dialog.close();
									}else{
										dialog.danger("保存失败");
									}
								})
	    	                }
	    	            }, {
	    	                label: '取消',
	    	                action: function(dialog) {
	    	                    dialog.close();
	    	                }
	    	            }]
	    	        });
	    	},
	    	//编辑安全组弹框
	    	EditVmSecurity : function(id,cb){
				//取云主机列表
				Common.xhr.ajax('/resources/data/arrays.txt',function(data){
					
			    	//生成html数据
					Common.render(true,'tpls/ccenter/security.html',data,function(html){
						Dialog.show({
		    	            title: '编辑安全组',
		    	            message: html,
		    	            nl2br: false,
		    	            buttons: [{
		    	                label: '保存',
		    	                action: function(dialog) {
		    	                	Common.xhr.ajax('/resources/data/arrays.txt',function(data){
		    	                		if(data){
		    	                			dialog.success("保存成功");
								    		dialog.close();
										}else{
											dialog.danger("保存失败");
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
	    	EditVmType : function(id){
	    		
	    		require(['template','text!'+PubVars.contextPath+'/resources/tpls/ccenter/vmdetail.html'],function(template,tpl){
	    			//初始化云主机规格,完成后去绑定popver提示
					DataIniter.initVmSpecs(function(){
						//执行配额的初始化操作,因为需要在配额中减去当前规格所需的资源，所以在此初始化配额
				    	DataIniter.initQuotos();
				    	//载入规格详细信息提示popver
				    	DataIniter.initPopver();
					});
	    		});
	    	}
	    };
	    //修改云主机名称
	    $(document).on("click","ul.dropdown-menu a.editName",function(){
	    	EditData.EditVmName($(this).attr("data"));
	    });
	    //编辑安全组
	    $(document).on("click","ul.dropdown-menu a.editSecurity",function(){
	    	EditData.EditVmSecurity($(this).attr("data"),function(){
	    		//右移按钮
	    		$("span.btn-add-security").on("click",function(){
	    			var securityName = $("select[name='allSecurity']").val();
	    			if(securityName != null){
	    			$("select[name='allSecurity'] option:selected").remove();
	    			/* var strArr = securityName.split(",");
	    			for(var i=0;i<strArr.length;i++){
	    				alert(111);
	    			} */
	    			$("select[name='choosedSecurity']").append('<option value="'+securityName+'">'+securityName+'</option>');
	    			}else{
	    				Dialog.warning("请选择正确的安全组");
	    			}
	    		});
	    		//左移按钮
	    		$("span.btn-remove-security").on("click",function(){
	    			var securityName = $("select[name='choosedSecurity']").val();
	    			if(securityName != null){
	    				$("select[name='choosedSecurity'] option:selected").remove();
	    				$("select[name='allSecurity']").append('<option value="'+securityName+'">'+securityName+'</option>');
	    			}else{
	    				Dialog.warning("请选择正确的安全组");
	    			}
	    		});
	    		//筛选按钮
	    		$(document).on("click","span.btn-choose",function(){
	    			var obj = $(this);
	    			Common.xhr.ajax('/resources/data/arrays.txt',function(data){
	    				if(data){
				    		var text = "";
				    		var res = data.data;
				    		for(var i = 0;i<res.length;i++){
				    			text+="<option value="+res[i].id+">"+res[i].id+"</option>";
				    		}
				    		obj.parent().next().html(text);
						}else{
							Dialog.warning("筛选失败");
						}
	    			})
	    			
	    		});
	    	});
    		
	    });
	    //修改云主机大小
	    $(document).on("click","ul.dropdown-menu a.editVmType",function(){
	    	EditData.EditVmType($(this).attr("data"));
	    });
	}
	return {
		init : init
	}
})
