define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var current_vdc_id = '9cc717d8047e46e5bf23804fc4400247';
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/ccenter/vm/list.html',
//			data:'/'+current_vdc_id+'/servers/page/1/10',
//			beforeRender: function(data){
//				var vms = data.result
//	    		for(var i=0;i<vms.length;i++){
//	    			if(vms[i]['fixedIps']!=null){//ip 换行显示
//	    				vms[i]['fixedIps'] = vms[i]['fixedIps'].replace(new RegExp(/(,)/g),'<br>')
//	    			}
//	    			if(vms[i]['floatingIps']!=null){//ip 换行显示
//	    				vms[i]['floatingIps'] = vms[i]['floatingIps'].replace(new RegExp(/(,)/g),'<br>')
//	    			}
//	    		}
//				return vms;
//			},
			callback: bindEvent
		});
	};
	
	var bindEvent = function(){
		//页面渲染完后进行各种事件的绑定
		//dataTables
		Common.initDataTable($('#VmTable'),
			{
		      "processing": true,  //加载效果，默认false
		      "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
		      "ordering": false,   //禁用所有排序
		      "sAjaxSource":"compute/v2/"+current_vdc_id+'/servers/page/', //ajax源，后端提供的分页接口
		      /*fnServerData是与服务器端交换数据时被调用的函数
		       * sSource： 就是sAjaxSource中指定的地址，接收数据的url需要拼装成 v2.0/users/page/10/1 格式
		       *      aoData[4].value为每页显示条数，aoData[3].value/aoData[4].value+1为请求的页码数
		       * aoData：请求参数，其中包含search 输入框中的值
		       * */
		      "fnServerData": function( sSource, aoData, fnCallback ) {
		    	    $.ajax( {   
		    	        "url": sSource +(aoData[3].value/aoData[4].value+1)+"/"+ aoData[4].value, 
		    	        "data":aoData,
		    	        "dataType": "json",   
		    	        "success": function(resp) {
		    	        	/*渲染前预处理后端返回的数据为DataTables期望的格式,
		    	        	 * 后端返回数据格式 {"pageNo":1,"pageSize":5,"orderBy":null,"order":null,"autoCount":true,"result":[{"id":"07da487da17b4354a4b5d8e2b2e41485","name":"wzz"}],
		    	        	 * "totalCount":31,"first":1,"orderBySetted":false,"totalPages":7,"hasNext":true,"nextPage":2,"hasPre":false,"prePage":1}
		    	        	 * DataTables期望的格式 {"draw": 2,"recordsTotal": 11,"recordsFiltered": 11,"data": [{"id": 1,"firstName": "Troy"}]}
							*/
		    	        	resp.data = resp.result;
		    	        	resp.recordsTotal = resp.totalCount;
		    	        	resp.recordsFiltered = resp.totalCount;
		    	            fnCallback(resp);   //fnCallback：服务器返回数据后的处理函数，需要按DataTables期望的格式传入返回数据 
		    	        }   
		    	    });   
		      },
	    	  /*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
		      "columns": [
			        {"data": ""},
			        {"data": "name"},
			        {"data": "fixedIps"},
			        {"data": "floatingIps"},
			        {"data": "flavor"},
			        {"data": "availability_zone"},
			        {"data": "vdcName"},
			        {"data": "vmState"},
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
					    "targets": [7],
					    "data": "vmState",
					    "render": function(data, type, full) {
				 			if(data == 'ACTIVE') return ' <span class="text-success">运行中</span>';
							if(data == 'BUILD') return ' <span class="text-warning">创建中</span>';
							if(data == 'REBUILD') return ' <span class="text-success">重建中</span>';
							if(data == 'SUSPENDED') return ' <span class="text-danger">已挂起</span>';
							if(data == 'PAUSED') return ' <span class="text-danger">已暂停</span>';
							if(data == 'RESIZE') return ' <span class="text-danger">重建中</span>';
							if(data == 'VERIFY_RESIZE') return ' <span class="text-success">确认重建</span>';
							if(data == 'REVERT_RESIZE') return ' <span class="text-success">回退重建</span>';
							if(data == 'REBOOT') return ' <span class="text-warning">重启中</span>';
							if(data == 'HARD_REBOOT') return ' <span class="text-warning">硬重启中</span>';
							if(data == 'DELETED') return ' <span class="text-danger">已删除</span>';
							if(data == 'ERROR') return ' <span class="text-danger">错误</span>';
							if(data == 'SHUTOFF') return ' <span class="text-danger">关机</span>';
							return '<span class="text-danger">未知</span>';
					    }
					},
					{
	                       "targets": [6],
	                       "data": "tenant_id",
	                       "class": "vdc_name"
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
                    	   var html = '<a href="javascript:void(0)" class="btn-opt createSnapshot" data-toggle="tooltip" title="创建快照" data-act="stop" data="'+data+'" style="margin: 0;"><i class="fa fa-camera"></i></a>'
                    	   if(data.vmState != 'PAUSED' && data.vmState != 'SHUTOFF' && data.vmState != 'SUSPENDED'){
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
		                            +'<li><a href="javascript:void(0)" class="resume" data="'+data.id+'" vm_state="{{data.vmState}}"><i class="fa fa-file-text fa-fw"></i>恢复</a></li>'
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
					Common.xhr.get('/v2/'+current_vdc_id+'/images',{'imageType':'image'},function(imageList){
						renderData.imageList = imageList;
					});
				},
				//快照列表,
				getSnapshot :  function(uid){
					Common.xhr.get('/v2/'+current_vdc_id+'/images',{'imageType':'snapshot'},function(snapShotList){
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
						if(!data) {
							data = {};
						}
						data = data["availabilityZoneInfo"]||{};
						for(var i=0;i<data.length;i++){
							if(data[i]["zoneState"]["available"]){
								selectData.push({"name":data[i]["zoneName"],"id":data[i]["id"]});
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
					Common.xhr.ajax('/v2.0/'+current_vdc_id+'/os-quota-sets/'+vdc_id,function(quotas){
						if(!quotas) {
							quotas = {};
						}
						quotas = quotas.quota_set||{};
						//获取vdc的配额使用情况
						Common.xhr.ajax('/v2.0/'+vdc_id+'/limits',function(quotaUsages){
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
										Common.xhr.get('/v2.0/subnets',{"networkId":netId},function(data){
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
				Common.xhr.get('/v2.0/security-groups',{"vdcId":currentChosenObj.vdc},function(data){
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
				var vdc_id = currentChosenObj.vdc || $('select.tenant_id').children('option:selected').val();
				if(vdc_id){
					Common.xhr.ajax("/compute/v2/"+vdc_id+'/os-keypairs',function(keypairs){
						var keypairData = []
						for(var i=0;i<keypairs.length;i++){
							keypairData[i] = {value:keypairs[i].name};
						}
						var html = Common.uiSelect(keypairData);
				    	$('select.keypairs').html(html);
					});
				}else{
					Modal.error('尚未选择所属vdc');
				}
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
								Common.xhr.get('/v2.0/subnets/'+subnetId+'/availableips',function(data){
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
		$(document).off("click","#VmTable_wrapper span.btn-add");
	    $(document).on("click","#VmTable_wrapper span.btn-add",function(){
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
    	            submitEnabled: [2,3,4],
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
    				$('div.security-group').find('.icheckbox-info').each(function(){
    					if($(this).hasClass('checked')){
    						if(sgGroupStr==""){
    							sgGroupStr = $(this).parent().attr('data-id');
    						}else{
    							sgGroupStr = sgGroupStr+ "," + $(this).parent().attr('data-id');
    						}
    					}
    				});
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
    				Common.xhr.postJSON("/compute/v2/"+current_vdc_id+'/servers/'+currentChosenObj.vdc,serverData,function(data){
    					if(data.error){
    						Modal.error(data.message)
    					}
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
	    	EditVmName : function(id,vdcId,name){
	    		Common.render('tpls/ccenter/vm/editvmname.html','',function(html){
	    			Modal.show({
	    	            title: '修改云主机名称',
	    	            message: html,
	    	            nl2br: false,
	    	            buttons: [{
	    	                label: '保存',
	    	                action: function(dialog) {
	    	                	var modiName = $("#editVmName input").val();
	    	                	var postData = {"server":{"name":modiName}};
    	    					Common.xhr.putJSON('/'+vdcId+'/servers/'+id,postData,function(data){
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
				//取云主机列表
				Common.xhr.getSync("/compute/v2/"+vdcId+'/servers/'+id+'/list-unattched-security-groups',function(data){
					pageData.unattched=data;});
				Common.xhr.getSync("/compute/v2/"+vdcId+'/servers/'+id+'/list-attched-security-groups',function(data){
					pageData.attched=data;});
				
		    	//生成html数据
				Common.render('tpls/ccenter/vm/security.html',pageData,function(html){
					
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
    	    					Common.xhr.postJSON('/'+vdcId+'/servers/'+id+'/change-security-group',selectedList,function(data){
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
	    	EditVmType : function(id,vdcId,cb){
	    		Common.render('tpls/ccenter/vm/editvmtype.html',renderData,function(html){
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
                                         dialog.close();
                                         Modal.success("云主机配置已更改!");
     	    	                		 setTimeout(function(){Modal.closeAll()},3000);
         	                			 Common.router.route();
                                     }else{
                                    	 Modal.error("云主机变更配置失败!");
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
	    	
	    	DoAction:function(id,name,vdcId,rq,dc){
	    		Common.$pageContent.addClass("loading");
                Common.xhr.postJSON("/compute/v2/"+vdcId+'/servers/'+id+'/action',rq,function(data){
                	alert(JSON.stringify(data));
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
		//明细
	    $("#VmTable_wrapper a.vm_name").on("click",function(){
	    	var id = $(this).attr("data");
	    	Common.render(true,'tpls/ccenter/vm/detail.html',"/compute/v2/"+currentChosenObj.vdc+'/servers/'+id,function(html){
					 $("a.reload").on("click",function(){
		    		    	Common.router.route();
		    		  });
	    	});
	    })
	    //修改云主机名称
	    $("ul.dropdown-menu a.editName").on("click",function(){
	    	var vdcId = $(this).parents('tr:first').find('td.vdc_name').attr("data");
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	EditData.EditVmName($(this).attr("data"),vdcId,serverName);
	    });
	    //编辑安全组
	    $("ul.dropdown-menu a.editSecurity").on("click",function(){
	    	var vdcId = $(this).parents('tr:first').find('td.vdc_name').attr("data");
	    	EditData.EditVmSecurity($(this).attr("data"),vdcId,function(){
	    		
	    	});
	    });
	    //修改虚拟机大小
	    $("ul.dropdown-menu a.editVmType").on("click",function(){
	    	var vdcId = $(this).parents('tr:first').find('td.vdc_name').attr("data");
	    	var specs={nums:1};
	    	specs.core = $(this).parents('tr:first').find('td.vm_type').attr("data_cores");
	    	specs.memory = $(this).parents('tr:first').find('td.vm_type').attr("data_memory");
	    	flavorName = $(this).parents('tr:first').find('td.vm_type').attr("data_name");
	    	//获取云主机个数,规格等信息
//    		currentChosenObj.nums = 0;  //data:云主机个数
    		EditData.EditVmType($(this).attr("data"),vdcId,function(){
    			$("#editVmType div.col-sm:first").html(flavorName);
    			$("[name='flavorRef']").val(vdcId);
		    	currentChosenObj.specs = $('select.flavorRef').find('option:selected');
	    		DataIniter.initPopver();
	    		DataIniter.initQuatos(vdcId,specs);  //data:vcd_id
	    		EventsHandler.specsChange();
	    	});
	    });
	    
	    //删除云主机
	    $("ul.dropdown-menu a.delete").on("click",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var vdcId = $(this).parents('tr:first').find('td.vdc_name').attr("data");
	    	var serverId = $(this).attr("data");
	    	Modal.confirm("你已经选择了 ["+serverName+"] 。 请确认您的选择。终止的云主机均无法恢复。",function(result){
	            if(result) {
	                Common.xhr.del("/compute/v2/"+vdcId+'/servers/'+serverId,function(data){
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
	    $("ul.dropdown-menu a.rebootSoft").on("click",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	var vdcId = $(this).parents('tr:first').find('td.vdc_name').attr("data");
	    	Modal.confirm({title:"确认：软重启云主机",
	    		message:"你已经选择了 ["+serverName+"] 。  请确认您的选择。重启云主机会丢失所以没有存放在永久存储设备上的数据。 ",
	    		callback:function(result){
	            if(result) {
	            	EditData.DoAction(serverId,serverName,vdcId,{"reboot": {"type": "SOFT"}},"软重启");
	            }
	    	}});
	    });
	    //硬重启云主机
	    $("ul.dropdown-menu a.rebootHard").on("click",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	var vdcId = $(this).parents('tr:first').find('td.vdc_name').attr("data");
	    	Modal.confirm({title:"确认：硬重启云主机",
	    		message:"你已经选择了 ["+serverName+"] 。  请确认您的选择。重启云主机会丢失所以没有存放在永久存储设备上的数据。 ",
	    		callback:function(result){
	            if(result) {
	            	EditData.DoAction(serverId,serverName,vdcId,{"reboot": {"type": "HARD"}},"硬重启");
	            }
	    	}});
	    });
	    
	    //关闭云主机
	    $("ul.dropdown-menu a.osStop").on("click",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	var vdcId = $(this).parents('tr:first').find('td.vdc_name').attr("data");
	    	Modal.confirm({title:"确认：关闭云主机",
	    		message:"你已经选择了 ["+serverName+"] 。  请确认您的选择。关闭该云主机。 ",
	    		callback:function(result){
	            if(result) {
	            	EditData.DoAction(serverId,serverName,vdcId,{"os-stop": null},"关闭");
	            }
	    	}});
	    });
	    
	    //暂停云主机
	    $("ul.dropdown-menu a.pause").on("click",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	var vdcId = $(this).parents('tr:first').find('td.vdc_name').attr("data");
	    	Modal.confirm({title:"确认：暂停云主机",
	    		message:"你已经选择了 ["+serverName+"] 。  请确认您的选择。暂停该云主机。 ",
	    		callback:function(result){
	            if(result) {
	            	EditData.DoAction(serverId,serverName,vdcId,{"pause": null},"暂停");
	            }
	    	}});
	    });
	    
	    //挂起云主机
	    $("ul.dropdown-menu a.suspend").on("click",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	var vdcId = $(this).parents('tr:first').find('td.vdc_name').attr("data");
	    	Modal.confirm({title:"确认：挂起云主机",
	    		message:"你已经选择了 ["+serverName+"] 。  请确认您的选择。挂起该云主机。 ",
	    		callback:function(result){
	            if(result) {
	            	EditData.DoAction(serverId,serverName,vdcId,{"suspend": null},"挂起");
	            }
	    	}});
	    });
	    
	    //重建云主机
//	    $("ul.dropdown-menu a.rebuild").on("click",function(){
	    $(document).on("click","ul.dropdown-menu a.rebuild",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
//	    	var vdcId = $(this).parents('tr:first').find('td.vdc_name').html(); //.attr("data")
	    	var vdcId=current_vdc_id;
	    	var imageList;
	    	Common.xhr.getSync('/v2/'+vdcId+'/images/?owner='+vdcId,function(data){
    			imageList=data;
    		});
	    	Common.render('tpls/ccenter/vm/rebuild.html',imageList,function(html){
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
//    	                 	alert("Value: " + JSON.stringify(postData));
    	                 	EditData.DoAction(serverId,serverName,vdcId,postData,"重建");
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
	    $("ul.dropdown-menu a.attachIp").on("click",function(){
	    	var serverId = $(this).attr("data");
	    	var vdcId = $(this).parents('tr:first').find('td.vdc_name').attr("data");
	    	Common.render('tpls/ccenter/vm/attachip.html','',function(html){	
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
	    $("ul.dropdown-menu a.dettachIp").on("click",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var vdcId = $(this).parents('tr:first').find('td.vdc_name').attr("data");
	    	var floatingIpStr = $(this).parents('tr:first').find('td.vm_floating_ips').html();
	    	var ipStrList = floatingIpStr.split('<br>');
	    	var floatingIpList = [];
	    	for (var i in ipStrList){
	    		floatingIpList.push({"value":ipStrList[i]});
	    	}
	    	
	    	var serverId = $(this).attr("data");
	    	debugger
	    	Common.render('tpls/ccenter/vm/dettachip.html',floatingIpList,function(html){	
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
	    $("a.createSnapshot").on("click",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	var vdcId = $(this).parents('tr:first').find('td.vdc_name').attr("data");
	    	Common.render('tpls/ccenter/vm/snapshot.html','',function(html){	
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
    	                	EditData.DoAction(serverId,serverName,vdcId,postData,"创建快照");
    	                 	dialog.close();
    	                }
    	            }, {
    	                label: '取消',
    	                action: function(dialog) {
    	                    dialog.close();
    	                }
    	            }],
    	            onshown : function(dialog){
    	            	dialog.setData("formvalid",EventsHandler.formValidator());
    	            }
    	        });
	    	});
	    });
	    
	  //恢复实例
	    $("a.resume").on("click",function(){
	    	var serverName = $(this).parents('tr:first').find('a.vm_name').html();
	    	var serverId = $(this).attr("data");
	    	var vdcId = $(this).parents('tr:first').find('td.vdc_name').attr("data");
	    	var vmState = $(this).attr("vm_state");
	    	if(vmState == "SUSPENDED"){
	    		EditData.DoAction(serverId,serverName,vdcId,{ "resume" : null},"恢复");
	    	}else if(vmState == "PAUSED"){
	    		EditData.DoAction(serverId,serverName,vdcId,{ "unpause" : null},"恢复");
	    	}else if(vmState == "SHUTOFF"){
	    		EditData.DoAction(serverId,serverName,vdcId,{ "os-start" : null},"恢复");
	    	}
	    	
	    });

        //获取控制台
        $("a.vncConsole").on("click",function(){
            var serverId = $(this).attr("data");
            var info = {
                "os-getVNCConsole": {
                    "type": "novnc"
                }
            }
            Common.xhr.postJSON("/compute/v2/"+current_vdc_id+'/servers/'+serverId+'/action',info,function(data){
                var url = data['console']['url'];
                Common.render('tpls/ccenter/vm/vncconsole.html', {url: url}, function (html) {
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
        $("a.consoleOutput").on("click",function(){
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
