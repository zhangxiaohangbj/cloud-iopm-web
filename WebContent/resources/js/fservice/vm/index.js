define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var current_vdc_id = Common.cookies.getVdcId();
	var current_user_id = Common.cookies.getUid();
	var default_vdc_id = Common.cookies.getUser().defaultVdcId;
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/fservice/vm/list.html',
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		//websocket
		var sendMsg = {};
		sendMsg["type"] = "vm";
		sendMsg["action"] = "status";
		sendMsg["vdcId"] = current_vdc_id;
		Common.addWebsocketListener(sendMsg, function(data){
//			alert(JSON.stringify(data));
			var id = data.id;
			var status = data.status;
			var fixedIps = "";
			if(data.fixedIps!=null){
				fixedIps = data.fixedIps.replace(new RegExp(/(,)/g),'<br>');;
			}			
			$("span[data="+id+"]").parents("tr:first").children("td.vm_fixed_ips").html(fixedIps);
			if(status=="ACTIVE"){
				$("span[data="+id+"]").html("运行中");
				$("span[data="+id+"]").attr("class","text-success");
			}
			if(status=="BUILD"){
				$("span[data="+id+"]").html("创建中");
				$("span[data="+id+"]").attr("class","text-warning");
			}
			if(status=="BUILDING"){
				$("span[data="+id+"]").html("创建中");
				$("span[data="+id+"]").attr("class","text-warning");
			}
			if(status=="REBUILD"){
				$("span[data="+id+"]").html("重建中");
				$("span[data="+id+"]").attr("class","text-success");
			}
			if(status=="SUSPENDED"){
				$("span[data="+id+"]").html("已挂起");
				$("span[data="+id+"]").attr("class","text-danger");
			}
			if(status=="PAUSED"){
				$("span[data="+id+"]").html("已暂停");
				$("span[data="+id+"]").attr("class","text-danger");
			}
			if(status=="RESIZE"){
				$("span[data="+id+"]").html("重建中");
				$("span[data="+id+"]").attr("class","text-danger");
			}
			if(status=="VERIFY_RESIZE"){
				$("span[data="+id+"]").html("确认重建");
				$("span[data="+id+"]").attr("class","text-success");
			}
			if(status=="REVERT_RESIZE"){
				$("span[data="+id+"]").html("回退重建");
				$("span[data="+id+"]").attr("class","text-success");
			}
			if(status=="REBOOT"){
				$("span[data="+id+"]").html("重启中");
				$("span[data="+id+"]").attr("class","text-warning");
			}
			if(status=="HARD_REBOOT"){
				$("span[data="+id+"]").html("硬重启中");
				$("span[data="+id+"]").attr("class","text-warning");
			}
			if(status=="ERROR"){
				$("span[data="+id+"]").html("错误");
				$("span[data="+id+"]").attr("class","text-danger");
			}
			if(status=="SHUTOFF"){
				$("span[data="+id+"]").html("关机");
				$("span[data="+id+"]").attr("class","text-danger");
			}
			if(status=="STOPPED"){
				$("span[data="+id+"]").html("停止");
				$("span[data="+id+"]").attr("class","text-danger");
			}
		});
		
		//页面渲染完后进行各种事件的绑定
		//dataTables
		var table =Common.initDataTable($('#VmTable'),
			{
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":"compute/v2/"+current_vdc_id+'/servers/page/', //ajax源，后端提供的分页接口
	    	  /*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
		      "columns": [
			        {"data": ""},
			        {"data": {}},
			        {"data": "fixedIps","class":"vm_fixed_ips"},
			        {"data": "floatingIps","class":"vm_floating_ips"},
			        {"data": "flavor"},
			        {"data": "availability_zone"},
			        {"data": "vdcName"},
			        {"data": {}},
			        {"data": "created_at"},
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
					      return '<a href="#fservice/vm/detail/'+data.id+'" class="vm_name" data="'+data.id+'">'+data.name+"</a>";
					    }
					},	
					{
					    "targets": [2],
					    "defaultContent": "",
					    "render": function(data, type, full) {
					    	if(data!=null){
					    		return data.replace(new RegExp(/(,)/g),'<br>');
					    	}
					    }
					},	
					{
					    "targets": [3],
					    "defaultContent": "",
					    "render": function(data, type, full) {
					    	if(data!=null){
					    		return data.replace(new RegExp(/(,)/g),'<br>');
					    	}
					    }
					},	
					{
					    "targets": [7],
					    "render": function(data, type, full) {
				 			if(data.vmState == 'ACTIVE') return ' <span class="text-success" data="'+data.id+'">运行中</span>';
							if(data.vmState == 'BUILD') return ' <span class="text-warning" data="'+data.id+'">创建中</span>';
							if(data.vmState == 'BUILDING') return ' <span class="text-warning" data="'+data.id+'">创建中</span>';
							if(data.vmState == 'REBUILD') return ' <span class="text-success" data="'+data.id+'">重建中</span>';
							if(data.vmState == 'SUSPENDED') return ' <span class="text-danger" data="'+data.id+'">已挂起</span>';
							if(data.vmState == 'PAUSED') return ' <span class="text-danger" data="'+data.id+'">已暂停</span>';
							if(data.vmState == 'RESIZE') return ' <span class="text-danger" data="'+data.id+'">重建中</span>';
							if(data.vmState == 'VERIFY_RESIZE') return ' <span class="text-success" data="'+data.id+'">确认重建</span>';
							if(data.vmState == 'REVERT_RESIZE') return ' <span class="text-success" data="'+data.id+'">回退重建</span>';
							if(data.vmState == 'REBOOT') return ' <span class="text-warning" data="'+data.id+'">重启中</span>';
							if(data.vmState == 'HARD_REBOOT') return ' <span class="text-warning" data="'+data.id+'">硬重启中</span>';
							if(data.vmState == 'DELETED') return ' <span class="text-danger" data="'+data.id+'">已删除</span>';
							if(data.vmState == 'ERROR') return ' <span class="text-danger" data="'+data.id+'">错误</span>';
							if(data.vmState == 'SHUTOFF') return ' <span class="text-danger" data="'+data.id+'">关机</span>';
							if(data.vmState == 'STOPPED') return ' <span class="text-danger" data="'+data.id+'">关闭</span>';
							return '<span class="text-danger" data="'+data.id+'">未知</span>';
					    }
					},
                    {
	                       "targets": [4],
	                       "data": "id",
	                       "render": function(data, type, full) {
	                    	   if(data != null){
	                    		   return ((data.ram%512==0)?(data.ram/1024):(data.ram/1024).toFixed(1))+"GB|"+data.vcpus+"CPUs|"+data.disk+"GB"
	                    	   }
	                         return '';
	                       }
	                 },
                     {
                       "targets": [9],
                       "data": "id",
                       "render": function(data, type, full) {
                    	   var html = '<a href="javascript:void(0)" class="btn-opt createSnapshot" data-toggle="tooltip" title="创建快照" data-act="stop" data="'+data.id+'" style="margin: 0;"><i class="fa fa-camera"></i></a>'
                    	   if(data.vmState != 'PAUSED' && data.vmState != 'SHUTOFF' && data.vmState != 'SUSPENDED' && data.vmState != 'STOPPED'){
                    		   html = html + 
                    		   '<div class="dropdown">'
	                    		   +'<a class="btn-opt dropdown-toggle" data-toggle="dropdown" title="更多"  aria-expanded="false" ><i class="fa fa-angle-double-right"></i></a>'
	                    		   +'<ul class="dropdown-menu" style="right: 0;left: initial;">'
	                    		   +'<li><a href="javascript:void(0)" class="attachIp" data="'+data.id+'"><i class="fa fa-gear fa-fw"></i>绑定浮动IP</a></li>'
	                    		   +'<li><a href="javascript:void(0)" class="dettachIp" data="'+data.id+'"><i class="fa fa-gear fa-fw"></i>解除浮动IP绑定</a></li>'
	                    		   +'<li><a href="javascript:void(0)" class="editName" data="'+data.id+'"><i class="fa fa-file-text fa-fw"></i>修改云主机名称</a></li>'
	                    		   +'<li><a href="javascript:void(0)" class="editSecurity" data="'+data.id+'"><i class="fa fa-file-text fa-fw"></i>编辑安全组</a></li>'
	                    		   +'<li><a href="javascript:void(0)" class="vncConsole" data="'+data.id+'"><i class="fa fa-file-text fa-fw"></i>控制台</a></li>'
	                    		   +'<li><a href="javascript:void(0)" class="consoleOutput" data="'+data.id+'"><i class="fa fa-file-text fa-fw"></i>查看日志</a></li>'
	                    		   +'<li><a href="javascript:void(0)" class="pause" data="'+data.id+'"><i class="fa fa-file-text fa-fw"></i>暂停</a></li>'
	                    		   +'<li><a href="javascript:void(0)" class="suspend" data="'+data.id+'"><i class="fa fa-file-text fa-fw"></i>挂起</a></li>'
	                    		   +'<li><a href="javascript:void(0)" class="editVmType" data="'+data.id+'"><i class="fa fa-file-text fa-fw"></i>调整配置</a></li>'
	                    		   +'<li><a href="javascript:void(0)" class="rebootSoft" data="'+data.id+'"><i class="fa fa-refresh fa-fw"></i>软重启</a></li>'
	                    		   +'<li><a href="javascript:void(0)" class="rebootHard" data="'+data.id+'"><i class="fa fa-refresh fa-fw"></i>硬重启</a></li>'
	                    		   +'<li><a href="javascript:void(0)" class="osStop" data="'+data.id+'"><i class="fa fa-power-off fa-fw"></i>关闭</a></li>'
	                    		   +'<li><a href="javascript:void(0)" class="rebuild" data="'+data.id+'"><i class="fa fa-file-text fa-fw"></i>重建</a></li>'
	                    		   +'<li><a href="javascript:void(0)" class="delete" data="'+data.id+'"><i class="fa fa-file-text fa-fw"></i>终止</a></li>'
	                    		   +'</ul>'
                    		   +'</div>';
                    	   }else{
                    		   html = html + 
                    		   '<div class="dropdown">'
		                		   	+'<a class="btn-opt dropdown-toggle" data-toggle="dropdown" title="更多"  aria-expanded="false" ><i class="fa fa-angle-double-right"></i></a>'
		                            +'<ul class="dropdown-menu" style="right: 0;left: initial;">'
		                            +'<li><a href="javascript:void(0)" class="attachIp" data="'+data.id+'"><i class="fa fa-gear fa-fw"></i>绑定浮动IP</a></li>'
		                            +'<li><a href="javascript:void(0)" class="dettachIp" data="'+data.id+'"><i class="fa fa-gear fa-fw"></i>解除浮动IP绑定</a></li>'
		                            +'<li><a href="javascript:void(0)" class="editName" data="'+data.name+'"><i class="fa fa-file-text fa-fw"></i>修改云主机名称</a></li>'
		                            +'<li><a href="javascript:void(0)" class="resume" data="'+data.id+'" vm_state="'+data.vmState+'"><i class="fa fa-file-text fa-fw"></i>恢复</a></li>'
		                            +'<li><a href="javascript:void(0)" class="delete" data="'+data.id+'"><i class="fa fa-file-text fa-fw"></i>终止</a></li>'
		                            +'</ul>'
                    		   +'</div>';
                    	   }
							return html;
                       }
                     }
                ]
		    },
		    function($tar){
		    	Common.xhr.ajax('/identity/v2.0/users/tenants/'+current_user_id,function(vdcDatas){
					for(var i=0;i<vdcDatas.length;i++){
						$('.select-vdc').append('<option value="'+vdcDatas[i]["id"]+'">'+vdcDatas[i]["name"]+'</option>');
					}
				});
		    	var $tbMenu = $tar.prev('.tableMenus');
		    	$tbMenu.length && $tbMenu.empty().html($('.table-menus').html());
				Common.$pageContent.removeClass("loading");
		});
		
		Common.on('click','.dataTables_filter .btn-query',function(){
			table.search($('.global-search').val()).draw();
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
						quotas = quotas.quota_set||{'cores':0,'ram':0,'instances':0};
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
				}
			},
			//根据vdc可用网络信息
			initAvailableNetWorks : function(){
				var vdc_id = currentChosenObj.vdc || $('select.tenant_id').children('option:selected').val();
				Common.xhr.get('/networking/v2.0/networks',{"vdcId":vdc_id},function(data){
					var dataArr = [];
					if(data){
						var networks = [];
						for (var i=0;i<data.networks.length;i++){
							var network = data.networks[i];
							if(network["router:external"]==false){
								networks.push(network);
							}
						}
						
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
											$clone.append('<li class="pull-right fixedip"><select class="select-fixedip" style="width:125px"><option>DHCP</option></select></li>');
											$clone.append('<li class="pull-right subnet">'+html+'</li>');
											$('select.select-subnet').attr('style','width:110px');
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
					var keypairData = [{id:"keypair-select-default",name:"选择一个密钥对"}]
					if(keypairs&&keypairs["keypairs"]){
						for(var i=0;i<keypairs["keypairs"].length;i++){
							keypairData.push({value:keypairs["keypairs"][i]["keypair"].name});
						}
					}
					var html = Common.uiSelect(keypairData);
			    	$('select.keypairs').html(html);
			    	$('#keypair-select-default').attr("value","");
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
	    				Common.on("changed.bs.spinbox","#setVmNums",function(event){
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
					Common.on("change","#vm-networks .select-subnet",function(event){
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
									$('select.select-fixedip').attr('style','width:125px');
								});
							}else{
								var selectData = [{id:"dhcp",name:"DHCP"}];
								var html = Common.uiSelect(selectData);
								that.parents('.list-group-item:first').find('select.select-fixedip').html(html);
								$('select.select-fixedip').attr('style','width:125px');
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
	    Common.on("click","#VmTable_wrapper span.btn-add",function(){
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
    				var networkStr = "";
    				$('#vm-networks .list-group-select').children().each(function(i,item){
    					var network_uuid = $(item).find('li:first').children('span.display_name').text();//attr('data-id');
    					var fixedIp = $(item).find('select.select-fixedip').children('option:selected').val();
    					networkStr = networkStr+'<div class="form-group"><label class="control-label col-sm-3">'+network_uuid+'：</label><label class="col-sm-6">'+fixedIp+"</label></div>"
    				});
    				$('.network-confirm').html(networkStr);
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
    			DataIniter.initKeyPairs();
    			
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
	  //更多按钮
	    var EditData = {
	    		//编辑云主机名称弹框
	    	EditVmName : function(id,name){
	    		Common.render('tpls/fservice/vm/editvmname.html','',function(html){
	    			Modal.show({
	    	            title: '修改云主机名称',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	var modiName = $("#editVmName input").val();
	    	                	var postData = {"server":{"name":modiName}};
    	    					Common.xhr.putJSON('/compute/v2/'+current_vdc_id+'/servers/'+id,postData,function(data){
    	    						if(data){
    	    							dialog.close();
    	    	                		Modal.success("云主机名称已更改为["+data.server.name+"]!");
    	    	                		setTimeout(function(){Modal.closeAll()},3000);
        	                			Common.router.route();
    	    	                	}else{
    	    	                		Modal.error("云主机变更名称失败!");
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
	    	            	$("#editVmName input[name='name']").val(name);
	    	            }
	    	        });
	    		});
	    		
	    	},
	    	//编辑安全组弹框
	    	EditVmSecurity : function(id,vdcId,cb){
	    		Common.$pageContent.addClass("loading");
	    		var pageData={};
				//取安全组列表
				Common.xhr.getSync("/compute/v2/"+vdcId+'/servers/'+id+'/list-unattched-security-groups',function(data){
					pageData.unattched=data;});
				Common.xhr.getSync("/compute/v2/"+vdcId+'/servers/'+id+'/list-attched-security-groups',function(data){
					pageData.attched=data;});
				
		    	//生成html数据
				Common.render('tpls/fservice/vm/security.html',pageData,function(html){
					
					Modal.show({
	    	            title: '编辑安全组',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
    	    					var selectedList = [];
    	    					$("#edit-security-group .list-group-select").find("li.member").each(function(i,element){
    	    						var id = $(element).attr("data-id");
    	    						selectedList.push(id);
    	    					});
    	    					Common.xhr.postJSON('/compute/v2/'+current_vdc_id+'/servers/'+id+'/change-security-group',selectedList,function(data){
    	    						if(data.success){
    	    							dialog.close();
    	    	                		Modal.success("云主机安全组已更改!");
    	    	                		setTimeout(function(){Modal.closeAll()},3000);
        	                			Common.router.route();
    	    	                	}else{
    	    	                		Modal.error("云主机变更安全组失败!");
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
	    	            	require(['js/common/choose'],function(choose){
	    						var options = {
	    								selector: '#edit-security-group',
	    								allData: pageData.unattched,
	    								selectData: pageData.attched
	    						};
	    						choose.initChoose(options);
	    					})
	    					//Modal show后回调
	    	            	cb;
	    	            	Common.$pageContent.removeClass("loading");
	    	            } 
	    	        });
				});
				
	    	},
	    	//编辑虚拟机大小弹框
	    	EditVmType : function(id,cb){
	    		Common.render('tpls/fservice/vm/editvmtype.html',renderData,function(html){
		    		Modal.show({
	    	            title: '编辑虚拟机大小',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	 var flavor_data = {
                                     "resize": {
                                         "flavorRef": $('#flavorRef option:selected').val()
                                     }
                                 }
                                 Common.xhr.postJSON("/compute/v2/"+current_vdc_id+'/servers/'+id+'/action', flavor_data, function(data){
                                     if(!data.error){
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
	    	                	resetCurrentChosenObj();
	    	                    dialog.close();
	    	                }
	    	            }],
	    	            onshown : cb  //Modal show后回调
	    	        });
	    		});
	    	},
	    	
	    	DoAction:function(id,name,rq,dc){
	    		Common.$pageContent.addClass("loading");
                Common.xhr.postJSON("/compute/v2/"+current_vdc_id+'/servers/'+id+'/action',rq,function(data){
                	if(data.success){
                		Modal.success("云主机["+name+"]已"+dc+"!");
                		setTimeout(function(){Modal.closeAll()},3000);
                	}else{
                		Modal.error("云主机["+name+"]"+dc+"失败!");
                	}
                	Common.router.reload();
                	Common.$pageContent.removeClass("loading");
                });	    		
	    	}
	    };

	    //修改云主机名称
	    Common.on("click","#VmTable_wrapper a.editName",function(){	  	    
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	EditData.EditVmName($(this).attr("data"),serverName);
	    });
	    //编辑安全组
	    Common.on("click","#VmTable_wrapper a.editSecurity",function(){
	    	var rowData = $(this).parents('tr:first').data("rowData.dt");
	    	var vdcId = rowData.tenant_id;
	    	EditData.EditVmSecurity($(this).attr("data"),vdcId,function(){
	    		
	    	});
	    });
	    //修改虚拟机大小
		Common.on("click","#VmTable_wrapper a.editVmType",function(){
	    	var rowData = $(this).parents('tr:first').data("rowData.dt");
	    	var vdcId = rowData.tenant_id;
	    	var specs={nums:1};
	    	specs.core = rowData.flavor.vcpus;
	    	specs.memory = rowData.flavor.ram;
	    	flavorName = rowData.flavor.name;
	    	//获取云主机个数,规格等信息
    		EditData.EditVmType($(this).attr("data"),function(){
    			$("#editVmType div.col-sm:first").html(flavorName);
    			$("[name='flavorRef']").val(vdcId);
		    	currentChosenObj.specs = $('select.flavorRef').find('option:selected');
	    		DataIniter.initPopver();
	    		DataIniter.initQuatos(vdcId,specs);  //data:vcd_id
	    		EventsHandler.specsChange();
	    	});
	    });
	    
	    //删除云主机
	    Common.on("click","#VmTable_wrapper a.delete",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	Modal.confirm("你已经选择了 ["+serverName+"] 。 请确认您的选择。终止的云主机均无法恢复。",function(result){
	            if(result) {
	                Common.xhr.del("/compute/v2/"+current_vdc_id+'/servers/'+serverId,function(data){
	                	if(data.success||data.code==404){
	                		Modal.success("云主机["+serverName+"]已终止！");
	                	}else{
	                		Modal.error("云主机["+serverName+"]终止失败！");
	                	}
	                	Common.router.reload();
	                });	    		
	            }
	    	});
	    });
	    
	    //软重启云主机
	    Common.on("click","#VmTable_wrapper a.rebootSoft",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	Modal.confirm({title:"确认：软重启云主机",
	    		message:"你已经选择了 ["+serverName+"] 。  请确认您的选择。重启云主机会丢失所以没有存放在永久存储设备上的数据。 ",
	    		callback:function(result){
	            if(result) {
	            	EditData.DoAction(serverId,serverName,{"reboot": {"type": "SOFT"}},"软重启");
	            }
	    	}});
	    });
	    //硬重启云主机
	    Common.on("click","#VmTable_wrapper a.rebootHard",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	Modal.confirm({title:"确认：硬重启云主机",
	    		message:"你已经选择了 ["+serverName+"] 。  请确认您的选择。重启云主机会丢失所以没有存放在永久存储设备上的数据。 ",
	    		callback:function(result){
	            if(result) {
	            	EditData.DoAction(serverId,serverName,{"reboot": {"type": "HARD"}},"硬重启");
	            }
	    	}});
	    });
	    
	    //关闭云主机
	    Common.on("click","#VmTable_wrapper a.osStop",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	Modal.confirm({title:"确认：关闭云主机",
	    		message:"你已经选择了 ["+serverName+"] 。  请确认您的选择。关闭该云主机。 ",
	    		callback:function(result){
	            if(result) {
	            	EditData.DoAction(serverId,serverName,{"os-stop": null},"关闭");
	            }
	    	}});
	    });
	    
	    //暂停云主机
	    Common.on("click","#VmTable_wrapper a.pause",function(){	    
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	Modal.confirm({title:"确认：暂停云主机",
	    		message:"你已经选择了 ["+serverName+"] 。  请确认您的选择。暂停该云主机。 ",
	    		callback:function(result){
	            if(result) {
	            	EditData.DoAction(serverId,serverName,{"pause": null},"暂停");
	            }
	    	}});
	    });
	    
	    //挂起云主机
	    Common.on("click","#VmTable_wrapper a.suspend",function(){	    
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	Modal.confirm({title:"确认：挂起云主机",
	    		message:"你已经选择了 ["+serverName+"] 。  请确认您的选择。挂起该云主机。 ",
	    		callback:function(result){
	            if(result) {
	            	EditData.DoAction(serverId,serverName,{"suspend": null},"挂起");
	            }
	    	}});
	    });
	    
	    //重建云主机
	    Common.on("click","#VmTable_wrapper a.rebuild",function(){	
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	var rowData = $(this).parents('tr:first').data("rowData.dt");
	    	var vdcId = rowData.tenant_id;
	    	var imageList;
	    	Common.xhr.getSync('/image/v2/'+vdcId+'/images/?owner='+vdcId,function(data){
    			imageList=data;
    		});
	    	Common.render('tpls/fservice/vm/rebuild.html',imageList,function(html){
	    		Modal.show({
    	            title: '重建云主机',
    	            message: html,
    	            closeByBackdrop: false,
    	            nl2br: false,
    	            buttons: [{
    	                label: '保存',
    	                action: function(dialog) {
    	                	var postData={"rebuild":{}};
    	                	postData.rebuild["imageRef"]=$('select.image-list').val();
    	                	postData.rebuild["OS-DCF:diskConfig"]=$('select.config-list').val();
    	                 	EditData.DoAction(serverId,serverName,postData,"重建");
    	                 	dialog.close();
    	                }
    	            }, {
    	                label: '取消',
    	                action: function(dialog) {
    	                    dialog.close();
    	                }
    	            }],
    	            onshown : function(dialog){
			    	
    	            }
    	        });
	    	});
	    });
	    
	    //绑定floatingIp
	    Common.on("click","#VmTable_wrapper a.attachIp",function(){	
	    	var serverId = $(this).attr("data");
	    	var rowData = $(this).parents('tr:first').data("rowData.dt");
	    	var vdcId = rowData.tenant_id;
	    	Common.render('tpls/fservice/vm/attachip.html','',function(html){	
	    		Modal.show({
    	            title: '绑定浮动IP',
    	            message: html,
    	            closeByBackdrop: false,
    	            nl2br: false,
    	            buttons: [{
    	                label: '绑定',
    	                action: function(dialog) {
    	                	var ipId = $('select.floating-ips').val();
    	                	var portId = $('select.network-interface').val();
    	                	
    	                	Common.xhr.postJSON("/compute/v2/"+vdcId+'/servers/'+serverId+'/add-floating-ip?floating_ip_id='+ipId+'&port_id='+portId,null,function(data){
    	                    	debugger
    	                		if(data.success){
    	                    		dialog.close();
    	                    		Modal.success("浮动IP绑定成功!");
    	                    		setTimeout(function(){Modal.closeAll()},3000);
    	                			Common.router.route();
    	                    	}else{
    	                    		Modal.error("浮动IP绑定失败!");
    	                    	}
    	                    });	    
    	                 	dialog.close();
    	                }
    	            }, {
    	                label: '取消',
    	                action: function(dialog) {
    	                    dialog.close();
    	                }
    	            }],
    	            onshown : function(dialog){
    	            	DataIniter.initExtNetwork(serverId);
    	            	DataIniter.initFloatingIp(serverId);
    	            	DataIniter.initNetworkInterface(serverId);
    	            	$('select.ip-pools').change(function(){
    	            		DataIniter.initFloatingIp(serverId);
    	            	})
    	            }
    	        });
	    	});
	    });
	    
	  //解绑floatingIp
	    Common.on("click","#VmTable_wrapper a.dettachIp",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var rowData = $(this).parents('tr:first').data("rowData.dt");
	    	var vdcId = rowData.tenant_id;
	    	var floatingIpStr = $(this).parents('tr:first').find('td.vm_floating_ips').html();
	    	var ipStrList = floatingIpStr.split('<br>');
	    	var floatingIpList = [];
	    	for (var i in ipStrList){
	    		floatingIpList.push({"value":ipStrList[i]});
	    	}
	    	
	    	var serverId = $(this).attr("data");
	    	Common.render('tpls/fservice/vm/dettachip.html',floatingIpList,function(html){	
	    		Modal.show({
    	            title: '解除浮动IP绑定',
    	            message: html,
    	            closeByBackdrop: false,
    	            nl2br: false,
    	            buttons: [{
    	                label: '解除绑定',
    	                action: function(dialog) {
    	                	var ip = $('select.floating-ips').val();
    	                	
    	                	Common.xhr.postJSON("/compute/v2/"+vdcId+'/servers/'+serverId+'/remove-floating-ip?floating_ip='+ip,null,function(data){
    	                    	debugger
    	                		if(data.success){
    	                    		dialog.close();
    	                    		Modal.success("浮动IP["+ip+"]解除绑定成功!");
    	                    		setTimeout(function(){Modal.closeAll()},3000);
    	                			Common.router.route();
    	                    	}else{
    	                    		Modal.error("浮动IP["+ip+"]解除绑定失败!");
    	                    	}
    	                    });	    
    	                 	dialog.close();
    	                }
    	            }, {
    	                label: '取消',
    	                action: function(dialog) {
    	                    dialog.close();
    	                }
    	            }],
    	            onshown : function(dialog){
    	            	var html=Common.uiSelect(floatingIpList);
    	            	$('select.floating-ips').html(html);
    	            	
    	            }
    	        });
	    	});
	    });
	    
	    //创建快照
	    Common.on("click","#VmTable_wrapper a.createSnapshot",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	Common.render('tpls/fservice/vm/snapshot.html','',function(html){	
	    		Modal.show({
    	            title: '创建快照',
    	            message: html,
    	            closeByBackdrop: false,
    	            nl2br: false,
    	            buttons: [{
    	                label: '创建',
    	                action: function(dialog) {
    	                	var valid = $(".form-horizontal").valid();
    	            		if(!valid) return false;
    	                	var postData={"createSnapshot":{}};
    	                	postData.createSnapshot.name=$('#create-snapshot input.name').val();
    	                	EditData.DoAction(serverId,serverName,postData,"创建快照");
    	                 	dialog.close();
    	                }
    	            }, {
    	                label: '取消',
    	                action: function(dialog) {
    	                    dialog.close();
    	                }
    	            }],
    	            onshown : function(dialog){
    	            	dialog.setData("formvalid",EventsHandler.snapshotFormValidator());
    	            }
    	        });
	    	});
	    });
	    
	  //恢复实例
	    Common.on("click","#VmTable_wrapper a.resume",function(){	    
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	var vmState = $(this).attr("vm_state");
	    	if(vmState == "SUSPENDED"){
	    		EditData.DoAction(serverId,serverName,{ "resume" : null},"恢复");
	    	}else if(vmState == "PAUSED"){
	    		EditData.DoAction(serverId,serverName,{ "unpause" : null},"恢复");
	    	}else if(vmState == "SHUTOFF"){
	    		EditData.DoAction(serverId,serverName,{ "os-start" : null},"恢复");
	    	}
	    	
	    });

        //获取控制台
	    Common.on("click","#VmTable_wrapper a.vncConsole",function(){	
            var serverId = $(this).attr("data");
            var info = {
                "os-getVNCConsole": {
                    "type": "novnc"
                }
            }
            Common.xhr.postJSON("/compute/v2/"+current_vdc_id+'/servers/'+serverId+'/action',info,function(data){
                var url = data['console']['url'];
                Common.render('tpls/fservice/vm/vncconsole.html', {url: url}, function (html) {
                    Modal.show({
                        size: 'size-_console',
                        title: '控制台',
                        message: html,
                        nl2br: false,
                        onshown: function () {

                        }
                    });
                });
            });

        });

        //显示日志输出
	    Common.on("click","#VmTable_wrapper a.consoleOutput",function(){	
            var serverId = $(this).attr("data");
            var info = {
                "os-getConsoleOutput": {
                    "length": 30
                }
            }
            Common.xhr.postJSON("/compute/v2/"+current_vdc_id+'/servers/'+serverId+'/action',info,function(data){
                var output = data['output'];
                Modal.show({
                    size: 'size-_console',
                    title: '日志',
                    message: output,
                    nl2br: true

                });

            });

        });
	}	
	return {
		init : init
	}
})
