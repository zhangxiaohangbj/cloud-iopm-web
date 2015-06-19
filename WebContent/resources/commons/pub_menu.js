/*!
 * 公共header和侧边栏的维护
 */
define(function() {
    // init nav & sideBar
    var navPrimaryItems = [
        {
            text: '首页',
            link: '#'
        },
        {
            text: '基础环境',
            link: '#cresource'
        },
        {
            text: '云中心',
            link: '#ccenter'
        },
        {
            text: '云服务',
            link: '#cservice'
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
            title: '<i class="fa fa-codepen fa-fw"></i>基础环境',
            current: [3],
            items:[
                {
                    text: '<i class="fa fa-th-large"></i>设备管理<i class="fa icon-arrow"></i>',
                    link:'#device',
                    items: [
                        {
                            text: '<i class="fa fa-cloud"></i>服务器',
                            link: '#vdc'
                        },
                        {
                            text: '<i class="fa fa-cloud"></i>存储设备',
                            link: '#vdc'
                        },
                        {
                            text: '<i class="fa fa-cloud"></i>交换机',
                            link: '#vdc'
                        },
                        {
                            text: '<i class="fa fa-cloud"></i>防火墙',
                            link: '#vdc'
                        },
                        {
                            text: '<i class="fa fa-cloud"></i>负载均衡设备',
                            link: '#vdc'
                        },
                        {
                            text: '<i class="fa fa-cloud"></i>路由器',
                            link: '#vdc'
                        },
                    ]
                },
                {
                    text: '<i class="fa fa-cloud"></i>物理区域',
                    link: '#region'
                },
                {
                    text: '<i class="fa fa-cloud"></i>虚拟化环境',
                    link: '#env'
                },
                {
                    text: '<i class="fa fa-cloud"></i>可用分区',
                    link: '#zone'
                },
                {
                    text: '<i class="fa fa-cloud"></i>资源标签',
                    link: '#tag'
                }
            ]
        },
        {
            title: '<i class="fa fa-codepen fa-fw"></i>云中心',
            current: [2],
            items: [
                {
                    text: '<i class="fa fa-cloud"></i>虚拟数据中心',
                    link: '#vdc'
                },
                {
                    text: '<i class="fa fa-tachometer"></i>云主机管理',
                    link: '#vm'
                },
                {
                    text: '<i class="fa fa-tachometer"></i>云主机类型管理',
                    link: '#vmtype'
                },
                {
                    text: '<i class="fa fa-database"></i>磁盘管理',
                    link: '#block'
                },
                {
                    text: '<i class="fa fa-cube"></i>镜像管理',
                    link: ''
                },
                {
                    text: '<i class="fa fa-vimeo-square"></i>VPC管理<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '网络管理',
                            link: '#vpc/network'
                        },
                        {
                            text: '子网管理',
                            link: '#vpc/subnet'
                        },
                        {
                            text: '路由器管理',
                            link: '#vpc/router'
                        },
                        {
                            text: '浮动IP管理',
                            link: '#vpc/floatingip'
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-th-large"></i>安全管理<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: 'ACLs',
                            link: '#security/acls'
                        },
                        {
                            text: '安全组',
                            link: '#security/securitygroup'
                        },
                        {
                            text: '密钥对',
                            link: '#security/keypair'
                        },
                        {
                            text: '防火墙',
                            link: '#'
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-cubes"></i>VPN管理<i class="fa icon-arrow"></i>',
                    link: '',
                    items: [
                        {
                            text: 'VPN网关',
                            link: ''
                        },
                        {
                            text: 'VPN链接',
                            link: ''
                        }
                    ]
                },
                {
                    text: '<i class="fa fa-list-alt"></i>配额设置<i class="fa icon-arrow"></i>',
                    link: '',
                    items: [
                        {
                            text: '云主机规格',
                            link: ''
                        },
                        {
                            text: 'VDC配额',
                            link: ''
                        },
                        {
                            text: 'VPC配额',
                            link: ''
                        }
                    ]
                }
            ]
        },
        {
            title: '<i class="fa fa-codepen fa-fw"></i>云服务',
            current: [1,1],
            items: [
                {
                    text: '<i class="fa fa-puzzle-piece"></i>云安全<i class="fa icon-arrow"></i>',
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
                    text: '<i class="fa fa-cloud"></i>数据库<i class="fa icon-arrow"></i>',
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
                    text: '<i class="fa fa-cogs"></i>云存储<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '硬盘',
                            link: '#volumes'
                        },
                        {
                            text: 'vitural SAN',
                            link: '#vsans'
                        },
                        {
                            text: '快照',
                            link: '#snapshots'
                        }
                    ]
                }
            ]
        },
        {
            title: '<i class="fa fa-codepen fa-fw"></i>监控与调度',
            current: [1,1],
            items: [
                {
                    text: '<i class="fa fa-puzzle-piece"></i>任务调度<i class="fa icon-arrow"></i>',
                    items: [
                        {
                            text: '任务管理',
                            link: '#task/task'
                        },
                        {
                            text: '策略管理',
                            link: '#task/strategy'
                        },
                        {
                            text: '执行日志',
                            link: '#task/monitor'
                        },
                        /*{
                         text: '任务分组',
                         link: '#task/taskGroup'
                         },*/
                        {
                            text: '分组管理',
                            link: '#task/strategyGroup'
                        }
                    ]
                }
            ]
        },
        {
            title: '<i class="fa fa-codepen fa-fw"></i>系统管理',
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
                    link: '#organization'
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