/*
 * This class takes survey json and executes the survey
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

    // Used to keep track of when questions can be displayed
    var canDisplayQuestion = true;

    /*
     * Displays the next question in the queue
     * If there is no such question, it plays the next video
     */
    this.displayQuestion = function(){
        // Check if we can display another question (and if there's another question to display!)
        if(questionQueue.length > 0 && canDisplayQuestion){
            
            // we're going to be displaying a question, so make this false
            canDisplayQuestion = false;
            
            // get the first question on the question queue
            var qa = questionQueue.shift();
            
            // display the question text
            $("#my_question_text").text(qa.question);

            // delete the current answer choices
            $("#my_response_row").empty();

            // add the new answer choices
            var responseHTML = "";
            for(var i = 0; i < qa.responses.length; i++){
                responseHTML += "<button class='btn btn-primary my_button_response_class'>" + qa.responses[i]  + "</button>";
            }
            $("#my_response_row").html(responseHTML);

            // note the start time
            var start_time = new Date();

            // keep track of the current object (because "this" takes on a different meaning when we write our handlers)
            var thisObject = this;

            // remove any existing click events
            $(".my_button_response_class").unbind('click');

            // create a click handler
            $(".my_button_response_class").click(function(){
                
                // when the user answers the question, add the question to the survey result
                thisObject.surveyResult.addQuestion(qa.question, this.innerHTML, new Date() - start_time);
                
                // Disable the button and indicate that we have a response
                $('.my_button_response_class').prop('disabled', true);
                
                // show the toast message indicating that they've answered the question
                thisObject.setToast(true, "Your response has been recorded");

                // hide the toast message in 1.5 seconds
                setTimeout(function(){
                    thisObject.setToast(false, "");
                }, 1500);

                // now that the question has been answered, we can display another one
                canDisplayQuestion = true;

                // decrement the number of questions remaining
                remainingQuestions -= 1;

                // display the next question
                thisObject.displayQuestion();
            });
        }else if (currentVideoEnded && remainingQuestions === 0){
            // if we've finished all the questions for the video, and the video is over, start another video
            this.endVideoAndStartAnother();
        }
    };

    /*
     *  Display the next video
     */
    this.displayNextVideo = function(){
        // stop the playing video
        this.videoElement.pause();

        // figure out next cideo
        var currentSurveyVideo = this.surveyVideos[currentSurveyVideoIndex];

        // the video has not started so it certainly hasn't ended
        currentVideoEnded = false;

        // figure out the number of remaining questions that the user has to answer for this video
        remainingQuestions = currentSurveyVideo.QAs.length;
        if(currentSurveyVideo.timedQA){
            remainingQuestions += 1;
        }

        // add the current video to the surveyResult
        this.surveyResult.startSurveyVideo(currentSurveyVideo.videoTitle);


        // show the modal
        $("#my_modal_title").text(currentSurveyVideo.videoTitle);
        $("#my_modal_body").text(currentSurveyVideo.preVideoPrompt);
        $("#my_modal").modal();

        // keep track of the current object (because "this" takes on a different meaning when we write our handlers)
        var thisObject = this;

        // remove any existing handlers and create a new one
        $("#my_modal_button").unbind("click");
        $("#my_modal_button").click(function(){
            // load next video
            thisObject.loadVideo(currentSurveyVideo.videoURL);

            // play the video
            thisObject.videoElement.play();

            // if there's a timed question, load it
            if(currentSurveyVideo.timedQA){
                thisObject.putQuestion(currentSurveyVideo.timedQA);
            }

            // when the video is over...
            thisObject.videoElement.onended = function(){
                // show the next question
                for(var i = 0; i < currentSurveyVideo.QAs.length; i++){
                    thisObject.putQuestion(currentSurveyVideo.QAs[i]);
                }

                // the video is over, so indcate so
                currentVideoEnded = true;

                // if the video is over and the questions have been answered, display the next video (plus its questions)
                if(currentVideoEnded && remainingQuestions === 0){
                thisObject.endVideoAndStartAnother();
                }
            };
        });
    };

    /*
     *  End the current video and start the next one
     */
    this.endVideoAndStartAnother = function(){
        // Finishing appending to the video in the JSON Survey Result
        this.surveyResult.endSurveyVideo();

        // increment the index of the current video
        currentSurveyVideoIndex += 1;

        // if we have more videos to show, show the next one
        if(currentSurveyVideoIndex < this.surveyVideos.length){
            this.displayNextVideo();
        }else{
            // If we're done with all the videos, do something with the result.
            // TODO: Save the file into the file
            console.log(this.surveyResult);
        }
    };

    /*
     *  Display a toast message or turn it off
     */
    this.setToast = function(isOn, text){
        // if isOn = true, display the toast
        // if isOn = false, hide the toast
        if(isOn){
            $("#my_toast").html(text);
            $("#my_toast").fadeIn();
        }else{
            $("#my_toast").fadeOut(400, function(){$("#my_toast").html("");});
        }
    };

    /*
     *  Enqueue the question and attempt to display it
     */
    this.putQuestion = function(qa){
        questionQueue.push(qa);
        this.displayQuestion();
    };

    /*
     *  Load the video for the given URL
     */
    this.loadVideo = function(url){
        var sources = this.videoElement.getElementsByTagName("source");
        sources[0].src = url;
        this.videoElement.load();
        return url;
    };

    /*
     *  This the HTML needed to create a modal for Bootstrap
     */
    this.getBootstrapModalHTML = function(){
        return '<div class="modal fade" id="my_modal"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h4 class="modal-title" id="my_modal_title">Modal title</h4></div><div class="modal-body"><p id="my_modal_body">One fine body&hellip;</p></div><div class="modal-footer"><button type="button" class="btn btn-primary" data-dismiss="modal" id="my_modal_button">OK</button></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal -->';
    };

    // Add the modal to the HTML so that we can use it alter
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