(function() {
	if(typeof PubView !== "undefiend") {
			PubView({
				pubViewHome: PubVars.contextPath,
				userInfo: PubVars.userInfo,
				header: {
	                data: {
	                    logo: { },
	                    nav: [
	                        {
	                            current: 3,
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
						        	   link: PubVars.contextPath+'/views/ccenter.jsp'
								   },
								   {
									   text: '云服务',
						        	   link: PubVars.contextPath+'/views/cservice.jsp'
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
	                        {
	                            items: [
	                                {
	                                    index: "search-bar",
	                                    html: true,
	                                    text: function() {
	                                        return (
	                                            '<form action="#">'+
	                                                '<input class="form-control" name="key" type="text" placeholder="搜索" />'+
	                                                '<button class="btn-search"><i class="fa fa-search"></i></button>'+
	                                            '</form>'
	                                        );
	                                    }()
	                                },
	                                {
	                                    index: "notifications",
	                                    text: '消息 <span class="badge">5</span>'
	                                },
	                                {
	                                    dropMenu: {
	                                        text: 'admin<i class="fa fa-angle-down fa-fw"></i>',
	                                        items: [
	                                            {
	                                                text: '<i class="fa fa-file-text fa-fw"></i>基本信息'
	                                            },
	                                            {
	                                                text: '<i class="fa fa-gear fa-fw"></i>账号设置'
	                                            },
	                                            {
	                                                text: '<i class="fa fa-sign-out fa-fw"></i>退出'
	                                            }
	                                        ]
	                                    }
	                                }
	                            ]
	                        }
	                    ]
	                },
	                rendered: function($header) {
	                	Initializer.initSearch($header);	//初始化搜索框
			        	Initializer.initNavChoosen();	//初始化头部nav选中
	                }
	            },
				sideBar: {
	                wrapper: '#page-main',
	                data: {
	                	title: '<i class="fa fa-codepen fa-fw"></i>云中心',
	                    current: [2],
	                    items: [
								{
									text: '<i class="fa fa-cloud"></i>虚拟数据中心',
									link: '#vdc'
								},
								{
									text: '<i class="fa fa-tachometer"></i>云主机',
									link: ''
								},
								{
									text: '<i class="fa fa-database"></i>云主机规格',
									link: ''
								},
								{
									text: '<i class="fa fa-puzzle-piece"></i>设备管理 <i class="fa fa-angle-down fa-arrows"></i>',
									items: [
								          		{
								          			text: '服务器',
								          			link: '#vm'
								          		},
								          		{
								          			text: '存储设备',
								          			link: '#storage'
								          		},
								          		{
								          			text: '交换机',
								          			link: '#switchboard '
								          		}
								          	]
								},
						        {
						        	text: '<i class="fa fa-cogs"></i>设备管理<i class="fa fa-angle-down fa-arrows"></i>',
						        	items: [
					       	           		{
					       	           			text: '服务器',
					       	           			link: ''
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
						        	text: '<i class="fa fa-cubes"></i>物理区域<i class="fa fa-angle-down fa-arrows"></i>',
						        	link: '',
						        	items: [
					       	           		{
					       	           			text: '服务器',
					       	           			link: ''
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
						        }
				        ]
	                },
	                rendered: function() {

	                }
	            },
				footer: null
			});
	}
})();

with(Initializer.router){
	when("^#?(!.*)?$", ['js/ccenter/vm']);
	when("^#vm(!.*)?$", ['js/ccenter/vm']);
	when("^#storage(!.*)?$", ['js/ccenter/storage']);
	//otherwise(['js/ccenter/vm']);
}
//初始化
Initializer.init();