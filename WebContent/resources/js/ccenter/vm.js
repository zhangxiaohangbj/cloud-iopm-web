define(function(){
	var init = function(){
		PubView.activeSideBar(2);	//左侧导航选中
		$('.page-content').addClass("loading");
		//需要修改为真实数据源
		require(['template','text!'+PubVars.contextPath+'/resources/tpls/ccenter/vm.tpl'],function(template,tpl){
			try{
				//取云主机列表
				$.ajax({
				    url: PubVars.contextPath+'/resources/data/arrays.txt',// 跳转到 action    
				    data:{
				    	//type : type
				    },    
				   // type:'POST',    
				    dataType:'json',    
				    success:function(data) {
				    	if(data){
				    		var render = template.compile(tpl);
							$('.page-content').html(render(data));
							//bind events
					    	 bindEvent();
						}else{
							$('.page-content').html('<p class="error-tips text-danger">数据已全部加载</p>');
						}
				    }
				});
				
			}catch(e){
				$('.page-content').html('<p class="error-tips text-danger">数据解析出错，请稍后再试…</p>');
			}
			
		});
		
	}
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
			//dataTables
		Initializer.initDataTable($('#VmTable'),function($tar){
				$tar.prev().find('.left-col:first').append(
					'<span class="btn btn-add">接 入</span>'+
					'<div class="dropdown">'+
						'<span class="btn btn-more dropdown-toggle" data-toggle="dropdown">更 多 <i class="fa fa-angle-down fa-fw"></i></span>'+
						'<ul class="dropdown-menu">'+
							'<li><a href="#"><i class="fa fa-file-text fa-fw"></i>成员管理</a></li>'+
							'<li><a href="#"><i class="fa fa-gear fa-fw"></i>配额管理</a></li>'+
							'<li><a href="#"><i class="fa fa-file-text fa-fw"></i>可用分区</a></li>'+
							'<li><a href="#"><i class="fa fa-file-text fa-fw"></i>外部网络</a></li>'+
							'<li><a href="#"><i class="fa fa-file-text fa-fw"></i>使用情况</a></li>'+
							'<li><a href="#"><i class="fa fa-file-text fa-fw"></i>删除</a></li>'+
						'</ul>'+
					'</div>'
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
				$('.page-content').removeClass("loading");
		});
		//tooltip
		require(['bs/tooltip'],function(){
			$("[data-toggle='tooltip']").tooltip();
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
	    //增加按钮
	    $(document).on("click","span.btn-add",function(){
	    	require(['text!'+PubVars.contextPath+'/resources/tpls/ccenter/add.tpl','bs/wizard'],function(html){
	    			require(['css!'+PubVars.contextPath+'/resources/css/wizard.css'],function(){
	    				//维护当前select的值以及云主机数量，为更新配额以及vdc相关的数据用
	    				var currentChosenObj = {
	    						vdc: null,
	    						az: null,
	    						specs: null,
	    						nums: 1
	    				}
	    				
	    				if($('#create-server-wizard').length == 0){
		    				$('body').append(html);
		    			}
		    			$.fn.wizard.logging = true;
		    			var wizard = $('#create-server-wizard').wizard({
		    				keyboard : false,
		    				contentHeight : 526,
		    				contentWidth : 900,
		    				submitUrl: "http://localhost:18080/cloud-web/views/ccenter.jsp",
		    				showCancel: true,
		    				backdrop: 'static',
		    				buttons: {
		    	                cancelText: "取消",
		    	                nextText: "下一步",
		    	                backText: "上一步",
		    	                submitText: "提交",
		    	                submittingText: "提交中...",
		    	            },
		    			});
		    			wizard.show();
		    			//载入默认的数据 inits,创建数据载入类
		    			var DataIniter = (function(){
		    				//镜像获取方法
		    				var initImage = function(type){
		    					$.ajax({
			    				    url: PubVars.contextPath+'/resources/data/arrays.txt',// 跳转到 action    
			    				    data:{
			    				    	type : type
			    				    },    
			    				   // type:'POST',    
			    				    dataType:'json',    
			    				    success:function(data) {
			    				    	var html = '<div class="btn" data-con="CentOS 5.8 64bit"><i class="image-icon-default centos"></i>CentOS 5.8 64bit</div>'+
												   '<div class="btn" data-con="CentOS 5.11 64bit"><i class="image-icon-default centos"></i>CentOS 5.11 64bit</div>'+
													'<div class="btn" data-con="CentOS 5.11 64bit"><i class="image-icon-default centos"></i>CentOS 5.11 64bit</div>'+
													'<div class="btn" data-con="Ubuntu 14.04 64bit"><i class="image-icon-default ubuntu"></i>Ubuntu 14.04 64bit</div>'+
													'<div class="btn hook" data-con="Windows Server 2003 R2 Enterprise 32bit (cn) (Not Activated)"><i class="image-icon-default windows"></i>Windows Server 2003 R2 Enterprise 32bit (cn) (Not Activated)</div>';
			    				    	wizard.el.find(".wizard-card .image-list").html(html);
			    				    	//绑定basic所需事件
			    				    	EventsBind.bindBasicWizard();
			    				    }
			    				});
		    				};
		    				//虚拟数据中心获取,如果是管理员，获取所有的vdc，否则只获取租户默认在的vdc
		    				var initVdc = function(cb){
		    					//是管理员用户则获取所有的vdc
		    					if(true){
		    						$.ajax({
		    	    				    url: PubVars.contextPath+'/resources/data/arrays.txt',// 跳转到 action    
		    	    				    data:{ 
		    	    				    },    
		    	    				   // type:'POST',    
		    	    				    dataType:'json',    
		    	    				    success:function(data){
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
		    	    				    }
		    	    				});
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
		    				var initAvailableZone = function(vdc_id){
		    					$.ajax({
	    	    				    url: PubVars.contextPath+'/resources/data/arrays.txt',// 跳转到 action    
	    	    				    data:{ 
	    	    				    	vdc_id : vdc_id
	    	    				    },
	    	    				   // type:'POST',    
	    	    				    dataType:'json',    
	    	    				    success:function(data){
	    	    				    	var html = '<option>input-section1</option>'+
				    	    				    	'<option>input-section2</option>'+
				    	    				    	'<option>input-section3</option>'+
				    	    				    	'<option>input-section4</option>';
	    	    				    	$('select.select-available-zone').html(html);
	    	    				    	//同步currentChosenObj
	    	    				    	currentChosenObj.az = $('select.select-available-zone').children('option:selected');
	    	    				    }
	    	    				});
		    				};
		    				//云主机规格
		    				var initVmSpecs = function(cb){
		    					$.ajax({
	    	    				    url: PubVars.contextPath+'/resources/data/arrays.txt',// 跳转到 action    
	    	    				    data:{ 
	    	    				    	//vdc_id : vdc_id
	    	    				    },
	    	    				   // type:'POST',    
	    	    				    dataType:'json',    
	    	    				    success:function(data){
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
	    	    				    	currentChosenObj.specs = $('select.select-specs').children('option:selected');
	    	    				    	//云主机规格数据加载完成后绑定事件
	    	    				    	EventsBind.specsChange();
	    	    				    	cb && typeof cb === 'function' && cb();
	    	    				    }
	    	    				});
		    				};
		    				//init云主机规格的详细信息popver
		    				var initPopver = function(current){
		    					current = current || $('select.select-specs').find('option:selected');
		    					var	rootDisk = current.attr('data-root-disk'),
		    						tmpDisk = current.attr('data-tmp-disk'),
		    						memory = current.attr('data-memory'),
		    						core = current.attr('data-core');
		    					var popoverOptions = {
	    			    				html: true,
	    			    				content: '<div class="popver-tips"><p>名称：'+current.html()+'</p><p>根磁盘：'+rootDisk+',  临时磁盘： '+tmpDisk+'</p><p>内存：'+memory+'  核数 :'+core+'</p></div>',
	    			    				trigger: 'hover',
	    			    				delay: {
	    			    					hide: 500
	    			    				}
	    			    			};
		    					var _$popover = $('[data-toggle="popover"]').data('bs.popover');
		    					if(_$popover){
		    						var html = '<div class="popver-tips"><p>名称：'+current.html()+'</p><p>根磁盘：'+rootDisk+',  临时磁盘： '+tmpDisk+'</p><p>内存：'+memory+'  核数 :'+core+'</p></div>';
		    							_$popover.options.content=html;
		    					}else{
		    						$('[data-toggle="popover"]').popover(popoverOptions);
		    					}
		    					
		    				};
		    				//vdc的可用配额
		    				var initQuotos = function(vdc_id){
		    					vdc_id = vdc_id || $('select.select-vdc').children('option:selected').val();
		    					if(vdc_id){
		    						$.ajax({
		    	    				    url: PubVars.contextPath+'/resources/data/arrays.txt',// 跳转到 action    
		    	    				    data:{ 
		    	    				    	vdc_id : vdc_id
		    	    				    },
		    	    				   // type:'POST',    
		    	    				    dataType:'json',    
		    	    				    success:function(data){
		    	    				    	var quotas = {
		    	    				    			core : {
		    	    				    				total : 200,
		    	    				    				used : 176
		    	    				    			},
		    	    				    			memory : {
		    	    				    				total : 512000,
		    	    				    				used : 235016
		    	    				    			},
		    	    				    			nums : {
		    	    				    				total : 100,
		    	    				    				used : 26
		    	    				    			}
		    	    				    	};
		    	    				    	
		    	    				    	//当前配额 等于 当前vdc下总配额 减去  当前选中规格的额度
		    	    				    	var current = $('select.select-specs').find('option:selected');
		    	    				    	if(current.length){
		    	    				    		var current_core = parseInt(current.attr('data-core')),
		    	    				    			current_memory = parseInt(current.attr('data-memory'));
		    	    				    		quotas.core.used = parseInt(quotas.core.used) - current_core;
			    	    				    	quotas.memory.used = parseInt(quotas.memory.used) - current_memory;
		    	    				    	};
		    	    				    	//生成html数据
		    	    				    	var rateCore = Math.round((parseInt(quotas.core.used)/parseInt(quotas.core.total))*100),
		    	    				    		rateMemory = Math.round((parseInt(quotas.memory.used)/parseInt(quotas.memory.total))*100),
		    	    				    		rateNums = Math.round((parseInt(quotas.nums.used)/parseInt(quotas.nums.total))*100),
		    	    				    		styleCore = rateCore <= 30 ? 'progress-bar-success' : rateCore >= 80 ? 'progress-bar-danger' : 'progress-bar-info';
		    	    				    		styleMemory = rateMemory <= 30 ? 'progress-bar-success' : rateMemory >= 80 ? 'progress-bar-danger' : 'progress-bar-info';
		    	    				    		styleNums = rateNums <= 30 ? 'progress-bar-success' : rateNums >= 80 ? 'progress-bar-danger' : 'progress-bar-info';
		    	    				    	var html = '<div class="core-quota">'+
															'<div class="progress-info clearfix" data-all="'+quotas.core.total+'" data-used="'+quotas.core.used+'">'+
															  	'<span class="quota-key">虚拟内核数量</span>'+
															  	'<span  class="quota-desc">'+quotas.core.total+'个中的'+quotas.core.used+'个已使用</span>'+
															'</div>'+
															'<div class="progress">'+
																'<div class="progress-bar '+styleCore+'" role="progressbar" aria-valuenow="'+rateCore+'" aria-valuemin="0" aria-valuemax="100" style="width: '+rateCore+'%;">'+
																    ''+rateCore+'%'+
																'</div>'+
															'</div>'+
														'</div>'+
														
														'<div class="memory-quota">'+
															'<div class="progress-info clearfix" data-all="'+quotas.memory.total+'" data-used="'+quotas.memory.used+'">'+
															  	'<span class="quota-key">内存总计</span>'+
															  	'<span  class="quota-desc">'+quotas.memory.total+'中的'+quotas.memory.used+'已使用</span>'+
															'</div>'+
															'<div class="progress">'+
																'<div class="progress-bar '+styleMemory+'" role="progressbar" aria-valuenow="'+rateMemory+'" aria-valuemin="0" aria-valuemax="100" style="width: '+rateMemory+'%;">'+
																''+rateMemory+'%'+
																'</div>'+
															'</div>'+
														'</div>'+
														
														'<div class="vm-nums-quota">'+
															'<div class="progress-info clearfix" data-all="'+quotas.nums.total+'" data-used="'+quotas.nums.used+'">'+
															  	'<span class="quota-key">云主机数量</span>'+
															  	'<span  class="quota-desc">'+quotas.nums.total+'中的'+quotas.nums.used+'已使用</span>'+
															'</div>'+
															'<div class="progress">'+
																'<div class="progress-bar '+styleNums+'" role="progressbar" aria-valuenow="'+rateNums+'" aria-valuemin="0" aria-valuemax="100" style="width: '+rateNums+'%;">'+
																''+rateNums+'%'+
																'</div>'+
															'</div>'+
														'</div>';
		    	    				    	
		    	    				    	$('div.quotas').html(html);
		    	    				    }
		    	    				});
		    					}else{
		    						alert("尚未选择虚拟数据中心");
		    					}
		    					
		    				};
		    				//根据vdc可用网络信息
		    				var initAvailableNetWorks = function(vdc_id){
		    					$.ajax({
	    	    				    url: PubVars.contextPath+'/resources/data/arrays.txt',// 跳转到 action    
	    	    				    data:{ 
	    	    				    	vdc_id : vdc_id
	    	    				    },
	    	    				   // type:'POST',    
	    	    				    dataType:'json',    
	    	    				    success:function(data){
	    	    				    	var html = '<a href="#" class="list-group-item">'+
														  'private (<span>58c41046-408e-b959-d63147471b</span>)'+
														  '<i class="fa fa-plus-circle fa-fw"></i>'+
													  '</a>'+
													  '<a href="#" class="list-group-item">'+
														  'facilisis (<span>58c41046-408e-b959-d63147471b</span>)'+
														  '<i class="fa fa-plus-circle fa-fw"></i>'+
													 '</a>'+
													  '<a href="#" class="list-group-item">'+
														  'risus (<span>58c41046-408e-b959-d63147471b</span>)'+
														  '<i class="fa fa-plus-circle fa-fw"></i>'+
													  '</a>'+
													  '<a href="#" class="list-group-item">'+
													  'consectr (<span>58c41046-408e-b959-d63147471b</span>)'+
													  '<i class="fa fa-plus-circle fa-fw"></i>'+
													  '</a>';
	    	    				    	$('div.available-network').html(html);
	    	    				    	$('.list-group-item').hover(function(){
	    	    		    				$(this).find('.fa').show();
	    	    		    			},function(){
	    	    		    				$(this).find('.fa').hide();
	    	    		    			})
	    	    				    }
	    	    				});
		    				};
		    				
		    				return {
		    					initImage : initImage,
		    					initVdc : initVdc,
		    					initAvailableZone : initAvailableZone,
		    					initVmSpecs : initVmSpecs,
		    					initPopver : initPopver,
		    					initQuotos : initQuotos,
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
		    					var cur_vdc = $('select.select-vdc').children('option:selected').val();
		    					DataIniter.initAvailableZone(cur_vdc);
		    					//可用网络
		    					DataIniter.initAvailableNetWorks(cur_vdc);
	    					});
	    					//初始化云主机规格,完成后去绑定popver提示
	    					DataIniter.initVmSpecs(function(){
	    						//执行配额的初始化操作,因为需要在配额中减去当前规格所需的资源，所以在此初始化配额
	    				    	DataIniter.initQuotos();
	    				    	//载入规格详细信息提示popver
	    				    	DataIniter.initPopver();
	    					});
	    					
	    				},500);
	    				
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
	    			    			})
	    						},
	    						//vdc切换，需要加载可用域 可用网络，配额的数据
	    						vdcChange : function(){
	    							$('select.select-vdc').change(function(){
	    		    					var current = $(this).children('option:selected').val();
	    		    					//重新加载可用域的数据
			    				    	DataIniter.initAvailableZone(current);
			    				    	//重新加载配额数据
			    				    	DataIniter.initQuotos(current);
			    				    	//重新获取可用网络数据
			    				    	DataIniter.initAvailableNetWorks(current);
	    		    				});
	    						},
	    						//规格change
	    						specsChange : function(){
	    							$('select.select-specs').change(function(){
	    								var current = $(this).find('option:selected');
	    								//重新加载详细信息提示
	    								DataIniter.initPopver(current);
	    								//重新计算配额值
	    								var core = parseInt(current.attr('data-core')),
	    									memory = parseInt(current.attr('data-memory')),
	    									$core = $('div.core-quota'),
	    									$memory = $('div.memory-quota');
	    								//更新core
	    								//var width = parseInt($core)
	    								//$core.width($core.)
	    							})
	    						}
	    						
	    				}
		    			
	    				//spinbox
	    				EventsBind.VmNumsSpinbox();
	    				
		    			
		    			$('input[type="checkbox"],input[type="radio"]').iCheck({
					    	checkboxClass: "icheckbox-info",
					        radioClass: "iradio-info"
					    })
		    			

		    			wizard.on('closed', function() {
		    				$('div.wizard').remove();
		    				$('div.modal-backdrop').remove();
		    			});

		    			/*wizard.on("submit", function(wizard) {
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
		    			});*/
		    			
		    			wizard.el.find(".wizard-success .im-done").click(function() {
		    				$('div.wizard').remove();
		    				$('div.modal-backdrop').remove();
		    			});
		    		
		    			wizard.el.find(".wizard-success .create-another-server").click(function() {
		    				wizard.reset();
		    			});
		    		
		    			$(".wizard-group-list").click(function() {
		    				alert("Disabled for demo.");
		    			});
	    			})

			});
	    });
	}
	return {
		init : init
	}
})
