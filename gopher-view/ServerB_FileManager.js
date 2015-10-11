var fs = require('fs');
var os = require('os');
var StringDecoder = require('string_decoder').StringDecoder;

var decoder = new StringDecoder('utf8');



var fileNode = exports.fileNode = function(_name,_path,_isDirectory){
    return {
        name:_name,
        path:_path,
        isDirectory: _isDirectory
    };
};

var pathHelper = exports.pathHelper = {
    getFileName: function (_filePath) {
        var fileArr = _filePath.split('/');
        var targetFile = fileArr[fileArr.length - 1];
        return targetFile;
    },
    getFileExtention: function (_filePath) {
        var targetFile = pathHelper.getFileName(_filePath);
        if (targetFile.indexOf('.') > -1) {
            var nameArr = targetFile.split('.');
            return nameArr[nameArr.length - 1];
        } else {
            return '';
        }
    }
};

var getDriveList = exports.getDriveList = function (_callBack) {
    var command = '';
    switch(os.platform().toLowerCase()){
        case 'win32':
            command = 'wmic logicaldisk get name';
            break;
        case 'darwin':
            command = 'df -kl | awk \'{print $9}\'';
            break;
        default:
            command = 'wmic logicaldisk get name';
            break;
    }
    
    require('child_process').exec(command, function (error, stdout, stderr) {
        var stdoutStr = decoder.write(stdout);
        stdoutStr = stdoutStr.trim(); //console.log('(stdoutStr)'+stdoutStr);
		console.log(stdoutStr+"\n=====");

        /*var lines = stdoutStr.toString().split('\n');
        var result = [];
        for (var i = 1; i < lines.length; i++) {
            result.push(new fileNode(lines[i].trim(), lines[i].trim() + '/'));
        }*/
        var lines = stdout.split('\n');
        lines.splice(0,1);
        lines.splice(-1,1);
        lines = lines.filter(function(item){ return item.trim() != ""});
        
		
		
        var result = [];
        for (var i = 0; i < lines.length; i++) {
			
			console.log(lines[i].trim());
			var newitem = lines[i].trim();
			if (newitem.slice(-1)!="/") { newitem += "/"; }
            result.push(new fileNode(lines[i].trim(), newitem));
        }
        return _callBack(result,error);

    });
};

/*This function only list folders or .js files*/
var getFileList = exports.getFileList = function(_targetFilePath, _onlyFolders, _callBack){

	if (typeof _targetFilePath !== 'undefined' && _targetFilePath !== null){
		var result = [];
		if(typeof(_onlyFolders) === 'string'){
			if(_onlyFolders.toLowerCase() === 'true'){
				_onlyFolders = true;
			}else{
				_onlyFolders = false;
			}
		}

		console.log("read folder: "+_targetFilePath);

		fs.readdir(_targetFilePath,function(err,fileList){
			if(err !== null){
				return _callBack('Error in ServerB FileManager: '+err,null);
			}
			var pending = fileList.length; 

			fileList.forEach(function(file){
				fs.stat(_targetFilePath+file, function(err, stats){
					--pending; 
					if (err !== null) {
						console.log('error at read stat'+err);
						return;
					}

					if(_onlyFolders){
						if(stats.isDirectory()){
							//console.log(file);
							result.push(new fileNode(file, _targetFilePath + file + '/', true));
							//console.log(pending);
						}
					}else{
						var markIsDirectory = false;
						if(stats.isDirectory()){
							markIsDirectory = true;
							result.push(new fileNode(file, _targetFilePath + file + '/', markIsDirectory));
						}else{
							var filePath = _targetFilePath.toLowerCase()+file.toLowerCase();
							if((pathHelper.getFileExtention(filePath)).toLowerCase() === 'js'){
								result.push(new fileNode(file, _targetFilePath + file , markIsDirectory));
							}
						}       
					}

					if (pending === 0) {                    
						result.sort(function(a,b){
						   return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
						});

						var directoryList = [];
						var fileList = [];
						for(var i=0; i<result.length; i++){
							if(result[i].isDirectory){
								directoryList.push(result[i]);
							}else{
								fileList.push(result[i]);
							}
						}

						result = [];
						for(var j=0; j<directoryList.length; j++){
							result.push(directoryList[j]);
						}
						for(var j=0; j<fileList.length; j++){
							result.push(fileList[j]);
						}
						return _callBack(null, result);
					}
				});
			});

		});
	}
};

var findFiles = exports.findFiles = function (_options, _end, _result) {
    /*
     * _options = {
     *  targetFolder:,
     *  targetFiles:(is an array)
     * }
     */
    
    var result;
    if(typeof(_result) !== 'undefined'){
        result = _result;
    }else{
        result = [];
    }
    
    fs.readdir(_options.targetFolder, function (err, fileList) {
        var pending = fileList.length;
        if (!pending) {
            return _end(null, result);
        }

        fileList.forEach(function (file) {
            fs.stat(_options.targetFolder + file, function (err, stats) {
                if(err !== null){
                    console.log('error at read stat'+err);
                    return;
                }
                
                if (stats.isDirectory()) {
                    var options = {
                        targetFolder: _options.targetFolder + file +'/',
                        targetFiles: _options.targetFiles
                    };
                    findFiles(options, function(err, res){
                       //result.push(res);
                       if(!--pending){
                           _end(null,result);
                       }
                    }, result);
                } else {
                    var match=0;
                    for(var i=0; i<_options.targetFiles.length; i++){
                        if( file.search(_options.targetFiles[i]) > -1){
                            match++;
                        }
                    }
                    if(match>0){
                        result.push(_options.targetFolder + file);
                    }
                    if(!--pending){
                        _end(null,result);
                    }
                }
            });
        });
    });
};


/*(function test3(){
    var options = {
        targetFolder: 'C:\\wamp\\www\\EgeFlipCard\\',
        targetFiles: Global.ignoredByDefault
    };
    findFiles(options, function(error,result){
        if(error !== null){
            console.log(error);
            return;
        }
        
        console.log(result);
        console.log('result.length '+result.length);
    });
})();*/

/*(function test2(){
    getFileList('C:\\', true,function(error, result){
       if(error !== null){
           console.log(error);
       }
       console.log('++++++++++++++++++++++++++');
       console.log('result, test2');
       for(var i=0; i<result.length; i++){
           console.log(result[i].name);
       }
       console.log('++++++++++++++++++++++++++');
    });
})();*/


/*console.log('test function is called');
(function test() {
    
    var dir = "C:\\";
    var files = fs.readdir(dir, function (err, fileList) {
        fileList.forEach(function (file) {
            fs.stat(dir + file, function (err, stats) {
                if (err !== null) {
                    console.log(err);
                    return;
                }
                if (stats.isDirectory()) {
                    console.log(file);
                }
            });
        });
        if (err !== null) {
            console.log(err);
            return;
        }
    });
}());*/