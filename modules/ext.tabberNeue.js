/**
 * This needs a full-rewrite dropping jQuery and using ES6.
 * But it will do for now.
 */
( function ( $ ) {
	$.fn.tabber = function () {
		// Load icons
		mw.loader.load( 'ext.tabberNeue.icons' );

		return this.each( function () {
			// create tabs
			const $this = $( this ),
				key = $this.attr( 'id' ).substring( 7 ),
				tabSection = $this.children( '.tabber__section' ),
				tabPanel = tabSection.children( '.tabber__panel' ),
				nav = $( '<nav>' ).addClass( 'tabber__nav' ),
				header = $( '<header>' ).addClass( 'tabber__header' ),
				arrowLeft = $( '<div>' ).addClass( 'tabber__header__prev' ),
				arrowRight = $( '<div>' ).addClass( 'tabber__header__next' );

			let hash;

			nav.attr( 'role', 'tablist' );

			tabPanel.each( function () {
				hash = mw.util.escapeIdForAttribute( this.title ) + '-' + key;
				$( this ).attr( 'id', hash );
				$( this ).attr( 'role', 'tabpanel' );
				$( this ).attr( 'aria-labelledby', 'tab-' + hash );
				$( this ).attr( 'aria-hidden', 'true' );

				const anchor = $( '<a>' ).text( this.title ).attr( 'title', this.title );
				anchor.addClass( 'tabber__item' );
				anchor.attr( 'role', 'tab' );
				anchor.attr( 'href', '#' + hash );
				anchor.attr( 'id', 'tab-' + hash );
				anchor.attr( 'aria-controls', hash );
				anchor.appendTo( nav );
			} );

			arrowLeft.appendTo( header );
			nav.appendTo( header );
			arrowRight.appendTo( header );

			$this.prepend( header );

			const tabber = document.getElementById( 'tabber-' + key ),
				tablist = tabber.querySelector( '.tabber__nav' );

			/**
			 * Internal helper function for showing panel
			 *
			 * @param  {string} targetHash to show, matching only 1 tab
			 * @return {bool} true if matching tab could be shown
			 */
			function showPanel( targetHash ) {
				const ACTIVEITEMCLASS = 'tabber__item--active',
					ACTIVEPANELCLASS = 'tabber__panel--active',
					targetPanel = document.getElementById( targetHash ),
					targetTab = document.getElementById( 'tab-' + targetHash ),
					section = targetPanel.parentElement,
					activePanel = section.querySelector( '.' + ACTIVEPANELCLASS );

				/* eslint-disable mediawiki/class-doc */
				if ( activePanel ) {
					const activeTab = tablist.querySelector( '.' + ACTIVEITEMCLASS );
					activeTab.classList.remove( ACTIVEITEMCLASS );
					activePanel.classList.remove( ACTIVEPANELCLASS );
					activePanel.setAttribute( 'aria-hidden', 'true' );
					section.style.height = activePanel.offsetHeight + 'px';
					section.style.height = targetPanel.offsetHeight + 'px';
				} else {
					section.style.height = targetPanel.offsetHeight + 'px';
				}

				// Add active class to the tab item
				targetTab.classList.add( ACTIVEITEMCLASS );
				targetPanel.classList.add( ACTIVEPANELCLASS );
				targetPanel.setAttribute( 'aria-hidden', 'false' );

				// Scroll to tab
				section.scrollLeft = targetPanel.offsetLeft;
				/* eslint-enable mediawiki/class-doc */
			}

			function initButtons() {
				const container = tabber.querySelector( '.tabber__header' ),
					PREVCLASS = 'tabber__header--prev-visible',
					NEXTCLASS = 'tabber__header--next-visible';

				/* eslint-disable mediawiki/class-doc */
				const scrollTabs = ( offset ) => {
					const scrollLeft = tablist.scrollLeft + offset;

					// Scroll to the start
					if ( scrollLeft <= 0 ) {
						tablist.scrollLeft = 0;
						container.classList.remove( PREVCLASS );
						container.classList.add( NEXTCLASS );
					} else {
						tablist.scrollLeft = scrollLeft;
						// Scroll to the end
						if ( scrollLeft + tablist.offsetWidth >= tablist.scrollWidth ) {
							container.classList.remove( NEXTCLASS );
							container.classList.add( PREVCLASS );
						} else {
							container.classList.add( NEXTCLASS );
							container.classList.add( PREVCLASS );
						}
					}
				};

				const setupButtons = () => {
					const isScrollable = ( tablist.scrollWidth > container.offsetWidth );

					if ( isScrollable ) {
						const prevButton = container.querySelector( '.tabber__header__prev' ),
							nextButton = container.querySelector( '.tabber__header__next' ),
							scrollOffset = container.offsetWidth / 2;

						// Just to add the right classes
						scrollTabs( 0 );
						prevButton.addEventListener( 'click', () => {
							scrollTabs( -scrollOffset );
						}, false );

						nextButton.addEventListener( 'click', () => {
							scrollTabs( scrollOffset );
						}, false );
					} else {
						container.classList.remove( NEXTCLASS );
						container.classList.remove( PREVCLASS );
					}
				};
				/* eslint-enable mediawiki/class-doc */

				setupButtons();

				// Listen for window resize
				window.addEventListener( 'resize', () => {
					mw.util.debounce( 250, setupButtons() );
				} );
			}

			function switchTab() {
				const targetHash = new mw.Uri( location.href ).fragment;

				if ( targetHash ) {
					if ( nav.find( 'a[href="#' + targetHash + '"]' ).length ) {
						showPanel( targetHash );
					}
				} else {
					showPanel( tabPanel.first().attr( 'id' ) );
				}
			}

			switchTab();

			// Only run if client is not a touch device
			if ( matchMedia( '(hover: hover)' ).matches ) {
				initButtons( tabber );
			}

			window.addEventListener( 'hashchange', switchTab, false );

			// Respond to clicks on the nav tabs
			[ ...tablist.children ].forEach( ( tab ) => {
				tab.addEventListener( 'click', ( event ) => {
					const targetHash = tab.getAttribute( 'href' ).substring( 1 );
					event.preventDefault();
					// Add hash to the end of the URL
					history.pushState( null, null, '#' + targetHash );
					showPanel( targetHash );
				} );
			} );

			$this.addClass( 'tabber--live' );
		} );
	};
}( jQuery ) );

$( function () {
	$( '.tabber' ).tabber();
} );
