define(['Common'],function(Common){
	var init = function(){
		Common.Deferred();
		Common.render('tpls/index.html', function() {
			Common.resolve(true);
		});
	};
	return {
		init : init
	};
});