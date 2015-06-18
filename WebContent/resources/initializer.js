/**
 * 初始化对象,包含公共的初始化加载方法和全局的方法，包括路由注册
 */
define('Common',
    [
        'commons/pub_menu', 'PubView', 'bs/modal', 'json', 'template',
        'jq/dataTables-bs3', 'bs/popover'
    ],
    function(PubMenu, PubView, Modal, JSON, template) {

    //获取hash
    var _getHash = function(url){
        if(!url && typeof window.location.hash !== "undefined") {
            return window.location.hash || '';
        }
        url = url || document.URL;
        return '#' + url.replace(/^[^#]*#?(.*)$/, '$1' );
    };

    // init dataTable
    if($.fn.dataTable) {
        $.extend(true, $.fn.dataTable.defaults, {
            "dom": "<'row tableMenus'<'col-sm-6 left-col'><'col-sm-6 right-col'f>>" + "t" + "<'row tableInfos'<'col-sm-4'i><'col-sm-8'lp>>",
            "language": {
                "search": "_INPUT_<i class='fa fa-search'></i>",
                "lengthMenu": "每页显示 _MENU_ 条",
                "info": "第 _START_~_END_ 条 / 共<span class='nums'> _TOTAL_ </span>条",
                "infoEmpty": "第 0~0 条 / 共 0 条",
                "paginate": {
                    "previous": '<i class="fa fa-angle-left"></i>',
                    "next": '<i class="fa fa-angle-right"></i>'
                },
                "paginationType": "two_button",
                "emptyTable": '<div class="text-danger text-center">还没有数据</div>',
                "zeroRecords": '<div class="text-danger text-center">没有找到符合查询条件的数据项</div>',
                "infoFiltered": "(总 _MAX_ 条)"
            }
        });
    }

    // init defaultOptions
    Modal.configDefaultOptions(['processing', 'info', 'warning', 'error', 'success'], {
        position: 'right 48'
    });

    return {
        hash: function() {
            return _getHash();
        }(),
        pub: {
            navPrimaryItems: PubMenu.navPrimaryItems,
            sideBarDataMap: PubMenu.sideBarDataMap,
            headerNavIndex: PubMenu.headerNavIndex,
            sideBarNavIndex: null
        },
        initHeaderNavIndex: function() {
            var hash = this.hash;
            hash = hash.split('\/')[0];
            for (var i=0; i<PubMenu.navPrimaryItems.length; i++) {
                var navItem = PubMenu.navPrimaryItems[i];
                if(navItem.link && navItem.link == hash) {
                    this.pub.headerNavIndex = i + 1;
                    return this;
                }
            }
            return this;
        },
        initSideBarNavIndex: function() {
            var hash = this.hash;
            var $li = $("#side-bar").find('[href$="'+hash+'"]').parents('li:first');
            if($li.length) {
                this.pub.sideBarNavIndex = [];
                var indexFirst = $li.attr('index'), indexSecond = 0;
                var $second = $li.parents(".nav-second-level:first");
                if($second.length) {
                    indexSecond = indexFirst;
                    indexFirst = $second.parents("li:first").attr('index');
                    indexFirst && (indexSecond = indexSecond.replace(new RegExp('^'+indexFirst), ''));
                }
                this.pub.sideBarNavIndex[0] = parseInt(indexFirst);
                if(indexSecond) {
                    this.pub.sideBarNavIndex[1] = parseInt(indexSecond);
                }
            }
        },
        $pageMain: null,
        $pageContent: null,
        init: function(){
            var that = this;
            // 注册template公共方法
            template.helper('uiSelect', function(data) {
                var inHtml = that.uiSelect(data);
                return inHtml;
            });
            template.helper('uiSelectList', function(data) {
                if(!PubView.utils.isPlainObject(data)) {
                    data = $.extend({}, {list: data}, {wrapper: false});
                } else {
                    data = $.extend({}, data, {wrapper: false});
                }
                var inHtml = that.uiSelect(data);
                return inHtml;
            });
            // 初始化导航和菜单索引
            this.initHeaderNavIndex();
            this.initSideBarNavIndex();
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
            // 初始化异步请求对象
            this._xhr();
            // 初始化路由表
            this._router();
            // 注册hash监听
            this._registerHashEvent();
            // 取消加载中效果
            $("#loader").loader('destroy');
            return this;
        },
        _inRender: false,
        _deferred: null,
        Deferred: function(callback) {
            if(!this._deferred) {
                this._deferred = $.Deferred();
                PubView.utils.isFunction(callback) && this._deferred.promise().done(callback);
            }
            return this._deferred;
        },
        resolve: function() {
            this._inRender && (this._inRender = false);
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
                this.initSideBarNavIndex();
                if(this.pub.sideBarNavIndex) {
                    PubView.activeSideBar.apply(PubView, this.pub.sideBarNavIndex);
                }
            } else {
                PubView.renderSideBar(null);
            }
            this.pub.headerNavIndex = index;
            this.adjustContentLeft();
        },
        /**
         * 使用dataTables组件初始化表格
         * @param tableSelector
         *          表格选择器 或 表格的jQuery对象
         * @param options
         *          初始化表格时的配置项，若为零配置此参数可忽略，后一个参数往前提
         * @param complete
         *          初始化后的回调方法，此参数也可直接写在options中，对应键是initComplete
         *          function($table, settings, json) {
		 *              // do something
		 *          }
         * @returns dataTable API实例，为 NULL 则表示表格未找到或未初始化成功
         */
        initDataTable: function(tableSelector, options, complete) {
            var _options;
            if(PubView.utils.isFunction(options)) {
                complete = options;
                _options = null;
            } else {
                _options = options;
            }
            if(PubView.utils.isString(tableSelector) || PubView.utils.is$(tableSelector)) {
                var $table;
                if(PubView.utils.isString(tableSelector)) {
                    $table = $(tableSelector);
                } else {
                    $table = tableSelector;
                }
                if($table.length <= 0) return null;
                if(_options && PubView.utils.isFunction(_options.initComplete)) {
                    complete = _options.initComplete;
                }
                _options = $.extend(true, {}, _options, {'initComplete': function() {
                    var firstColumn = this.fnSettings().aoColumns[0];
                    if(firstColumn && !firstColumn.orderable) {
                        $(firstColumn.nTh).removeClass("sorting sorting_asc sorting_desc").addClass(firstColumn.sSortingClass || "sorting_disabled");
                    }
                    var args = [];
                    $.each(arguments, function(i, arg) {
                        args.push(arg);
                    });
                    args.unshift($table);
                    PubView.utils.isFunction(complete) && complete.apply(this, args);
                }});
                return $table.DataTable(_options);
            } else if(PubView.utils.isFunction(complete)) {
                complete.call(this, tableSelector);
            }
            return null;
        },
        _registerHashEvent: function() {
            var that = this;
            var documentMode = document.documentMode;
            //IE8虽然在兼容模式下有onhashchange事件，但不起作用(_isUndefined(documentMode) || documentMode > 7)
            if("onhashchange" in window && !documentMode || documentMode > 7){
                window.onhashchange = function(){
                    that.hash =  _getHash();
                    that.router && that.router.route();
                };
            } else {
                //要兼容IE低版本,暂时采用定时器模拟监听hashchange,最好使用子iframe方法或者jquery.address插件
                var thash = _getHash();
                var t = setInterval(function(){
                    var chash = _getHash();
                    if(chash != thash){
                        that.hash = thash = chash;
                        that.router && that.router.route();
                    }
                }, 100);
            }
        },
        router: null,
        _router: function() {
            var that = this;
            var Router = function() {
                //默认路由入口前缀
                this.ctrlPrefix = 'js/';
                //默认路由入口
                this.ctrlDef = 'index';
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
                //获取默认的路由入口文件路径
                this.getDefaultCtrl = function(hash) {
                    hash = hash || that.hash;
                    if(hash && hash.lastIndexOf('/') < 0) {
                        hash += '/';
                    } else if(!hash) {
                        hash = '#';
                    }
                    var ctrl = hash.replace(/^#/, this.ctrlPrefix);
                    if(ctrl.lastIndexOf('/') == ctrl.length - 1) {
                        ctrl += this.ctrlDef;
                    }
                    return ctrl;
                };
                //重新加载当前页面
                this.reload = function() {
                    this.route();
                };
                //根据hash重新路由或无缝刷新
                this.route = function(hash){
                    hash = hash || that.hash;
                    var ctrl;
                    loop_1:
                        for(var i in this.table.path){
                            var path = this.table.path[i];
                            if(path){
                                var regx = new RegExp(path, "gi");
                                if(regx.test(hash)){
                                    ctrl = this.table.ctrl[i];
                                    break loop_1;
                                }
                            }
                        }
                    if(!ctrl){
                        ctrl = this.getDefaultCtrl(hash);
                    }else{
                    	if(ctrl[0].lastIndexOf('/') == ctrl[0].length - 1) {
                            ctrl += this.ctrlDef;
                        }
                    }
                    if(ctrl){
                        this.loadctrl(ctrl);
                    }
                    return this;
                };
                //加载控制器,并默认执行init初始化
                this.loadctrl = function(ctrl){
                    Modal.loading();
                    var onLoad = function() {
                        that.resetSideBar();
                        Modal.loading('remove');
                    };
                    that.Deferred(onLoad);
                    var ctrlList = [];
                    if(!PubView.utils.isArray(ctrl)) {
                        ctrlList.push(ctrl);
                    } else {
                        ctrlList = ctrl;
                    }
                    //路由后页面载入入口
                    require(ctrlList, function(o){
                        if(o && PubView.utils.isFunction(o.init)) {
                            var initRes = o.init();
                            if(PubView.utils.isObject(initRes) && initRes.done) {
                                initRes.done(function() {
                                    that.resolve.apply(that, arguments);
                                });
                            } else {
                                !that._inRender && that.resolve(initRes);
                            }
                        } else {
                            that.resolve();
                        }
                    }, function(e) {
                        that.resolve();
                        if(e.requireType) {
                            if(e.requireMap) {
                                Modal.error('Script error for ' + e.requireMap.id + ': ' + e.message);
                            } else {
                                Modal.error(e.message.split('\n')[0] + '. Can not load this Control Module');
                            }
                        } else {
                            Modal.error(e.message);
                        }
                        console.error(e);
                    });
                    return this;
                };
            };
            !that.router && (that.router = new Router());
        },
        render: function(renderToPage, tplUrl, data, callback) {
            var that = this,
                _renderToPage, _tplUrl, _data, _beforeRender, _callback;
            if(typeof renderToPage !== "boolean") {
                _renderToPage = false;
                _tplUrl = renderToPage;
                _data = tplUrl;
                _callback = data;
            } else {
                _renderToPage = renderToPage;
                _tplUrl= tplUrl;
                _data = data;
                _callback = callback;
            }
            if(PubView.utils.isPlainObject(_tplUrl)) {
                var obj = $.extend({}, _tplUrl);
                _tplUrl = obj.tpl;
                _data = obj.data;
                _beforeRender = obj.beforeRender;
                _callback = obj.callback;
            }
            if(_tplUrl && PubView.utils.isString(_tplUrl)) {
                try {
                    _renderToPage && (that._inRender = true);
                    _tplUrl = that.xhr._getFullUrl(_tplUrl, true);
                    var posSuffix = _tplUrl.lastIndexOf(".");
                    if(posSuffix == -1) {
                        _tplUrl = _tplUrl + '.html';
                    } else if(posSuffix == _tplUrl.length - 1)  {
                        _tplUrl = _tplUrl + 'html';
                    }
                    var doRender = function(_data) {
                        var data = _data;
                        if(PubView.utils.isArray(_data)) {
                            data = $.extend({}, {list: _data});
                        } else if(!PubView.utils.isPlainObject(_data)) {
                            data = $.extend({}, {data: _data});
                        }
                        require(['rq/text!'+_tplUrl], function(tplText) {
                            try{
                                var render = template.compile(tplText),
                                    inHtml = render(data);
                                if(_renderToPage) {
                                    that.html(that.$pageContent, inHtml);
                                    PubView.utils.isFunction(_callback) && _callback(_data);
                                    that.resolve();
                                } else {
                                    PubView.utils.isFunction(_callback) && _callback(inHtml, _data);
                                }
                            }catch(e){
                                that.resolve();
                                Modal.error(e.message);
                                console.error(e);
                            }
                        }, function(e) {
                            that.resolve();
                            Modal.error("Template load error: " + e.message.split(' ')[0]);
                        });
                    };
                    var filterData = function(data) {
                        var _data;
                        try {
                            if(typeof _beforeRender === "function") {
                                _data = _beforeRender(data);
                            }
                        } catch (e) {
                            _data = null;
                        }
                        return _data ? _data : data;
                    };
                    if(PubView.utils.isPlainObject(_data)) {
                        doRender(filterData(_data));
                    } else if(_data && PubView.utils.isString(_data)) {
                        that.xhr.ajax(_data, function(data) {
                            doRender(filterData(data));
                        });
                    } else if(PubView.utils.isFunction(_data)) {
                        _callback = _data;
                        doRender();
                    } else {
                        doRender(_data);
                    }
                } catch (e) {
                    that.resolve();
                    Modal.error(e.message);
                    console.error(e);
                }
            }
        },
        html: function(parent, inHtml) {
            try {
                var $parent;
                if(!PubView.utils.is$(parent)) {
                    $parent = $(parent);
                } else {
                    $parent = parent;
                }
                if($parent && inHtml) {
                    $parent.html(inHtml);
                    this._initComponents($parent);
                }
            } catch (e) {
                Modal.error('Common html error: '+ e.message);
            }
        },
        componentsDefaults: {
            'iCheck': {
                radioClass: "iradio-info",
                checkboxClass: "icheckbox-info"
            }
        },
        _initComponents: function($parent) {
            var that = this;
            $parent.find('[data-spy]').each(function() {
                var $this = $(this), spyApi = $this.attr('data-spy');
                if(spyApi === 'scroll') {
                    $this.scrollspy();
                } else if($.fn[spyApi]) {
                    $this[spyApi](that.componentsDefaults[spyApi]);
                }
            });
            $parent.find('[data-toggle="tooltip"]').tooltip();
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
                    Modal.error(e.message);
                    console.error(e);
                    if(this._deferred) {
                        this.resolve(false);
                    }
                }
            }
        },
        requestCSS: function(cssUrl, callback) {
            var that = this;
            if(cssUrl && PubView.utils.isString(cssUrl)) {
                require(['rq/css!'+(cssUrl.indexOf('/')==0?PubView.root:PubView.rqBaseUrl+'/')+cssUrl], function() {
                    PubView.utils.isFunction(callback) && callback.apply(that, arguments);
                });
            }
        },
        xhr: null,
        _xhr: function() {
            var that = this;
            var XHR = function() {
                //请求header
                this.headers = {
                    Accept: "application/json",
                    'Content-Type': "application/json"
                };
                this.ajax = function(url, success) {
                    var resolve = function(msg) {
                        that._inRender && (that._inRender = false);
                        that._deferred && that.resolve();
                        msg && Modal.error(msg);
                    };
                    if(url) {
                        var object;
                        if(PubView.utils.isString(url)) {
                            object = $.extend({}, {url: url});
                        } else if(!PubView.utils.isPlainObject(url) || !url.url) {
                            resolve("Ajax Error: 请确定请求内容url");
                            return false;
                        } else {
                            object = $.extend({}, url);
                        }
                        object.url = this._getFullUrl(object.url);
                        var defaults = {
                            type: 'GET',
                            headers: this.headers,
                            dataType: 'json',
                            error: function(xhr, errorText) {
                                if(errorText) {
                                    errorText = errorText.replace(/(.+)error$/, "$1 error").replace(/\b\w+\b/g,function(w) {
                                        return w.substr(0,1).toLocaleUpperCase() + w.substring(1);
                                    });
                                } else {
                                    errorText = 'Error';
                                }
                                resolve("Ajax "+errorText+ (xhr.status >= 400 ? ": Status "+xhr.status+" / "+xhr.statusText : "."));
                            }
                        };
                        return $.ajax($.extend(
                                {},
                                defaults,
                                object,
                                PubView.utils.isFunction(success) ? {success: success} : null)
                        );
                    } else {
                        resolve("Ajax Error: 请确定请求内容url");
                        return false;
                    }
                };
                this.get = function(url, data, success) {
                    var _data, _success;
                    if(PubView.utils.isFunction(data)) {
                        _success = data;
                        _data = null;
                    } else {
                        _data = data;
                        _success = success;
                    }
                    return this.ajax({
                        'type': 'GET',
                        'url': url,
                        'data': _data,
                        'success': _success
                    });
                };
                this.getSync = function(url, data, success) {
                    var _data, _success;
                    if(PubView.utils.isFunction(data)) {
                        _success = data;
                        _data = null;
                    } else {
                        _data = data;
                        _success = success;
                    }
                    return this.ajax({
                        'type': 'GET',
                        'async': false,
                        'url': url,
                        'data': _data,
                        'success': _success
                    });
                };
                this.post = function(url, data, success) {
                    var _data, _success;
                    if(PubView.utils.isFunction(data)) {
                        _success = data;
                        _data = null;
                    } else {
                        _data = data;
                        _success = success;
                    }
                    return this.ajax({
                        'type': 'POST',
                        'url': url,
                        'data': _data,
                        'success': _success
                    });
                };
                this.postSync = function(url, data, success) {
                    var _data, _success;
                    if(PubView.utils.isFunction(data)) {
                        _success = data;
                        _data = null;
                    } else {
                        _data = data;
                        _success = success;
                    }
                    return this.ajax({
                        'type': 'POST',
                        'async': false,
                        'url': url,
                        'data': _data,
                        'success': _success
                    });
                };
                this.put = function(url, data, success) {
                    var _data, _success;
                    if(PubView.utils.isFunction(data)) {
                        _success = data;
                        _data = null;
                    } else {
                        _data = data;
                        _success = success;
                    }
                    return this.ajax({
                        'type': 'PUT',
                        'url': url,
                        'data': _data,
                        'success': _success
                    });
                };
                this.putSync = function(url, data, success) {
                    var _data, _success;
                    if(PubView.utils.isFunction(data)) {
                        _success = data;
                        _data = null;
                    } else {
                        _data = data;
                        _success = success;
                    }
                    return this.ajax({
                        'type': 'PUT',
                        'async': false,
                        'url': url,
                        'data': _data,
                        'success': _success
                    });
                };
                this.del = function(url, data, success) {
                    var _data, _success;
                    if(PubView.utils.isFunction(data)) {
                        _success = data;
                        _data = null;
                    } else {
                        _data = data;
                        _success = success;
                    }
                    return this.ajax({
                        'type': 'DELETE',
                        'url': url,
                        'data': _data,
                        'success': _success
                    });
                };
                this.delSync = function(url, data, success) {
                    var _data, _success;
                    if(PubView.utils.isFunction(data)) {
                        _success = data;
                        _data = null;
                    } else {
                        _data = data;
                        _success = success;
                    }
                    return this.ajax({
                        'type': 'DELETE',
                        'async': false,
                        'url': url,
                        'data': _data,
                        'success': _success
                    });
                };
                this.postJSON = function(url, data, success) {
                    var _data, _success;
                    if(PubView.utils.isFunction(data)) {
                        _success = data;
                        _data = {};
                    } else {
                        _data = data;
                        _success = success;
                    }
                    try {
                        return this.ajax({
                            'type': 'POST',
                            'url': url,
                            'data': JSON.stringify(_data),
                            'contentType': 'application/json',
                            'success': _success
                        });
                    } catch (e) {
                        Modal.error("Ajax postJSON Error: data param parse error.");
                    }
                };
                this.postJSONSync = function(url, data, success) {
                    var _data, _success;
                    if(PubView.utils.isFunction(data)) {
                        _success = data;
                        _data = {};
                    } else {
                        _data = data;
                        _success = success;
                    }
                    try {
                        return this.ajax({
                            'type': 'POST',
                            'async': false,
                            'url': url,
                            'data': JSON.stringify(_data),
                            'contentType': 'application/json',
                            'success': _success
                        });
                    } catch (e) {
                        Modal.error("Ajax postJSONSync Error: data param parse error.");
                    }
                };
                this.putJSON = function(url, data, success) {
                    var _data, _success;
                    if(PubView.utils.isFunction(data)) {
                        _success = data;
                        _data = {};
                    } else {
                        _data = data;
                        _success = success;
                    }
                    try {
                        return this.ajax({
                            'type': 'PUT',
                            'url': url,
                            'data': JSON.stringify(_data),
                            'contentType': 'application/json',
                            'success': _success
                        });
                    } catch (e) {
                        Modal.error("Ajax putJSON Error: data param parse error.");
                    }
                };
                this.putJSONSync = function(url, data, success) {
                    var _data, _success;
                    if(PubView.utils.isFunction(data)) {
                        _success = data;
                        _data = {};
                    } else {
                        _data = data;
                        _success = success;
                    }
                    try {
                        return this.ajax({
                            'type': 'PUT',
                            'url': url,
                            'data': JSON.stringify(_data),
                            'contentType': 'application/json',
                            'success': _success
                        });
                    } catch (e) {
                        Modal.error("Ajax putJSONSync Error: data param parse error.");
                    }
                };
                this._getFullUrl = function(url, isResource) {
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
                };
            };
            !that.xhr && (that.xhr = new XHR());
        },
        uiSelect: function(options, renderTo) {
            var defaults = {wrapper: true, className: "form-control"};
            if(!PubView.utils.isPlainObject(options)) {
                options = $.extend({}, {list: options}, defaults);
            } else {
                options = $.extend({}, defaults, options);
            }
            var inHtml = this.template('ui-select', options);
            try {
                if(renderTo) {
                    if(!PubView.utils.is$(renderTo)) {
                        renderTo = $(renderTo);
                    }
                    renderTo.append(inHtml);
                }
            } catch (e) { }
            return inHtml;
        }
    };
});

require(['PubView', 'Common', 'commons/router_table'], function(PubView, Common, RouterTable) {
    // 初始化
    Common.init();

    // 路由表注册
    $.each(RouterTable, function(path, ctrl) {
        Common.router.when(path, ctrl)
    });

    //路由当前页面
    Common.router.route();

    // 设置公共header和侧边栏
    PubView({
        header: {
            data: {
                logo: { },
                nav: [
                    {
                        current: Common.pub.headerNavIndex,
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
            return Common.pub.sideBarDataMap[Common.pub.headerNavIndex] ?
                $.extend(
                    {
                        data: Common.pub.sideBarDataMap[Common.pub.headerNavIndex]
                    },
                    Common.pub.sideBarNavIndex ? {current: Common.pub.sideBarNavIndex} : null
                ) : null;
        }()
    });

    Common.resize();
});
