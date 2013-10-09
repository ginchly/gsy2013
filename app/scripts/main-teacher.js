

$( document ).ready(function() {
	'use strict';

	var recognizing;

	var prod;

	var course, session;
	var Recognition, finalTranscript = 'initial test content';
	var recordingStopped, addTimestampInt;

	if (document.location.hostname.indexOf('heroku') === 0) {
		prod = true;
	}

	if (!('webkitSpeechRecognition' in window)) {
		console.log('not supported');
	} else {
		Recognition = new webkitSpeechRecognition();
		Recognition.continuous = true;
		Recognition.interimResults = true;// log state
		Recognition.lang = 'en-US';
	}

	function getCourses() {
		var url;
		if (prod) {
			url = './api/courses';
		} else {
			url = 'http://localhost:5000/api/courses';
		}
		$.ajax({
			url: url
		})
		.done(function( data ) {
			var courseList = '<ul>';
			for (var i = 0; i < data.length; i++) {
				courseList = courseList + '<li><div class="js-link-course" data-id=' + data[i].id + '>' + data[i].name + '</div></li>';
			}
			courseList = courseList + '</ul>';
			$('#js-all-courses').html(courseList);

			$('.js-link-course').click(function() {
				var courseId = $(this).data('id');
				course = courseId;
				getSessions(courseId);
			});
		});


	}

	function getSessions(courseId) {
		var url;
		if (prod) {
			url = './api/courses/' + courseId + '/sessions';
		} else {
			url = 'http://localhost:5000/api/courses/' + courseId + '/sessions' ;
		}
		$.ajax({
			url: url
		})
		.done(function( data ) {
			console.log(data);
			var sessionList = '<h2>Sessions</h2><ul id="js-list">';
			for (var i = 0; i < data.length; i++) {
				sessionList += '<li id=' + data[i].id + '><span class="js-link-session" data-id=' + data[i].id + '>' + data[i].name +
				'</span><span class="js-delete" data-id=' + data[i].id + '> (Delete)</span></li>';
			}
			sessionList += '</ul>';
			sessionList += '<form class="form-inline" role="form"><div class="form-group">' +
			  '<input type="email" class="form-control" id="js-add-session" placeholder="New session"></div>' +
			  '<button id="js-btn-add-session" class="btn btn-default">Add</button></form>';
			$('#js-content').html(sessionList);

			$('.js-link-session').click(function() {
				var sessionId = $(this).data('id');
				session = sessionId;
				getConcepts(sessionId);
			});

			$('.js-delete').click(function() {
				var thisId = $(this).data('id');
				$('#' + thisId).remove();
				if (prod) {
					url = './api/sessions/' + thisId;
				} else {
					url = 'http://localhost:5000/api/sessions/' + thisId;
				}
				$.ajax({
				    url : url,
				    type: 'DELETE'
				}).done(function() {
					console.log('session deleted');
				});
			});

			$('#js-btn-add-session').click(function() {
				event.preventDefault();
				var newSession = $('#js-add-session').val();

				$('#js-list').append('<li>' + newSession + '</li>');

				var formData = {};
				formData.name = newSession;

				var postUrl;
				if (prod) {
					postUrl = './api/courses/' + course + '/sessions';
				} else {
					postUrl = 'http://localhost:5000/api/courses/' + course + '/sessions';
				}
				$.ajax({
				    url : postUrl,
				    type: 'POST',
				    data : formData,
				    success: function()
				    {
				        console.log('new session created successfully');
				    },
				    error: function ()
				    {
						console.log('error trying to create new session');
				    }
				});
			});
		});
	}

	// I'm sure this could be abstracted somewhat rather than having multiple similar functions
	function getConcepts(sessionId) {
		var url;
		if (prod) {
			url = './api/sessions/' + sessionId + '/concepts';
		} else {
			url = 'http://localhost:5000/api/sessions/' + sessionId + '/concepts';
		}
		$.ajax({
			url: url
		})
		.done(function( data ) {
			console.log(data);
			var conceptList = '<h2>Concepts</h2><ul id="js-list">';
			for (var i = 0; i < data.length; i++) {
				conceptList = conceptList + '<li id=' + data[i].id + '><div class="js-link-concepts" data-id=' + data[i].id + '>' + data[i].name +
					' <span class="js-delete" data-id=' + data[i].id + '> (Delete)</span></div></li>';
			}
			conceptList = conceptList + '</ul>';
			conceptList += '<form class="form-inline" role="form"><div class="form-group">' +
			  '<input class="form-control" id="js-add-concept" placeholder="New concept"></div>' +
			  '<button id="js-btn-add-concept"  class="btn btn-default">Add</button></form>';
			conceptList += '<button type="button" class="btn btn-default" id="js-start-recording">Start recording</button>' +
                        '<button type="button" class="btn btn-default" id="js-stop-recording">Stop recording</button>';

			$('#js-content').html(conceptList);

			$('.js-delete').click(function() {
				var thisId = $(this).data('id');
				$('#' + thisId).remove();
				if (prod) {
					url = './api/concepts/' + thisId;
				} else {
					url = 'http://localhost:5000/api/concepts/' + thisId;
				}
				$.ajax({
				    url : url,
				    type: 'DELETE'
				}).done(function() {
					console.log('concept deleted');
				});
			});

			$('#js-start-recording').click(function() {
				recordingStopped = false;
				Recognition.start();
			});

			$('#js-stop-recording').click(function() {
				Recognition.stop();
				recordingStopped = true;
			});

			$('#js-btn-add-concept').click(function() {
				event.preventDefault();
				var newConcept = $('#js-add-concept').val();
				$('#js-list').append('<li>' + newConcept + '</li>');
				var formData = {};
				formData.name = newConcept;

				var postUrl;

				if (prod) {
					postUrl = './api/sessions/' + session + '/concepts';
				} else {
					postUrl = 'http://localhost:5000/api/sessions/' + session + '/concepts';
				}
				$.ajax({
				    url : postUrl,
				    type: 'POST',
				    data : formData,
				    success: function()
				    {
				        console.log('new concept created successfully');
				    },
				    error: function ()
				    {
						console.log('error trying to create new concept');
				    }
				});
			});
		});
	}

	Recognition.onstart = function() {
		recognizing = true;
	};

	Recognition.onresult = function(event) {
		var interimTranscript = '';
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				finalTranscript += event.results[i][0].transcript;
				if (event.results[i][0].transcript !== '') {
					var timeNow = new Date().getTime();
					finalTranscript += '[TIME=' + timeNow + ']';
				}
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
		console.log(finalTranscript);
		var body = encodeURI(finalTranscript);

		//TODO post to db
		var postUrl;
		if (prod) {
			postUrl = './api/sessions/' + session + '/transcript';
		} else {
			postUrl = 'http://localhost:5000/api/sessions/' + session + '/transcript';
		}
		var timeNow = new Date().getTime();
		$.ajax({
		    url : postUrl,
		    type: 'POST',
		    data : {transcript: body, time: timeNow},
		    success: function()
		    {
		        console.log('new session created successfully');
		    },
		    error: function ()
		    {
				console.log('error trying to create new session');
		    }
		});
	};

	getCourses();
});