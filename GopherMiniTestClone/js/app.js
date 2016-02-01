$(document).ready( function() {
gopher(2, '/js','\'start\'','start'); 	/*gopher:'start'*/

	var postData = {
		task: 'getCampaignImages'
	};
	$.ajax({
		type: 'post',
		url: "testresponse.php",
		dataType: "JSON",
		data: postData,
		success: function(data) {
gopher(13, '/js','data',data); 			/*gopher:data*/
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

gopher(33, '/js','obj',obj); 	/*gopher:obj*/
gopher(34, '/js','blockA',blockA); 	/*gopher:blockA*/
gopher(35, '/js','blockB',blockB); 	/*gopher:blockB*/
});
