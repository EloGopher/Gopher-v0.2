$(document).ready( function()
{

	for (var i=0; i<3; i++)
	{
		console.log("start 111111))11111111","start-tag,multitag");
	}

	// Get all the keys from document
	var keys = $('#calculator span');
	var operators = ['+', '-', 'x', '/'];
	var decimalAdded = false;
	var InputStr = "";

	var blockA1 = {firstName:'John', lastName:'Doe', age:50, eyeColor:'blue'};
	var blockB2 = ['hi 2','hello 2'];

	console.log( blockA1["first,)Name"], "MyTag" );


	console.log("hel()()(())lo");
	console.log(operators);

	$("#calculator22 span").click( function(e) {
	});


	// Add onclick event to all the keys and perform operations
	$("#calculator span").click( function(e) {
		// Get the input and button values
		var input = $('.screen');
		var inputVal = input.html();
		var btnVal = $(this).html();

		console.log("button_click","calculator");
		console.log(btnVal,"calculator");

		// Now, just append the key values (btnValue) to the input string and finally use javascript's eval function to get the result
		// If clear key is pressed, erase everything
		if(btnVal == 'C') {
			console.log("C button","calculator");
			InputStr="";
			input.html(InputStr);
			decimalAdded = false;
		}

		// If eval key is pressed, calculate and display the result
		else if(btnVal == '=') {
			console.log("= button","calculator");
			var equation = inputVal;
			var lastChar = equation[equation.length - 1];

			// Replace all instances of x with *.
			equation = equation.replace(/x/g, '*');
			console.log(equation,"calculator");


			// Final thing left to do is checking the last character of the equation. If it's an operator or a decimal, remove it
			if(operators.indexOf(lastChar) > -1 || lastChar == '.')
				equation = equation.replace(/.$/, '');

			if(equation)
				console.log('track error start');
				input.html(eval(equation));
				console.log('track error end');

			decimalAdded = false;
		}

		else if(operators.indexOf(btnVal) > -1) {
			// Operator is clicked
			// Get the last character from the equation
			var lastChar = inputVal[inputVal.length - 1];
			console.log(lastChar,"calculator");

			// Only add operator if input is not empty and there is no operator at the last
			if(inputVal != '' && operators.indexOf(lastChar) == -1)
			{
				InputStr += btnVal;
				console.log(InputStr,"calculator");
				input.html(InputStr);
			}

			// Allow minus if the string is empty
			else if(inputVal == '' && btnVal == '-')
			{
				InputStr += btnVal;
				console.log(InputStr,"calculator");
				input.html(InputStr);
			}

			// Replace the last operator (if exists) with the newly pressed operator
			if(operators.indexOf(lastChar) > -1 && inputVal.length > 1) {
				// Here, '.' matches any character while $ denotes the end of string, so anything (will be an operator in this case) at the end of string will get replaced by new operator
				InputStr = inputVal.replace(/.$/, btnVal);
				console.log(InputStr,"calculator");
				input.html(InputStr);
			}

			decimalAdded =false;
		}

		// Now only the decimal problem is left. We can solve it easily using a flag 'decimalAdded' which we'll set once the decimal is added and prevent more decimals to be added once it's set. It will be reset when an operator, eval or clear key is pressed.
		else if(btnVal == '.') {
			if(!decimalAdded) {
				InputStr += btnVal;
				console.log(InputStr,"calculator");
				input.html(InputStr);
				decimalAdded = true;
			}
		}

		// if any other key is pressed, just append it
		else {
			InputStr += btnVal;
			console.log(InputStr,"calculator");
			input.html(InputStr);
		}

		// prevent page jumps
		e.preventDefault();
	});


});
