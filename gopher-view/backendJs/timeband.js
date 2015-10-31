function getTimeSlots(_db,_callBack){
	_db.serialize(function(){
		var result = {
			data:[]
		};
		
		db.each('SELECT * FROM ignoredFiles WHERE ProjectID=' + projectID, function (error, row) {
			result.data.push(row);
		}, function complete() {
			_callBack(null,result);
		});
	});
}

exports.postThis = function(_postData,_db){
	switch(_postData.task){
	case 'getAllTimeSlots':
		getTimeSlots(_db,function(error,rst){
			return rst;
		});
		break;
	}
};