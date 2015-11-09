$(document).ready( function() {


	var postData = {
		task: 'getCampaignImages'
	};
	$.ajax({
		type: 'post',
		url: "testresponse.php",
		dataType: "JSON",
		data: postData,
		success: function(data) {
			console.log("ajax response javascript");
			console.log(data);
		},
		error: function(jqXHR, textStatus, errorThrown) {
		},
		complete: function(jqXHR, textStatus) {}
	});

	var blockA = {firstName:'John', lastName:'Doe', age:50, eyeColor:'blue'};
	var blockB = ['hi 2','hello 2'];

	console.log(blockA);
	console.log(blockB);

/*
	var j=0;
	var k=100;
	for (var i=0; i<100; i++) {
		j=j+i;
		console.log(i,"loop");
		console.log(j,"sum");
		console.log("this is k:"+k,"mix");
	}
*/
	console.log(NotExists);

});
