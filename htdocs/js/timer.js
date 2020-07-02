"use strict";
/*
 SPDX-License-Identifier: GPL-2.0-or-later
 myMPD (c) 2018-2020 Juergen Mang <mail@jcgames.de>
 https://github.com/jcorporation/mympd
*/

//eslint-disable-next-line no-unused-vars
function deleteTimer(timerid) {
    sendAPI("MYMPD_API_TIMER_RM", {"timerid": timerid}, showListTimer);
}

//eslint-disable-next-line no-unused-vars
function toggleTimer(target, timerid) {
    if (target.classList.contains('active')) {
        target.classList.remove('active');
        sendAPI("MYMPD_API_TIMER_TOGGLE", {"timerid": timerid, "enabled": false}, showListTimer);
    }
    else {
        target.classList.add('active');
        sendAPI("MYMPD_API_TIMER_TOGGLE", {"timerid": timerid, "enabled": true}, showListTimer);
    }
}

//eslint-disable-next-line no-unused-vars
function saveTimer() {
    let formOK = true;
    let nameEl = document.getElementById('inputTimerName');
    if (!validateNotBlank(nameEl)) {
        formOK = false;
    }
    let minOneDay = false;
    let weekdayBtns = ['btnTimerMon', 'btnTimerTue', 'btnTimerWed', 'btnTimerThu', 'btnTimerFri', 'btnTimerSat', 'btnTimerSun'];
    let weekdays = [];
    for (let i = 0; i < weekdayBtns.length; i++) {
        let checked = document.getElementById(weekdayBtns[i]).classList.contains('active') ? true : false;
        weekdays.push(checked);
        if (checked === true) {
            minOneDay = true;
        }
    }
    if (minOneDay === false) {
        formOK = false;
        document.getElementById('invalidTimerWeekdays').style.display = 'block';
    }
    else {
        document.getElementById('invalidTimerWeekdays').style.display = 'none';
    }
    let selectTimerAction = document.getElementById('selectTimerAction');
    let selectTimerPlaylist = document.getElementById('selectTimerPlaylist');
    let selectTimerHour = document.getElementById('selectTimerHour');
    let selectTimerMinute = document.getElementById('selectTimerMinute');
    let jukeboxMode = document.getElementById('btnTimerJukeboxModeGroup').getElementsByClassName('active')[0].getAttribute('data-value');

    if (selectTimerAction.selectedIndex === -1) {
        formOK = false;
        selectTimerAction.classList.add('is-invalid');
    }

    if (jukeboxMode === '0' &&
        selectTimerPlaylist.options[selectTimerPlaylist.selectedIndex].value === 'Database'&&
        selectTimerAction.options[selectTimerAction.selectedIndex].value === 'startplay')
    {
        formOK = false;
        document.getElementById('btnTimerJukeboxModeGroup').classList.add('is-invalid');
    }
    
    if (formOK === true) {
        let args = {};
        let argEls = document.getElementById('timerActionScriptArguments').getElementsByTagName('input');
        for (let i = 0; i < argEls.length; i ++) {
            args[argEls[i].getAttribute('data-name')] = argEls[i].value;
        }
        sendAPI("MYMPD_API_TIMER_SAVE", {
            "timerid": parseInt(document.getElementById('inputTimerId').value),
            "name": nameEl.value,
            "enabled": (document.getElementById('btnTimerEnabled').classList.contains('active') ? true : false),
            "startHour": parseInt(selectTimerHour.options[selectTimerHour.selectedIndex].value),
            "startMinute": parseInt(selectTimerMinute.options[selectTimerMinute.selectedIndex].value),
            "weekdays": weekdays,
            "action": selectTimerAction.options[selectTimerAction.selectedIndex].parentNode.getAttribute('data-value'),
            "subaction": selectTimerAction.options[selectTimerAction.selectedIndex].value,
            "volume": parseInt(document.getElementById('inputTimerVolume').value), 
            "playlist": selectTimerPlaylist.options[selectTimerPlaylist.selectedIndex].value,
            "jukeboxMode": parseInt(jukeboxMode),
            "arguments": args
            }, showListTimer);
    }
}

//eslint-disable-next-line no-unused-vars
function showEditTimer(timerid) {
    document.getElementById('timerActionPlay').classList.add('hide');
    document.getElementById('timerActionScript').classList.add('hide');
    document.getElementById('listTimer').classList.remove('active');
    document.getElementById('editTimer').classList.add('active');
    document.getElementById('listTimerFooter').classList.add('hide');
    document.getElementById('editTimerFooter').classList.remove('hide');
        
    if (timerid !== 0) {
        sendAPI("MYMPD_API_TIMER_GET", {"timerid": timerid}, parseEditTimer);
    }
    else {
        sendAPI("MPD_API_PLAYLIST_LIST_ALL", {}, function(obj2) { 
            getAllPlaylists(obj2, 'selectTimerPlaylist', 'Database');
        });
        document.getElementById('inputTimerId').value = '0';
        document.getElementById('inputTimerName').value = '';
        toggleBtnChk('btnTimerEnabled', true);
        document.getElementById('selectTimerHour').value = '12';
        document.getElementById('selectTimerMinute').value = '0';
        document.getElementById('selectTimerAction').value = 'startplay';
        document.getElementById('inputTimerVolume').value = '50';
        document.getElementById('selectTimerPlaylist').value = 'Database';
        toggleBtnGroupValue(document.getElementById('btnTimerJukeboxModeGroup'), 1);
        let weekdayBtns = ['btnTimerMon', 'btnTimerTue', 'btnTimerWed', 'btnTimerThu', 'btnTimerFri', 'btnTimerSat', 'btnTimerSun'];
        for (let i = 0; i < weekdayBtns.length; i++) {
            toggleBtnChk(weekdayBtns[i], false);
        }
        document.getElementById('timerActionPlay').classList.remove('hide');
    }
    document.getElementById('inputTimerName').focus();
    removeIsInvalid(document.getElementById('editTimerForm'));    
    document.getElementById('invalidTimerWeekdays').style.display = 'none';
}

function parseEditTimer(obj) {
    let playlistValue = obj.result.playlist;
    sendAPI("MPD_API_PLAYLIST_LIST_ALL", {}, function(obj2) { 
        getAllPlaylists(obj2, 'selectTimerPlaylist', playlistValue);
    });
    document.getElementById('inputTimerId').value = obj.result.timerid;
    document.getElementById('inputTimerName').value = obj.result.name;
    toggleBtnChk('btnTimerEnabled', obj.result.enabled);
    document.getElementById('selectTimerHour').value = obj.result.startHour;
    document.getElementById('selectTimerMinute').value = obj.result.startMinute;
    document.getElementById('selectTimerAction').value = obj.result.subaction;
    selectTimerActionChange(obj.result.arguments);
    document.getElementById('inputTimerVolume').value = obj.result.volume;
    toggleBtnGroupValue(document.getElementById('btnTimerJukeboxModeGroup'), obj.result.jukeboxMode);
    let weekdayBtns = ['btnTimerMon', 'btnTimerTue', 'btnTimerWed', 'btnTimerThu', 'btnTimerFri', 'btnTimerSat', 'btnTimerSun'];
    for (let i = 0; i < weekdayBtns.length; i++) {
        toggleBtnChk(weekdayBtns[i], obj.result.weekdays[i]);
    }
}

function selectTimerActionChange(values) {
    let el = document.getElementById('selectTimerAction');
    
    if (el.options[el.selectedIndex].value === 'startplay') {
        document.getElementById('timerActionPlay').classList.remove('hide');
        document.getElementById('timerActionScript').classList.add('hide');
    }
    else if (el.options[el.selectedIndex].parentNode.getAttribute('data-value') === 'script') {
        document.getElementById('timerActionScript').classList.remove('hide');
        document.getElementById('timerActionPlay').classList.add('hide');
        showTimerScriptArgs(el.options[el.selectedIndex], values);
    }
    else {
        document.getElementById('timerActionPlay').classList.add('hide');
        document.getElementById('timerActionScript').classList.add('hide');
    }
}

function showTimerScriptArgs(option, values) {
    if (values === undefined) {
        values = {};
    }
    let args = JSON.parse(option.getAttribute('data-arguments'));
    let list = '';
    for (let i = 0; i < args.arguments.length; i++) {
        list += '<div class="form-group row">' +
                  '<label class="col-sm-4 col-form-label" for="timerActionScriptArguments' + i + '">' + e(args.arguments[i]) + '</label>' +
                  '<div class="col-sm-8">' +
                    '<input name="timerActionScriptArguments' + i + '" class="form-control border-secondary" type="text" value="' +
                    (values[args.arguments[i]] ? e(values[args.arguments[i]]) : '') + '"' +
                    'data-name="' + args.arguments[i] + '">' +
                  '</div>' +
                '</div>';
    }
    document.getElementById('timerActionScriptArguments').innerHTML = list;
}

function showListTimer() {
    document.getElementById('listTimer').classList.add('active');
    document.getElementById('editTimer').classList.remove('active');
    document.getElementById('listTimerFooter').classList.remove('hide');
    document.getElementById('editTimerFooter').classList.add('hide');
    sendAPI("MYMPD_API_TIMER_LIST", {}, parseListTimer);
}

function parseListTimer(obj) {
    let tbody = document.getElementById('listTimer').getElementsByTagName('tbody')[0];
    let tr = tbody.getElementsByTagName('tr');
    
    let activeRow = 0;
    let weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < obj.result.returnedEntities; i++) {
        let row = document.createElement('tr');
        row.setAttribute('data-id', obj.result.data[i].timerid);
        let tds = '<td>' + e(obj.result.data[i].name) + '</td>' +
                  '<td><button name="enabled" class="btn btn-secondary btn-xs clickable material-icons material-icons-small' +
                  (obj.result.data[i].enabled === true ? ' active' : '') + '">' +
                  (obj.result.data[i].enabled === true ? 'check' : 'radio_button_unchecked') + '</button></td>' +
                  '<td>' + zeroPad(obj.result.data[i].startHour, 2) + ':' + zeroPad(obj.result.data[i].startMinute,2) + ' ' + t('on') + ' ';
        let days = [];
        for (let j = 0; j < 7; j++) {
            if (obj.result.data[i].weekdays[j] === true) {
                days.push(t(weekdays[j]))
            }
        }
        tds += days.join(', ')  + '</td><td>' + prettyTimerAction(obj.result.data[i].action, obj.result.data[i].subaction) + '</td>' +
               '<td data-col="Action"><a href="#" class="material-icons color-darkgrey">delete</a></td>';
        row.innerHTML = tds;
        if (i < tr.length) {
            activeRow = replaceTblRow(tr[i], row) === true ? i : activeRow;
        }
        else {
            tbody.append(row);
        }
    }
    let trLen = tr.length - 1;
    for (let i = trLen; i >= obj.result.returnedEntities; i --) {
        tr[i].remove();
    }

    if (obj.result.returnedEntities === 0) {
        tbody.innerHTML = '<tr class="not-clickable"><td><span class="material-icons">error_outline</span></td>' +
                          '<td colspan="4">' + t('Empty list') + '</td></tr>';
    }     
}

function prettyTimerAction(action, subaction) {
    if (action === 'player' && subaction === 'startplay') {
        return t('Start playback');
    }
    if (action === 'player' && subaction === 'stopplay') {
        return t('Stop playback');
    }
    if (action === 'syscmd') {
        return t('System command') + ': ' + e(subaction);
    }
    if (action === 'script') {
        return t('Script') + ': ' + e(subaction);
    }
    return e(action) + ': ' + e(subaction);
}
