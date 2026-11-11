window.onload = function() {

	var btn = document.querySelector( '.btn' );

	var btnFront = btn.querySelector( '.btn-front' ),
		btnYes = btn.querySelector( '.btn-back .yes' ),
		btnNo = btn.querySelector( '.btn-back .no' );

	btnFront.addEventListener( 'click', function( event ) {
		var mx = event.clientX - btn.offsetLeft,
			my = event.clientY - btn.offsetTop;

		var w = btn.offsetWidth,
			h = btn.offsetHeight;

		var directions = [
			{ id: 'top', x: w/2, y: 0 },
			{ id: 'right', x: w, y: h/2 },
			{ id: 'bottom', x: w/2, y: h },
			{ id: 'left', x: 0, y: h/2 }
		];

		directions.sort( function( a, b ) {
			return distance( mx, my, a.x, a.y ) - distance( mx, my, b.x, b.y );
		} );

		btn.setAttribute( 'data-direction', directions.shift().id );
		btn.classList.add( 'is-open' );
	} );

	btnYes.addEventListener( 'click', function( event ) {
		btn.classList.remove( 'is-open' );
	} );

	var noClickCount = 0;

	btnNo.addEventListener( 'click', function( event ) {
		noClickCount = Math.min( noClickCount + 1, 6 );

		var yesScale = 1 + ( noClickCount * 0.12 );
		var noScale = Math.max( 0.35, 1 - ( noClickCount * 0.12 ) );

		btnYes.style.transform = 'scale(' + yesScale + ')';
		btnYes.style.setProperty( '--yes-scale', yesScale );
		btnNo.style.transform = 'scale(' + noScale + ')';
		btnNo.style.opacity = String( Math.max( 0.45, 1 - ( noClickCount * 0.1 ) ) );

		btnYes.classList.remove( 'is-shaking' );
		void btnYes.offsetWidth;
		btnYes.classList.add( 'is-shaking' );
	} );

	function distance( x1, y1, x2, y2 ) {
		var dx = x1-x2;
		var dy = y1-y2;
		return Math.sqrt( dx*dx + dy*dy );
	}

};
