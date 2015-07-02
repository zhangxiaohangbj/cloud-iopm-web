/*!
 * 公共header和侧边栏的维护
 */
define('commons/pub_menu', function() {
    // init nav & sideBar
    var navPrimaryItems = [
        {
            text: '首页',
            link: '#'
        },
        {
            text: '云中心',
            link: '#ccenter'
        },
        {
            text: '基础服务',
            link: '#fservice'
        },
        {
            text: '应用服务',
            link: '#aservice'
        },
        {
            text: '大数据服务',
            link: '#bservice'
        },
        {
            text: '监控与调度',
            link: '#monitor'
        },
        {
            text: '系统管理',
            link: '#sysmanagement'
        }
    ];
    var sideBarItems = [
        null,
        {
            title: '<i class="fa fa-soundcloud fa-fw"></i>云中心',
            current: [3],
            items:[
                {
                    text: '<i class="fa fa-th-large"></i>设备管理<i class="fa icon-arrow"></i>',
                    link:'#device',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>服务器',
                            link: '#vdc'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>存储设备',
                            link: '#vdc'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>交换机',
                            link: '#vdc'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>防火墙',
                            link: '#vdc'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>负载均衡设备',
                            link: '#vdc'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>路由器',
                            link: '#vdc'
                        },
                    ]
                },
                {
                    text: '<i class="fa fa-university"></i>物理区域',
                    link: '#region'
                },
                {
                    text: '<i class="fa fa-sellsy"></i>虚拟化环境',
                    link: '#env'
                },
                {
                    text: '<i class="fa fa-delicious"></i>可用分区',
                    link: '#zone'
                },
                {
                    text: '<i class="fa fa-cloud"></i>虚拟数据中心',
                    link: '#vdc/'
                },
                {
                    text: '<i class="fa fa-medium"></i>元数据<i class="fa icon-arrow"></i>',
                    link: '',
                    items:[
                        {
                            text: '<i class="fa fa-dot fa-1"></i>命名空间',
                            link: '#metadata/namespace'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>标签',
                            link: '#metadata/tag'
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-tachometer"></i>云主机类型管理',
                    link: '#vmtype/'
                },
                {
                    text: '<i class="fa fa-suitcase"></i>配额设置<i class="fa icon-arrow"></i>',
                    link: '',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>VDC配额',
                            link: '#quota/'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>VPC配额',
                            link: '#security/'
                        }
                    ]
                }
            ]
        },
        {
            title: '<i class="fa fa-codepen fa-fw"></i>基础服务',
            current: [2],
            items: [
                {
                    text: '<i class="fa fa-server"></i>弹性云主机<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>云主机管理',
                            link: '#vm/'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>弹性伸缩组管理',
                            link: '#sshkey'
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-hdd-o"></i>磁盘管理',
                    link: '#block/'
                },
                {
                    text: '<i class="fa fa-camera"></i>快照管理<i class="fa icon-arrow"></i>',
                    link: '',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>磁盘快照',
                            link: '#snapshot/volume'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>主机快照',
                            link: '#snapshot/vm'
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-cube"></i>镜像管理',
                    link: '#image'
                },
                {
                    text: '<i class="fa fa-vimeo-square"></i>VPC管理<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>网络管理',
                            link: '#vpc/network'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>子网管理',
                            link: '#vpc/subnet'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>路由器管理',
                            link: '#vpc/router'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>浮动IP管理',
                            link: '#vpc/floatingip'
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-anchor"></i>安全管理<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>安全组',
                            link: '#security/securitygroup'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>密钥对',
                            link: '#security/keypair/'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>防火墙',
                            link: '#security/firewall'
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-cubes"></i>VPN管理<i class="fa icon-arrow"></i>',
                    link: '',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>VPN网关',
                            link: '#vpn/vpn'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>VPN链接',
                            link: '#network/vpn'
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-random"></i>负载均衡LBS<i class="fa icon-arrow"></i>',
                    link: '',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>关系型数据库',
                            link: '#db'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>缓存',
                            link: '#cache'
                        }
                    ]
                }
            ]
        },
        {
            title: '<i class="fa fa-jsfiddle fa-fw"></i>应用服务',
            current: [1,1],
            items: [
				{
				    text: '<i class="fa fa-database"></i>数据库RDS<i class="fa icon-arrow"></i>',
				    items: [
				        {
				            text: '<i class="fa fa-dot fa-1"></i>关系型数据库',
				            link: '#db'
				        },
				        {
				            text: '<i class="fa fa-dot fa-1"></i>缓存',
				            link: '#cache'
				        }
				    ]
				},
                {
                    text: '<i class="fa fa-archive"></i>Docker容器<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>容器集群',
                            link: '#container/'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>容器规格模板',
                            link: '#container/'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>镜像管理',
                            link: '#container/'
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-cogs"></i>云应用引擎<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>应用管理',
                            link: '#cae/app'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>镜像管理',
                            link: '#cae/image'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>监控管理',
                            link: '#cae/monitor'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>伸缩组管理',
                            link: '#cae/scaling'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>存储管理',
                            link: '#cae/storage'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>网络管理',
                            link: '#cae/network'
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-cogs"></i>消息队列管理<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>应用管理',
                            link: '#cae/app'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>镜像管理',
                            link: '#cae/image'
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-cogs"></i>缓存服务管理<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>应用管理',
                            link: '#cae/app'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>镜像管理',
                            link: '#cae/image'
                        }
                    ]
                }
            ]
        },
        {
            title: '<i class="fa fa-jsfiddle fa-fw"></i>大数据服务',
            current: [1,1],
            items: [
                {
                    text: '<i class="fa fa-database"></i>NoSQL存储<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>关系型数据库',
                            link: '#db'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>缓存',
                            link: '#cache'
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-th"></i>大数据处理<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>集群管理',
                            link: '#emr/cluster'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>任务管理',
                            link: '#emr/job'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>集群模板管理',
                            link: '#emr/template'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>镜像管理',
                            link: '#emr/image'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>插件管理',
                            link: '#emr/plugin'
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-cloud-upload"></i>流式计算<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>关系型数据库',
                            link: '#db'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>缓存',
                            link: '#cache'
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-cloud-upload"></i>非结构化存储<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>关系型数据库',
                            link: '#db'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>缓存',
                            link: '#cache'
                        }
                    ]
                }
            ]
        },
        {
            title: '<i class="fa fa-eye fa-fw"></i>监控与调度',
            current: [1,1],
            items: [
                {
                    text: '<i class="fa fa-tasks"></i>任务调度<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '<i class="fa fa-dot fa-1"></i>任务管理',
                            link: '#task/task'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>策略管理',
                            link: '#task/strategy'
                        },
                        {
                            text: '<i class="fa fa-dot fa-1"></i>执行日志',
                            link: '#task/monitor'
                        },
                        /*{
                         text: '任务分组',
                         link: '#task/taskGroup'
                         },*/
                        {
                            text: '<i class="fa fa-dot fa-1"></i>策略分组',
                            link: '#task/strategyGroup'
                        }
                    ]
                }
            ]
        },
        {
            title: '<i class="fa fa-briefcase fa-fw"></i>系统管理',
            current: [1],
            items: [
                {
                    text: '<i class="fa fa-user"></i>用户管理',
                    link: '#user'
                },
                {
                    text: '<i class="fa fa-street-view"></i>角色管理',
                    link: '#role'
                },
                {
                    text: '<i class="fa fa-puzzle-piece"></i>功能管理',
                    link: '#functiontree'
                },
                {
                    text: '<i class="fa fa-bars"></i>URL管理',
                    link: '#url'
                },
                {
                    text: '<i class="fa fa-sitemap"></i>组织机构管理',
                    link: '#organ'
                }
            ]

        }
    ];
    var sideBarDataMap = function() {
        var initItemsLink = function(prefix, item, level) {
            level = level || 1;
            if(level > 100) return item;
            prefix = prefix || '#';
            if(item.items) {
                level ++;
                $.each(item.items, function(i) {
                    if(item.link) {
                        var link = item.link.substring(item.link.lastIndexOf("#") + 1);
                        prefix = prefix + (prefix.length > 1 ? '/' : '') + link;
                    }
                    initItemsLink(prefix, item.items[i], level);
                });
            } else if(item.link) {
                item.link = item.link.split('#');
                if(!/^javascript:/.test(prefix)) {
                    if(item.link.length <= 1) {
                        item.link = prefix;
                    } else {
                        item.link = prefix + '/' + item.link[1];
                    }
                }
            } else {
                item.link = prefix;
            }
            return item;
        };
        var dataMap = {};
        for(var i=0; i<navPrimaryItems.length; i++) {
            var sideBarItem = sideBarItems[i];
            if(sideBarItem) {
                var item = navPrimaryItems[i];
                dataMap[i+1] = initItemsLink(item.link, sideBarItem);
                item = null;
            }
            sideBarItem = null;
        }
        return dataMap;
    }();

    return {
        navPrimaryItems: navPrimaryItems,
        sideBarDataMap: sideBarDataMap,
        headerNavIndex: 1
    };
});
