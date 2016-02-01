
$(document).ready( function() {
	$.SyntaxHighlighter.init();
	
	var lastfileid = 0;
		
		
	$(".alert").addClass("in").fadeOut(4500);
	/* swap open/close side menu icons */
	$('[data-toggle=collapse]').click(function(){
		// toggle icon
		$(this).find("i").toggleClass("glyphicon-chevron-right glyphicon-chevron-down");
	});
	
	$(".LineClick").click(function() {
//		console.log($(this).attr("id"));
		var xid = $(this).attr("id");
		xid = xid.split("-");
		
		if (xid[1]!=lastfileid) {
			$.ajax({				
				url: "get-source-from-db.php?id="+xid[1]
			,   type: 'GET'
			,	crossDomain:true
			,   contentType: "application/x-www-form-urlencoded; charset=UTF-8"
			,   success: function(data)
				{ 

					$("#source_file").html('<pre class="language-javascript" id="source_file_pre">'+data+'</pre>');
					$("#source_file").syntaxHighlight();

					$('#source_file').animate({
						 scrollTop: $('#source_file pre ol li:nth-child('+xid[0]+')').position().top-$('#source_file pre').position().top-20
					}, 'fast');

					$('#source_file pre ol li:nth-child('+xid[0]+')').removeClass("transition-duration-medium");
					$('#source_file pre ol li:nth-child('+xid[0]+')').addClass("transition-duration-instant");
					$('#source_file pre ol li:nth-child('+xid[0]+')').addClass("ko-flash");

					setTimeout(function () {
						$('#source_file pre ol li:nth-child('+xid[0]+')').removeClass("transition-duration-instant");
						$('#source_file pre ol li:nth-child('+xid[0]+')').addClass("transition-duration-medium");
						$('#source_file pre ol li:nth-child('+xid[0]+')').removeClass("ko-flash");
					}, 500);		
				
				} 
			});
		} else
		{
			$('#source_file').animate({
				 scrollTop: $('#source_file pre ol li:nth-child('+xid[0]+')').position().top-$('#source_file pre').position().top-20
			}, 'fast');

			$('#source_file pre ol li:nth-child('+xid[0]+')').removeClass("transition-duration-medium");
			$('#source_file pre ol li:nth-child('+xid[0]+')').addClass("transition-duration-instant");
			$('#source_file pre ol li:nth-child('+xid[0]+')').addClass("ko-flash");

			setTimeout(function () {
				$('#source_file pre ol li:nth-child('+xid[0]+')').removeClass("transition-duration-instant");
				$('#source_file pre ol li:nth-child('+xid[0]+')').addClass("transition-duration-medium");
				$('#source_file pre ol li:nth-child('+xid[0]+')').removeClass("ko-flash");
			}, 500);		
			
		}
		
		lastfileid = xid[1];
//		console.log(xid[0]);
//		$('.nav-tabs a[href="#file_' + xid[1] + '"]').tab('show');

		
	});
	
/*	
	$("#source_0").html('<pre class="language-javascript">var j=0;\n\
console.log(\'hello you\');</pre>');
	
	$("#source_0").syntaxHighlight(); 
	*/

});