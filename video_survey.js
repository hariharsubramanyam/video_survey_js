/*
 * videoElement = the video element on the page which will display the videos
 * questionDiv = div to show the question/answers in
 * surveyVideos = list of SurveyVideos which constitute this survey
 */
function SurveyManager(videoElement, questionDiv, surveyVideos){
	// The <video> element
	this.videoElement = videoElement;

	// The <div> which will contain the questions and the responses
	this.questionDiv = questionDiv;

	// The list of SurveyVideos	
	this.surveyVideos = surveyVideos;

	// the current survey video
	var currentSurveyVideoIndex = 0;

	// Randomly permutes the SurveyVideos 
	this.shuffleVideoSurveys = function(){
		for(var i = 0; i < this.surveyVideos.length; i++){
			var tmp = this.surveyVideos[i];
			var swapIndex = Math.floor(Math.random()*this.surveyVideos.length);
			this.surveyVideos[i] = this.surveyVideos[swapIndex];
			this.surveyVideos[swapIndex] = tmp;
		}
	};

	// Displays the next video
	this.displayNextVideo = function(){
		this.videoElement.pause();
		var currentSurveyVideo = this.surveyVideos[currentSurveyVideoIndex];
		$("#my_modal_title").text(currentSurveyVideo.videoTitle);
		$("#my_modal_body").text(currentSurveyVideo.preVideoPrompt);
		$("#my_modal").modal();
		var thisObject = this;
		$("#my_modal_button").unbind("click");
		$("#my_modal_button").click(function(){
			var start_time = new Date();
			thisObject.loadVideo(currentSurveyVideo.videoURL);	
			thisObject.videoElement.play();
			if(currentSurveyVideo.timedQA){
				thisObject.questionDiv.innerHTML = '<div class="container">' + '<div class="row" id="my_question_row">' + "<p>" + currentSurveyVideo.timedQA.question + "</p>" + '</div>' + '<div class="row" id="my_response_row">'+  '</div>'+ '</div>';
			}
			currentSurveyVideoIndex = (currentSurveyVideoIndex + 1)%thisObject.surveyVideos.length;
		});
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
	this.shuffleVideoSurveys();
}

/*
 * question = the question text (ex. "What is your favorite color?")
 * responses = the possible responses to the question (ex. ["Red", "Blue", "Green"])
 */
function QA(question, responses){
	this.question = question;
	this.responses = responses;
}

/*
 * videoURL = url of the video to play
 * QAs = the QAs associated with this video
 * preVideoPrompt = the prompt text that will be displayed before the video begins (ex. "You will see a video of a bunch of colors and then asked a set of questions afterwards")
 * timedQA = the question to show while the video is playing (and should keep track of the time taken to answer the question) - if there isn't any timed question, then pass in null
 */
function SurveyVideo(videoURL, QAs, videoTitle, preVideoPrompt, timedQA){
	this.videoTitle = videoTitle;
	this.videoURL = videoURL;
	this.preVideoPrompt = preVideoPrompt;
	this.QAs = QAs;
	this.timedQA = timedQA;
}
