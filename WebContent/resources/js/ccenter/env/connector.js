define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
    Common.requestCSS('css/detail.css');


    var curEnvInfo={};
    var init = function(){
        Common.$pageContent.addClass("loading");
        var hashArr = Common.hash.split('/');
        var envId = hashArr[hashArr.length-1];
        Common.xhr.ajax("/resources/data/connector.txt",function(data){
            var curList = {"data":data}
            Common.render(true,'tpls/ccenter/env/connector.html',curList,function(html){
                bindEvent();
            });
        })
    };
    function bindEvent(){

        Common.initDataTable($('#connectorTable'),function($tar){
            $tar.prev().find('.left-col:first').append(
                '<span class="btn btn-add">创 建</span>'
            );
            Common.$pageContent.removeClass("loading");
        });


        Common.$pageContent.removeClass("loading");
        $('.detail-info .nav li').on('click',function(){
            var $this = $(this);
            if(!$this.hasClass('active')){
                $('.detail-info .nav li').removeClass('active');
                $this.addClass('active');
                var data = $this.attr('data-for');
                $('.detail-info-content').find('.tab-pane').removeClass('active');
                renderTab(data);
            }
        });
        //异步渲染tab标签内容
        function renderTab(data){
            var $tab = $('.detail-info-content').find('div.'+data);
            $tab.addClass('active');
            Common.showLocalLoading($tab);
            if('resources' == data){
                //获取磁盘快照列表
                Common.render(false,'tpls/ccenter/zone/list_resources.html',curZoneInfo,function(html){
                    $tab.empty().append(html);

                });
            }else if('basic' == data){

            }
            Common.hideLocalLoading($tab);
        }

    }
    return {
        init: init
    }
})
