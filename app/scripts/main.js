'use strict';

var Recognition, finalTranscript = 'initial test content';
var recordingStopped;

function addTimestamp() {
	finalTranscript = finalTranscript + '[TIME=' + new Date().getTime() + ']';
}

$( document ).ready(function() {
	console.log('app start');
	if (!('webkitSpeechRecognition' in window)) {
		console.log('not supported');
	} else {
		Recognition = new webkitSpeechRecognition();
		Recognition.continuous = true;
		Recognition.interimResults = true;// log state

		var recognizing;

		Recognition.onstart = function() {
			recognizing = true;
		};

		Recognition.onresult = function(event) {
			var interimTranscript = '';
			for (var i = event.resultIndex; i < event.results.length; ++i) {
				if (event.results[i].isFinal) {
					finalTranscript += event.results[i][0].transcript;
				} else {
					interimTranscript += event.results[i][0].transcript;
				}
			}
			if (recordingStopped) {
				console.log(finalTranscript);
			}
		};

		Recognition.onerror = function(event) {
			console.log('error' + event);
		};

		Recognition.onend = function() {
			recognizing = false;
		};

		var addTimestampInt;
		$('#js-start-recording').click(function() {
			recordingStopped = false;
			Recognition.start();
			addTimestampInt = window.setInterval(addTimestamp, 10000);
		});

		$('#js-stop-recording').click(function() {
			Recognition.stop();
			recordingStopped = true;
			window.clearInterval(addTimestampInt);
		});
	}
});

