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
	                            current: 4,
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
	                    current: [1,1],
	                    items: [
								{
									text: '<i class="fa fa-puzzle-piece"></i>云安全',
									items: [
								          		{
								          			text: '防火墙',
								          			link: '#firewall'
								          		},
								          		{
								          			text: 'SSH密钥',
								          			link: '#sshkey'
								          		}
								          	]
								},
								{
									text: '<i class="fa fa-cloud"></i>数据库',
									items: [
							          		{
							          			text: '关系型数据库',
							          			link: '#db'
							          		},
							          		{
							          			text: '缓存',
							          			link: '#cache'
							          		}
							          	]
								},
						        {
						        	text: '<i class="fa fa-cogs"></i>云存储',
						        	items: [
					       	           		{
					       	           			text: '硬盘',
					       	           			link: '#volumes'
					       	           		},
					       	           		{
					       	           			text: 'Vitural SAN',
					       	           			link: 'vsans'
					       	           		},
					       	           		{
					       	           			text: '快照',
					       	           			link: 'snapshots'
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
	when("^#?(!.*)?$", ['js/cservice/firewall']);
	when("^#firewall(!.*)?$", ['js/cservice/firewall']);
	when("^#db(!.*)?$", ['js/cservice/db']);
	otherwise(['js/cservice/firewall']);
}
//初始化
Initializer.init();