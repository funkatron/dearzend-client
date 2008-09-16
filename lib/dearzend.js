var DZ; if (!DZ) DZ = {};

DZ.baseurl = 'http://127.0.0.1/~coj/dearzend.com/index.php/letters/';

/*
	Initializes the application
*/
DZ.init = function() {
	DZ.status('Starting up…');
	
	/*
		setup tabs
	*/
	$('#tabs > UL').tabs();
	
	/*
		add event listeners
	*/
	$().intercept('click',{
		'#submit': function(e){
			DZ.addNewEntry();
		},

		'.letter>.posted': function(event) {
			var id  = $(event.target).attr('data-id');
			var url = DZ.baseurl + "single/" + id;

			DZ.dump('opening '+url);
			var request = new air.URLRequest(url);
			try {            
			    air.navigateToURL(request);
			}
			catch (exception) {
			    DZ.dump(exception.errorMsg);
			}
		},
		
		'.letter>.favorite': function(event) {
			var id  = $(event.target).attr('data-id');
			
			DZ.addFav(id);

		}
	});
	
	/*
		tabsselect does not bubble, so need to use standard binding
	*/
	$('.ui-tabs-nav').bind('tabsselect', function(event, ui) {
		/*
		    ui.options // options used to intialize this widget
		    ui.tab // anchor element of the selected (clicked) tab
		    ui.panel // element, that contains the contents of the selected (clicked) tab
		    ui.index // zero-based index of the selected (clicked) tab
		*/
		air.trace('selected '+ui.index);
		air.trace('selected '+ui.panel.id);
		if (ui.panel.id == 'list') {
			DZ.getNewest();
		}
	})
	
	DZ.status('Ready.');
};




DZ.getNewest = function() {
	
	DZ.status('Getting newest posts…');

	$.ajax({
		url: DZ.baseurl+'newest/', 
		type:'GET',
		dataType:'text',
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			DZ.status(textStatus);
			data = JSON.parse(XMLHttpRequest.responseText);
			DZ.status(data.msg);
			air.trace(textStatus);
		},
		success: function(data, textStatus) {
			DZ.status(textStatus);
			data = JSON.parse(data);
			DZ.status(data.msg +"; "+data.count+" total");
			
			$('#list').empty();
			
			for(x in data.letters) {
				DZ.dump(data.letters[x]);
				var html = "<div class='letter' data-id='"+data.letters[x].id+"'> \
					<div class='body'>"+data.letters[x].body+"</div> \
					<div class='posted' data-id='"+data.letters[x].id+"'>"+data.letters[x].posted+"</div> \
					<div class='favorite' data-id='"+data.letters[x].id+"'> \
						I like this (<span class='favorite-count' data-id='"+data.letters[x].id+"'>"+data.letters[x].favorite_count+"</span>) \
					</div> \
				</div>";
				$('#list').append(html);
			}
			
		},
		complete: function(XMLHttpRequest, textStatus) {
			if (XMLHttpRequest.readyState < 3) {
		        DZ.status("ERROR: Server did not respond")
		    }
		    DZ.dump("HEADERS:\n"+XMLHttpRequest.getAllResponseHeaders());
		    DZ.dump("DATA:\n"+XMLHttpRequest.responseText);
		    DZ.dump("COMPLETE: " + textStatus);
		}
		
	});
	
};


DZ.addNewEntry = function() {
	
	var thisdata = {
		'letter': $('#entrybox').val()
	}
	
	DZ.status('Posting…');

	$.ajax({
		url: DZ.baseurl+'add', 
		type:'POST',
		dataType:'text',
		data: thisdata,
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			DZ.status(textStatus);
			data = JSON.parse(XMLHttpRequest.responseText);
			DZ.status(data.msg);
			air.trace(textStatus);
		},
		success: function(data, textStatus) {
			DZ.status(textStatus);
			data = JSON.parse(data);
			DZ.status("Added as ID "+data.id);
		},
		complete: function(XMLHttpRequest, textStatus) {
			if (XMLHttpRequest.readyState < 3) {
		        DZ.status("ERROR: Server did not respond")
		    }
		    DZ.dump("HEADERS:\n"+XMLHttpRequest.getAllResponseHeaders());
		    DZ.dump("DATA:\n"+XMLHttpRequest.responseText);
		    DZ.dump("COMPLETE: " + textStatus);
		}
		
	});	
};



DZ.addFav = function(id) {
	
	DZ.status('Favoriting…');

	$.ajax({
		url: DZ.baseurl + "favorite/" + id, 
		type:'GET',
		dataType:'text',
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			DZ.status(textStatus);
			data = JSON.parse(XMLHttpRequest.responseText);
			DZ.status(data.msg);
			air.trace(textStatus);
		},
		success: function(data, textStatus) {
			DZ.status(textStatus);
			data = JSON.parse(data);
			DZ.status("New fav count is "+data.favorite_count);
			/*
				Update the listing
			*/
			$('.favorite-count[data-id=\''+id+'\']').text(data.favorite_count);
		},
		complete: function(XMLHttpRequest, textStatus) {
			if (XMLHttpRequest.readyState < 3) {
		        DZ.status("ERROR: Server did not respond")
		    }
		    DZ.dump("HEADERS:\n"+XMLHttpRequest.getAllResponseHeaders());
		    DZ.dump("DATA:\n"+XMLHttpRequest.responseText);
		    DZ.dump("COMPLETE: " + textStatus);
		}
		
	});	
};



/*
	Sets the statusbar text
*/
DZ.status = function(statustxt) {
	if (!statustxt) {
		$('#status').text('');
	}
	else {
		$('#status').text(statustxt);
	}
	return true;
};


DZ.notify = function(data) {

}



/*
	a quick dump function for debugging
*/
DZ.dump = function(msg) {
	if (air.Introspector && air.Introspector.Console && air.Introspector.Console.info) {
		air.Introspector.Console.info(msg);
	} else {
		air.trace(msg);
	}
};