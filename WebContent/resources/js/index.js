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
			$('#table-id').dataTable({
				data: [
					{
						"name":       "Tiger Nixon",
						"position":   "System Architect",
						"salary":     "$3,120",
						"start_date": "2011/04/25",
						"office":     "Edinburgh",
						"extn":       "5421"
					},
					{
						"name":       "Garrett Winters",
						"position":   "Director",
						"salary":     "$5,300",
						"start_date": "2011/07/25",
						"office":     "Edinburgh",
						"extn":       "8422"
					}
				],
				columns: [
					{ orderable: false, data: null },
					{ data: 'name' },
					{ data: 'position' },
					{ data: 'salary' },
					{ data: 'office' }
				]
			});
		});
	};
	return {
		init : init
	};
});