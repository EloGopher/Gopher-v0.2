function Layout() {
	var Layout = this;
	Layout.slot = '';
	Layout.logItem = '';
	Layout.logTag = '';
	this.Adjust = function(){
		adjust();
	};
	__Layout();

  Layout.Switch = function(_viewName, _callBack) {
		switch(_viewName) {
		case 'messages-only':
			$('.messages-source').removeClass('active').addClass('inactive');
			$('.messages-only').off('transitionend');
			$('.messages-source').off('transitionend').on('transitionend', function() {
				console.log('messages-source trnasitionend');
				if ($(this).hasClass('inactive')) {
					$('.messages-only').addClass('active').removeClass('inactive');
					if ( typeof (_callBack) !== 'undefined') {
						_callBack();
					}
				}
			});
			break;
		case 'messages-source':
			$('.messages-only').removeClass('active').addClass('inactive');
			$('.messages-source').off('transitionend');
			$('.messages-only').off('transitionend').on('transitionend', function() {
				console.log('messages-only trnasitionend');
				if ($(this).hasClass('inactive')) {
					$('.messages-source').addClass('active').removeClass('inactive');
					if ( typeof (_callBack) !== 'undefined') {
						_callBack();
					}
				}
			});
			//->adjust source-content height
			break;
		}
	};

	function adjust(){
		$('#time_band').css('height',$(window).height());
		$('#view_container').css({
			'height':$(window).height() +'px'
		});

		$('.view').css({
			'width' : $('#view_container').width() + 'px',
			'height' : $('#view_container').height() + 'px'
		});

		$('#source_content').css('height',$('#source_code').height()-$('#source_title').height());

		var testme=0;
	};

	function __Layout(){
		Layout.slot = getTemplate($('#time_band').find('div[data-template="time-slot"]'));
		Layout.logItem = getTemplate($('.message-list:eq(0)').find('div[data-template="log-item"]'));
		Layout.logTag = getTemplate($('.message-list:eq(0)').find('div[data-template="log-item"] span[data-template="tag"]'));
		$('#view_container').find('[data-template]').remove();

	  adjust();
	}

	function getTemplate(jqObject) {
		var result = $.parseHTML($(jqObject).prop("outerHTML"));
		if($(result).data('template') === 'log-item'){
			$(result).find('span[data-template="tag"]').remove();
		}
		$(result).removeAttr('data-template');
		return $(result).prop("outerHTML");
	}

}



function TimeSlot(_layout) {
	var TimeSlot = this;
	this.AjaxTimeSlots = null;

	this.AjaxGetTimeSlots = function(_callBack) {
		if (TimeSlot.AjaxTimeSlots !== null) {
			TimeSlot.AjaxTimeSlots.abort();
		}

		TimeSlot.AjaxTimeSlots = $.ajax({
			type : 'POST',
			url : '/timeband.js',
			dataType : 'json',
			data : {
				task : 'getAllTimeSlots'
			},
			beforeSend : function() {
				$('#time_band').empty();
				$('#message_list').empty();
			},
			success : function(data) {
				console.log(data);
				if (data.length > 0) {
					var timeBand = TimeSlot.RenderTimeSlots(data, (Number($(document).height())));
					//console.log(timeBand);
					$('#time_band').find('.time-slot:eq(0)').addClass('selected');
					if ( typeof (_callBack) !== 'undefined') {
						_callBack({Data:data,TimeBand:timeBand}, null);
					}
					//<-ajaxGetMessages(timeBand[timeBand.length - 1].start, timeBand[timeBand.length - 1].end);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				if ( typeof (_callBack) !== 'undefined') {
					_callBack(null, textStatus);
				}
			},
			complete : function(jqXHR, textStatus) {
			}
		});
	};

	this.RenderTimeSlots = function(data, ideal) {
		var ideaHeight = ideal;
		var slotHeightArr = [],
		    newTimeBand = [];

		//make the original timeband and save original slot height
		for (var i = 0; i < data.length; i++) {
			var calSlotHeight = (ideaHeight * Number(data[i].Percentage)) / 100;
			slotHeightArr.push(calSlotHeight);
			newTimeBand.push({
				'height' : calSlotHeight,
				'start' : data[i].Start,
				'end' : data[i].End
			});
		}
		console.log('original timeBand');
		console.log(newTimeBand);

		//find out the smallest slot height, and how much is required to become 28
		var additionHeight = 28 - Math.min.apply(Math, slotHeightArr);

		//In reverse order, add "become fit 28" width to the slot, stop until totl width is bigger than the page height.
		var sumHeight = 0;
		var trackHeight = 0;
		for (var i = (newTimeBand.length - 1); i > -1; i--) {
			newTimeBand[i].height = newTimeBand[i].height + additionHeight;
			sumHeight += newTimeBand[i].height;

			if (sumHeight <= ideaHeight) {
				trackHeight = sumHeight;
			}

			if (sumHeight > ideaHeight) {
				newTimeBand.splice(i, 1);
			}
		}

		var newAdditionHeight = (ideaHeight - trackHeight) / newTimeBand.length;
		for (var i = 0; i < newTimeBand.length; i++) {
			var changedTo = newTimeBand[i].height + newAdditionHeight;
			changedTo = Math.round(changedTo * 1000) / 1000;
			newTimeBand[i].height = changedTo;
			//subtract border height
		}
		var rows = '',
		    row = '';
		var fw = 0;
		for (var i = (newTimeBand.length - 1); i > -1; i--) {
			row = _layout.slot;
			row = row.replace("##StartTime##", newTimeBand[i].start);
			row = row.replace("##EndTime##", newTimeBand[i].end);
			row = $(row);

			$(row).css({
				'height' : newTimeBand[i].height + 'px'
			});
			if (i == 0) {
				$(row).addClass('last');
			}

			fw += Number(newTimeBand[i].height);
			rows += $(row).prop('outerHTML');
		}
		$('#time_band').append(rows);
		//console.log('final timeBand');
		//console.log(newTimeBand);
		return newTimeBand;
	};

}

function Messages() {
	var ajaxMesages = null;
	this.AjaxGetMessages = function(_startTime, _endTime, _callBack) {
		if (ajaxMesages !== null) {
			ajaxMesages.abort();
		}
		ajaxMesages = $.ajax({
			type : 'POST',
			url : 'gopher-view-backend/time_band.php',
			dataType : 'json',
			data : {
				task : 'getGopherMessages',
				startTime : _startTime,
				endTime : _endTime
			},
			beforeSend : function() {
				$('#message_list').empty();
			},
			success : function(data) {
				if ( typeof (_callBack) !== 'undefined') {
					_callBack(data, null);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {

			},
			complete : function(jqXHR, textStatus) {
			}
		});
	};

	this.RenderMessages = function(_template, data) {
		var rows = '';
		var repeatCount = {
			fileName : 0,
			codeLine : 0,
			dataType : 0,
			messageText : null,
			variableName : null,
			variableValue : null,
			initialIndex : {
				fileName : 0,
				codeLine : 0,
				dataType : 0,
				messageText : 0,
				variableName : 0,
				variableValue : 0
			},
			saveCounts : []
		};

		for (var i = 0; i < data.length; i++) {
			var row = _template;
			var rowJ = $.parseHTML(row);

			$(rowJ).attr('data-id', data[i].ID);

			//track repeating
			if (i > 0) {
				if (getFileName(data[i].FileName) === getFileName(data[(i - 1)].FileName)) {
					repeatCount.fileName++;
				} else {
					repeatCount.fileName = 0;
					repeatCount.initialIndex.fileName = i;
				}

				if (data[i].CodeLine === data[(i - 1)].CodeLine) {
					repeatCount.codeLine++;
				} else {
					repeatCount.codeLine = 0;
					repeatCount.initialIndex.codeLine = i;
				}

				if (data[i].DataType === data[(i - 1)].DataType) {
					repeatCount.dataType++;
				} else {
					repeatCount.dataType = 0;
					repeatCount.initialIndex.dataType = i;
				}

				if (data[i].LogMessage === data[(i - 1)].LogMessage && data[i].LogMessage !== null) {
					repeatCount.messageText++;
				} else {
					repeatCount.messageText = null;
					repeatCount.initialIndex.messageText = i;
				}

				if (data[i].VarName === data[(i - 1)].VarName && data[i].VarName !== null) {
					repeatCount.variableName++;
				} else {
					repeatCount.variableName = null;
					repeatCount.initialIndex.variableName = i;
				}

				if (data[i].VarValue === data[(i - 1)].VarValue && data[i].VarValue !== null) {
					repeatCount.variableValue++;
				} else {
					repeatCount.variableValue = null;
					repeatCount.initialIndex.variableValue = i;
				}
			}

			//process repeatCount
			if (repeatCount.fileName > 0 && repeatCount.dataType > 0 && repeatCount.codeLine > 0) {
				if ((data[i].DataType == 'pgt' || data[i].DataType == 'gt') && repeatCount.messageText > 0) {
					$(rowJ).find('.line-number').text('');
					repeatCount.saveCounts[repeatCount.saveCounts.length - 1].repeatCount = repeatCount.messageText + 1;
					$(rowJ).css('display', 'none');
				} else if ((data[i].DataType == 'pvt' || data[i].DataType == 'vt') && repeatCount.variableName > 0 && repeatCount.variableValue > 0) {
					$(rowJ).find('.line-number').text('');
					repeatCount.saveCounts[repeatCount.saveCounts.length - 1].repeatCount = repeatCount.variableValue + 1;
					$(rowJ).css('display', 'none');
				} else {
					$(rowJ).find('.line-number').text(data[i].CodeLine);
					$(rowJ).find('.repeat-num').css('visibility', 'hidden');
				}
			} else {
				$(rowJ).find('.line-number').text(data[i].CodeLine);
				repeatCount.saveCounts.push({
					index : i,
					repeatCount : 0
				});
				//console.log('hide i ' + i);
				$(rowJ).find('.repeat-num').css('visibility', 'hidden');
			}

			//process message or variable
			if (data[i].DataType == 'pgt' || data[i].DataType == 'gt') {
				$(rowJ).find('.item-message').removeClass('variables');
				$(rowJ).find('.message-text').html(data[i].LogMessage);
				$(rowJ).find('.varname').css({
					'display' : 'none'
				});
				$(rowJ).find('.varvalue').css({
					'display' : 'none'
				});
			} else if (data[i].DataType == 'pvt' || data[i].DataType == 'vt') {
				$(rowJ).find('.message-text').css({
					'display' : 'none'
				});
				$(rowJ).find('.item-message').addClass('variables');
				switch (data[i].DataType) {
				case 'vt':
					$(rowJ).find('.varname').text(data[i].VarName);
					break;
				case 'pvt':
					$(rowJ).find('.varname').text('Variable');
					break;
				}
				$(rowJ).find('.varvalue').text(data[i].VarValue);

				switch (data[i].DataType) {
				case 'pvt':
					$(rowJ).find('.varname').attr('class', 'varname ext-php');
					break;
				case 'vt':
					$(rowJ).find('.varname').attr('class', 'varname ext-js');
					break;
				}
			}

			//process FileName
			var fileNameObj = $(rowJ).find('.filename');
			$(fileNameObj).removeAttr('data-language');
			if (data[i].DataType == 'pgt' || data[i].DataType == 'pvt') {
				$(fileNameObj).attr('class', 'filename ext-php');
				$(fileNameObj).attr('data-language', 'php');
			} else if (data[i].DataType == 'gt' || data[i].DataType == 'vt') {
				$(fileNameObj).attr('class', 'filename ext-js');
				$(fileNameObj).attr('data-language', 'javascript');
			}
			$(fileNameObj).text(getFileName(data[i].FileName));
			$(fileNameObj).removeAttr('data-filepath');
			$(fileNameObj).attr('data-filepath', data[i].FileName);
			$(fileNameObj).removeAttr('data-parent');
			$(fileNameObj).attr('data-parent', data[i].ParentFileName);

			row = $(rowJ).prop('outerHTML');
			rows += row;
		}

		var rowJ = $.parseHTML(rows);
		for (var j = 0; j < repeatCount.saveCounts.length; j++) {
			$(rowJ[repeatCount.saveCounts[j].index]).find('.repeat-num').text(repeatCount.saveCounts[j].repeatCount);
			if (repeatCount.saveCounts[j].repeatCount > 0) {
				$(rowJ[repeatCount.saveCounts[j].index]).find('.repeat-num').css('visibility', 'visible');
			}
		}

		var redoRows = '';
		for (var k = 0; k < $(rowJ).length; k++) {
			redoRows += $(rowJ[k]).prop('outerHTML');
		}
		return redoRows;
	};

	function getFileName(filePath) {
		var slashes = [];
		if (filePath.indexOf('/') > -1) {
			slashes = filePath.split('/');
		} else {
			slashes = filePath.split('\\');
		}

		if (slashes.length == 0) {
			return filePath;
		} else {
			return slashes[slashes.length - 1];
		}
	}

}


$(document).ready(function() {
	/*** WHEN PAGE STARTS ***/
	var layout = new Layout();
	var timeSlots = new TimeSlot(layout);
	var messages = new Messages();

	timeSlots.AjaxGetTimeSlots(function(data, error) {
		if (data !== null) {
			messages.AjaxGetMessages(data.TimeBand[data.TimeBand.length - 1].start, data.TimeBand[data.TimeBand.length - 1].end, function(data, error) {
				if (data !== null) {
					if (data.length > 0) {
						$('.view .message-list').append(messages.RenderMessages(layout.logItem, data));
					}
				}

			});
		}
	});

	/*** JQUERY EVENT BINDING ***/
	$('#time_band').on('click', '.time-slot', function() {
		var startTime = $(this).data('starttime');
		var endTime = $(this).data('endtime');

		if ($(this).hasClass('selected') === false) {
			$('#time_band').find('.time-slot').removeClass('selected');
			$(this).addClass('selected');
			messages.AjaxGetMessages(startTime, endTime, function(data, error) {
				if (data !== null) {
					if (data.length > 0) {
						$('.view .message-list').empty();
						$('.view .message-list').append(messages.RenderMessages(layout.logItem, data));
						layout.Switch('messages-only');
					}
				}
			});
		} else {
			if ($('.messages-source').hasClass('active')) {
				console.log('just open the messages');
				layout.Switch('messages-only');
				//refresh
			} else {
				console.log('do nothing!!!');
			}
		}
	});

	$('.message-list').on('click', '.item-log', function() {
		var selectedFileName = $(this).find('span.filename').text();

		function selectAMessage(_selectedItem){
			$('.messages-source').find('.item-log').each(function() {
				if ($(this).find('span.filename').text() !== selectedFileName) {
					$(this).addClass('dim');
				} else {
					$(this).removeClass('dim');
				}
			});

			$('.messages-source .item-log').removeClass('selected');
			$(_selectedItem).addClass('selected');
		}

		if ($('.messages-source').hasClass('active')) {
			console.log('get the source code1');
			selectAMessage($(this));

		} else {
			var itemIndex = $(this).index(); console.log('itemIndex '+itemIndex);
			layout.Switch('messages-source',function(){
				selectAMessage($('.messages-source .item-log:eq('+itemIndex+')'));
			});
		}
	});

	$('#source_code').click(function() {
		/*changeViewLayout('message only');
		 $('#message_list').find('.item-log.dim').removeClass('dim');
		 $('#message_list').find('.item-log.selected').removeClass('selected');*/
	});

	$(window).resize(function() {
		$('#time_band').empty();
	  layout.Adjust();
		timeSlots.TimeBand = timeSlots.RenderTimeSlots(timeSlots.AjaxTimeSlots.responseJSON, Number($(window).height()));
	});



});
