const MOCK_CAMPAIGN_INFO = {
  "campaigns": [
    {
      "id": "1111111",
      "createdAt": 1470016976609,
      "artist": "TOOL",
      "title": "New Album",
      "description": "We will use the money to make a new record filled with polyrhythms, obscure melodies, obscure progressions.  Everything you'd want from a TOOL record :).  It will be analog, to tape, old school.  It will sound awesome.",
      "files": [],
      "financialGoal": 100000,
      "createdAt": 1470030976609,
      "status": "current"
    },
    {
      "id": "3333333",
      "createdAt": 1470011976609,
      "artist": "John Mayer",
      "title": "Guitar Solo Challenge",
      "description": "I've got a dynamite track absent vocals.  I want one of my fans or fellow guitarists to track a solo at 2:15-2:35.",
      "files": ["sickjam.wav", "sickjam.mp3", "sickjam.gpx"],
      "financialGoal": 400,
      "createdAt": 1470055976609,
      "status": "current"
    },
    {
      "artist": "John Mayer Trio",
      "title": "New Album",
      "description": "The trio is back in action.  Recording a full length.  Steve and Pino are broke, so we need money for them to be able to eat and sleep while we bang this out.  We also may or not want an orchestra for a few tracks.",
      "files": [],
      "financialGoal": "$50,000",
      "createdAt": 1470025976609,
      "status": "completed"
    }
  ]
};

// this function's name and argument can stay the
// same after we have a live API, but its internal
// implementation will change. Instead of using a
// timeout function that returns mock data, it will
// use jQuery's AJAX functionality to make a call
// to the server and then run the callbackFn
function getRecentCampaigns(callbackFn) {
    // we use a `setTimeout` to make this asynchronous
    // as it would be with a real AJAX call.
	setTimeout(function(){ callbackFn(MOCK_CAMPAIGN_INFO)}, 1);
}

// this function stays the same when we connect
// to real API later
function displayCampaigns(data) {
    for (index in data.campaigns) {
      if(data.campaigns[index].status === "current") {
        $('.current-campaigns').append(
           '<p>Artist: ' + data.campaigns[index].artist + '</p>' +
           '<p>Title: ' + data.campaigns[index].title + '</p>' +
           '<p>Description: ' + data.campaigns[index].description + '</p>' +
           '<a href="contribute.html">Contribute</a>');

      }

    }
}

// this function can stay the same even when we
// are connecting to real API
function getAndDisplayCampaigns() {
	getRecentCampaigns(displayCampaigns);
}

function updateFinancialGoal() {
  $( ".contribution-form" ).submit(function( event ) {
    MOCK_CAMPAIGN_INFO.campaigns[1].financialGoal = MOCK_CAMPAIGN_INFO.campaigns[1].financialGoal - $(".amount").val();
    alert( MOCK_CAMPAIGN_INFO.campaigns[1].financialGoal );
    event.preventDefault();
  });
}

//  on page load do this
$(function() {
	getAndDisplayCampaigns();
  updateFinancialGoal();
})
