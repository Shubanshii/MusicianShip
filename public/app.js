
// this function's name and argument can stay the
// same after we have a live API, but its internal
// implementation will change. Instead of using a
// timeout function that returns mock data, it will
// use jQuery's AJAX functionality to make a call
// to the server and then run the callbackFn
function getRecentCampaigns(callbackFn) {
    // we use a `setTimeout` to make this asynchronous
    // as it would be with a real AJAX call.

    const settings = {
      url: '/campaigns',
      // data: {
      //   q: `${searchTerm} in:name`,
      //   per_page: 5
      // },
      dataType: 'json',
      type: 'GET',
      success: callbackFn
    };

    $.ajax(settings);
}

// this function stays the same when we connect
// to real API later
function displayCampaigns(data) {
  console.log(data.campaigns);
    for (index in data.campaigns) {
      if(data.campaigns[index].status === "current") {
        $('.current-campaigns').append(
           '<p>Artist: ' + data.campaigns[index].artist + '</p>' +
           '<p>Title: ' + data.campaigns[index].title + '</p>' +
           '<p>Description: ' + data.campaigns[index].description + '</p>' +
           '<a href="/campaigns/' + data.campaigns[index].id + '">Contribute</a>');

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
  // displayCampaigns();
  updateFinancialGoal();
  createCampaign();

})
