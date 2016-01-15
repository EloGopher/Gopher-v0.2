$(document).ready(function() {

	var filemanager = $('.filemanager');
	var breadcrumbs = $('.breadcrumbs');
	var fileList = filemanager.find('.data');

	var searchByPathCounter = 0;

	var response;
	var currentPath = '';
	var breadcrumbsUrls = [];

	var folders = [];
	var files = [];


	//---------------------------------------------------------------------------------------------------------------------------------------
	if (typeof String.prototype.startsWith != 'function') {
		// see below for better implementation!
		String.prototype.startsWith = function(str) {
			return this.indexOf(str) === 0;
		};
	}


	//---------------------------------------------------------------------------------------------------------------------------------------
	function escapeHTML(text) {
		return text.replace(/\&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
	}

	//---------------------------------------------------------------------------------------------------------------------------------------
	function bytesToSize(bytes) {
		var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes == 0) return '0 Bytes';
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	}

	//---------------------------------------------------------------------------------------------------------------------------------------
	function AddRemoveCheck(xthis) {
		if ($(xthis).hasClass("FileChecked")) {

			$(xthis).removeClass("FileChecked");
			$(xthis).addClass("FileNotChecked");
			$(xthis).find('.topCheck').remove();
			/*
			$.post('scan.php?op=unmark', {filename: $(xthis).data("filename") },  function(data) {
				MarkFileData(response,$(xthis).data("filename"), "0");
			});
			*/

		} else {
			$(xthis).removeClass("FileNotChecked");
			$(xthis).addClass("FileChecked");
			$(xthis).append("<div class=\"topCheck\"><i style=\"color:white;\" class=\"fa fa-3x fa-check\"></i></div>");
			/*
			$.post('scan.php?op=mark', {filename: $(xthis).data("filename") },  function(data) {
				$(xthis).ischecked = "1";
				MarkFileData(response,$(xthis).data("filename"), "1");
			});
			*/
		}
	}


	// Start by fetching the file data from scan.php with an AJAX request
	$.get('scan.php?op=files', function(data) {
		response = [data];
		currentPath = '';
		breadcrumbsUrls = [];
		folders = [];
		files = [];

		$(window).on('hashchange', function() { // capture back/forward navigation in the browser.
			goto(window.location.hash);
		});


		goto(window.location.hash); //when page loads the first time

		// Clicking on folders
		fileList.on('click', 'li.folders', function(e) {
			e.preventDefault();

			var nextDir = $(this).find('a.folders').attr('href');

			breadcrumbsUrls.push(nextDir);

			window.location.hash = encodeURIComponent(nextDir);
			//goto(nextDir);
			currentPath = nextDir;
		});


		// Clicking on files
		fileList.on('click', 'li.files', function(e) {
			e.preventDefault();
			AddRemoveCheck(this);
		});

		// Clicking on breadcrumbs
		breadcrumbs.on('click', 'a', function(e) {
			e.preventDefault();

			var index = breadcrumbs.find('a').index($(this)),
				nextDir = breadcrumbsUrls[index];

			breadcrumbsUrls.length = Number(index);

			//goto(nextDir);

			window.location.hash = encodeURIComponent(nextDir);
		});

		// Navigates to the given hash (path)
		function goto(hash) {
			console.log("goto hash:'" + hash + "'");
			hash = decodeURIComponent(hash);

			hash = hash.replace('/Project Home','');

			if (hash != '/Project Home') {
				hash = hash.slice(1).split('=');
				var rendered = '';

				searchByPathCounter = 0;
				rendered = searchByPath(response, hash[0]);
				currentPath = hash[0];
				//console.log("currentPath:" + currentPath);

				breadcrumbsUrls = generateBreadcrumbs(hash[0]);

				render(rendered.data);
			}
			// if there is no hash
			else {
				currentPath = '';
				breadcrumbsUrls = generateBreadcrumbs('');

				searchByPathCounter = 0;
				rendered = searchByPath(response, '');
				render(rendered.data);
			}
		}

		// Splits a file path and turns it into clickable breadcrumbs

		function generateBreadcrumbs(nextDir) {
			if (nextDir.indexOf('/Project Home')==-1) { nextDir = '/Project Home'+nextDir; }
			//console.log("generateBreadcrumbs: "+nextDir);

			var path = nextDir.split('/').slice(0);
			for (var i = 1; i < path.length; i++) {
				path[i] = path[i - 1] + '/' + path[i];
				//console.log("generateBreadcrumbs: " + path[i]);
			}
			return path;
		}


		function searchByPath(data, dir) {
			//			console.log("searchByPath: "+dir);
			searchByPathCounter++;

			if (searchByPathCounter < 250) {
				var filedata = {};
				filedata.data = data;
				filedata.flag = 0;

				filedata.data.forEach(function(d) {
					if ((d.type === 'folder') && (filedata.flag == 0)) {

						if (d.path === dir) {
							console.log("found: " + d.path + " === " + dir);
							filedata.data = d.items;
							filedata.flag = 1;
							//							console.log(d.items);
						} else {
							//							console.log("recuive search: "+d.path)
							filedata = searchByPath(d.items, dir);
						}
					}
				});
				return filedata;
			}
		}

		// Render the HTML for the file manager
		function FindCheckedFileNumber(data, searchPath, FoundNumber) {
			data.forEach(function(d) {
				if (d.type === 'folder') {
					FoundNumber = FindCheckedFileNumber(d.items, searchPath, FoundNumber);
				} else if (d.type === 'file') {
					//if (d.path == searchFile) {
					if ((d.ischecked == "1") && (d.path.startsWith(searchPath))) {
						FoundNumber++;
					}
				}
			});

			return FoundNumber;
		}


		function render(data) {
			console.log("render");
			//			console.log(data);
			var scannedFolders = [];
			var scannedFiles = [];

			if (Array.isArray(data)) {
				data.forEach(function(d) {
					if (d.type === 'folder') {
						scannedFolders.push(d);
					} else if (d.type === 'file') {
						scannedFiles.push(d);
					}
				});
			} else
			if (typeof data === 'object') {
				scannedFolders = data.folders;
				scannedFiles = data.files;
			}

			// Empty the old result and make the new one

			fileList.empty().hide();

			if (!scannedFolders.length && !scannedFiles.length) {
				filemanager.find('.nothingfound').show();
			} else {
				filemanager.find('.nothingfound').hide();
			}

			if (scannedFolders.length) {
				scannedFolders.forEach(function(f) {

					var itemsLength = f.items.length,
						name = escapeHTML(f.name),
						icon = '<span class="icon folder"></span>';

					if (itemsLength) {
						icon = '<span class="icon folder full"></span>';
					}

					if (itemsLength == 1) {
						itemsLength += ' item';
					} else if (itemsLength > 1) {
						itemsLength += ' items';
					} else {
						itemsLength = 'Empty';
					}

					if (itemsLength != 'Empty') {
						var FoundNumber = 0;
						FoundNumber = FindCheckedFileNumber(data, f.path, 0);
						if (FoundNumber == "0") {
							FoundNumber = "no files selected";
						} else {
							if (FoundNumber == "1") {
								FoundNumber = "one file selected";
							} else {
								FoundNumber = FoundNumber + " files selected";
							}
						}
					} else {
						FoundNumber = "";
					}

					var folder = $('<li class="folders folderBorder"><a href="' + f.path + '" title="' + f.path + '" class="folders">' + icon + '<span class="name">' + name + '</span> <span class="details">' + itemsLength + '<br>' + FoundNumber + '</span></a></li>');

					folder.appendTo(fileList);
				});
			}

			if (scannedFiles.length) {

				scannedFiles.forEach(function(f) {

					var fileSize = bytesToSize(f.size),
						name = escapeHTML(f.name),
						fileType = name.split('.'),
						icon = '<span class="icon file"></span>';

					fileType = fileType[fileType.length - 1];

					if (fileType == "js") {
						//ignore javascript files
					} else {
						icon = '<span class="icon file f-' + fileType + '">.' + fileType + '</span>';

						var CheckMarkStyle = "FileNotChecked";
						var CheckMarkInsert = "";
						if (f.ischecked == "1") {
							CheckMarkStyle = "FileChecked";
							CheckMarkInsert = "<div class=\"topCheck\"><i style=\"color:white;\" class=\"fa fa-3x fa-check\"></i></div>";
						}

						var file = $('<li class="files ' + CheckMarkStyle + '" data-filename="' + f.path + '"><span title="' + f.path + '" class="files">' + icon + '<span class="name">' + name + '</span> <span class="details">' + fileSize + '</span></span>' + CheckMarkInsert + '</li>');

						file.appendTo(fileList);
					}
				});
			}


			// Generate the breadcrumbs

			var url = '';

			fileList.addClass('animated');

			breadcrumbsUrls.forEach(function(u, i) {

				var name = u.split('/');

				var xname = name[name.length - 1];
				if (name[name.length - 1] == "..") {
					xname = "Home";
				}

				if (i !== breadcrumbsUrls.length - 1) {
					url += '<a href="' + u + '"><span class="folderName">' + xname + '</span></a> <i class="fa fa-long-arrow-right"></i> ';
				} else {
					url += '<span class="folderName">' + xname + '</span>';
				}
			});

			breadcrumbs.text('').append(url);

			// Show the generated elements
			fileList.fadeIn(100); //animate({'display':'inline-block'});
		}
	});
});
