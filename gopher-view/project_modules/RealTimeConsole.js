var Globals = require("../project_modules/Globals.js"); 
var util = require('util');

var SocketIOHandle;


//----------------------------------------------------------------------------------------
function recurse(TreeHTML, key, val) 
{
//		list += "<li>";
	if (val instanceof Object) {

		if (key=="loc")
		{
//			TreeHTML += key + "<ul>";
			TreeHTML += "<li><a>"+ key + "</a><ul>";
			Object.keys(val).forEach(function(key) {  TreeHTML = recurse(TreeHTML, key, val[key] ); } );
			TreeHTML += "</ul>";
		} else
		{
			TreeHTML += "<li><a>"+ key + "</a><ul>";
			Object.keys(val).forEach(function(key) {  TreeHTML = recurse(TreeHTML, key, val[key] ); } );
			TreeHTML += "</ul></li>";
		}
	} else {
//		if (key=="start") {} else
//		if (key=="end") {} else
		{
			TreeHTML +=  "<li><a>" + key +  " = " + val + "</a></li>";
		}

		if ( (key=="type") && (val=="AssignmentExpression") )
		{
			SaveAssignment = true;
		}
	}
	return TreeHTML;
//		list += "</li>";
}


//----------------------------------------------------------------------------------------
function MakeJSONTreeFromJS(parsed,filePath)
{
	var TreeHTML2;

	//console.log(JSON.stringify(parsed, null, compact ? null : 2));

	TreeHTML2 = "<ul>";
	Object.keys(parsed).forEach(function(key) {  TreeHTML2 = recurse(TreeHTML2, key, parsed[key] ); } );
	TreeHTML2 += "</ul>";

	Globals.fs.writeFile(filePath.replace(".js","-gopher.html"),TreeHTML2);
// TODO: escape characters that will break the conversion from JSON to XML
//						parsed = parsed.replace(/</g,'&lt;');
//						parsed = parsed.replace(/>/g,'&gt;');
	
}


//----------------------------------------------------------------------------------------
function recurseJSON(key, val, indent, GopherObjectsA,parentStr,SelfValue,ParentID) 
{
	if (val instanceof Object) {
		indent++;
		var NewQ = new Object();
		NewQ.XPath = parentStr;
		NewQ.XSelf = key;
		NewQ.XParentNode = true;
		NewQ.XParentID = ParentID;
		NewQ.XValue = '';
		NewQ.XIndent = indent;
		var TempVar = 0; if (GopherObjectsA.length>0) { TempVar =GopherObjectsA[GopherObjectsA.length -1].XID+1; }
		NewQ.XID = TempVar;

		var xParentID = TempVar;
		GopherObjectsA.push( NewQ );
		
		if (SelfValue!="") {
			var xParentStr = parentStr+"."+SelfValue;
		} else
		{
			var xParentStr = parentStr;
		}
		
//		console.log("("+indent+" "+ParentID+" "+TempVar+"."+parentStr + ")");
		
		Object.keys(val).forEach(function(key) {
			GopherObjectsA = recurseJSON(key, val[key], indent, GopherObjectsA, xParentStr, key, xParentID ); 
		});
	} else {
		
		var NewQ = new Object();
		NewQ.XPath = parentStr;
		NewQ.XSelf = SelfValue;
		NewQ.XParentNode = false;
		NewQ.XParentID = ParentID;
		NewQ.XValue = val;
		NewQ.XIndent = indent+1;
		
		var TempVar = 0; if (GopherObjectsA.length>0) { TempVar =GopherObjectsA[GopherObjectsA.length -1].XID+1; }
		NewQ.XID = TempVar;

		GopherObjectsA.push( NewQ );

//		console.log(" "+(indent+1)+" "+ParentID+" "+ParentID+"."+parentStr +  " = " + val);
	}
	
	return GopherObjectsA;
}


//----------------------------------------------------------------------------------------
function LoopGopherS(DataListSource,SourceCode,  IncludeBlocks,  LoopGopherSDebug)
{
	IncludeBlocks = (typeof IncludeBlocks === "undefined") ? false : IncludeBlocks;
	LoopGopherSDebug = (typeof LoopGopherSDebug === "undefined") ? false : LoopGopherSDebug;
	var XStartIndent = 0;
	var NewRecordType = "";
	
	var NestedParentType = "";
	
	var ResetNestedType = true;
	
	GopherObjectsA = [];
	
	 //For Debugging JSON to Array Fuction
	 
	for (var i=0; i<DataListSource.length; i++) {
		console.log(DataListSource[i].XIndent+" "+ DataListSource[i].XID+" "+ DataListSource[i].XParentID + "." + DataListSource[i].XPath + " " + DataListSource[i].XParentNode+"   "+ DataListSource[i].XSelf+" = "+ DataListSource[i].XValue);
	}
	
	
	var HelperParentType = "";
	var HelperParentName = "";
	for (var C1=0; C1<DataListSource.length;C1++)
	{
		var FirstType = DataListSource[C1].XValue;
		var FirstKey = DataListSource[C1].XSelf;

		if ((XStartIndent!=0) && (DataListSource[C1].XIndent<=XStartIndent-1))
		{
			if (LoopGopherSDebug) console.log("--------------- END --------------- "); 
			XStartIndent = 0;
			ResetNestedType = true;
		}

		if ( (FirstKey=="type")
		&& ( (FirstType == "VariableDeclarator") || 
			  (FirstType == "AssignmentExpression") ||
			  (FirstType == "UnaryExpression") ||
			  (FirstType == "ArrayExpression") ||

			  (FirstType == "ForStatement") ||
			  (FirstType == "ForInStatement") ||
			  (FirstType == "WhileStatement") ||
			  (FirstType == "BlockStatement") ||
			  (FirstType == "VariableDeclaration") ||
			  (FirstType == "ExpressionStatement") ||
			  (FirstType == "SequenceExpression") ||
			  (FirstType == "ReturnStatement") ||
			  (FirstType == "FunctionDeclaration") ||
			  (FirstType == "ObjectExpression") ||
			  (FirstType == "IfStatement") ||
			  

			  (FirstType == "UpdateExpression") ||
			  (FirstType == "BinaryExpression") ||
			  (FirstType == "LogicalExpression") ||
			  (FirstType == "Identifier") ||
			  (FirstType == "Literal") ||
			  (FirstType == "CallExpression") ||
			  (FirstType == "LogicalExpression") ||
			  (FirstType == "MemberExpression")
		  ) )
		{
			
//			console.log(DataListSource[C1].XPath+" "+DataListSource[DataListSource[C1].XParentID].XSelf);
			
			
			var ParentType = DataListSource[DataListSource[C1].XParentID].XSelf;
			var CalleLine = "0";
			var CalleCol  = "0";

			var CalleStart = "0";
			var CalleEnd   = "0";

			var xstr = "";
			for (var i2=0; i2<DataListSource[C1].XIndent; i2++) { xstr += " "; }
			
			for (var C2=C1; C2<DataListSource.length;C2++)
			{
				if ((DataListSource[C2].XPath == DataListSource[C1].XPath+".loc.start") && (DataListSource[C2].XSelf == "line"))
				{	CalleLine = parseInt( DataListSource[C2].XValue,10);	}

				if ((DataListSource[C2].XPath == DataListSource[C1].XPath+".loc.start") && (DataListSource[C2].XSelf == "column"))
				{	CalleCol = parseInt( DataListSource[C2].XValue,10);	}

				if ((DataListSource[C2].XPath == DataListSource[C1].XPath) && (DataListSource[C2].XSelf == "start"))
				{	CalleStart = parseInt( DataListSource[C2].XValue,10);	}
				
				if ((DataListSource[C2].XPath == DataListSource[C1].XPath) && (DataListSource[C2].XSelf == "end"))
				{	CalleEnd = parseInt( DataListSource[C2].XValue,10);	}

				if ( (CalleLine!="0") && (CalleCol!="0")) { break; }
			}

			if (	(FirstType == "ForStatement") || 
					(FirstType == "ForInStatement") ||
	 			   (FirstType == "WhileStatement") ||
					(FirstType == "VariableDeclaration") ||
					((FirstType == "BlockStatement") && (!IncludeBlocks)) ||
					((FirstType == "ExpressionStatement") && (!IncludeBlocks)) ||
					(FirstType == "SequenceExpression") ||
					(FirstType == "FunctionDeclaration") ||
					(FirstType == "IfStatement")  )
			{
				if (LoopGopherSDebug) console.log(CalleLine+": "+xstr+FirstType);
				
				if (ResetNestedType) {NestedParentType = ""; ResetNestedType=false; }
				if (NestedParentType=="") {NestedParentType = FirstType;} else {
				NestedParentType = NestedParentType + " > " + FirstType; }
				HelperParentType = FirstType;
				HelperParentName = ParentType;
				HelperParentStart = CalleStart;
				HelperParentEnd = CalleEnd;
			} else
			{
				
				if (XStartIndent==0)
				{
					NewRecordType = "";
					if ((FirstType=="VariableDeclarator")) { 
						if (LoopGopherSDebug) console.log("--------------- START VAR --------------- "); 
						NewRecordType = "VariableDeclarator";
					} else

					if ((FirstType=="AssignmentExpression")) { 
						if (LoopGopherSDebug) console.log("--------------- START ASSIGN --------------- "); 
						NewRecordType = "AssignmentExpression";
					} else

					if (FirstType=="BinaryExpression") { 
						if (LoopGopherSDebug) console.log("--------------- START BINARY --------------- "); 
						NewRecordType = "BinaryExpression";
					} else
					
					if (FirstType=="ReturnStatement") { 
						if (LoopGopherSDebug) console.log("--------------- START RETURN  --------------- "); 
						NewRecordType = "ReturnStatement";
					} else

					if (FirstType=="UpdateExpression") { 
						if (LoopGopherSDebug) console.log("--------------- START UPDATE --------------- "); 
						NewRecordType = "UpdateExpression";
					}
				
					if (FirstType=="LogicalExpression") { 
						if (LoopGopherSDebug) console.log("--------------- START LOGICAL --------------- "); 
						NewRecordType = "LogicalExpression";
					}
					
					if ((FirstType=="BlockStatement") && (IncludeBlocks)) { 
						if (LoopGopherSDebug) console.log("--------------- START BLOCK --------------- "); 
						NewRecordType = "BlockStatement";
					}
					
					if ((FirstType=="ExpressionStatement") && (IncludeBlocks)) { 
						if (LoopGopherSDebug) console.log("--------------- START EXPRESSION --------------- "); 
						NewRecordType = "ExpressionStatement";
					}
					
					if ((FirstType == "CallExpression") && (IncludeBlocks)) { 
						if (LoopGopherSDebug) console.log("--------------- START CALL BLOCK --------------- "); 
						NewRecordType = "CallExpression";
					}

					if (NewRecordType!="")
					{
						var NewQParent = new Object();
						NewQParent.NewRecordType = NewRecordType;
						NewQParent.Records = [];
						NewQParent.LeftRightPairs = [];
						NewQParent.StartIndent = DataListSource[C1].XIndent; 
						NewQParent.ArrayIndex = C1;
						NewQParent.InsertStr = "";
						NewQParent.HelperParentType = HelperParentType;
						NewQParent.NestedParentType = NestedParentType;
						NewQParent.HelperParentStart = HelperParentStart;
						NewQParent.HelperParentEnd = HelperParentEnd;
						
						NewQParent.HelperParentName = HelperParentName;
						NewQParent.HelperXPath = DataListSource[C1].XPath;
						if (LoopGopherSDebug) console.log(" path:"+DataListSource[C1].XPath); 
						
						
						var CopyStart = 0;
						var CopyEnd = 0;
						for (var C2=C1; C2<DataListSource.length;C2++)
						{
							if ((DataListSource[C2].XPath == DataListSource[C1].XPath) && (DataListSource[C2].XSelf == "start"))
							{
								CopyStart = parseInt( DataListSource[C2].XValue, 10);
							}
							
							if ((DataListSource[C2].XPath == DataListSource[C1].XPath) && (DataListSource[C2].XSelf == "end"))
							{
								CopyEnd = parseInt( DataListSource[C2].XValue, 10);
							}

							if ( (CopyStart!=0) && (CopyEnd!=0) ) { break; }
							if (C2>C1+1000) { break; }
						}
						NewQParent.CopyStart = CopyStart;
						NewQParent.CopyEnd = CopyEnd;
						
						GopherObjectsA.push( NewQParent );
						XStartIndent = DataListSource[C1].XIndent; 
					}
				}
				
				var ThisIsLeft = false;
				if (XStartIndent>0)
				{
					if (NewQParent.LeftRightPairs.length==0)
					{
						ThisIsLeft = true;
						var NewQ = new Object();
						NewQ.XLeft = C1;
						NewQ.XRight = 0;
						NewQ.XIndent = DataListSource[C1].XIndent;
						NewQParent.LeftRightPairs.push( NewQ );
					} else
					{
						var C11 = -1;
						for (var C10=0; C10<NewQParent.LeftRightPairs.length; C10++)
						{
							if ((NewQParent.LeftRightPairs[C10].XIndent == DataListSource[C1].XIndent) && (NewQParent.LeftRightPairs[C10].XRight==0))
							{
								C11 = C10;
								break;
							}
						}
						if (C11!=-1)
						{
							NewQParent.LeftRightPairs[C11].XRight = DataListSource[C1].XIndent;
							ThisIsLeft = false;
						} else
						{
							ThisIsLeft = true;
							var NewQ = new Object();
							NewQ.XLeft = C1;
							NewQ.XRight = 0;
							NewQ.XIndent = DataListSource[C1].XIndent;
							NewQParent.LeftRightPairs.push( NewQ );
						}
					}
				}
				
				var CopyStart = 0;
				var CopyEnd = 0;
				var xOperator = "";
				var xPrefix = "";
				for (var C2=C1; C2<DataListSource.length;C2++)
				{
					if ((DataListSource[C2].XPath == DataListSource[C1].XPath) && (DataListSource[C2].XSelf == "start"))
					{
						CopyStart = parseInt( DataListSource[C2].XValue, 10);
					}
					
					if ((DataListSource[C2].XPath == DataListSource[C1].XPath) && (DataListSource[C2].XSelf == "end"))
					{
						CopyEnd = parseInt( DataListSource[C2].XValue, 10);
					}

					if ((DataListSource[C2].XPath == DataListSource[C1].XPath) && (DataListSource[C2].XSelf == "operator"))
					{
						xOperator = DataListSource[C2].XValue;
					}
					
					if ((DataListSource[C2].XPath == DataListSource[C1].XPath) && (DataListSource[C2].XSelf == "prefix"))
					{
						xPrefix = DataListSource[C2].XValue;
					}

					if ( (CopyStart!=0) && (CopyEnd!=0) && (xOperator!="") && (xPrefix!="") ) { break; }
					if (C2>C1+1000) { break; }
				}
				
				var SourceX = SourceCode.slice( CopyStart  , CopyEnd );
				if (FirstType == "VariableDeclarator") { xOperator = "="; }
				
				if ((XStartIndent>0) && (DataListSource[C1].XIndent>NewQParent.StartIndent))
				{
					var XLeft="R:";
					if (ThisIsLeft) {XLeft="L:"; }

					var NewQ = new Object();
					NewQ.XLine = CalleLine;
					NewQ.XCol = CalleCol;
					NewQ.XStartPosition = CopyStart;
					NewQ.XEndPosition = CopyEnd;
					NewQ.ThisType = FirstType;
					NewQ.ParentType = ParentType;

					NewQ.HasChildren = false;

					NewQ.Prefix = xPrefix;
					NewQ.Operator = xOperator;
					NewQ.xSource = SourceX.toString();
					NewQ.Indent = DataListSource[C1].XIndent;
					NewQ.xID = DataListSource[C1].XID;
					NewQ.ParentID = 0;
					NewQ.LeftRight = true;
					NewQ.IsLeft = ThisIsLeft;

					NewQ.Processed = false;
					NewQ.TempVarName  = SourceX.toString();

					if (NewQParent.Records.length>0)
					{
						for (jj=NewQParent.Records.length-1; jj>0; jj--)
						{
							if (NewQParent.Records[jj].Indent == DataListSource[C1].XIndent-1 )
							{
								NewQParent.Records[jj].HasChildren = true;
								NewQ.ParentID = NewQParent.Records[jj].xID;
								break;
							}
						}
					}
					
					NewQParent.Records.push( NewQ );

					if (LoopGopherSDebug) console.log(CalleLine+": "+xstr+XLeft+DataListSource[C1].XIndent+" "+FirstType+" "+ParentType+" ("+xOperator+") ["+SourceX+"]  Parent:"+DataListSource[C1].XParentID+", Self:"+DataListSource[C1].XID); 
					
				} else
				{
					if (XStartIndent>0)
					{
						var NewQ = new Object();
						NewQ.XLine = CalleLine;
						NewQ.XCol = CalleCol;
						NewQ.XStartPosition = CopyStart;
						NewQ.XEndPosition = CopyEnd;
						NewQ.ThisType = FirstType;
						NewQ.ParentType = ParentType;
						NewQ.HasChildren = false;
						NewQ.Prefix = xPrefix;
						NewQ.Operator = xOperator;
						NewQ.xSource = SourceX.toString();
						NewQ.Indent = DataListSource[C1].XIndent;
						NewQ.xID = DataListSource[C1].XID;
						NewQ.ParentID = 0;
						NewQ.LeftRight = false;
						NewQ.IsLeft = false;
						
						NewQ.Processed = false;
						NewQ.TempVarName  = SourceX.toString();

						if (NewQParent.Records.length>0)
						{
							for (jj=NewQParent.Records.length-1; jj>0; jj--)
							{
								if (NewQParent.Records[jj].Indent == DataListSource[C1].XIndent-1 )
								{
									NewQParent.Records[jj].HasChildren = true;
									NewQ.ParentID = NewQParent.Records[jj].xID;
									break;
								}
							}
						}

						NewQParent.Records.push( NewQ );
					}

					if (LoopGopherSDebug) console.log(CalleLine+": "+xstr+FirstType+" "+ParentType+" ("+xOperator+") ["+SourceX+"]  Parent:"+DataListSource[C1].XParentID+", Self:"+DataListSource[C1].XID); 
				}
			}
		}
	}
	return GopherObjectsA;
}


function IFArrayCompare(a,b) {
  if (a.AddPosition < b.AddPosition)
     return -1;
  if (a.AddPosition > b.AddPosition)
    return 1;
  return 0;
}



//----------------------------------------------------------------------------------------
function GopherTellify(contents,inFile)
{
	var DebugLines = false;
	var TempVarStr = "";

	var options = {};
	options.locations = true; 
	
	//******** Reparse Source for the first time
	var DataList = [];
	var parsed = Globals.acorn.parse(contents, options); 
	MakeJSONTreeFromJS(parsed,inFile);
	Object.keys(parsed).forEach(function(key) {  
		DataList = recurseJSON(key, parsed[key],0,DataList, "p", "", 0);
	});
	//********

//	for (var i=0; i<DataList.length; i++) {
//		console.log(DataList[i].XIndent+" "+ DataList[i].XID+" "+ DataList[i].XParentID + "." + DataList[i].XPath + " " + DataList[i].XParentNode+"   "+ DataList[i].XSelf+" = "+ DataList[i].XValue);
//	}
	

	//Loop All IF consequent/alternate statements check if it has no curly brackets (ExpressionStatement) instead of curly brackets (BlockStatment) 
	//if it is ExpressionStatement add curly brackets and semicolumn to last character if not already semicolumn
	//first find all consequent/alternate and save pos and source in list
	//then loop the result last to first and change it
	
	var ExpressionStatementList = [];
	for (var C1=0; C1<DataList.length;C1++)
	{
		if ((DataList[C1].XSelf=="consequent") || (DataList[C1].XSelf=="alternate"))
		{
			C1++;
			if ((DataList[C1].XValue=="ExpressionStatement") && (DataList[C1].XSelf=="type"))
			{
//				console.log("************ consequent");
				var CopyStart=0;
				var CopyEnd=0;
				
				while ( ( (CopyStart==0) || (CopyEnd==0) ) && (C1<DataList.length) )
				{
					C1++;
					if (DataList[C1].XSelf=="start") { CopyStart = parseInt(DataList[C1].XValue,10); }
					if (DataList[C1].XSelf=="end") { CopyEnd = parseInt(DataList[C1].XValue,10); }
				}
				if ( (CopyStart>0) && (CopyEnd>CopyStart) )
				{
					var NewQ = new Object();
					NewQ.CopyEnd = CopyEnd;
					NewQ.CopyStart = CopyStart;
					NewQ.XSource = contents.slice( CopyStart  , CopyEnd ).toString();
					ExpressionStatementList.push( NewQ );
//					console.log( contents.slice( CopyStart  , CopyEnd ).toString() );
				}
				
			}
		}
	}
	
	for (var ObjectCounter=ExpressionStatementList.length-1; ObjectCounter >= 0; ObjectCounter--)
	{
//			console.log( ObjectCounter+": "+ExpressionStatementList[ObjectCounter].XSource );
			if (ExpressionStatementList[ObjectCounter].XSource.slice(-1)!=";") { ExpressionStatementList[ObjectCounter].XSource += ";" }
			contents = [contents.slice(0, ExpressionStatementList[ObjectCounter].CopyStart), " { " + ExpressionStatementList[ObjectCounter].XSource + " } ", 	contents.slice(ExpressionStatementList[ObjectCounter].CopyEnd)].join('');
	}
	
	
	//******** Reparse Source since it was changed
	var DataList = [];
	var parsed = Globals.acorn.parse(contents, options); 
	Object.keys(parsed).forEach(function(key) {  
		DataList = recurseJSON(key, parsed[key],0,DataList, "p", "", 0);
	});
	//********
	

	//Loop All ForStatement, WhileStatement check if the body is ExpressionStatement if so add curly brackets and semicolumn to last character if not already semicolumn
	//first find all bodies and save pos and source in list
	//then loop the result last to first and change it


	var ExpressionStatementList = [];
	for (var C1=0; C1<DataList.length;C1++)
	{
		if ((DataList[C1].XSelf=="body") )
		{
			C1++;
			if ((DataList[C1].XValue=="ExpressionStatement") && (DataList[C1].XSelf=="type"))
			{
				var CopyStart=0;
				var CopyEnd=0;
				
				while ( ( (CopyStart==0) || (CopyEnd==0) ) && (C1<DataList.length) )
				{
					C1++;
					if (DataList[C1].XSelf=="start") { CopyStart = parseInt(DataList[C1].XValue,10); }
					if (DataList[C1].XSelf=="end") { CopyEnd = parseInt(DataList[C1].XValue,10); }
				}
				if ( (CopyStart>0) && (CopyEnd>CopyStart) )
				{
					var NewQ = new Object();
					NewQ.CopyEnd = CopyEnd;
					NewQ.CopyStart = CopyStart;
					NewQ.XSource = contents.slice( CopyStart  , CopyEnd ).toString();
					ExpressionStatementList.push( NewQ );
//					console.log( contents.slice( CopyStart  , CopyEnd ).toString() );
				}
			}
		}
	}
	for (var ObjectCounter=ExpressionStatementList.length-1; ObjectCounter >= 0; ObjectCounter--)
	{
			if (ExpressionStatementList[ObjectCounter].XSource.slice(-1)!=";") { ExpressionStatementList[ObjectCounter].XSource += ";" }
			contents = [contents.slice(0, ExpressionStatementList[ObjectCounter].CopyStart), " { " + ExpressionStatementList[ObjectCounter].XSource + " } ", 	contents.slice(ExpressionStatementList[ObjectCounter].CopyEnd)].join('');
	}
	
	
	//******** Reparse Source since it was changed
	var DataList = [];
	var GopherObjectsA = [];
	var parsed = Globals.acorn.parse(contents, options); 
	Object.keys(parsed).forEach(function(key) {  
		DataList = recurseJSON(key, parsed[key],0,DataList, "p", "", 0);
	});
	GopherObjectsA = LoopGopherS(DataList,contents,false,true);
	//********

	//Loop all Variable Expressions and convert them to multiline statements
	for (var ObjectCounter=0; ObjectCounter < GopherObjectsA.length; ObjectCounter++)
	{
		if ( (GopherObjectsA[ObjectCounter].NewRecordType=="UpdateExpression")  ) //++, --
		{
			//first print to screen
			//function GopherSetF(xCodeLine, NestedParent, ParentType, LeftSideStr, LeftSideValue, RightSideStr, RightSideValue, Operator, InnerFunctionCount)
			GopherObjectsA[ObjectCounter].InsertStr = "(tempVar = "+GopherObjectsA[ObjectCounter].Records[1].xSource+", " + 
			               GopherObjectsA[ObjectCounter].Records[1].xSource + "= " +
								"GopherSetF("+GopherObjectsA[ObjectCounter].Records[0].XLine + "," +
											  "'" + GopherObjectsA[ObjectCounter].NestedParentType + "'," +
											  "'" + GopherObjectsA[ObjectCounter].Records[0].ParentType + "'," +
											  "'" + Globals.escapeSingleQuote(GopherObjectsA[ObjectCounter].Records[1].xSource) + "'," +
											  "0,'',"+GopherObjectsA[ObjectCounter].Records[1].xSource+",'" + GopherObjectsA[ObjectCounter].Records[0].Operator + "',0), tempVar)";
						   
//			if (DebugLines) 
			{
				console.log( "\n" +GopherObjectsA[ObjectCounter].NewRecordType);
				console.log( 
				" HelperParentType: " + GopherObjectsA[ObjectCounter].HelperParentType + 
				" HelperParentName: " + GopherObjectsA[ObjectCounter].HelperParentName + 
				" NestedParentType: " + GopherObjectsA[ObjectCounter].NestedParentType + 
				
				" Parent Type: " + GopherObjectsA[ObjectCounter].Records[0].ParentType + 
				" Indent: " + GopherObjectsA[ObjectCounter].Records[0].Indent + 
				" Length : " + GopherObjectsA[ObjectCounter].Records.length + 
				" Source: " + GopherObjectsA[ObjectCounter].Records[0].xSource + 
				" Operator: " + GopherObjectsA[ObjectCounter].Records[0].Operator);
				console.log( GopherObjectsA[ObjectCounter].InsertStr + "\n"   );
			}
		}

		if (GopherObjectsA[ObjectCounter].NewRecordType=="BinaryExpression") //j>10, k+1, "hello "+"world"
		{
			//if (DebugLines) 
			{
				console.log( "\n" +GopherObjectsA[ObjectCounter].NewRecordType);
				console.log( 
				" HelperParentType: " + GopherObjectsA[ObjectCounter].HelperParentType + 
				" HelperParentName: " + GopherObjectsA[ObjectCounter].HelperParentName + 
				" NestedParentType: " + GopherObjectsA[ObjectCounter].NestedParentType + 

				  " Parent Type: " + GopherObjectsA[ObjectCounter].Records[0].ParentType + 
				" Indent: " + GopherObjectsA[ObjectCounter].Records[0].Indent + 
				" Length : " + GopherObjectsA[ObjectCounter].Records.length + 
				" Source: " + GopherObjectsA[ObjectCounter].Records[0].xSource + 
				" Operator: " + GopherObjectsA[ObjectCounter].Records[0].Operator);
			}
			
			//find and list all function calls on the right side
			var RecordCounter = 0;
			var FunctionCalls = [];
			var FunctionsCounter = 0;
			while ( (RecordCounter<GopherObjectsA[ObjectCounter].Records.length-1) )
			{
				RecordCounter++;
				if ( (GopherObjectsA[ObjectCounter].Records[RecordCounter].ThisType=="CallExpression") )
				{
					if ( (GopherObjectsA[ObjectCounter].Records[RecordCounter].ParentType=="left") ||
						  (GopherObjectsA[ObjectCounter].Records[RecordCounter].ParentType=="right") ||
						  (GopherObjectsA[ObjectCounter].Records[RecordCounter].ParentType=="property") ||
						  (GopherObjectsA[ObjectCounter].Records[RecordCounter].ParentType=="0") )
					{
						FunctionCalls[FunctionsCounter] = GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource;
						FunctionsCounter++;
						//if (DebugLines) 
						{							
							console.log("        EXT. REF: "+GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource+ " " + 
							GopherObjectsA[ObjectCounter].Records[RecordCounter].ThisType + " " + 
							GopherObjectsA[ObjectCounter].Records[RecordCounter].ParentType + " " + 
							GopherObjectsA[ObjectCounter].Records[RecordCounter].Indent);
						}
					}
				}


				if (GopherObjectsA[ObjectCounter].Records[RecordCounter].ThisType=="MemberExpression")
				{
					if ( ( GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource.indexOf("window.") == 0) ||
						  ( GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource.indexOf("parent.") == 0) ||
						  ( GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource.indexOf("document.") == 0) )
					{
						FunctionCalls[FunctionsCounter] = GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource;
						FunctionsCounter++;
						//if (DebugLines) 
						{							
							console.log("        EXT. REF: "+GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource+ " " + 
							GopherObjectsA[ObjectCounter].Records[RecordCounter].ThisType + " " + 
							GopherObjectsA[ObjectCounter].Records[RecordCounter].ParentType + " " + 
							GopherObjectsA[ObjectCounter].Records[RecordCounter].Indent);
						}
					}
				}
			}

			var ExtraParams = "";
//				FunctionCalls[FunctionsCounter] = GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource;
//				FunctionsCounter++;
			for (var zCounter = 0; zCounter<FunctionCalls.length; zCounter++)
			{
				ExtraParams = ",'" + Globals.escapeSingleQuote(FunctionCalls[zCounter]) + "'," + FunctionCalls[zCounter] + ExtraParams;
			}
			
			
			//function GopherEvaluateF(xCodeLine, NestedParent, ParentType, StatemetStr, StatemetValue, InnerFunctionCount)
			GopherObjectsA[ObjectCounter].InsertStr = 
			  "GopherEvaluateF("+GopherObjectsA[ObjectCounter].Records[0].XLine + "," +
			                   "'" + GopherObjectsA[ObjectCounter].NestedParentType + "'," +
									 "'" + GopherObjectsA[ObjectCounter].Records[0].ParentType + "'," +
									 "'" + Globals.escapeSingleQuote(GopherObjectsA[ObjectCounter].Records[0].xSource) + "', " +
									 GopherObjectsA[ObjectCounter].Records[0].xSource + "," + 
									 (FunctionCalls.length) + ExtraParams + ")";
			
		}
		
		//If AssignmentExpression,VariableDeclarator and first operator is =
		if ( (GopherObjectsA[ObjectCounter].NewRecordType=="AssignmentExpression") || //a = 5;
		     (GopherObjectsA[ObjectCounter].NewRecordType=="VariableDeclarator") || //var a = 5;
			  (GopherObjectsA[ObjectCounter].NewRecordType=="LogicalExpression") ) // ((10>5) && (3<4))
		{
			//first print to screen
			//if (DebugLines) 
			{
				console.log( "\n" +GopherObjectsA[ObjectCounter].NewRecordType);
				console.log( 
				" HelperParentType: " + GopherObjectsA[ObjectCounter].HelperParentType + 
				" HelperParentName: " + GopherObjectsA[ObjectCounter].HelperParentName + 
				" NestedParentType: " + GopherObjectsA[ObjectCounter].NestedParentType + 

				  " Parent Type: " + GopherObjectsA[ObjectCounter].Records[0].ParentType + 
				" Indent: " + GopherObjectsA[ObjectCounter].Records[0].Indent + 
				" Length : " + GopherObjectsA[ObjectCounter].Records.length + 
				" Source: " + GopherObjectsA[ObjectCounter].Records[0].xSource + 
				" Operator: " + GopherObjectsA[ObjectCounter].Records[0].Operator);
			 
				console.log(" Left Var Name: " + GopherObjectsA[ObjectCounter].Records[1].xSource );
			 
			}
			
			//find the right side with the same indent as left
			var RightSideFound = 0;
			var RecordCounter = 1;
			while ( (RightSideFound==0) && (RecordCounter<GopherObjectsA[ObjectCounter].Records.length-1) )
			{
				RecordCounter++;
				if (GopherObjectsA[ObjectCounter].Records[RecordCounter].Indent==GopherObjectsA[ObjectCounter].Records[1].Indent)
				{
					RightSideFound = RecordCounter;
				}
			}
			if (RightSideFound!=0)
			{
				//if (DebugLines) 
				{
					console.log(" Right("+RightSideFound+") Var Name: " + GopherObjectsA[ObjectCounter].Records[RightSideFound].xSource );
				}
				
				//find and list all function calls on the right side
				var RecordCounter = RightSideFound;
				var FunctionCalls = [];
				var FunctionsCounter = 0;
				while ( (RecordCounter<GopherObjectsA[ObjectCounter].Records.length-1) )
				{
					RecordCounter++;
					if ( (GopherObjectsA[ObjectCounter].Records[RecordCounter].ThisType=="CallExpression") )
					{
						if ( (GopherObjectsA[ObjectCounter].Records[RecordCounter].ParentType=="left") ||
						     (GopherObjectsA[ObjectCounter].Records[RecordCounter].ParentType=="right") ||
							  (GopherObjectsA[ObjectCounter].Records[RecordCounter].ParentType=="property") ||
							  (GopherObjectsA[ObjectCounter].Records[RecordCounter].ParentType=="0") )
						{
							FunctionCalls[FunctionsCounter] = GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource;
							FunctionsCounter++;
							//if (DebugLines) 
							{							
								console.log("        EXT. REF: "+GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource+ " " + 
								GopherObjectsA[ObjectCounter].Records[RecordCounter].ThisType + " " + 
								GopherObjectsA[ObjectCounter].Records[RecordCounter].ParentType + " " + 
								GopherObjectsA[ObjectCounter].Records[RecordCounter].Indent);
							}
						}
					}
					
					
					if (GopherObjectsA[ObjectCounter].Records[RecordCounter].ThisType=="MemberExpression")
					{
						if ( ( GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource.indexOf("window.") == 0) ||
						     ( GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource.indexOf("parent.") == 0) ||
						     ( GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource.indexOf("document.") == 0) )
						{
							FunctionCalls[FunctionsCounter] = GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource;
							FunctionsCounter++;
							//if (DebugLines) 
							{							
								console.log("        EXT. REF: "+GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource+ " " + 
								GopherObjectsA[ObjectCounter].Records[RecordCounter].ThisType + " " + 
								GopherObjectsA[ObjectCounter].Records[RecordCounter].ParentType + " " + 
								GopherObjectsA[ObjectCounter].Records[RecordCounter].Indent);
							}
						}
					}
				}

				var ExtraParams = "";
//				FunctionCalls[FunctionsCounter] = GopherObjectsA[ObjectCounter].Records[RecordCounter].xSource;
//				FunctionsCounter++;
				for (var zCounter = 0; zCounter<FunctionCalls.length; zCounter++)
				{
					ExtraParams = ",'" + Globals.escapeSingleQuote(FunctionCalls[zCounter]) + "'," + FunctionCalls[zCounter] + ExtraParams;
				}
				
					
				if (GopherObjectsA[ObjectCounter].HelperParentType=="IfStatement")
				{
					//function GopherEvaluateF(xCodeLine, NestedParent, ParentType, StatemetStr, StatemetValue, InnerFunctionCount)
					GopherObjectsA[ObjectCounter].InsertStr = 
						"GopherEvaluateF("+GopherObjectsA[ObjectCounter].Records[0].XLine + "," +
											  "'" + GopherObjectsA[ObjectCounter].NestedParentType + "'," +
											  "'" + GopherObjectsA[ObjectCounter].Records[0].ParentType + "'," +
											  "'" + Globals.escapeSingleQuote(GopherObjectsA[ObjectCounter].Records[0].xSource) + "', " +
											  GopherObjectsA[ObjectCounter].Records[0].xSource + "," + 
											  (FunctionCalls.length) + ExtraParams + ")";
				} else
				{
					//function GopherSetF(xCodeLine, NestedParent, ParentType, LeftSideStr, LeftSideValue, RightSideStr, RightSideValue, Operator, InnerFunctionCount)
					GopherObjectsA[ObjectCounter].InsertStr = 
					  GopherObjectsA[ObjectCounter].Records[1].xSource + " = " + 
					  "GopherSetF("+GopherObjectsA[ObjectCounter].Records[0].XLine + "," +
										"'" + GopherObjectsA[ObjectCounter].NestedParentType + "'," +
										"'" + GopherObjectsA[ObjectCounter].Records[0].ParentType + "'," +
										"'" + Globals.escapeSingleQuote(GopherObjectsA[ObjectCounter].Records[1].xSource) + "'," +
										Globals.escapeSingleQuote(GopherObjectsA[ObjectCounter].Records[1].xSource) + "," +
										"'" + Globals.escapeSingleQuote(GopherObjectsA[ObjectCounter].Records[RightSideFound].xSource) + "'," + 
									   GopherObjectsA[ObjectCounter].Records[RightSideFound].xSource + "," + 
										"'" + GopherObjectsA[ObjectCounter].Records[0].Operator + "'," + 
										(FunctionCalls.length) + ExtraParams + ")";
				}
			}
		}
	}

	//change the code with InsertStr
	for (var ObjectCounter=GopherObjectsA.length-1; ObjectCounter >= 0; ObjectCounter--)
	{
		if ( (GopherObjectsA[ObjectCounter].InsertStr!="") && (GopherObjectsA[ObjectCounter].CopyStart>0) && (GopherObjectsA[ObjectCounter].CopyEnd>0) )
		{
			//console.log( GopherObjectsA[i].InsertStr + "\n"   );
			contents = [contents.slice(0, GopherObjectsA[ObjectCounter].CopyStart), GopherObjectsA[ObjectCounter].InsertStr, 	contents.slice(GopherObjectsA[ObjectCounter].CopyEnd)].join('');
		}
	}
	
	
	
	// **** IN RealTimeConsole_Temps.JS REF #001
  
	//========================================
	//Insert the gohper callback fuctions and socket.io setup
	var insert_contents =	"//GopherB node Socket setup \n"+
	"var iosocket;\n"+
	"iosocket = io.connect();\n"+
	"iosocket.emit('HiGopherB','');\n"+
	"iosocket.emit('HiClientServer','');\n"+
	"\n\n" +
	"var GopherCallerIDCouter = 100;\n"+
	"var GopherCallerID = '0:0';\n"+


	"//------------------------------------------------------------------------------\n"+
	"function GopherFunctionCall(xCodeLine, xFuncTrackID, xFuncStr, xFuncValue, xParentID, xGopherCallerID) {\n" +
	" iosocket.emit( 'Gopher.FuncCall', {CodeLine:xCodeLine, FuncTrackID:xFuncTrackID, VarStr:xFuncStr, FuncValue:xFuncValue, ParentID:xParentID, GopherCallerID:xGopherCallerID } );\n"+
	"return xFuncValue;\n"+
	"}\n\n"+
	

	"//------------------------------------------------------------------------------\n"+
	"function GopherSetF(xCodeLine, NestedParent, ParentType, LeftSideStr, LeftSideValue, RightSideStr, RightSideValue, Operator, InnerFunctionCount) {\n" +
	"    var OutPut = RightSideValue;\n" +
	"    if (Operator == '++') {\n" +
	"        OutPut = RightSideValue + 1;\n" +
	"    } else\n" +
	"    if (Operator == '--') {\n" +
	"        OutPut = RightSideValue - 1;\n" +
	"    } else\n" +
	"    if (Operator == '+=') {\n" +
	"        OutPut = LeftSideValue + RightSideValue;\n" +
	"    } else\n" +
	"    if (Operator == '-=') {\n" +
	"        OutPut = LeftSideValue - RightSideValue;\n" +
	"    }\n" +
	"    console.log('Gopeher Set:' + NestedParent + ' - '+ParentType);\n" +
	"    console.log('Line:' + xCodeLine + ', Left: ' + LeftSideStr + '(' + LeftSideValue + '), Op: '+Operator+', Right: '+RightSideStr+' ('+RightSideValue+') New Value:'+OutPut); \n" +
	"    return OutPut;\n" +
	"}\n\n" +

	"//------------------------------------------------------------------------------\n"+
	"function GopherEvaluateF(xCodeLine, NestedParent, ParentType, StatemetStr, StatemetValue, InnerFunctionCount) {\n" +
	"    var OutPut = StatemetValue;\n" +
	"    console.log('Gopeher Evaluate:' + NestedParent + ' - '+ParentType);\n" +
	"    console.log('Line:' + xCodeLine + ', Statement: ' + StatemetStr + ', Value: '+StatemetValue); \n" +
	"    return OutPut;\n" +
	"}\n\n" +

	"//------------------------------------------------------------------------------\n"+
	"\n";
 
	if (TempVarStr!="")
	{
		insert_contents += "var "+TempVarStr+";\n\n"+
		"//------------------------------------------------------------------------------\n"+
		"\n\n";
	}
 
 
	return insert_contents+contents;
}


function GopherTellFile(inFile)
{
	Globals.fs.readFile(inFile,function(err,contents){
		if(!err){
			contents = GopherTellify(contents,inFile);
			Globals.fs.writeFile(inFile.replace(".js","-gopher.js"),Globals.beautify(contents, { indent_size: 4 }));
		}
	});
}

GopherTellFile(__dirname + '/../liveparser-root/js/app.js');

// **** IN RealTimeConsole.JS REF #002


	
this.getFile = function(request, response){
	
	var	localFolder = __dirname + '/..';
	
	localFolder = localFolder.replace(/\\/g,'/');
	
	var	page404 = localFolder + '/admin/404.html';
	
	var fileName = request.url;
	if ((request.url=="/admin") || (request.url=="/admin/")) { 
		fileName = '/admin/index.html'; 
	}
	
	
	var ext = Globals.path.extname(fileName);
	var mimeType = Globals.extensions[ext];

	//do we support the requested file type?
	if(!Globals.extensions[ext]){
		//for now just send a 404 and a short message
		response.writeHead(404, {'Content-Type': 'text/html'});
		response.end("<html><head></head><body>The requested file type is not supported</body></html>");
	};
	
	
	var filePath = localFolder+fileName;

	//console.log("file:"+fileName+" url:"+request.url+" ext:"+ext+" filePath:"+filePath);
	
	//does the requested file exist?
    Globals.fs.exists(filePath,function(exists){
        //if it does...
        if(exists){
            //read the fiule, run the anonymous function
            Globals.fs.readFile(filePath,function(err,contents){
                if(!err){
                    //if there was no error
                    //send the contents with the default 200/ok header
                    response.writeHead(200,{
                        "Content-type" : mimeType,
                        "Content-Length" : contents.length
                    });
                    response.end(contents);
                } else {
                    //for our own troubleshooting
                    console.dir(err);
                };
            });
        } else {
            //if the requested file was not found
            //serve-up our custom 404 page
            Globals.fs.readFile(page404,function(err,contents){
                //if there was no error
                if(!err){
                    //send the contents with a 404/not found header 
                    response.writeHead(404, {'Content-Type': 'text/html'});
                    response.end(contents);
                } else {
                    //for our own troubleshooting
                    console.dir(err);
                };
            });
        };
    });
};

this.InitLocalSocket = function(socket){

	// console.log("Call binding Real Time Console socket");

	SocketIOHandle = socket; // store socket so we can use it in the rest of the module
	
	socket.on('HiAdmin', function(data) {
		console.log("HiAdmin called from client: "+socket.id);
		
		Globals.socketServer.sockets.in("room1").emit('HiAdminClient', { text:"this is from Gopher Admin Server"});
	});

	socket.on('Gopher.Tell', function(data) {
//		console.log(data);
		Globals.socketServer.sockets.in("room1").emit('ConsoleTell', { text:"L:"+data.CodeLine+" C:"+data.GopherCallerID +": "+data.GopherMsg+", <b>parent:</b>"+data.ParentID });
	});

	socket.on('Gopher.GopherUnaryExp', function(data) {
//		console.log(data);
		Globals.socketServer.sockets.in("room1").emit('ConsoleTell', { text:"L:" + data.CodeLine + " C:0:0: <b>UNARY</b>:" + data.VarStr + " set to: " + data.VarValue });
	});

	socket.on('Gopher.VarDecl', function(data) {
//		console.log(data);
		Globals.socketServer.sockets.in("room1").emit('ConsoleTell', { text:"L:"+data.CodeLine+" C:"+data.GopherCallerID +": <b>Var "+ data.VarName+"</b> set to <b>"+data.VarValue+"</b>, ("+data.VarStr+") <b>parent:</b>"+data.ParentID });
	});	
	
	socket.on('Gopher.GopherAssignment', function(data) {
//		console.log(data);
		Globals.socketServer.sockets.in("room1").emit('ConsoleTell', { text:"L:"+data.CodeLine+" C:"+data.GopherCallerID +": <b>Assignment("+ data.VarOperator +") "+ data.VarName+"</b> set to <b>"+data.VarValue+"</b>, ("+data.VarStr+") <b>parent:</b>"+data.ParentID });
	});	
	
	
	socket.on('Gopher.GopherUpdateExp', function(data) {
//		console.log(data);
		Globals.socketServer.sockets.in("room1").emit('ConsoleTell', { text:"L:"+data.CodeLine+" C:"+data.GopherCallerID +": <b>Update("+ data.VarOperator +") "+ data.VarName+"</b> set to <b>"+data.VarValue+"</b> <b>parent:</b>"+data.ParentID });
	});	
		
}
