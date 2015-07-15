define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
    Common.requestCSS('css/detail.css');


    var curInfo={};
    var init = function(){
        Common.$pageContent.addClass("loading");
        var hashArr = Common.hash.split('/');
        var id = hashArr[hashArr.length-1];

        Common.xhr.ajax("/resources/data/severity.txt",function(severity){
            curInfo.severity = severity;
            Common.xhr.ajax("/monitor/v2/alarmDefines/"+id,function(data){
                curInfo.data = data;
                Common.render(true,'tpls/monitor/monitor/alarm/detail.html',curInfo,function(html){
                    bindEvent();
                });
            })
        })

    };
    function bindEvent(){
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
        //“Ï≤Ω‰÷»ætab±Í«©ƒ⁄»›
        function renderTab(data){
            var $tab = $('.detail-info-content').find('div.'+data);
            $tab.addClass('active');
            Common.showLocalLoading($tab);
            if('resources' == data){
                //Common.xhr.ajax('', function (curResources) {
                //    Common.render(false,'tpls/monitor/monitor/alarm/resources.html',curZoneInfo,function(html){
                //        $tab.empty().append(html);
                //    });
                //})

            }else if('notifications' == data){
                //Common.xhr.ajax('',function(curNotifications){
                //    Common.render(false,'tpls/monitor/monitor/alarm/notifications.html',curZoneInfo,function(html){
                //        $tab.empty().append(html);
                //    });
                //})

            }
            Common.hideLocalLoading($tab);
        }

    }
    return {
        init: init
    }
})
