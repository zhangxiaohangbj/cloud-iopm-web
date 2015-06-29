/*!
 * 定义全局的公共套件模块
 */
define('Common', ['commons/main'], function(Common) { return Common; });
/*!
 * 页面初始化
 */
require(['PubView', 'Common'], function(PubView, Common) {
    // 初始化公共套件
    Common.init();

    // 路由当前页面
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
                    // click to reload
                    var tlink = $(this).children("a:first").attr("href"), pos;
                    if(tlink && (pos = tlink.indexOf(Common.hash)) > -1 && pos == tlink.length - Common.hash.length) {
                        Common.router.reload();
                    }
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
                        data: Common.pub.sideBarDataMap[Common.pub.headerNavIndex],
                        rendered: function($sideBar) {
                            if($sideBar) {
                                // click to reload
                                $(document).on("click", "#side-bar li > a:not(.nav-first-level)", function() {
                                    var tlink = $(this).attr("href"), pos;
                                    if(tlink && (pos = tlink.indexOf(Common.hash)) > -1 && pos == tlink.length - Common.hash.length) {
                                        Common.router.reload();
                                    }
                                });
                            }
                        }
                    },
                    Common.pub.sideBarNavIndex ? {current: Common.pub.sideBarNavIndex} : null
                ) : null;
        }()
    });

    Common.resize();

    $(window).off("resize.content").on("resize.content", Common.resize);
});