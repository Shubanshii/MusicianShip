const MOCK_USER_INFO = {
  "users": [
    {
      "id": "1111111",
      "username": "Britain",
      "createdAt": 1470016976609,
      "campaigns": [
        {
          "artist": "TOOL",
          "title": "New Album",
          "description": "We will use the money to make a new record filled with polyrhythms, obscure melodies, obscure progressions.  Everything you'd want from a TOOL record :).  It will be analog, to tape, old school.  It will sound awesome.",
          "files": [],
          "financialGoal": 100000,
          "createdAt": 1470030976609,
          "status": "current"
        }
      ],
      "contributedTo": []
    },
    {
      "id": "2222222",
      "username": "MeshuggahFan",
      "createdAt": 1470012976609,
      "campaigns": [],
      "contributedTo": [
        {
          "artist": "TOOL",
          "title": "New Album",
          "amount": 1000
        }
      ]
    },
    {
      "id": "3333333",
      "username": "DaBrankOfDawn",
      "createdAt": 1470011976609,
      "campaigns": [
        {
          "artist": "John Mayer",
          "title": "Guitar Solo Challenge",
          "description": "I've got a dynamite track absent vocals.  I want one of my fans or fellow guitarists to track a solo at 2:15-2:35.",
          "files": ["sickjam.wav", "sickjam.mp3", "sickjam.gpx"],
          "financialGoal": "$400",
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
      ],
      "contributedTo": []
    }
  ]
};

function getCurrentCampaigns(callbackFn) {
  setTimeout(function(){ callbackFn(MOCK_USER_INFO)}, 1);
}

function displayCurrentCampaigns(data) {
  for (index in data.users) {
    console.log();
    if(data.users[index].campaigns.length > 0) {
      let i = index;
      for (var x = 0; x < data.users[i].campaigns.length; x++) {
        if(data.users[i].campaigns[x].status === "current") {
          $('.current-campaigns').append(
            '<h1>' + data.users[i].campaigns[x].artist + '</h1>' +
            '<h3>' + data.users[i].campaigns[x].title + '</h3>'
          );
        }
      }
    }
  }
}

function getAndDisplayCurrentCampaigns() {
  getCurrentCampaigns(displayCurrentCampaigns);
}

function getAndDisplayCampaign() {
  $('.contribute').append(
    '<h1>' + MOCK_USER_INFO.users[0].campaigns[0].artist + '</h1>' +
    '<h2>' + MOCK_USER_INFO.users[0].campaigns[0].title + '</h2>' +
    '<h4>' + MOCK_USER_INFO.users[0].campaigns[0].description + '</h4>' +
    '<h4>Finanial Goal: $' + MOCK_USER_INFO.users[0].campaigns[0].financialGoal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</h4>');
}

function onSubmit() {
  $('.contribution-form').submit(function( event ) {
    let amount = $('.amount').val();
    MOCK_USER_INFO.users[0].campaigns[0].financialGoal = MOCK_USER_INFO.users[0].campaigns[0].financialGoal - amount;
    console.log(MOCK_USER_INFO.users[0].campaigns[0].financialGoal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    event.preventDefault();
  });

  $('.create-campaign-form').submit(function( event ) {
    MOCK_USER_INFO.users[0].campaigns.push({
      "artist": $('.artist').val(),
      "title": $('.title').val(),
      "description": $('.description').val(),
      "files": [],
      "financialGoal": $('.financial-goal').val(),
      "createdAt": new Date().getTime(),
    });
    console.log(MOCK_USER_INFO.users[0].campaigns);
    event.preventDefault();
  });
}

$(function() {
  getAndDisplayCurrentCampaigns();
  getAndDisplayCampaign();
  onSubmit();
})
