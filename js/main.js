$(document).ready(function() {

	$('.mobile-trigger').on('click', function(e) {
		e.preventDefault();
		$('body').toggleClass('menu-open');
		$(this).toggleClass('active');
	});

	$('.mobile-close').on('click', function(e) {
		e.preventDefault();
		$('body').removeClass('menu-open');
		$('.mobile-trigger').removeClass('active');
		$('.dropdown').removeClass('open');
	});

	$('.overlay').on('click', function(e) {
		e.preventDefault();
		$('body').removeClass('menu-open');
		$('.mobile-trigger').removeClass('active');
		$('.dropdown').removeClass('open');
	});

});
