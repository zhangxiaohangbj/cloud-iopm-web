define(['Common'],function(Common){
	var init = function(){
		Common.Deferred();
		Common.render('tpls/index.html', {
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
		}, function() {
			Common.resolve(true);
			var inHtml = Common.uiSelect();
		});
	};
	return {
		init : init
	};
});