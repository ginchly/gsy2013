$( document ).ready(function() {
	'use strict';

	var prod;
	var urlRoot = '';
	var startPos;

	if (document.location.hostname.indexOf('heroku') !== 0) {
		prod = true;
	}

	function calculateDistance(lat1, lon1, lat2, lon2) {
		var R = 6371; // km
		lat1 = lat1 * 1;
		lon1 = lon1 * 1;
		lat2 = lat2 * 1;
		lon2 = lon2 * 1;
		var dLat = (lat2 - lat1).toRad();
		var dLon = (lon2 - lon1).toRad();
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;
		return d;
	}

	Number.prototype.toRad = function() {
		return this * Math.PI / 180;
	};

	function storeLocation(callback) {
		navigator.geolocation.getCurrentPosition(function(position) {
			startPos = position;
			console.log(startPos);
			callback();
		});
	}

	function getCourses() {
		var url;
		if (prod) {
			url = '../api/courses';
		} else {
			url = 'http://localhost:5000/api/courses';
		}
		$.ajax({
			url: url
		})
		.done(function( data ) {
			var distanceAway;
			console.log(data);
			var courseList = '<ul>';
			for (var i = 0; i < data.length; i++) {
				distanceAway = calculateDistance(startPos.coords.latitude, startPos.coords.longitude, data[i].lat, data[i].long);
				courseList = courseList + '<li><div class="js-link-course" data-id=' + data[i].id + '>' + data[i].name + ' (' + Math.round(distanceAway * 10) / 10 + ' km away)</li>';
			}
			courseList = courseList + '</ul>';
			$('#js-all-courses').html(courseList);

			$('.js-link-course').click(function() {
				var courseId = $(this).data('id');
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
			var sessionList = '<h2>Sessions</h2><ul>';
			for (var i = 0; i < data.length; i++) {
				sessionList = sessionList + '<li><div class="js-link-session" data-id=' + data[i].id + '>' + data[i].name + '</li>';
			}
			sessionList = sessionList + '</ul>';
			$('#js-content').html(sessionList);

			$('.js-link-session').click(function() {
				var sessionId = $(this).data('id');
				getConcepts(sessionId);
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
			var conceptList = '<h2>Concepts</h2><ul>';
			for (var i = 0; i < data.length; i++) {
				conceptList = conceptList + '<li><div class="js-link-concepts" data-id=' + data[i].id + '>' + data[i].name +
				'</span><span class="js-confused" id=' + data[i].id + ' data-id=' + data[i].id + '> (Confused)</span></li>';
			}
			conceptList = conceptList + '</ul>';

			$('#js-content').html(conceptList);

			$('.js-confused').click(function() {
				var thisId = $(this).data('id');
				if (prod) {
					url = './api/' + thisId + '/understandScores/';
				} else {
					url = 'http://localhost:5000/api/' + thisId + '/understandScores/';
				}

				if ($('#' + thisId).hasClass('confused')) {
					// minus
					$('#' + thisId).removeClass('confused');
					$('#' + thisId).html(' (Confused)');
					url += 'minus';
				} else {
					$('#' + thisId).addClass('confused');
					$('#' + thisId).html(' (Got it now)');
					// plus
					url += 'plus';
				}

				$.ajax({
				    url : url,
				}).done(function() {
					console.log('understand score updated');
				});

			});
		});
	}

	storeLocation(getCourses);
});