define(function(){
	var init = function(){
		PubView.activeSideBar(2);	//左侧导航选中
		$('.page-content').addClass("loading");
		//需要修改为真实数据源
		require(['template','text!'+PubVars.contextPath+'/resources/data/arrays.txt','text!'+PubVars.contextPath+'/resources/tpls/ccenter/vm.tpl'],function(template,data,tpl){
			try{
				if(data){
					data = JSON.parse(data);
				}
				var render = template.compile(tpl);
				$('.page-content').html(render(data));
			}catch(e){
				$('.page-content').html('<p class="error-tips text-danger">数据解析出错，请稍后再试…</p>');
			}
			bindEvent();
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
			    				    	var html = '<div class="btn selected" data-con="CentOS 5.8 64bit"><i class="image-icon-default centos"></i>CentOS 5.8 64bit</div>'+
												   '<div class="btn" data-con="CentOS 5.11 64bit"><i class="image-icon-default centos"></i>CentOS 5.11 64bit</div>'+
													'<div class="btn" data-con="CentOS 5.11 64bit"><i class="image-icon-default centos"></i>CentOS 5.11 64bit</div>'+
													'<div class="btn" data-con="Ubuntu 14.04 64bit"><i class="image-icon-default ubuntu"></i>Ubuntu 14.04 64bit</div>'+
													'<div class="btn hook" data-con="Windows Server 2003 R2 Enterprise 32bit (cn) (Not Activated)"><i class="image-icon-default windows"></i>Windows Server 2003 R2 Enterprise 32bit (cn) (Not Activated)</div>';
			    				    	wizard.el.find(".wizard-card .image-list").html(html);
			    				    }
			    				});
		    				};
		    				//虚拟数据中心获取,如果是管理员，获取所有的vdc，否则只获取租户默认在的vdc
		    				var initVdc = function(){
		    					//是管理员用户则获取所有的vdc
		    					if(true){
		    						$.ajax({
		    	    				    url: PubVars.contextPath+'/resources/data/arrays.txt',// 跳转到 action    
		    	    				    data:{ 
		    	    				    },    
		    	    				   // type:'POST',    
		    	    				    dataType:'json',    
		    	    				    success:function(data){
		    	    				    	var html = '<option selected>input-section1</option>'+
					  								   '<option>input-section2</option>'+
													   '<option>input-section3</option>'+
													   '<option>input-section4</option>'+
													   '<option>input-section5</option>';
		    	    				    	$('select.select-vdc').html(html);
		    	    				    }
		    	    				});
		    					}else{
		    						//取当前租户所在的vdc
		    						var html = '<option>input-section5</option>';
		    					    $('select.select-vdc').html(html);
		    					    $('select.select-vdc').prop("disabled",true);
		    					}
		    				};
		    				//根据vdc获取可用域数据
		    				var initAvailavleZone = function(vdc_id){
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
	    	    				    }
	    	    				});
		    				};
		    				//云主机规格
		    				var initVmSpecs = function(){
		    					$.ajax({
	    	    				    url: PubVars.contextPath+'/resources/data/arrays.txt',// 跳转到 action    
	    	    				    data:{ 
	    	    				    	//vdc_id : vdc_id
	    	    				    },
	    	    				   // type:'POST',    
	    	    				    dataType:'json',    
	    	    				    success:function(data){
	    	    				    	var html = '<optgroup class="" label="micro">'+
			                    					'<option value="8abaa0f9-30e1">micro-1 (1vCPU / 512M)</option>'+
			                    					'<option value="3332c026-533a">micro-2 (1vCPU / 1G)</option>'+
			             						'</optgroup>'+
						                        '<optgroup class="" label="standard">'+
								                    '<option value="8aaf699a-c760">standard-12 (12vCPU / 24G)</option>'+
								                    '<option value="d200524b-f8b1">standard-16 (16vCPU / 32G)</option>'+
								                 '</optgroup>'+
								                 '<optgroup class="" label="memory">'+
								                    '<option value="aa5987fe-6bf4">memory-8 (8vCPU / 32G)</option>'+
								                    '<option value="8e49d971-a306">memory-12 (12vCPU / 48G)</option>'+
								                 '</optgroup>'+
								                 '<optgroup class="" label="compute">'+
								                    '<option value="270a6d65-d1da">compute-8 (8vCPU / 8G)</option>'+
								                    '<option value="215ea357-2d56">compute-12 (12vCPU / 12G)</option>'+
								                 '</optgroup>';
	    	    				    	$('select.select-specs').html(html);
	    	    				    }
	    	    				});
		    				};
		    				//vdc的可用配额
		    				var initQuotos = function(vdc_id){
		    					$.ajax({
	    	    				    url: PubVars.contextPath+'/resources/data/arrays.txt',// 跳转到 action    
	    	    				    data:{ 
	    	    				    	vdc_id : vdc_id
	    	    				    },
	    	    				   // type:'POST',    
	    	    				    dataType:'json',    
	    	    				    success:function(data){
	    	    				    }
	    	    				});
		    				};
		    				//根据vdc可用网络信息
		    				var initAvailabelNetWorks = function(vdc_id){
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
		    					initAvailavleZone : initAvailavleZone,
		    					initVmSpecs : initVmSpecs,
		    					initQuotos : initQuotos,
		    					initAvailabelNetWorks : initAvailabelNetWorks
		    				}
		    			})();
		    			//init1：获取镜像的数据
		    			DataIniter.initImage('image');
		    			
		    			//init2:载入详细设置里面的数据，包括虚拟数据中心和可用域,可用网络
	    				setTimeout(function(){
	    					//vdc
	    					DataIniter.initVdc();
	    					//数据中心数据得到后，去加载可用域的数据
	    					var cur_vdc = $('select.select-vdc').children('option:selected').val();
	    					DataIniter.initAvailavleZone(cur_vdc);
	    					//云主机规格
	    					DataIniter.initVmSpecs();
	    					//可用网络
	    					DataIniter.initAvailabelNetWorks(cur_vdc);
	    					
	    				},500);
		    			
		    			
		    			//基本信息所需的js
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
		    			})
		    			
		    			//详细配置所需的js
		    			//detail 1: 云主机规格popover提示
		    			var popverOptions = {
		    				html: true,
		    				content: "<div class='popver-tips'><p>名称：statnd-1G-20G</p><p>根磁盘：15G,  临时磁盘： 0</p><p>所有磁盘：15GB  内存 :1024</p></div>",
		    				trigger: 'hover',
		    				delay: {
		    					hide: 500
		    				}
		    			}
		    			$('[data-toggle="popver"]').popover(popverOptions);
		    			
		    			//detail 2: 云主机数量 spinbox
		    			require(['bs/spinbox'],function(){
		    				$('#setVmNums').spinbox({
		    					value: 1,
		    					min: 1,
		    					max: 5
		    				});
		    			})
		    			
		    			//detail 3: 选择虚拟数据中心默认为disabled,超级管理员则置为可选
	    				$('select.select-vdc').change(function(){
	    					var current = $(this).children('option:selected').val();
	    					$.ajax({    
		    				    url: PubVars.contextPath+'/resources/data/arrays.txt',// 跳转到 action    
		    				    data:{
		    				         
		    				    },    
		    				   // type:'POST',    
		    				    dataType:'json',    
		    				    success:function(data) {
		    				    	var html = '<option>input-section5</option>'+
											   '<option>input-section2</option>';
		    				    	$('select.select-available-zone').html(html);
		    				    },    
		    				    error : function() {
		    				    	//dialog.info("获取数据失败", 'error');
		    				     }
		    				}); 
	    				})
		    			
		    			
		    			$('input[type="checkbox"],input[type="radio"]').iCheck({
					    	checkboxClass: "icheckbox-info",
					        radioClass: "iradio-info"
					    })
		    			
		    		/*	require(['jq/chosen'], function() {
			                var config = {
			                    '.chosen-select'           : {},
			                    '.chosen-select-deselect'  : {allow_single_deselect:true},
			                    '.chosen-select-no-single' : {disable_search_threshold:10},
			                    '.chosen-select-no-results': {no_results_text:'Oops, nothing found!'},
			                    '.chosen-select-width'     : {width:"95%"}
			                }
			                for (var selector in config) {
			                    $(selector).chosen(config[selector]);
			                }
			            });
					    */
		    			
					    

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
