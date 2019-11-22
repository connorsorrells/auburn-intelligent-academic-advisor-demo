//var bubbleTheme = "dark";
'use strict';

$(document).mouseup(function (e) {
    var container = $(".dropdown-menu");

    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        closeNavDrop();
    }
});

$(document).ready(function(){

    //Show menu when focused
    $('.accessible li a').focus(function() {$('.accessible').addClass('show');});
    $('.accessible li a').blur(function() {$('.accessible').removeClass('show');});

	//To Top
	if ($('#totop').length) {
	    var scrollTrigger = 200, // px
	    backToTop = function () {
	        var scrollTop = $(window).scrollTop();
	        if (scrollTop > scrollTrigger) {
				$("#totop").addClass("show");
	        } else {
				$("#totop").removeClass("show");
	        }
	    };
	    backToTop();
	    $(window).scroll(function () {
	        backToTop();
	    });
	    $('#totop').click(function (e) {
	        e.preventDefault();
	        $('html,body').animate({
	            scrollTop: 0
	        }, 250);
	    });
	};

	//data-toggle support - use to toggle elements with button/a tag
	$("[data-toggle]").click(function() {
		var target = $(this).attr("data-toggle");
		$(target).slideToggle("fast");
        flipAria(this,target);
	});


    var querywidth = 992 - (window.innerWidth - $('body').width());
    var querywidth2 = 768 - (window.innerWidth - $('body').width());
    function checkWidth(){
        if ($(window).width() < querywidth) {
            $('#sidebar').hide();
            flipAria($("#sidebar-nav-mobile"),$("#sidebar"),false);
        } else {
            $('#sidebar').show();
            flipAria($("#sidebar-nav-mobile"),$("#sidebar"),true);
        }

        if ($(window).width() < querywidth2) {
            $("#navigation").hide();
            flipAria($("#hamburger"),$("#navigation"),false);
            bubblewidth = '100%';
        } else {
            $("#navigation").show();
            flipAria($("#hamburger"),$("#navigation"),true);
            bubblewidth = '450';
        }
    }


	//Check width helpers
    var $window = $(window);
	var windowWidth = $window.width();
	window.addEventListener("resize", function() {
		if($window.width() != windowWidth) {
			checkWidth();
			windowWidth = $window.width();
		}
	});
    window.addEventListener("orientationchange", function() {
        checkWidth();
    }, false);
    //Execute on load
    checkWidth();


    // Toggle Headers
    $('#content :header.toggle').each(function(i){
		var selectedElem = $(this);
		var groupedElems = [];
		//find all of the next elements until the next same tag
		var selfTag = $(this).attr("tagName"); //replace with .prop() for newer jquery
		var next = $(this).next();
		while(next.length != 0 && $(next[0]).attr("tagName") != selfTag) { //replace with .prop() for newer jquery
			if($(next).find(selfTag).length > 0) {
				break;
			}
			groupedElems.push($(next)[0]);
			next = next.next();
		}
		//wrap the elements
		$(groupedElems).wrapAll("<div class='toggle-content' />");
		//wrap the .toggle H + the context
		$(this).next('.toggle-content').andSelf().wrapAll("<div class='toggle-wrap' />");
		//assign an id to the content wrap for a11y
		var id = 'tgl' + i;
		$(this).next('.toggle-content').attr({'aria-hidden':'true','id':id});
		var panel = $(this).next('.toggle-content');
		// Add the button inside the <h2> so both the heading and button semanics are read
		$(this).wrapInner('<button aria-expanded="false" aria-controls="'+ id +'">');
		//toggle the content and related attrs
		var button = $(this).children('button');
		button.click(function(){
			$(this).parent().toggleClass('expanded');
			var state = $(this).attr('aria-expanded') === 'false' ? true : false;
			$(this).attr('aria-expanded', state);
			panel.attr('aria-hidden', !state);
		});
    });

	// expand content corresponding to any anchor tag in URL visited
	if(window.location.hash) {
		var hash = escXML(window.location.hash.slice(1));

		//find the header relating to the anchor
		var target = "";
		var anchEl = "";
		if($(":header#"+hash+".toggle").length > 0) {
			target = $(":header#"+hash+".toggle");
			anchEl = $(target).attr("tagName");
		} else if($("a#"+hash).length > 0) {
			//find the nearest toggled header
			var container = $("a#"+hash).parents(".toggle-content");
			target = $(container).prev(".toggle");
			anchEl = "a";
		}

		if(target.length) {
			target = target[0];
			$(target).addClass("expanded").children('button').attr('aria-expanded', 'true');
			$(target).next('.toggle-content').attr('aria-hidden','false');
			//expand .toggle parents
			var contID = $(target).parents(".toggle-content").attr("id");
			$("#"+contID).prev(".toggle").addClass("expanded").children("button").attr("aria-expanded","true");
			$("#"+contID).attr("aria-hidden","false");

			//jump to that anchor
			var anch = $(anchEl + "#" + hash);
			$('html,body').animate({scrollTop: anch.offset().top},'fast');
		}
	}
	// end Toggle Headers


    //sticky header
    $(window).scroll(function () {
        if ($(window).scrollTop() > 150) {
            $("#header").addClass("shrunk");
        } else {
            $("#header").removeClass("shrunk");
        }
    });


    //navigation dropdowns
    $("#main-nav > li.isparent > a").click(function(e) {
        e.preventDefault();
        closeNavDrop();

        $(this).parent("li").toggleClass("open");
        var state = $(this).attr('aria-expanded') === 'false' ? true : false;
        $(this).attr('aria-expanded', state);
        $(this).next(".dropdown-menu").attr('aria-hidden', !state);
    });
    //close open navdrops after leaving the area
    $("#topper .search input").focus(function() {
        closeNavDrop();
    });
});

function closeNavDrop() {
    $("#main-nav > li").removeClass("open");
    $("#main-nav > li > a").attr('aria-expanded', "false");
    $(".dropdown-menu").attr('aria-hidden', "true");
}

function toggleNav(e) {
    $(e).parent().next("ul.nav").slideToggle();

	var state = $(e).parent().next("ul.nav").attr("aria-hidden") === 'false' ? true : false;
	$(e).parent().next("ul.nav").attr("aria-hidden", state);
	$(e).attr("aria-expanded", !state);

    $(e).toggleClass("open");
}

function flipAria(elem,target,state) {
    if(state === undefined) {
        var state = $(elem).attr('aria-expanded') === 'false' ? true : false;
    }
    $(elem).attr('aria-expanded', state);
    $(target).attr('aria-hidden', !state);
}

var showPrintDialog = showPrintDialog || function(){};
var base_showPrintDialog = showPrintDialog;
showPrintDialog = function() {
	base_showPrintDialog();

    var targetElem = $("#print-dialog");

	//keep focus within item
	var inputs = $(targetElem).find('select, input, textarea, button, a').filter(':visible');
	var firstInput = inputs.first();
	var lastInput = inputs.last();

	/*redirect last tab to first input*/
	lastInput.keydown(function (e) {
	   if ((e.which === 9 && !e.shiftKey)) {
	       e.preventDefault();
	       firstInput.focus();
	   }
	});
	/*redirect first shift+tab to last input*/
	firstInput.keydown(function (e) {
	    if ((e.which === 9 && e.shiftKey)) {
	        e.preventDefault();
	        lastInput.focus();
	    }
	});

}

$(window).load(function () {
    setTimeout(function() { // give extra time for Watson plugin to appear
        var watsonShadowRoot = document.getElementsByClassName("WatsonAssistantChatHost")[0].shadowRoot;
	    var startWatsonButton = watsonShadowRoot.querySelector(".WACLauncher__Button")
	
	    startWatsonButton.addEventListener('click', function() {
			setTimeout(function() {
				playWatsonAudio(watsonShadowRoot);

				var sendWatsonButton = watsonShadowRoot.querySelector(".WAC__send-button");
		
				sendWatsonButton.addEventListener('click', function() {
					setTimeout(function () {
						playWatsonAudio(watsonShadowRoot);
					}, 3000);
				});
			}, 3000);
        });
    }, 3000);
});

function playWatsonAudio(watsonShadowRoot) {
	return new Promise((resolve, reject) => {
		var messages = watsonShadowRoot.querySelectorAll("[id^=WAC__message]");
		var messagesLength = messages.length - 3; // dialog messages end here
		var lastSent = null;
		var i = 0;
		while (lastSent === null && i <= messagesLength - 1) {
			i++;
			lastSent = messages[messagesLength - i].querySelector(".WAC__sent");
		}
		if (lastSent === null) { // no messages sent yet
			i = messagesLength - 1; // set to this to play welcome messages
		}
		var text = "";
		for (var j = messagesLength - i + 1; j <= messagesLength; j++) {
			var received = messages[j].querySelector(".WAC__received");
			if (received !== null) {
				text += received.querySelector("div").textContent + " ";
			}
		}
		if (text != "") {
			var params = setupParams(text);
			var audio = new Audio();
			audio.setAttribute('src', `/api/v1/synthesize?${params.toString()}`);
			var playPromise = audio.play();
			if (playPromise !== undefined) {
				playPromise
					.then(() => {
						if (text.includes("Your schedule for your required classes has been completed")) {
							window.open('grid1.html');
						}
					})
					.catch(error => {
						throw new Error('Watson TextToSpeech: autoplay error:' + error);
					});
			}
		}
	});
}

/**
 * @return {Function} A polyfill for URLSearchParams
 */
const getSearchParams = () => {
	if (typeof URLSearchParams === 'function') {
	  return new URLSearchParams();
	}
  
	// Simple polyfill for URLSearchparams
	const SearchParams = function SearchParams() {
	};
  
	SearchParams.prototype.set = function set(key, value) {
	  this[key] = value;
	};
  
	SearchParams.prototype.toString = function toString() {
	  return Object.keys(this).map(v => `${encodeURI(v)}=${encodeURI(this[v])}`).join('&');
	};
  
	return new SearchParams();
};

function setupParams(text) {
    const params = getSearchParams();
	params.set('text', text);
    if (canPlayAudioFormat('audio/mp3')) {
      params.set('accept', 'audio/mp3');
    } else if (canPlayAudioFormat('audio/ogg;codec=opus')) {
      params.set('accept', 'audio/ogg;codec=opus');
    } else if (canPlayAudioFormat('audio/wav')) {
      params.set('accept', 'audio/wav');
    }
    return params;
};

/**
 * Validates that the mimetype is: audio/wav, audio/mpeg;codecs=mp3 or audio/ogg;codecs=opus
 * @param  {String} mimeType The audio mimetype
 * @return {bool} Returns true if the mimetype can be played.
 */
const canPlayAudioFormat = (mimeType) => {
	const audio = document.createElement('audio');
	if (audio) {
	  return (typeof audio.canPlayType === 'function' && audio.canPlayType(mimeType) !== '');
	}
	return false;
};