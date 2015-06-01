/**
 * 初始化对象,包含公共的初始化加载方法和全局的方法，包括路由注册
 */
var Initializer = (function(){
	
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
	};
	/**
	 * 初始化头部选中状态以及navAnimater移动动画
	 */
	var initNavChoosen = function(){
		var headerNavWrapper = $("#header-nav ul:first"),
		headerNavs = headerNavWrapper.find("li"),
		navAnimater = $('<div class="nav-animater"></div>').appendTo(headerNavWrapper),
		navIndexObj = headerNavWrapper.find('li.active'),
		navIndexCur = parseInt(navIndexObj.attr("index")),
		paramAnimate = {"duration":300,"queue":false},
		widthArr = [];
		var getLeftDistanceByIndex = function(index){
			//debugger;
			var result = 0;
			for(var i=0;i<index;i++){
				result += parseInt(widthArr[i]);
			}
			return result + "px";
		}
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
		headerNavs.hover(
				function() {
					var index = parseInt($(this).attr("index")),
					width = $(this).outerWidth(true);
					$(this).addClass("hover");
					navAnimater.animate({width:width,left:getLeftDistanceByIndex(index-1)},paramAnimate);
					return false;
				},
				function() {
					$(this).removeClass("hover");
				}
			);
		//鼠标移出后恢复原始状态
			headerNavs.on("mouseleave",function() {
				navAnimater.animate({width:navIndexObj.outerWidth(true),left:getLeftDistanceByIndex(navIndexCur-1)},paramAnimate);
				return false;
			});
		
	};
	/**
	 * 初始化aside的高度和page-content的margin-left值
	 */
	var resizeContent = function(){
		//dom
		var pageMain = $("#page-main"),
			aside = $("aside"),
			pageContent = pageMain.find(".page-content:first");
		//height && margin
		var asideW = aside.outerWidth(true),
			asideH = aside.innerHeight(),
			asideMinW = parseFloat(aside.css('min-width')) || 1,
			contentMgL = parseFloat(pageContent.css('margin-left')) || 1,
			winH = $(window).height(),
			contentH = winH - aside.offset().top - 2*parseInt(pageMain.css('border'));
		contentH = contentH < 1 ? 1 : contentH;
		if(contentH < asideH){
			pageContent.css('min-height',asideH);
		}else{
			pageContent.css('min-height',contentH);
		}
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
	};
	//获取hash
	var _getHash = function(url){
		//为了兼容低版本的IE， 此处不使用window.location.hash
		url = url || document.URL;
		return '#' + url.replace(/^[^#]*#?(.*)$/, '$1' );
	}
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
	}
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
	}
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
			//路由后页面载入入口
			require(ctrl, function(o){
				if(o && ('init' in o)){
					o.init();
				}
			});
			return this;
		}
	};
	
	var loadInit = function(){
		//resize监听
		$(window).on('resize',this.resize);
		//载入hash监听
		registerHashEvent();
		registerToggleEvent();
		router.route();
	}
	return {
		init: loadInit,
		router: router,
		resize: resizeContent,
		initDataTable: initDataTable,
		initSearch: initSearch,
		initNavChoosen: initNavChoosen
	}
	
})()
