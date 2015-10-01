$(document).ready(function () {
    var template = {
        slot: '',
        logItem: '',
        logTag: ''
    };
    var timeGroupData = null;

    function changeViewLayout(viewName) {
        switch (viewName) {
            case 'message only':
                $('.message-list').removeClass('with-source');
                $('.source-code').removeClass('opened');
                $('.message-list').find('.item-filename').removeClass('closed');
                break;
            case 'view source':
                $('.message-list').addClass('with-source');
                $('.source-code').addClass('opened');
                $('.message-list').find('.item-filename').addClass('closed');
                break;
        }
    }

    function renderTimeSlots(data, ideal) {
        var ideaHeight = ideal;
        var slotHeightArr = [], newTimeBand = [];
        
        //make the original timeband and save original slot height
        for (var i = 0; i < data.length; i++) {
            var calSlotHeight = (ideaHeight * Number(data[i].Percentage)) / 100;
            slotHeightArr.push(calSlotHeight);
            newTimeBand.push({'height': calSlotHeight, 'start': data[i].Start, 'end': data[i].End});
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
            newTimeBand[i].height = changedTo; //subtract border height
        }
        var rows = '', row = '';
        var fw = 0;
        for (var i = (newTimeBand.length-1); i > -1; i--) {
            row = template.slot;
            row = row.replace("##StartTime##", newTimeBand[i].start);
            row = row.replace("##EndTime##", newTimeBand[i].end);
            row = $(row);

            $(row).css({'height': newTimeBand[i].height + 'px'});
            if(i == 0){
                $(row).addClass('last');
            }
            
            fw += Number(newTimeBand[i].height);
            rows += $(row).prop('outerHTML');
        }
        $('#time_band').append(rows);
        console.log('final timeBand');
        console.log(newTimeBand);
        return newTimeBand;
    }

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

    function ajaxGetLog(_startTime, _endTime) {
        $.ajax({
            type: 'POST',
            url: 'gopher-view-backend/time_band.php',
            dataType: 'json',
            data: {task: 'getGopherMessages', startTime: _startTime, endTime: _endTime},
            beforeSend: function () {
                $('#message_list').empty();
            },
            success: function (data) {
                if (data.length > 0) {
                    var rows = '', row = '';
                    var repeatCount = {
                        fileName:0,
                        codeLine:0,
                        dataType:0,
                        messageText:null,
                        variableName:null,
                        variableValue:null,
                        initialIndex:{
                            fileName:0,
                            codeLine:0,
                            dataType:0,
                            messageText:0,
                            variableName:0,
                            variableValue:0
                        },
                        saveCounts:[]
                    };
                    
                    for (var i = 0; i < data.length; i++) {
                        row = template.logItem;
                        var rowJ = $.parseHTML(row);
                        
                        //track repeating
                        if(i>0){
                            if(getFileName(data[i].FileName) === getFileName(data[(i-1)].FileName)){
                                repeatCount.fileName++;
                            }else{
                                repeatCount.fileName=0;
                                repeatCount.initialIndex.fileName = i;
                            }
                            
                            if(data[i].CodeLine === data[(i-1)].CodeLine){
                                repeatCount.codeLine++;
                            }else{
                                repeatCount.codeLine = 0;
                                repeatCount.initialIndex.codeLine = i;
                            }
                            
                            if(data[i].DataType === data[(i-1)].DataType){
                                repeatCount.dataType++;
                            }else{
                                repeatCount.dataType = 0;
                                repeatCount.initialIndex.dataType = i;
                            }
                            
                            if(data[i].LogMessage === data[(i-1)].LogMessage && data[i].LogMessage!==null){
                                repeatCount.messageText++;
                            }else{
                                repeatCount.messageText = null;
                                repeatCount.initialIndex.messageText = i;
                            }
                            
                            if(data[i].VarName === data[(i-1)].VarName && data[i].VarName!==null){
                                repeatCount.variableName++;
                            }else{
                                repeatCount.variableName = null;
                                repeatCount.initialIndex.variableName = i;
                            }
                            
                            if(data[i].VarValue === data[(i-1)].VarValue && data[i].VarValue!==null){
                                repeatCount.variableValue++;
                            }else{
                                repeatCount.variableValue = null;
                                repeatCount.initialIndex.variableValue = i;
                            }
                        }
                        
                        //process repeatCount
                        if(repeatCount.fileName>0 && repeatCount.dataType>0 && repeatCount.codeLine>0){
                            if( (data[i].DataType == 'pgt' || data[i].DataType == 'gt') && repeatCount.messageText > 0){
                                $(rowJ).find('.line-number').text('');
                                repeatCount.saveCounts[repeatCount.saveCounts.length-1].repeatCount = repeatCount.messageText+1;
                                $(rowJ).css('display','none');
                            }else if( (data[i].DataType == 'pvt' || data[i].DataType == 'vt') && repeatCount.variableName>0 && repeatCount.variableValue>0){
                                $(rowJ).find('.line-number').text('');
                                repeatCount.saveCounts[repeatCount.saveCounts.length-1].repeatCount = repeatCount.variableValue+1;
                                $(rowJ).css('display','none');
                            }else{
                                $(rowJ).find('.line-number').text(data[i].CodeLine);
                                $(rowJ).find('.repeat-num').css('visibility','hidden');
                            }
                        }else{
                            $(rowJ).find('.line-number').text(data[i].CodeLine);
                            repeatCount.saveCounts.push({index:i,repeatCount:0});
                            console.log('hide i '+i);
                            $(rowJ).find('.repeat-num').css('visibility','hidden');
                        }
                        
                        //process message or variable
                        if (data[i].DataType == 'pgt' || data[i].DataType == 'gt') {
                            $(rowJ).find('.item-message').removeClass('variables');
                            $(rowJ).find('.message-text').html(data[i].LogMessage);
                            $(rowJ).find('.varname').css({'display': 'none'});
                            $(rowJ).find('.varvalue').css({'display': 'none'});    
                        } else if (data[i].DataType == 'pvt' || data[i].DataType == 'vt'){
                            $(rowJ).find('.message-text').css({'display': 'none'});
                            $(rowJ).find('.item-message').addClass('variables');
                            switch(data[i].DataType){
                                case 'vt':
                                    $(rowJ).find('.varname').text(data[i].VarName);
                                    break;
                                case 'pvt':
                                    $(rowJ).find('.varname').text('Variable');
                                    break;
                            }                            
                            $(rowJ).find('.varvalue').text(data[i].VarValue);
                            
                            switch(data[i].DataType){
                                case 'pvt':
                                    $(rowJ).find('.varname').attr('class', 'varname ext-php');
                                    break;
                                case 'vt':
                                    $(rowJ).find('.varname').attr('class', 'varname ext-js');
                                    break;
                            }
                        }
                        
                        //process FileName
                        if(data[i].DataType == 'pgt' || data[i].DataType == 'pvt'){
                            $(rowJ).find('.filename').attr('class','filename ext-php');
                        }else if (data[i].DataType == 'pvt' || data[i].DataType == 'vt'){
                             $(rowJ).find('.filename').attr('class','filename ext-js');
                        }
                        $(rowJ).find('.filename').text(getFileName(data[i].FileName));
                        
                        row = $(rowJ).prop('outerHTML');
                        rows += row;
                    }
                    
                    var rowJ = $.parseHTML(rows);
                    for(var j=0; j<repeatCount.saveCounts.length; j++){
                        $(rowJ[repeatCount.saveCounts[j].index]).find('.repeat-num').text(repeatCount.saveCounts[j].repeatCount);
                        if(repeatCount.saveCounts[j].repeatCount > 0){
                            $(rowJ[repeatCount.saveCounts[j].index]).find('.repeat-num').css('visibility','visible');
                        }
                    }
                    
                    var redoRows = '';
                    for(var k=0; k<$(rowJ).length; k++){
                        redoRows += $(rowJ[k]).prop('outerHTML');
                    }
                    
                    $('#message_list').append(redoRows);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {

            },
            complete: function (jqXHR, textStatus) {
            }
        });
    }


    $(window).resize(function () {
        $('#time_band').empty();
        renderTimeSlots(timeGroupData, (Number($('body').height()) - 8));
    });

    $('#message_list').on('click', '.item-log', function () {
        changeViewLayout('view source');
    });
    $('#source_code').click(function () {
        changeViewLayout('message only');
    });
    
    $('#time_band').on('click','.time-slot',function(){
        $('#time_band').find('.time-slot').removeClass('selected');
        $(this).addClass('selected');
        ajaxGetLog($(this).data('starttime'),$(this).data('endtime'));
    });



    /* WHEN PAGE STARTS */
    template.slot = $('#time_band').find('div[data-template="time-slot"]').prop('outerHTML');
    var slotObj = $.parseHTML(template.slot);
    $(slotObj).removeAttr('data-template');
    template.slot = $(slotObj).prop('outerHTML');

    template.logItem = $('#message_list').find('div[data-template="log-item"]').prop('outerHTML');
    var logItem = $.parseHTML(template.logItem);
    template.logTag = $(logItem).find('span[data-template="tag"]').prop('outerHTML');
    $(logItem).find('span[data-template="tag"]').remove();
    $(logItem).removeAttr('data-template');
    template.logItem = $(logItem).prop('outerHTML');
    
    $.ajax({
        type: 'POST',
        url: 'gopher-view-backend/time_band.php',
        dataType: 'json',
        data: {task: 'getAllTimeSlots'},
        beforeSend: function () {
            $('#time_band').empty();
            $('#message_list').empty();
        },
        success: function (data) {
            timeGroupData = data;
            //console.log('time group data');
            //console.log(timeGroupData);
            if (timeGroupData.length > 0) {
                
                var timeBand = renderTimeSlots(timeGroupData, (Number($('body').height()) - 8));
                //console.log(timeBand);
                $('#time_band').find('.time-slot:eq(0)').addClass('selected');
                ajaxGetLog(timeBand[timeBand.length-1].start,timeBand[timeBand.length-1].end);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {

        },
        complete: function (jqXHR, textStatus) {
        }
    });

});