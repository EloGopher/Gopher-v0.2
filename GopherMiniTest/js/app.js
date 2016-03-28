$(document).ready( function() {
	/*gopher:'start'*/
	
	gopher('1213311-ege',start);

	var postData = {
		task: 'getCampaignImages'
	};
	$.ajax({
		type: 'post',
		url: "testresponse.php",
		dataType: "JSON",
		data: postData,
		success: function(data) {
			/*gopher:data*/
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

	gopher('1-ekim',obj);
	gopher('2-ekim',blockA);
	gopher('3-ekim',blockB);
});
