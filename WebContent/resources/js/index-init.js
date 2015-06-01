(function() {
	if(typeof PubView !== "undefiend") {
			PubView({
				userInfo: '${sessionScope.userInfo}',
				header: {
					logo: {
					},
					globalWidth: false,
					nav: {
						current: 2,
						extral: {
							content: function(){
									return (
										'<ul class="extral-nav">'+
											'<li class="search-bar"><form action="#">'+
												'<input class="form-control" name="key" type="text" placeholder="搜索" />'+
												'<button class="btn-search"><i class="fa fa-search"></i></button></form>'+
											'</li>'+
											'<li class="notifications">'+
												'<a href="#">消息 <span class="badge">5</span></a>'+
											'</li>'+
											'<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#">'+
											'admin<i class="fa fa-angle-down fa-fw"></i></a>'+
											'<ul class="dropdown-menu"><li><a href="#"><i class="fa fa-file-text fa-fw"></i>基本信息</a></li><li><a href="#"><i class="fa fa-gear fa-fw"></i>账号设置</a></li><li><a href="#">'+
											'<i class="fa fa-sign-out fa-fw"></i>退出</a></li></ul>'+
											'</li>'+
										'</ul>'
									);
								}(),
								ord: 2
						},
						items: [
						   {
							   text: '首页',
				        	   link: ''
						   },
						   {
							   text: '基础环境',
				        	   link: ''
						   },
						   {
							   text: '云中心',
				        	   link: ''
						   },
						   {
							   text: '云服务',
				        	   link: ''
						   },
						   {
							   text: '调度与监控',
				        	   link: ''
						   },
						   {
							   text: '系统管理',
				        	   link: ''
						   }
				        ]
					},
			        complete: function($header) {
			        	initSearch($header);	//初始化搜索框
			        	initNavChoosen();	//初始化头部nav选中
			        }
				},
				sideBar: {
					wrapper: "body",
					  title: '<i class="fa fa-codepen fa-fw"></i>基础环境',
					  items: [
				        {
				        	text: '<i class="fa fa-angle-right"></i>设备管理',
				        	items: [
			       	           		{
			       	           			text: '服务器',
			       	           			link: '#'
			       	           		},
			       	           		{
			       	           			text: '存储设备',
			       	           			link: ''
			       	           		},
			       	           		{
			       	           			text: '交换机',
			       	           			link: ''
			       	           		},
			       	           		{
			       	           			text: '防火墙',
			       	           			link: ''
			       	           		},
			       	           		{
			       	           			text: '负载均衡设备',
			       	           			link: ''
			       	           		},
			       	           		{
			       	           			text: '路由器',
			       	           			link: ''
			       	           		}
			       	           	]
				        },
				        {
				        	text: '<i class="fa fa-angle-right"></i>物理区域',
				        	link: '',
				        	items: [
			       	           		{
			       	           			text: '服务器',
			       	           			link: '#'
			       	           		},
			       	           		{
			       	           			text: '存储设备',
			       	           			link: ''
			       	           		},
			       	           		{
			       	           			text: '交换机',
			       	           			link: ''
			       	           		},
			       	           		{
			       	           			text: '防火墙',
			       	           			link: ''
			       	           		}
			       	           	]
				        },
				        {
				        	text: '<i class="fa fa-angle-right"></i>虚拟化环境',
				        	items: [
		       	           		{
		       	           			text: '应用容器',
		       	           			link: ''
		       	           		},
		       	           		{
		       	           			text: '开放搜索',
		       	           			link: ''
		       	           		},
		       	           		{
		       	           			text: '开放消息',
		       	           			link: ''
		       	           		},
		       	           		{
		       	           			text: '消息队列',
		       	           			link: ''
		       	           		}
		       	           	]
				        },
				        {
				        	text: '<i class="fa fa-angle-right"></i>可用分区',
				        	items: [
			       	           	{
									text: '弹性云主机',
									link: '${fn:getLink("instance/index.htm")}'
			       	           	}
			       	         ]
				        },
				        {
				        	text: '<i class="fa fa-angle-right"></i>资源标签',
				        	link: ''
				        }
			        ],
			        complete: function() {
			        	require(['bs/collapse'], function () {});
			        	//resizeContent();	//sidebar生成后初始化内容区宽高
			        }
				},
				footer: null
			});
	}
})();
