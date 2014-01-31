/*
 * survey
 */
function SurveyManager(survey){
  // The <video> element
  this.videoElement = survey["videoElement"];

  // The <div> which will contain the questions and the responses
  this.questionDiv = survey["questionDiv"];
  this.questionDiv.innerHTML = '<div class="container">' + '<div class="row"><h3>Question</h3></div>' +'<div class="row">' + "<p id='my_question_text'>" +  "</p>" + '</div>' + '<div class="row" id="my_response_row">'+  '</div>'+ '<div id="my_toast" >' + '</div>' + '</div>';

  // We'll be accumulating the survey result as the user works through the survey
  this.surveyResult = new SurveyResult();


  // The list of SurveyVideos	
  this.surveyVideos = [];
  for(var i = 0; i < survey["surveyVideos"].length; i++){
    this.surveyVideos.push(new SurveyVideo(survey["surveyVideos"][i]));
  }

  // the current survey video
  var currentSurveyVideoIndex = 0;
  var currentVideoEnded = true;
  var remainingQuestions = 0;

  // the questions to display
  var questionQueue = [];
  var canDisplayQuestion = true;

  this.displayQuestion = function(){
    if(questionQueue.length > 0 && canDisplayQuestion){
      canDisplayQuestion = false;
      var qa = questionQueue.shift();
      $("#my_question_text").text(qa.question);
      $("#my_response_row").empty();
      var responseHTML = "";
      for(var i = 0; i < qa.responses.length; i++){
        responseHTML += "<button class='btn btn-primary my_button_response_class'>" + qa.responses[i]  + "</button>";
      }
      $("#my_response_row").html(responseHTML);
      var start_time = new Date();
      var thisObject = this;
      $(".my_button_response_class").unbind('click');
      $(".my_button_response_class").click(function(){
        // when the user answers the question, add the question to the survey result
        thisObject.surveyResult.addQuestion(qa.question, this.innerHTML, new Date() - start_time);
        // Disable the button and indicate that we have a response
        $('.my_button_response_class').prop('disabled', true);
        thisObject.setToast(true, "Your response has been recorded");
        setTimeout(function(){
          thisObject.setToast(false, "");
        }, 1500);
        canDisplayQuestion = true;
        remainingQuestions -= 1;
        thisObject.displayQuestion();
      });
    }else if (currentVideoEnded && remainingQuestions === 0){
      this.endVideoAndStartAnother();
    }
  };

  // Displays the next video
  this.displayNextVideo = function(){
    // stop the playing video
    this.videoElement.pause();

    // figure out next cideo
    var currentSurveyVideo = this.surveyVideos[currentSurveyVideoIndex];

    // add the current video to the surveyResult
    this.surveyResult.startSurveyVideo(currentSurveyVideo.videoTitle);
    // show the modal
    $("#my_modal_title").text(currentSurveyVideo.videoTitle);
    $("#my_modal_body").text(currentSurveyVideo.preVideoPrompt);
    $("#my_modal").modal();

    currentVideoEnded = false;
    remainingQuestions = currentSurveyVideo.QAs.length;
    if(currentSurveyVideo.timedQA){
      remainingQuestions += 1;
    }
    // handle click event for the modal button
    var thisObject = this;
    $("#my_modal_button").unbind("click");
    $("#my_modal_button").click(function(){
      // load next video
      thisObject.loadVideo(currentSurveyVideo.videoURL);
      thisObject.videoElement.play();
      // if there's a timed question, load it
      if(currentSurveyVideo.timedQA){
        thisObject.putQuestion(currentSurveyVideo.timedQA);
      }
      thisObject.videoElement.onended = function(){
        for(var i = 0; i < currentSurveyVideo.QAs.length; i++){
          thisObject.putQuestion(currentSurveyVideo.QAs[i]);
        }
        currentVideoEnded = true;
        if(currentVideoEnded && remainingQuestions === 0){
          thisObject.endVideoAndStartAnother();
        }
      };
    });
  };

  this.endVideoAndStartAnother = function(){
    this.surveyResult.endSurveyVideo();
    currentSurveyVideoIndex += 1;
    if(currentSurveyVideoIndex < this.surveyVideos.length){
      this.displayNextVideo();
    }else{
      console.log(this.surveyResult);
    }
  };

  this.fillQuestionDiv = function(text){
    this.putQuestion(text, []);
  };

  this.setToast = function(isOn, text){
    if(isOn){
      $("#my_toast").html(text);
      $("#my_toast").fadeIn();
    }else{
      $("#my_toast").fadeOut(400, function(){$("#my_toast").html("");});
    }
  };

  this.putQuestion = function(qa){
    questionQueue.push(qa);
    this.displayQuestion();
  };

  // Load the video for the given URL
  this.loadVideo = function(url){
    var sources = this.videoElement.getElementsByTagName("source");
    sources[0].src = url;
    this.videoElement.load();
    return url;
  };

  this.getBootstrapModalHTML = function(){
    return '<div class="modal fade" id="my_modal"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h4 class="modal-title" id="my_modal_title">Modal title</h4></div><div class="modal-body"><p id="my_modal_body">One fine body&hellip;</p></div><div class="modal-footer"><button type="button" class="btn btn-primary" data-dismiss="modal" id="my_modal_button">OK</button></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal -->';
  };

  $('body').append(this.getBootstrapModalHTML());

  // hide the toast
  $("#my_toast").fadeOut(1);
  $("#my_toast").addClass("alert");
  $("#my_toast").addClass("alert-success");
}


/*
 * Used to build up a JSON object cotnaining the results of a survey
 */
 /*
 {
  surveyVideos:[
    {
      videoName:"someName",
      QAs:[
        {question:"the question", response:"my response", responseTime:2.23}
        {question:"the question", response:"my response", responseTime:2.23}
        {question:"the question", response:"my response", responseTime:2.23}
      ]
    }
  ]
 }
 */
function SurveyResult(){
  this.response = {};
  this.response.surveyVideos = [];
  this.currentSurveyVideo = {};
  this.startSurveyVideo = function(surveyVideoName){
    this.currentSurveyVideo = {"videoName":surveyVideoName};
    this.currentSurveyVideo.QAs = [];
  };
  this.endSurveyVideo = function(){
    this.response.surveyVideos.push(this.currentSurveyVideo);
  };
  this.addQuestion = function(question, response, responseTime){
    this.currentSurveyVideo.QAs.push({
      "question":question,
      "response":response,
      "responseTime":responseTime
    });
  };
}

/*
 * videoURL = url of the video to play
 * QAs = the QAs associated with this video
 * preVideoPrompt = the prompt text that will be displayed before the video begins (ex. "You will see a video of a bunch of colors and then asked a set of questions afterwards")
 * timedQA = the question to show while the video is playing (and should keep track of the time taken to answer the question) - if there isn't any timed question, then pass in null
 */
function SurveyVideo(survey_video){
  this.videoTitle = survey_video["videoTitle"];
  this.videoURL = survey_video["videoURL"];
  this.preVideoPrompt = survey_video["preVideoPrompt"];
  this.timedQA = new QA(survey_video["timedQA"]);
  this.QAs = [];
  for(var i = 0; i < survey_video["QAs"].length; i++){
    this.QAs.push(new QA(survey_video["QAs"][i]));
  }
}

/*
 * question = the question text (ex. "What is your favorite color?")
 * responses = the possible responses to the question (ex. ["Red", "Blue", "Green"])
 */
function QA(qa){
  this.question = qa["question"];
  this.responses = [];
  for(var i = 0; i < qa["responses"].length; i++){
    this.responses.push(qa["responses"][i]);
  }
}