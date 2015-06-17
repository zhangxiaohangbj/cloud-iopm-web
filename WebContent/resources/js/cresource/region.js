define(['Common','bs/modal','jq/form/wizard','jq/form/validator-bs3','bs/tooltip'],function(Common,Modal) {
    Common.requestCSS('css/wizard.css');

    var init=  function(){
        Common.$pageContent.addClass("loading");

        //真实请求的数据
        Common.xhr.ajax('/v2/tenant_id/region',function(data){
            //var indexData = {"zone":data,"data":renderData};
            Common.render(true,'tpls/cresource/region/index.html',data,function(){
                bindEvent();
            });
        });
    }

    return {
        init : init
    };

});