$(document).ready( function() {
	/*gopher:'start'*/
	
	gopher('1001-app.js','start');

	var postData = {
		task: 'getCampaignImages'
	};
	$.ajax({
		type: 'post',
		url: "testresponse.php",
		dataType: "JSON",
		data: postData,
		success: function(data) {
			gopher('1005-app.js',data);
		},
		error: function(jqXHR, textStatus, errorThrown) {
		},
		complete: function(jqXHR, textStatus) {}
	});

	var blockA = {firstName:'John', lastName:'Doe', age:50, eyeColor:'blue'};
	var blockB = ['hi 2','hello 2'];

   var obj = {
       name: "Simon",
       age: "20",
       clothing: {
           style: "simple",
           isDouche: false,
           nested:{ nest:"yes" }
       }
   }

	gopher('1002-app.js',obj);
	gopher('1003-app.js',blockA);
	gopher('1004-app.js',blockB);
});
