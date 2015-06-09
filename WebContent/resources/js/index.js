define(['Common'],function(Common){
	var init = function(){
		Common.render(true, 'tpls/index.html', {
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
		}, function(data) {
			Common.dataTable('#table-example', {
				columnDefs: [
					{
						orderable: false,
						targets: [0, 10]
					}
				]
			});
		});
	};
	return {
		init : init
	};
});