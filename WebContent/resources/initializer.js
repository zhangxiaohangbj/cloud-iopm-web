/**
 * 初始化对象,包含公共的初始化加载方法和全局的方法，包括路由注册
 */
define('Initializer', ['bs/modal'], function(Modal) {
    /**
     * 初始化头部搜索框
     * @param $header
     */
    var initSearch = function($header){
        var $searchBar = $header.find("li[index=search-bar]");
        $searchBar.find(".form-control").click(function(e) {
            e.preventDefault();
            $(this).parents("li[index=search-bar]").addClass("active");
            return false;
        });
        $(document).on("click", function(e) {
            $searchBar.each(function() {
                if(!$.contains(this, e.target)) {
                    $(this).removeClass("active");
                }
            });
        });
        return this;
    };
    /**
     * 初始化头部选中状态以及navAnimater移动动画
     */
    var initNavChosen = function(_index){
        var headerNavWrapper = $("#header-nav ul:first"),
            headerNavs = headerNavWrapper.find("li"),
            navAnimater, navIndexObj, navIndexCur,
            paramAnimate = {"duration":300,"queue":false},
            widthArr = [];
        if(typeof _index === "undefined") {
            navAnimater = $('<div class="nav-animater"></div>').appendTo(headerNavWrapper);
            navIndexObj = headerNavWrapper.find('li.active');
            navIndexCur = parseInt(navIndexObj.attr("index"));
        } else {
            navAnimater = headerNavWrapper.find(".nav-animater:first");
            navIndexObj = headerNavWrapper.find('li[index="'+_index+'"]');
            navIndexCur = _index;
        }
        var getLeftDistanceByIndex = function(index){
            //debugger;
            var result = 0;
            for(var i=0;i<index;i++){
                result += parseInt(widthArr[i]);
            }
            return result + "px";
        };
        //初始化nav宽度数组和选中位置
        headerNavs.each(function(i) {
            var width = $(this).outerWidth();
            widthArr[i] = width;
            if($(this).hasClass("active")) {
                navAnimater.css({width:width,display:"block",left:getLeftDistanceByIndex(i)});
            }
            //$(this).attr("index",i);
        });
        //绑定hover事件
        headerNavs.off("mouseenter mouseleave").on("mouseenter",function() {
            var index = parseInt($(this).attr("index")),
                width = $(this).outerWidth(true);
            $(this).addClass("hover");
            navAnimater.animate({width:width,left:getLeftDistanceByIndex(index-1)},paramAnimate);
            return false;
        }).on("mouseleave",function() {
            $(this).removeClass("hover");
        });
        //鼠标移出后恢复原始状态
        headerNavWrapper.off("mouseleave").on("mouseleave",function() {
            navAnimater.animate({width:navIndexObj.outerWidth(true),left:getLeftDistanceByIndex(navIndexCur-1)},paramAnimate);
            return false;
        });
        return this;
    };
    /**
     * 初始化aside的高度和page-content的margin-left值
     */
    var resizeContent = function(){
        //dom
        var pageMain = $("#page-main"),
            aside = $("aside"),
            pageContent = pageMain.find(".page-content:first");
        pageContent.length && (pageMain.css({minHeight: 0}));
        //height
        var winH = $(window).height(),
            asideH = aside.innerHeight() || 0,
            contentH = winH - pageMain.offset().top - 2*parseInt(pageMain.css('border'));
        contentH = contentH < 1 ? 1 : contentH;
        if(contentH < asideH){
            (pageContent.length ? pageContent : pageMain).css('min-height',asideH);
        }else{
            (pageContent.length ? pageContent : pageMain).css('min-height',contentH);
        }
        adjustContentLeft();
        return this;
    };
    var adjustContentLeft = function() {
        var pageMain = $("#page-main"), aside = $("aside"),
            pageContent = pageMain.find(".page-content:first"),
            asideW = aside.outerWidth(true) || 0,
            asideMinW = parseFloat(aside.css('min-width')) || 1,
            contentMgL = parseFloat(pageContent.css('margin-left')) || 1;
        //set margin
        if(contentMgL < asideMinW) {
            pageContent.css('margin-left', asideMinW+"px");
        } else {
            pageContent.css('margin-left', asideW+"px");
        }
    };
    /**
     * 列表datatables处理
     */
    var initDataTable = function($target,cb){
        if(typeof jQuery !== "undefined" && $target instanceof jQuery){
            require(['jq/dataTables'],function(){
                $.extend(true, $.fn.dataTable.defaults, {
                    "sDom": "<'row tableMenus'<'col-sm-6 left-col'><'col-sm-6 right-col'f>>" + "t" + "<'row tableInfos'<'col-sm-4'i><'col-sm-8'lp>>",
                    "oLanguage": {
                        "sSearch": "_INPUT_<i class='fa fa-search'></i>",
                        "sLengthMenu": "每页显示 _MENU_ 条",
                        "sInfo": "第 _START_~_END_ 条 / 共<span class='nums'> _TOTAL_ </span>条",
                        "sInfoEmpty": "第 0~0 条 / 共 0 条",
                        "oPaginate": {
                            "sPrevious": '<i class="fa fa-angle-left"></i>',
                            "sNext": '<i class="fa fa-angle-right"></i>'
                        },
                        "sPaginationType": "two_button",
                        "sEmptyTable": '<div class="text-danger text-center">还没有数据</div>',
                        "sZeroRecords": '<div class="text-danger text-center">没有找到符合查询条件的数据项</div>',
                        "sInfoFiltered": "(总 _MAX_ 条)"
                    }
                });
                /* Default class modification */
                $.extend($.fn.dataTableExt.oStdClasses, {
                    "sWrapper": "dataTables_wrapper form-inline",
                    "sFilterInput": "form-control",
                    "sLengthSelect": "form-control input-sm"
                });
                $target.dataTable({
                    bProcessing : true,
                    bSort : false
                });
                typeof cb === "function" && cb($target);
            })
        }
        return this;
    };
    //获取hash
    var _getHash = function(url){
        //为了兼容低版本的IE， 此处不使用window.location.hash
        url = url || document.URL;
        return '#' + url.replace(/^[^#]*#?(.*)$/, '$1' );
    };
    //绑定hashchange
    var registerHashEvent = function(){
        var self = this;
        var documentMode = document.documentMode;
        //IE8虽然在兼容模式下有onhashchange事件，但不起作用(_isUndefined(documentMode) || documentMode > 7)
        if("onhashchange" in window && !documentMode || documentMode > 7){
            window.onhashchange = function(){
                var hash =  _getHash();
                router.route();
            };
        }else{
            //要兼容IE低版本,暂时采用定时器模拟监听hashchange,最好使用子iframe方法或者jquery.address插件
            var thash = getHash();
            var t = setInterval(function(){
                var chash = _getHash();
                if(chash != thash){
                    thash = chash;
                    router.route();
                }
            }, 100);
        }
        return this;
    };
    //绑定sidebar小三角的展开与折叠
    var registerToggleEvent = function(){
        var lis = $('#side-bar').find("li");
        lis.on('click',function(){
            var arrow = $(this).find('.fa-arrows'),
                second = $(this).find('ul');
            //其他
            lis.each(function(){
                var tul = $(this).find('ul'),
                    tarrow = $(this).find('.fa-arrows');
                if(tul.length && tul.attr('aria-expanded') == "false"){
                    tarrow.removeClass('fa-angle-right').addClass('fa-angle-down');
                }
            })
            //
            if(second.length){
                if(second.attr('aria-expanded') == "false"){
                    arrow.removeClass('fa-angle-right').addClass('fa-angle-down');
                }else{
                    arrow.removeClass('fa-angle-down').addClass('fa-angle-right');
                }
            }
        })
        return this;
    };
    //router模块
    var router = {
        //路由表
        table: {
            path: [],
            ctrl:[]
        },
        //注册路由
        when: function(path, ctrl){
            this.table.path.push(path);
            this.table.ctrl.push(ctrl);
            return this;
        },
        //注册默认路由
        otherwise: function(ctrl){
            this.table.path.unshift("^default$");
            this.table.ctrl.unshift(ctrl);
            return this;
        },

        //根据hash重新路由或无缝刷新
        route: function(hash){
            hash = hash || _getHash();
            loop_1:
                for(var i in this.table.path){
                    var path = this.table.path[i];
                    var ctrl;
                    if(path){
                        var regx = new RegExp(path, "gi");
                        if(regx.test(hash)){
                            ctrl = this.table.ctrl[i];
                            break loop_1;
                        }
                    }
                }
            if(!ctrl){ //load default ctrl
                ctrl = this.table.ctrl[0];
            }

            if(ctrl){
                this.loadctrl(ctrl);
            }
            return this;
        },
        //加载控制器,并默认执行init初始化
        loadctrl: function(ctrl){
            Modal.loader();
            var onLoad = function() {
                Modal.loader('remove');
            };
            //路由后页面载入入口
            require(ctrl, function(o){
                if(o && ('init' in o)){
                    var initRes = o.init();
                    if(PubView.utils.isObject(initRes) && initRes.done) {
                        initRes.done(onLoad);
                    } else {
                        onLoad();
                    }
                }
            });
            return this;
        }
    };

    var loadInit = function(){
        $(document.body).removeClass("loading").append(
            '<div id="page-main" class="clearfix">'+
            '<div class="page-content clearfix"></div>'+
            '</div>'
        );
        this.resize();
        $("#loader").loader('destroy');
        //resize监听
        $(window).on('resize', this.resize);
        //载入hash监听
        registerHashEvent();
        registerToggleEvent();
        router.route();
        return this;
    };

    return {
        init: loadInit,
        router: router,
        getHash: _getHash,
        resize: resizeContent,
        adjustContentLeft: adjustContentLeft,
        initDataTable: initDataTable,
        initSearch: initSearch,
        initNavChosen: initNavChosen
    };
});

require([
    'Initializer',
    'bs/popover'
], function(Initializer, Modal) {
    var navPrimaryItems = [
        {
            text: '首页',
            link: '#'
        },
        {
            text: '基础环境',
            link: '#'
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
            text: '调度与监控',
            link: '#'
        },
        {
            text: '系统管理',
            link: '#'
        }
    ];
    var navPrimaryCurIndex = function() {
        var hash = Initializer.getHash(), regExp = new RegExp(hash+"$", "i");
        for (var i=0; i<navPrimaryItems.length; i++) {
            var navItem = navPrimaryItems[i];
            if(navItem.link && regExp.test(navItem.link)) {
                return i + 1;
            }
        }
        return 1;
    }();
    var sideBarItems = [
        null,
        null,
        {
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
                            link: '#switchboard'
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
        {
            title: '<i class="fa fa-codepen fa-fw"></i>云服务',
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
        null
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

    // 注册路由规则
    with(Initializer.router){
        when("^#?(!.*)?$", ['js/index']);
        when("^#ccenter(!.*)?$", ['js/ccenter/vm']);
        when("^#ccenter/vm(!.*)?$", ['js/ccenter/vm']);
        when("^#ccenter/storage(!.*)?$", ['js/ccenter/storage']);
        //otherwise(['js/ccenter/vm']);
    }
    // 初始化
    Initializer.init();

    // 设置公共header和侧边栏
    PubView({
        header: {
            data: {
                logo: { },
                nav: [
                    {
                        current: navPrimaryCurIndex,
                        items: navPrimaryItems
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
                $(document).on("click", 'header nav>ul>li', function() {
                    var index = parseInt($(this).attr('index'));
                    PubView.activeHeader(index, 1);
                    if(sideBarDataMap[index]) {
                        PubView.renderSideBar({ data: sideBarDataMap[index] });
                    } else {
                        PubView.renderSideBar(null);
                    }
                    Initializer.adjustContentLeft();
                    Initializer.initNavChosen(index);
                });
                Initializer.initSearch($header);	//初始化搜索框
                Initializer.initNavChosen();	//初始化头部nav选中
            }
        },
        sideBar: function() {
            return sideBarDataMap[navPrimaryCurIndex] ? {
                data: sideBarDataMap[navPrimaryCurIndex]
            } : null;
        }()
    });

    Initializer.resize();
});
