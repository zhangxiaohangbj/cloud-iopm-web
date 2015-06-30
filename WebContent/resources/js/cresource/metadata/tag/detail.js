define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
    Common.requestCSS('css/detail.css');


    var curTagInfo;
    var init = function(){
        Common.$pageContent.addClass("loading");
        var hashArr = Common.hash.split('/');
        var tagId = hashArr[hashArr.length-1];
        Common.xhr.ajax("/resource-manager/v2/tag/"+tagId,function(tagInfo){
            curTagInfo = tagInfo;
            Common.render(true,'tpls/cresource/metadata/tag/detail.html',tagInfo,function(html){
                bindEvent();
            });
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
        //异步渲染tab标签内容
        function renderTab(data){
            var $tab = $('.detail-info-content').find('div.'+data);
            $tab.addClass('active');
            Common.showLocalLoading($tab);
            if('resources' == data){
                //获取磁盘快照列表
                Common.render(false,'tpls/cresource/zone/list_resources.html',curTagInfo,function(html){
                    $tab.empty().append(html);
                });
            }else if('basic' == data){

            }
            Common.hideLoclLoading($tab);
        }

    }
    return {
        init: init
    }
})
