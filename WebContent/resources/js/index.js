define(['Common'],function(Common){
	var init = function(){
		Common.Deferred();
		Common.render('tpls/index.html', function() {
			Common.resolve(true);
			var inHtml = Common.uiSelect({
				name: 'xxxx',
				list: [
					{
						value: 1245
					},
					{
						label: "12364",
						list: [
							{
								value: 56789
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