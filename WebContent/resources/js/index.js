define(['Common'],function(Common){
	var init = function(){
		Common.render(true, {
			tpl: 'tpls/index.html',
			data: '/resources/data/image.txt',
			beforeRender: function(data) {
				return $.extend({}, data, {
					iSelectData: {
						name: 'xxxx',
						attrs: {
							'data-xxx': 'xxx'
						},
						list: [
							{
								value: 1245,
								attrs: {
									'data-xxx': 'xxx'
								}
							},
							{
								label: "12364",
								attrs: {
									'data-xxx': 'xxx'
								},
								list: [
									{
										value: 56789,
										attrs: {
											'data-xxx': 'xxx'
										}
									}
								]
							}
						]
					}
				});
			},
			callback: function() {
				Common.dataTable('#table-example', {
					columnDefs: [
						{
							orderable: false,
							targets: [0, 10]
						}
					]
				});
			}
		});
	};
	return {
		init : init
	};
});