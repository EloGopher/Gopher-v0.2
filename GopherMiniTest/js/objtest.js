var obj = {
    name: "Simon",
    age: "20",
    clothing: {
        style: "simple",
        isDouche: false,
        nested:{ nest:"yes" }
    }
}

  function print_r(theObj,safeint,maxdata){
      var jsonstr = "";
      //console.log(theObj.constructor);
		  jsonstr += '{';
        if (theObj.constructor == Array || theObj.constructor == Object )
        {
          for(var p in theObj){
				 safeint++;
				 if (safeint>maxdata) { break; }

				 try {
	             if (theObj[p].constructor) {
					  if (theObj[p].constructor == String || theObj[p].constructor == Number || theObj[p].constructor == Boolean) {
	                jsonstr += p+": '"+theObj[p]+"', ";
	              } else
	              {
	                //console.log(theObj[p].constructor);
	                //if(theObj[p].constructor == Array || theObj[p].constructor == Object)
	                //jsonstr += "'"+p+"' : "+typeof(theObj)+" ";
						 jsonstr += p+": ";
	                jsonstr += print_r(theObj[p],safeint,maxdata);
	              }
			  		}
				} catch (err) {
					//console.log("catch error: "+err);
				}
          }
       } else {
       	jsonstr += "result: 'not Object or Array'"
       }
		 jsonstr += '}';

       return jsonstr;
    }


$(document).ready(function(){
	$("#savebtn").on('click',function() {
	    savedRange = window.getSelection().getRangeAt(0) ;
//	    console.log( savedRange ) ;
	    console.log( print_r( savedRange,0,1000 ) );

	});

 console.log( print_r(obj,0,1000) );
 console.log( print_r($("#zz"),0,1000) );

    console.log($("#zz"));
});

/*
for (var property in obj) {
    if (obj.hasOwnProperty(property)) {
        // do stuff
        console.log(property);
    }
}
*/
