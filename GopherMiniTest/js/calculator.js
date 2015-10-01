$(document).ready( function() 
{
	
	gopher.tell("start","start-tag");
	
	//console.log(5---5);

	// Get all the keys from document
	var keys = $('#calculator span');
	var operators = ['+', '-', 'x', '/'];
	var decimalAdded = false;
	var InputStr = "";
	
	gopher.tell("hello");
	gopher.track(operators);


	// Add onclick event to all the keys and perform operations
	$("#calculator span").click( function(e) {
		// Get the input and button values
		var input = $('.screen');
		var inputVal = input.html();
		var btnVal = $(this).html();
		
		gopher.tell("button click","calculator");
		gopher.track(btnVal,"calculator");

		// Now, just append the key values (btnValue) to the input string and finally use javascript's eval function to get the result
		// If clear key is pressed, erase everything
		if(btnVal == 'C') {
			gopher.tell("C button","calculator");
			InputStr="";
			input.html(InputStr);
			decimalAdded = false;
		}

		// If eval key is pressed, calculate and display the result
		else if(btnVal == '=') {
			gopher.tell("= button","calculator");
			var equation = inputVal;
			var lastChar = equation[equation.length - 1];

			// Replace all instances of x with *.
			equation = equation.replace(/x/g, '*');
			gopher.track(equation,"calculator");
			

			// Final thing left to do is checking the last character of the equation. If it's an operator or a decimal, remove it
			if(operators.indexOf(lastChar) > -1 || lastChar == '.')
				equation = equation.replace(/.$/, '');

			if(equation)
				gopher.tell('track error start');
				input.html(eval(equation));
				gopher.tell('track error end');

			decimalAdded = false;
		}

		else if(operators.indexOf(btnVal) > -1) {
			// Operator is clicked
			// Get the last character from the equation
			var lastChar = inputVal[inputVal.length - 1];
			gopher.track(lastChar,"calculator");

			// Only add operator if input is not empty and there is no operator at the last
			if(inputVal != '' && operators.indexOf(lastChar) == -1) 
			{
				InputStr += btnVal;
				gopher.track(InputStr,"calculator");
				input.html(InputStr);
			}

			// Allow minus if the string is empty
			else if(inputVal == '' && btnVal == '-') 
			{
				InputStr += btnVal;
				GopherVarTrack(InputStr,"calculator");
				input.html(InputStr);
			}

			// Replace the last operator (if exists) with the newly pressed operator
			if(operators.indexOf(lastChar) > -1 && inputVal.length > 1) {
				// Here, '.' matches any character while $ denotes the end of string, so anything (will be an operator in this case) at the end of string will get replaced by new operator
				InputStr = inputVal.replace(/.$/, btnVal);
				gopher.track(InputStr,"calculator");
				input.html(InputStr);
			}

			decimalAdded =false;
		}

		// Now only the decimal problem is left. We can solve it easily using a flag 'decimalAdded' which we'll set once the decimal is added and prevent more decimals to be added once it's set. It will be reset when an operator, eval or clear key is pressed.
		else if(btnVal == '.') {
			if(!decimalAdded) {
				InputStr += btnVal;
				gopher.track(InputStr,"calculator");
				input.html(InputStr);
				decimalAdded = true;
			}
		}

		// if any other key is pressed, just append it
		else {
			InputStr += btnVal;
			gopher.track(InputStr,"calculator");
			input.html(InputStr);
		}

		// prevent page jumps
		e.preventDefault();
	}); 
}); 
