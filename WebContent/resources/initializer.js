/**
 * 初始化对象,包含公共的初始化加载方法和全局的方法，包括路由注册
 */
define('Common', ['PubView', 'bs/modal', 'json', 'template', 'jq/dataTables', 'bs/popover'], function(PubView, Modal, JSON, template) {
    //获取hash
    var _getHash = function(url){
        if(!url && typeof window.location.hash !== "undefined") {
            return window.location.hash;
        }
        url = url || document.URL;
        return '#' + url.replace(/^[^#]*#?(.*)$/, '$1' );
    };

    // init nav & sideBar
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
        var hash = _getHash(), regExp = new RegExp(hash+"$", "i");
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

    // init dataTable
    if($.fn.dataTable) {
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
    }

    return {
        pub: {
            navPrimaryItems: navPrimaryItems,
            navPrimaryCurIndex: navPrimaryCurIndex,
            sideBarDataMap: sideBarDataMap
        },
        $pageMain: null,
        $pageContent: null,
        getHash: _getHash,
        init: function(){
            var that = this;
            // 注册template公共方法
            template.helper('uiSelect', function(data) {
                var inHtml = that.uiSelect(data);
                return inHtml;
            });
            // 初始化页面结构
            $(document.body).removeClass("loading").append(
                '<div id="page-main" class="clearfix">'+
                    '<div class="page-content clearfix"></div>'+
                '</div>'
            );
            this.$pageMain = $("#page-main");
            this.$pageContent = $("#page-main").children('.page-content:first');
            this.resize();
            // resize监听
            $(window).on('resize', this.resize);
            // 初始化路由表
            this._router();
            // 注册hash监听
            this._registerHashEvent();
            // 取消加载中效果
            $("#loader").loader('destroy');
            return this;
        },
        _deferred: null,
        Deferred: function() {
            if(!this._deferred) {
                this._deferred = $.Deferred();
            }
            return this._deferred;
        },
        resolve: function() {
            if(this._deferred) {
                this._deferred.resolve.apply(this, arguments);
                delete this._deferred;
            }
        },
        resize: function() {
            if(this.$pageMain && this.$pageContent) {
                this.$pageMain.css({minHeight: 0});
                //dom
                var $aside = $("aside");
                //height
                var winH = $(window).height(),
                    asideH = $aside.innerHeight() || 0,
                    contentH = winH - this.$pageMain.offset().top - (this.$pageMain.outerHeight() - this.$pageMain.innerHeight());
                contentH = contentH < 1 ? 1 : contentH;
                if(contentH < asideH){
                    this.$pageContent.css('min-height',asideH);
                }else{
                    this.$pageContent.css('min-height',contentH);
                }
                this.adjustContentLeft();
                return this;
            }
        },
        adjustContentLeft: function() {
            var $aside = $("aside"),
                asideW = $aside.outerWidth(true) || 0,
                asideMinW = parseFloat($aside.css('min-width')) || 1,
                contentMgL = parseFloat(this.$pageContent.css('margin-left')) || 1;
            //set margin
            if(contentMgL < asideMinW) {
                this.$pageContent.css('margin-left', asideMinW+"px");
            } else {
                this.$pageContent.css('margin-left', asideW+"px");
            }
            return this;
        },
        resetSideBar: function() {
            var $headerNav = $('#header-nav > [role="navigation"][index="1"]'),
                index = parseInt($headerNav.find('.active').attr('index')) || 1;
            if(this.pub.sideBarDataMap[index]) {
                PubView.renderSideBar({ data: this.pub.sideBarDataMap[index] });
            } else {
                PubView.renderSideBar(null);
            }
            this.adjustContentLeft();
        },
        initDataTable: function($tar, cb) {
            if(PubView.utils.is$($tar)) {
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
                $tar.dataTable({
                    bProcessing : true,
                    bSort : false
                });
                typeof cb === "function" && cb($tar);
            }
            return this;
        },
        router: null,
        _registerHashEvent: function() {
            var that = this;
            var documentMode = document.documentMode;
            //IE8虽然在兼容模式下有onhashchange事件，但不起作用(_isUndefined(documentMode) || documentMode > 7)
            if("onhashchange" in window && !documentMode || documentMode > 7){
                window.onhashchange = function(){
                    var hash =  that.getHash();
                    that.router && that.router.route();
                };
            } else {
                //要兼容IE低版本,暂时采用定时器模拟监听hashchange,最好使用子iframe方法或者jquery.address插件
                var thash = that.getHash();
                var t = setInterval(function(){
                    var chash = that.getHash();
                    if(chash != thash){
                        thash = chash;
                        that.router && that.router.route();
                    }
                }, 100);
            }
        },
        _router: function() {
            var that = this;
            var Router = function() {
                //路由表
                this.table = {
                    path: [], ctrl:[]
                };
                //注册路由
                this.when = function(path, ctrl){
                    this.table.path.push(path);
                    this.table.ctrl.push(ctrl);
                    return this;
                };
                //注册默认路由
                this.otherwise = function(ctrl){
                    this.table.path.unshift("^default$");
                    this.table.ctrl.unshift(ctrl);
                    return this;
                };

                //根据hash重新路由或无缝刷新
                this.route = function(hash){
                    debugger;
                    hash = hash || that.getHash();
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
                };
                //加载控制器,并默认执行init初始化
                this.loadctrl = function(ctrl){
                    Modal.loader();
                    var onLoad = function() {
                        that.resetSideBar();
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
                };
            };
            !that.router && (that.router = new Router());
        },
        render: function(handleRender, tplUrl, data, callback) {
            var that = this,
                _handleRender, _tplUrl, _data, _callback;
            if(typeof handleRender !== "boolean") {
                _handleRender = false;
                _tplUrl = handleRender;
                _data = tplUrl;
                _callback = data;
            } else {
                _handleRender = handleRender;
                _tplUrl= tplUrl;
                _data = data;
                _callback = callback;
            }
            if(_tplUrl && PubView.utils.isString(_tplUrl)) {
                try {
                    _tplUrl = that.xhr._getFullUrl(_tplUrl, true);
                    var posSuffix = _tplUrl.lastIndexOf(".");
                    if(posSuffix == -1) {
                        _tplUrl = _tplUrl + '.html';
                    } else if(posSuffix == _tplUrl.length - 1)  {
                        _tplUrl = _tplUrl + 'html';
                    }
                    var doRender = function(data) {
                        if(PubView.utils.isArray(data)) {
                            data = $.extend({}, {list: data});
                        } else if(!PubView.utils.isPlainObject(data)) {
                            data = $.extend({}, {data: data});
                        }
                        require(['text!'+_tplUrl], function(tplText) {
                            try{
                                var render = template.compile(tplText),
                                    inHtml = render(data);
                                if(!_handleRender) {
                                    that.$pageContent.html(inHtml);
                                    PubView.utils.isFunction(_callback) && _callback();
                                } else {
                                    PubView.utils.isFunction(_callback) && _callback(inHtml);
                                }
                            }catch(e){
                                throw "数据解析出错，请稍后再试…";
                            }
                        });
                    };
                    if(PubView.utils.isPlainObject(_data)) {
                        doRender(_data);
                    } else if(_data && PubView.utils.isString(_data)) {
                        that.xhr.ajax(_data, function(data) {
                            doRender(data);
                        });
                    } else if(PubView.utils.isFunction(_data)) {
                        _callback = _data;
                        doRender();
                    } else {
                        doRender();
                    }
                } catch (e) {
                    Modal.danger(e.message);
                    if(that._deferred) {
                        that.resolve(false);
                    }
                }
            }
        },
        template: function(tplId, data, callback) {
            if(PubView.utils.isString(tplId)) {
                try {
                    if(PubView.utils.isFunction(data)) {
                        callback = data;
                    } else if(PubView.utils.isArray(data)) {
                        data = $.extend({}, {list: data});
                    } else if(!PubView.utils.isPlainObject(data)) {
                        data = $.extend({}, {data: data});
                    }
                    var inHtml;
                    if(/^[_a-z][a-z\-_0-9]*$/i.test(tplId)) {
                        inHtml = template(tplId, data);
                    } else {
                        var render = template.compile(tplId);
                        inHtml = render(data);
                    }
                    if(PubView.utils.isFunction(callback)) {
                        callback(inHtml);
                    } else {
                        return inHtml;
                    }
                } catch (e) {
                    Modal.danger(e.message);
                    if(this._deferred) {
                        this.resolve(false);
                    }
                }
            }
        },
        xhr: {
            //请求header
            header: {
                Accept: "application/json",
                'Content-Type': "application/json"
            },
            ajax: function(object, callback) {
                if(object) {
                    if(PubView.utils.isString(object)) {
                        object = $.extend({}, {url: object});
                    } else if(!PubView.utils.isPlainObject(object) || !object.url) {
                        Modal.danger("Ajax Error: 请确定请求内容url");
                        return false;
                    }
                    object.url = this._getFullUrl(object.url);
                    var defaults = {
                        type: 'GET',
                        headers: this.headers,
                        dataType: 'json',
                        error: function(xhr, status) {
                            Modal.danger("Sorry, there was a problem!");
                        }
                    };
                    return $.ajax($.extend(
                        {},
                        defaults,
                        object,
                        PubView.utils.isFunction(callback) ? {success: callback} : null)
                    );
                } else {
                    Modal.danger("Ajax Error: 请确定请求内容url");
                    if(this._deferred) {
                        this.resolve(false);
                    }
                    return false;
                }
            },
            postJSON: function(url, data, callback) {
                return this.ajax({
                    'type': 'POST',
                    'url': url,
                    'data': JSON.stringify(data),
                    'success': callback
                });
            },
            putJSON: function(url, data, callback) {
                return this.ajax({
                    'type': 'PUT',
                    'url': url,
                    'data': JSON.stringify(data),
                    'success': callback
                });
            },
            _getFullUrl: function(url, isResource) {
                if(url && PubView.utils.isString(url)) {
                    if(/^((https?|s?ftp):)|(file:\/)\/\//.test(url)) {
                        return url;
                    }
                    if(!isResource) {
                        return PubView.root + (url.indexOf("/") == 0 ? url : '/' + url);
                    }
                    return url;
                } else {
                    return PubView.root;
                }
            }
        },
        uiSelect: function(data, appendToEl) {
            var defaults = {className: "form-control"};
            if(!PubView.utils.isPlainObject(data)) {
                data = $.extend({}, {list: data}, defaults);
            } else {
                data = $.extend({}, defaults, data);
            }
            var inHtml = this.template('ui-select', data);
            try {
                if(appendToEl) {
                    if(!PubView.utils.is$(appendToEl)) {
                        appendToEl = $(appendToEl);
                    }
                    appendToEl.append(inHtml);
                }
            } catch (e) { }
            return inHtml;
        }
    };
});

require(['PubView', 'Common'], function(PubView, Common) {
    // 初始化
    Common.init();

    // 注册路由规则
    with(Common.router){
        when("^#?(!.*)?$", ['js/index']);
        when("^#ccenter(!.*)?$", ['js/ccenter/vm']);
        when("^#ccenter/vm(!.*)?$", ['js/ccenter/vm']);
        when("^#ccenter/storage(!.*)?$", ['js/ccenter/storage']);
        //otherwise(['js/ccenter/vm']);
    }

    //路由当前页面
    Common.router.route();

    // 设置公共header和侧边栏
    PubView({
        header: {
            data: {
                logo: { },
                nav: [
                    {
                        current: Common.pub.navPrimaryCurIndex,
                        items: Common.pub.navPrimaryItems
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
                //初始化头部nav选中
                var $navWrapper = $('#header-nav>[role="navigation"][index="1"]>ul'),
                    $navItems = $navWrapper.children("li"),
                    $navAnimator = $('<div class="nav-animator"></div>').appendTo($navWrapper),
                    navItemCur = $navWrapper.find('li.active'),
                    navCurIndex = parseInt(navItemCur.attr("index")),
                    paramAnimate = {'duration':300, 'queue':false},
                    widthArr = [];
                var getLeftDistanceByIndex = function(index){
                    var result = 0;
                    for(var i=0;i<index;i++){
                        result += parseInt(widthArr[i]);
                    }
                    return result + "px";
                };
                $navItems.on("click", function() {
                    var index = parseInt($(this).attr('index'));
                    navItemCur = $navWrapper.find('li[index="'+index+'"]');
                    navCurIndex = index;
                    PubView.activeHeader(index, 1);
                });
                //初始化nav宽度数组和选中位置
                $navItems.each(function(i) {
                    var width = $(this).outerWidth();
                    widthArr[i] = width;
                    if($(this).hasClass("active")) {
                        $navAnimator.css({display:"block", width:width, left:getLeftDistanceByIndex(i)});
                    }
                    //$(this).attr("index",i);
                });
                $navItems.on("mouseenter",function() {
                    var index = parseInt($(this).attr("index")),
                        width = $(this).outerWidth(true);
                    $(this).addClass("hover");
                    $navAnimator.animate({width:width,left:getLeftDistanceByIndex(index-1)},paramAnimate);
                }).on("mouseleave",function() {
                    $(this).removeClass("hover");
                });
                $navWrapper.on("mouseleave",function() {
                    $navAnimator.animate({width:navItemCur.outerWidth(true),left:getLeftDistanceByIndex(navCurIndex-1)},paramAnimate);
                });
                // 初始化搜索框
                var $searchBar = $header.find('li[index="search-bar"]');
                $searchBar.find(".form-control").click(function(e) {
                    e.preventDefault();
                    $searchBar.addClass("active");
                    return false;
                });
                $(document).on("click", function(e) {
                    $searchBar.each(function() {
                        if(!$.contains(this, e.target)) {
                            $(this).removeClass("active");
                        }
                    });
                });
            }
        },
        sideBar: function() {
            return Common.pub.sideBarDataMap[Common.pub.navPrimaryCurIndex] ? {
                data: Common.pub.sideBarDataMap[Common.pub.navPrimaryCurIndex],
                rendered: function() {
                    var lis = $('#side-bar').find("li");
                    $(document).on('click', '#side-bar .nav-first-level', function(){
                        var arrow = $(this).children('.fa-arrows'),
                            second = $(this).siblings('.nav-second-level');
                        //其他
                        $('#side-bar .nav-first-level').each(function(){
                            var tul = $(this).siblings('.nav-second-level'),
                                tarrow = $(this).children('.fa-arrows');
                            if(tul.length && tul.attr('aria-expanded') == "false"){
                                tarrow.removeClass('fa-angle-right').addClass('fa-angle-down');
                            }
                        });
                        //
                        if(second.length){
                            if(second.attr('aria-expanded') == "false"){
                                arrow.removeClass('fa-angle-right').addClass('fa-angle-down');
                            }else{
                                arrow.removeClass('fa-angle-down').addClass('fa-angle-right');
                            }
                        }
                    });
                }
            } : null;
        }()
    });

    Common.resize();
});