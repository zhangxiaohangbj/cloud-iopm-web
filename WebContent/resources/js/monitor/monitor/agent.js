define(['Common','bs/modal','jq/form/wizard','bs/tooltip','jq/form/validator-bs3'],function(Common,Modal){
	Common.requestCSS('css/wizard.css');
	var init = function(){
		Common.$pageContent.addClass("loading");
		//先获取数据，进行加工后再去render
		Common.render(true,{
			tpl:'tpls/monitor/monitor/agent/agent.html',
			callback: bindEvent
		});
	};
	
	var bindEvent = function() {
        //页面渲染完后进行各种事件的绑定
        //dataTables
        var table = Common.initDataTable($('#agentTable'),
            {
                "processing": true,  //加载效果，默认false
                "serverSide": true,  //页面在加载时就请求后台，以及每次对 datatable 进行操作时也是请求后台
                "ordering": false,   //禁用所有排序
                "sAjaxSource": 'monitor/v2/agents/page/', //ajax源，后端提供的分页接口
                /*属性 columns 用来配置具体列的属性，包括对应的数据列名,如trueName，是否支持搜索，是否显示，是否支持排序等*/
                "columns": [
                    {"data": ""},
                    {"data": {}},
                    {"data": "port"},
                    {"data": "agentStatus"},
                    {"data": "type"},
                    {"data": "virtualEnvName"},
                    {"data": "createdAt"},
                    {"data": {}}
                ],
                /*
                 * columnDefs 属性操作自定义列
                 * targets ： 表示具体需要操作的目标列，下标从 0 开始
                 * data: 表示我们需要的某一列数据对应的属性名
                 * render: 返回需要显示的内容。在此我们可以修改列中样式，增加具体内容
                 *  属性列表： data，之前属性定义中对应的属性值； type，未知；full,全部数据值可以通过属性列名获取
                 * */
                "columnDefs": [
                    {
                        "targets": [0],
                        "orderable": false,
                        "render": function () {
                            return "<label><input type='checkbox'></label>";
                        }
                    },
                    {
                        "targets": [1],
                        "render": function (data, type, full) {
                            return '<a href="#monitor/monitor/agent/detail/' + data.id + '" class="agent_ip" data="' + data.id + '">' + data.ip + "</a>";
                        }
                    },
                    {
                        "targets": [3],
                        "data": "agentStatus",
                        "render": function (data, type, full) {
                            if (data == 'RUNNING') return ' <span class="text-success">运行中</span>';
                            return '<span class="text-danger">停止</span>';
                        }
                    },
                    {
                        "targets": [7],
                        "data": "id",
                        "render": function (data, type, full) {
                            var html = '<a href="javascript:void(0)" class="btn-opt createSnapshot" data-toggle="tooltip" title="操作" data-act="stop" data="' + data.id + '" style="margin: 0;"><i class="fa fa-camera"></i></a>'
                            return html;
                        }
                    }
                ]
            },
            function($tar){

                var $tbMenu = $tar.prev('.tableMenus');
                $tbMenu.length && $tbMenu.empty().html($('.table-menus').html());
                Common.$pageContent.removeClass("loading");
            });

        Common.on('click', '.dataTables_filter .btn-query', function () {
            table.search($('.global-search').val()).draw();
        }),

            //$("[data-toggle='tooltip']").tooltip();

            //icheck
            $('input[type="checkbox"]').iCheck({
                checkboxClass: "icheckbox-info",
                radioClass: "iradio-info"
            }).on('ifChecked', function (e) {
                if (e.target.className == 'selectAll') {
                    $('.table-primary').find('input[type=checkbox]').iCheck('check');
                }
            }).on('ifUnchecked', function (e) {
                if (e.target.className == 'selectAll') {
                    $('.table-primary').find('input[type=checkbox]').iCheck('uncheck');
                }
            })
        var renderData = {};
        //初始化加载，不依赖其他模块


        var wizard;

        //载入默认的数据 inits,创建数据载入类
        var DataIniter = {};


        //载入后的事件
        var EventsHandler = {
            //基本信息所需事件
            //bindBasicWizard : function(){
            //	//basic-1：动态获取镜像或者快照
            //
            //	//获取默认选中的镜像id
            //$('#imageRef').val($('.image-list').find('.selected:first').attr('data-con'));
            ////处理镜像列表点击事件
            //wizard.el.find(".wizard-card .image-source a").click(function() {
            //	var source = $(this).attr('data-image');
            //	$(this).parent().siblings('.active').removeClass('active');
            //	$(this).parent().addClass('active');
            //	$(this).parents('ul:first').siblings('div').each(function(){
            //		if($(this).attr('data-con') == source){
            //			$(this).removeClass('hide').addClass('show');
            //			//默认选中第一条
            //			$(this).parent().find('[data-con='+source+']').find('*:first').addClass('selected');
            //			$('#imageRef').val($(this).find('.selected:first').attr('data-con'));
            //		}else{
            //			$(this).removeClass('show').addClass('hide');
            //			$(this).find('.selected').removeClass('selected');
            //		}
            //	})
            //});
            ////basic 2：点击镜像列表添加选中
            //wizard.el.find(".wizard-card .image-list .btn").click(function(){
            //	$(this).parents('.form-group:first').find('.selected').removeClass('selected');
            //	$(this).addClass('selected');
            //	var data = $(this).attr("data-con");
            //	$('#imageRef').val(data);
            //})
            //},
            ////详细信息 -绑定云主机数量spinbox
            //VmNumsSpinbox : function(){
            //	require(['bs/spinbox'],function(){
            //	$('#setVmNums').spinbox({
            //			value: 1,
            //			min: 1,
            //			max: 5
            //	});
            //	Common.on("changed.bs.spinbox","#setVmNums",function(event){
            //		//同步currentChosenObj 第一次会执行两次，待解决
            //			currentChosenObj.prevNums = currentChosenObj.nums;
            //    	currentChosenObj.nums = $(this).spinbox('value');
            //    	//更新配额信息
            //			DataIniter.updateQuotaNums();
            //		})
            //})
            //},
            ////vdc切换，需要加载可用域 可用网络，配额的数据
            //
            ////初始化安全组的绑定checkbox
            //initCheckBox : function(){
            //	$('input[type="checkbox"],input[type="radio"]').iCheck({
            //    	checkboxClass: "icheckbox-info",
            //        radioClass: "iradio-info"
            //    })
            //},
            //checkNextWizard: function(){
            //	$('.form-group .progress-bar').each(function(){
            //		var info = $(this).parent().prev(),
            //			dataAll = parseInt(info.attr('data-all')),
            //			dataUsed = parseInt(info.attr('data-used'));
            //		if(parseInt($(this).attr('aria-valuenow')) > 100 || dataAll < dataUsed || dataAll == 0){
            //			wizard.disableNextButton();
            //			Modal.error(info.find('.quota-key').html()+'超出配额');
            //		}else{
            //			wizard.enableNextButton();
            //		}
            //	})
            //},
            ////表单校验
            //snapshotFormValidator: function(){
            //	return $(".form-horizontal").validate({
            //       rules: {
            //       	'name': {
            //       		required: true,
            //               minlength: 4,
            //               maxlength:255
            //           },
            //           'imageRef':{
            //           	required: true,
            //               minlength: 1,
            //               ignore: ""
            //           },
            //           'public_key':{
            //           	required: true
            //           }
            //       }
            //   });
            //}
        };

    }

	return {
		init : init
	}
})
