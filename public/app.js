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

function createCampaign() {
  let dataURI;
  $('#file-id').on('change', function(e) {
    console.log('working');

    //
    const file = e.currentTarget.files[0],
      reader = new FileReader();

    // if(file.size > 500000)
    // { alert('File Size must be less than .5 megabytes'); return false; }


    reader.addEventListener('load', () =>
    {
      //
      // preview.src = reader.result;
      // uriVal.value = reader.result;
      console.log(reader.result);
      dataURI = reader.result;
    }, false);

    if(file)
    { reader.readAsDataURL(file); }
  });


  $.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
              o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    o.files = dataURI;
    console.log(o);
    return o;
};
  $(".create-campaign-form").submit(function(event) {
    // console.log($(this));
    // var files = $(this).get(3).files;
    //
    // if (files.length > 0){
    //   // create a FormData object which will be sent as the data payload in the
    //   // AJAX request
    //   var formData = new FormData();
    //
    //   // loop through all the selected files and add them to the formData object
    //   for (var i = 0; i < files.length; i++) {
    //     var file = files[i];
    //
    //     // add the files to formData object for the data payload
    //     formData.append('uploads[]', file, file.name);
    //   }
    //
    //   $.ajax({
    //     url: '/upload',
    //     type: 'POST',
    //     data: formData,
    //     processData: false,
    //     contentType: false,
    //     success: function(data){
    //         console.log('upload successful!\n' + data);
    //     }
    //   });
    //
    // }

    let postObject = JSON.stringify($('.create-campaign-form').serializeObject())

    $.ajax({
      type: "POST",
      url: "/campaigns",
      data: JSON.stringify($('.create-campaign-form').serializeObject()),
      success: function(){},
      dataType: "json",
      contentType: "application/json"
    });

    event.preventDefault();
  });
}



//  on page load do this
$(function() {
	getAndDisplayCampaigns();
  updateFinancialGoal();
  createCampaign();

})
