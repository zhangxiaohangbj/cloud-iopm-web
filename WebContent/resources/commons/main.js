/**
 * 初始化对象,包含公共的初始化加载方法和全局的方法，包括路由注册
 */
define('commons/main',
    [
        'PubView', 'bs/modal', 'json', 'template',
        'commons/pub_menu', 'commons/router_table',
        'jq/dataTables-bs3', 'bs/popover', 'jq/cookie'
    ],
    function(
        PubView, Modal, JSON, template,
        PubMenu, RouterTable
    ) {

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
        showLocalLoading: function($wrapper){
            $wrapper.append('<p class="loading" style="width:100%;text-align:center;line-height:100px;">加载中...</p>');
        },
        hideLocalLoading: function($wrapper){
            $wrapper.find('.loading').remove();
        },
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
                '<div id="page-main">'+
                    '<div class="container clearfix">'+
                        '<div class="page-content clearfix"></div>'+
                    '</div>'+
                '</div>'
            );
            this.$pageMain = $("#page-main");
            this.$pageContent = $("#page-main").find('.page-content:first');
            // 初始化异步请求对象
            this._xhr();
            // 初始化路由表
            this._router(RouterTable);
            // 注册hash监听
            this._registerHashEvent();
            // 初始化cookie工具
            this._cookies();
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
            if(this.$pageMain) {
                var winH = $(window).height(),
                    mainH = winH - this.$pageMain.offset().top;
                mainH = mainH <=0 ? 1 : mainH;
                this.$pageMain.css('height', mainH + 'px');
                debugger;
                if(this.$pageContent) {
                    var $aside = $("aside"),
                        asideH = $aside.innerHeight() || 0;
                    var contentMinH = this.$pageMain.height(),
                        $contentParent =  this.$pageContent.parent(),
                        contentBorderH = $contentParent.outerHeight() - $contentParent.innerHeight();
                    contentMinH -= contentBorderH;
                    contentMinH = contentMinH <=0 ? 1 : contentMinH;
                    if(contentMinH < asideH){
                        this.$pageContent.css('min-height',asideH);
                    }else{
                        this.$pageContent.css('min-height',contentMinH);
                    }
                    this.adjustContentLeft();
                }
            }
            return this;
        },
        adjustContentLeft: function() {
            var $aside = $("aside");
            if(!$aside || $aside.length <= 0) {
                this.$pageContent.css('margin-left', "0px");
                return this;
            }
            var asideW = $aside.outerWidth(true) || 0,
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
            var that = this, _options;
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
                if($table.length <= 0 || !$table.selector) return null;
                if(_options && PubView.utils.isFunction(_options.initComplete)) {
                    complete = _options.initComplete;
                }
                var th_num = $table.find("thead th").length;
                if($table.find("tfoot")){
                	var td_num = $table.find("tfoot td").length;
                	if(th_num > td_num)
                		$table.find("tfoot td:last").attr("colspan",th_num-td_num+1);
                	if(th_num < td_num)
                		$table.find("thead th:last").attr("colspan",td_num-th_num+1);
                }
                _options = $.extend(true, {}, _options, {
                    'initComplete': function() {
                    	var settings = this.fnSettings();
                        var firstColumn = settings.aoColumns[0];
                        if(firstColumn && !firstColumn.orderable) {
                            $(firstColumn.nTh).removeClass("sorting sorting_asc sorting_desc").addClass(firstColumn.sSortingClass || "sorting_disabled");
                        }
                        var rowDataList = settings.aoData;
                        if(rowDataList) {
                        	$.each(rowDataList, function(i, rowData) {
                        		if(rowData._aFilterData) {
                        			$(rowData.nTr).data('rowData.dt', rowData._aFilterData);
                        		} else {
                        			$(rowData.nTr).data('rowData.dt', rowData._aData);
                        		}
                        	});
                        }
                        var args = [];
                        $.each(arguments, function(i, arg) {
                            args.push(arg);
                        });
                        args.unshift($table);
                        PubView.utils.isFunction(complete) && complete.apply(this, args);
                    },
                    /*fnServerData是与服务器端交换数据时被调用的函数
	  	  		       * sSource： 就是sAjaxSource中指定的地址，接收数据的url需要拼装成 v2.0/users/page/10/1 格式
	  	  		       *      aoData[4].value为每页显示条数，aoData[3].value/aoData[4].value+1为请求的页码数
	  	  		       * aoData：请求参数，其中包含search 输入框中的值
	  	  		    * */
                    'fnServerData': function( sSource, aoData, fnCallback ) {
      		    	  	//前端处理搜索关键字的转换
      		    	  	var $filter = $table.prev().find('.dataTables_filter'),
      		    	  		parameter = "";
      		    	  	var getSeparator = function(parameter){
      		    	  		return parameter.indexOf('?') > -1 ? '&' : '?';
      		    	  	}
      		    	  	$filter.find('select,input').each(function(){
      		    	  		var filterKey = $(this).attr('name'),
      		    	  			filterVal = $(this).val();
      		    	  		if(filterKey && filterVal){
      		    	  			parameter += getSeparator(parameter)+filterKey+"="+filterVal;
      		    	  		}
      		    	  	})
    		    	    $.ajax({
    		    	        "url": sSource + (aoData[3].value/aoData[4].value+1) +"/"+aoData[4].value+parameter,
    		    	        //"data":aoData,
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
                    'drawCallback': function( settings ) {
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
                    }
                });
                var tableFlag = true;
                $.fn.dataTableExt.errMode = function(table, errCode, errText) {
                    tableFlag = false;
                    var errMsg = "";
                    switch(errCode) {
                        case 3:
                            errMsg = "DataTables error: table id='"+$table.selector+"' has already been initialised.";
                            break;
                        default:
                            errMsg = errText.replace("warning:", "error:");
                    }
                    that.error(errMsg);
                };
                var tableApi = $table.DataTable(_options);
                !tableFlag && (tableApi = null);
                return tableApi;
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
        _router: function(RouterTable) {
            var that = this;
            var Router = function(RouterTable) {
                var self = this;
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
                    if(hash){
                        if(hash.lastIndexOf('/') < 0){
                            hash += '/';
                        }
                        if(hash.lastIndexOf('!') != -1){
                            hash = hash.substring(0,hash.lastIndexOf('!'));
                        }
                    }else{
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
                        that.clearError();
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
                        that.clearError();
                        if(e.requireType) {
                            if(e.requireMap) {
                                that.error('Script error for ' + e.requireMap.id + ': ' + e.message);
                            } else {
                                that.error(e.message.split('\n')[0] + '. Can not load this Control Module');
                            }
                        } else {
                            that.error(e.message);
                        }
                    });
                    return this;
                };
                // 路由表注册
                if(PubView.utils.isPlainObject(RouterTable)) {
                    $.each(RouterTable, function(path, ctrl) {
                        self.when(path, ctrl)
                    });
                }
            };
            !that.router && (that.router = new Router(RouterTable));
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
            var renderDef = $.Deferred();
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
                                    renderDef.resolve(tplText, _data);
                                    PubView.utils.isFunction(_callback) && _callback.call(that, tplText, _data);
                                    that.resolve();
                                } else {
                                    renderDef.resolve(inHtml, tplText, _data);
                                    PubView.utils.isFunction(_callback) && _callback.call(that, inHtml, tplText, _data);
                                }
                            }catch(e){
                                renderDef.reject(e);
                                that.resolve();
                                that.error(e);
                            }
                        }, function(e) {
                            renderDef.reject(e);
                            that.resolve();
                            that.error("Template load error: " + e.message.split(' ')[0]);
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
                    renderDef.reject(e);
                    that.resolve();
                    that.error(e);
                }
            } else {
                renderDef.resolve('');
            }
            return renderDef;
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
                this.error('Common html error: '+ e.message);
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
                    this.error(e);
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
                /**
                 * 服务器端请求方法
                 * @param request 请求参数，可为字符串，数组、对象等。
                 *                {String} 若为字符串: 作为请求url
                 *                {Object} 若为对象: 作为请求配置项，必须含有url属性
                 *                {Array} 若为数组: 将同时发送多个请求。数组每项配置同以上{String}和{Object}规则，不含有请求地址url的项将被过滤掉
                 * @param success 请求成功后的回调
                 *                若同时发送了多个请求，多个请求的回调将以多个参数形式返回，即 fn{data1, data2, ...}
                 * @param error 请求错误后的回调
                 *                若多个请求中有一个请求发生了错误，将执行此回调方法，参数同ajax的error回调 fn{xhr, errorName, errorText}
                 */
                this.ajax = function(request, success, error) {
                    var self = this;
                    var resolve = function(msg) {
                        that._inRender && (that._inRender = false);
                        that._deferred && that.resolve();
                        msg && that.error(msg);
                    };
                    if(request) {
                        var defaults = {
                                type: 'GET',
                                headers: this.headers,
                                dataType: 'json'
                            },
                            failureCallback = function(xhr, errorName, errorText) {
                                if(errorName) {
                                    errorName = errorName.replace(/(.+)error$/, "$1 error").replace(/\b\w+\b/g,function(w) {
                                        return w.substr(0,1).toLocaleUpperCase() + w.substring(1);
                                    });
                                } else {
                                    errorName = 'Error';
                                }
                                resolve("Ajax "+errorName+ (xhr.status >= 400 ? ": Status "+xhr.status+" / "+xhr.statusText : "."));

                                PubView.utils.isFunction(error) && error.apply(that, arguments);
                            };
                        var requests = this._initRequests(request);
                        if(requests.length <= 0) {
                            resolve("Ajax Error: 请确定请求内容url");
                            return false;
                        }
                        var deferreds = [], requestConf;
                        $.each(requests, function(i, req) {
                            req.url = self._getFullUrl(req.url);
                            requestConf = $.extend({}, defaults, req);
                            deferreds.push($.ajax(requestConf));
                        });
                        var deferredsHandler = $.when.apply(that, deferreds);
                        return deferredsHandler.then(
                            function() {
                                var results = [], errors = [];
                                if(requests.length > 1) {
                                    $.each(arguments, function(i, arg) {
                                        if(arg[0] && arg[0].error) {
                                            errors.push(arg[0]);
                                        } else {
                                            results.push(arg[0]);
                                        }
                                    });
                                } else {
                                    if(arguments[0] && arguments[0].error) {
                                        errors.push(arguments[0]);
                                    } else {
                                        results.push(arguments[0]);
                                    }
                                }
                                if(errors.length > 0) {
                                    var errMsg;
                                    $.each(errors, function(i, error) {
                                        if(error.message) errMsg = error.message;
                                    });
                                    errMsg = errMsg || '服务器端发生未知错误';
                                    resolve("Ajax Error: "+errMsg);

                                    PubView.utils.isFunction(error) && error.apply(that, errors);
                                } else {
                                    PubView.utils.isFunction(success) && success.apply(that, results);
                                }
                            },
                            function() {
                                // failure
                                failureCallback.apply(that, arguments);
                            }
                        );
                    } else {
                        resolve("Ajax Error: 请确定请求内容url");
                    }
                };
                this.get = function(url, data, success, error) {
                    var defaults = { 'type': 'GET' };
                    return this._createAjax(defaults, arguments);
                };
                this.getSync = function(url, data, success, error) {
                    var defaults = { 'type': 'GET','async': false };
                    return this._createAjax(defaults, arguments);
                };
                this.post = function(url, data, success, error) {
                    var defaults = { 'type': 'POST' };
                    return this._createAjax(defaults, arguments);
                };
                this.postSync = function(url, data, success, error) {
                    var defaults = { 'type': 'POST','async': false };
                    return this._createAjax(defaults, arguments);
                };
                this.put = function(url, data, success, error) {
                    var defaults = { 'type': 'PUT' };
                    return this._createAjax(defaults, arguments);
                };
                this.putSync = function(url, data, success, error) {
                    var defaults = { 'type': 'PUT','async': false };
                    return this._createAjax(defaults, arguments);
                };
                this.del = function(url, data, success, error) {
                    var defaults = { 'type': 'DELETE' };
                    return this._createAjax(defaults, arguments);
                };
                this.delSync = function(url, data, success, error) {
                    var defaults = { 'type': 'DELETE','async': false };
                    return this._createAjax(defaults, arguments);
                };
                this.postJSON = function(url, data, success, error) {
                    var defaults = { 'type': 'POST','contentType': 'application/json' };
                    try {
                        data && !PubView.utils.isFunction(data) && (arguments[1] = JSON.stringify(data));
                        return this._createAjax(defaults, arguments);
                    } catch (e) {
                        that.error("Ajax postJSON Error: data param parse error.");
                    }
                };
                this.postJSONSync = function(url, data, success, error) {
                    var defaults = { 'type': 'POST','contentType': 'application/json','async': false };
                    try {
                        data && !PubView.utils.isFunction(data) && (arguments[1] = JSON.stringify(data));
                        return this._createAjax(defaults, arguments);
                    } catch (e) {
                        that.error("Ajax postJSONSync Error: data param parse error.");
                    }
                };
                this.putJSON = function(url, data, success, error) {
                    var defaults = { 'type': 'PUT','contentType': 'application/json' };
                    try {
                        data && !PubView.utils.isFunction(data) && (arguments[1] = JSON.stringify(data));
                        return this._createAjax(defaults, arguments);
                    } catch (e) {
                        that.error("Ajax putJSON Error: data param parse error.");
                    }
                };
                this.putJSONSync = function(url, data, success, error) {
                    var defaults = { 'type': 'PUT','contentType': 'application/json','async': false };
                    try {
                        data && !PubView.utils.isFunction(data) && (arguments[1] = JSON.stringify(data));
                        return this._createAjax(defaults, arguments);
                    } catch (e) {
                        that.error("Ajax putJSONSync Error: data param parse error.");
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
                this._createAjax = function(defaults, args) {
                    var initArgs = function(url, data, success, error) {
                        var args = {
                            url: $.extend({}, defaults, {url: url}),
                            data: null,
                            success: null,
                            error: null
                        };
                        if(PubView.utils.isFunction(data)) {
                            args.success = data;
                            success && (args.error = success);
                        } else {
                            data && (args.data = data);
                            success && (args.success = success);
                            error && (args.error = error);
                        }
                        return args;
                    };
                    args = initArgs.apply(this, args);
                    var requests = this._initRequests(args.url, args.data);
                    return this.ajax(requests, args.success, args.error);
                };
                this._initRequests = function(request, data, requests) {
                    if(!requests || !PubView.utils.isArray(requests)) {
                        requests = [];
                    }
                    if(PubView.utils.isString(request)) {
                        requests.push($.extend({url: request}, data ? {data: data} : null));
                    } else if(PubView.utils.isPlainObject(request) && request.url) {
                        requests.push($.extend(request, data ? {data: data} : null));
                    } else if(PubView.utils.isArray(request)) {
                        for (var i=0; i<request.length; i++) {
                            if(requests.length > 100) return requests;
                            var req = request[i];
                            requests = this._initRequests(req, data, requests);
                            req = null;
                        }
                    }
                    return requests;
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
        },
        /**
         * cookie操作工具
         */
        cookies: null,
        _cookies: function() {
            var that = this;
            var Cookies = function() {
                /**
                 * 获取所有的cookie（键=>值）
                 * @returns object
                 */
                this.getAll = function() {
                    $.cookie.json = true;
                    return $.cookie();
                };
                /**
                 * 获取某个cookie的值
                 * @param key {string} 键
                 * @param converters {object|function} 定义转换类型，如：
                 *                  $.cookie('foo', '42');
                 *                  $.cookie('foo', Number); // => 42
                 *                  或自定义规则：
                 *                  $.cookie.raw = true;
                 *                  $.cookie('foo', unescape);
                 * @returns {string|object}
                 */
                this.get = function (key, converters) {
                    $.cookie.json = true;
                    return $.cookie.apply(that, arguments);
                };
                /**
                 * 设置cookie
                 * @param key {string} 键
                 * @param value 任意类型 值
                 * @param options 额外参数，也可通过$.cookie.defaults进行初始化
                 *                {
                 *                  expires: {number|Date对象} 有效时间
                 *                  path: {string} 有效路径
                 *                  domain: {string} 有效域（二级域）
                 *                  secure: {boolean} 设为true，则获取cookie时需要https协议，默认为false
                 *                }
                 */
                this.set = function (key, value, options) {
                    $.cookie.json = true;
                    $.cookie.apply(that, arguments);
                };
                /**
                 * 删除cookie
                 * @param key {string} 键
                 * @param options 额外参数，也可通过$.cookie.defaults进行初始化
                 *                {
                 *                  expires: {number|Date对象} 有效时间
                 *                  path: {string} 有效路径
                 *                  domain: {string} 有效域（二级域）
                 *                  secure: {boolean} 设为true，则获取cookie时需要https协议，默认为false
                 *                }
                 * @returns true|false
                 */
                this.remove = function (key, options) {
                    return $.removeCookie.apply(that, arguments);
                };
                /**
                 * 获取登录用户uid
                 * @returns {string}
                 */
                this.getUid = function() {
                    var uid = this.get('uid');
                    if(!uid) {
                        var user = this.getUser();
                        user && (uid = user.id);
                    }
                    return uid;
                };
                /**
                 * 获取登录用户名
                 * @returns {string}
                 */
                this.getUname = function() {
                    var userName = this.get('login_name');
                    if(!userName) {
                        var user = this.getUser();
                        user && (userName = user.name);
                    }
                    return userName;
                };
                /**
                 * 获取登录用户信息
                 * @returns {object}
                 */
                this.getUser = function() {
                    return this.get('user');
                };
                /**
                 * 获取vdcId
                 * @returns {string}
                 */
                this.getVdcId = function() {
                    var vdcId = this.get('vdc_id');
                    if(!vdcId) {
                        var vdc = this.getVdc();
                        vdc && (vdcId = vdc.id);
                    }
                    return vdcId;
                };
                /**
                 * 获取vdcName
                 * @returns {string}
                 */
                this.getVdcName = function() {
                    var vdcName;
                    var vdc = this.getVdc();
                    vdc && (vdcName = vdc.name);
                    return vdcName;
                };
                /**
                 * 获取vdc信息
                 * @returns {object}
                 */
                this.getVdc = function() {
                    return this.get('vdc');
                };
            };
            !that.cookies && (that.cookies = new Cookies());
        },
        /**
         * 登录弹出框
         * @param message
         * @param callback
         */
        login: function(message, callback) {
            var that = this;
            Modal.show({
                cssClass: 'modal-login',
                title: '请登录',
                closable: false,
                message: function() {
                    return [
                        '<div class="signin-header">',
                            '<div class="signin-title">',
                                '<img class="signin-logo" alt="IOP Manager" src="',PubView.root,'/resources/css/login/img/header-logo.png"/>',
                            '</div>',
                        '</div>',
                        '<form class="form-horizontal form-signin" onsubmit="return false;" role="form" autocomplete="off">',
                            '<div class="input-group">',
                                '<span class="signin-icons signin-icon-input signin-icon-user">',
                                    '<i class="signin-icons signin-icon-br"></i>',
                                '</span>',
                                '<input id="loginName" class="form-control" name="loginName" type="text" />',
                            '</div>',
                            '<div class="input-group">',
                                '<span class="signin-icons signin-icon-input signin-icon-pwd">',
                                    '<i class="signin-icons signin-icon-br"></i>',
                                '</span>',
                                '<input id="password" class="form-control" name="password" type="password" />',
                            '</div>',
                            '<div class="checkbox">',
                                '<label>',
                                    '<input type="checkbox" name="remember_me" value="1" /> 记住密码',
                                '</label>',
                            '</div>',
                        '</form>'
                    ].join('')
                }(),
                buttons: [
                    {
                        icon: 'fa fa-sign-in',
                        label: '登&ensp;录',
                        id: "btn-signin",
                        cssClass: 'btn-primary',
                        autospin: true,
                        action: function(dialog){
                            dialog.enableButtons(false);
                            var $form = dialog.getModalBody().find('.form-signin:first');
                            var formValid = true, errorTip = function($tar, msg) {
                                if(PubView.utils.is$($tar)) {
                                    $tar.popover({
                                        container: $form,
                                        className: "popover-danger",
                                        placement: "left top",
                                        content: '<i class="glyphicon glyphicon-exclamation-sign"></i> '+(msg||''),
                                        trigger: 'manual',
                                        html: true
                                    }).popover("show");
                                }
                            };
                            if(!$('#loginName').val()) {
                                errorTip($('#loginName'), "用户名不能为空！");
                                formValid = false;
                            } else if(!$('#password').val()) {
                                errorTip($('#password'), "密码不能为空！");
                                formValid = false;
                            }
                            if(!formValid) {
                                dialog.enableButtons(true);
                                dialog.getButton('btn-signin').stopSpin();
                                return false;
                            }
                            var data = {
                                'auth': {
                                    'tenantId': "",
                                    'passwordCredentials': {
                                        'username': $('#loginName').val(),
                                        'password':  $('#password').val()
                                    }
                                }
                            };
                            that.xhr.ajax({
                                type: "POST",
                                url: '/v2.0/tokens',
                                data: JSON.stringify(data),
                                contentType: "application/json",
                                success: function(res) {
                                    if(!res || res.error_code){
                                        alert("错误代码："+res.error_code+"\n错误描述: "+res.error_desc);
                                    }else{
                                        dialog.close();
                                        dialog.getButton('btn-signin').stopSpin();
                                    }
                                },
                                error: function(xhr, errorText) {
                                }
                            });
                        }
                    },
                    {
                        label: '取消',
                        cssClass: 'btn-primary',
                        action: function(dialog){
                            dialog.close();
                        }
                    }
                ],
                onshow: function(dialog) {
                    var $body = dialog.getModalBody();
                    $body.find('input[type="checkbox"]').iCheck({
                        checkboxClass: "icheckbox-primary"
                    });
                },
                onhidden: function(dialog) {
                    dialog.enableButtons(true);
                }
            });
        },
        error: function(e) {
            if(typeof e === "string") {
                Modal.error(e);
            } else {
                Modal.error(e.message || "发生了未知错误");
            }
            console.error(e);
        },
        clearError: function() {
            Modal.closeAll();
            console.clear();
        },
        on: function(type,selector,cb){
        	if(type && selector && typeof cb === 'function'){
        		if(selector instanceof jQuery){
        			selector = selector.selector;
        		}
        		$(document).off(selector);
        		$(document).on(type,selector,cb);
        	}
        },
        //处理搜索参数
        handleTableParam: function(){
        	
        }
    };
});
