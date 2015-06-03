define(['Common'],function(Common){
	var init = function(){
		Common.Deferred();
		Common.render('tpls/index.html', function() {
			Common.resolve(true);
			var inHtml = Common.uiSelect({
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
			}, Common.$pageContent);
		});
	};
	return {
		init : init
	};
});