function getTimeSlots(_db,_callBack){
	console.log('getTimeSlots()');
	_db.serialize(function(){
		var result = {
			data:[]
		};
		console.log('before select query');
		_db.each('SELECT * FROM Logs ORDER BY ID DESC', function (error, row) {
			console.log('select query call back');
			result.data.push(row);
			console.log('_db select push row');
			console.log(result.data);
		}, function complete() {
			_callBack(null,result);
		});
	});
}

exports.postThis = function(_postData,_db){
	switch(_postData.task){
	case 'getAllTimeSlots':
		getTimeSlots(_db,function(error,rst){
			console.log('>>getAllTimeSlots callback');
			if(error!==null){
				console.log(error);
			}else{
				return rst;
			}
		});
		break;
	}
};