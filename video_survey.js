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

	this.displayNextVideo = function(){
		var currentSurveyVideo = this.surveyVideos[currentSurveyVideoIndex];
		confirm(currentSurveyVideo.preVideoPrompt);
		this.loadVideo(currentSurveyVideo.videoURL);
		this.videoElement.play();
		currentSurveyVideoIndex = (currentSurveyVideoIndex + 1)%this.surveyVideos.length;
	};

	this.loadVideo = function(url){
		var sources = this.videoElement.getElementsByTagName("source");
		sources[0].src = url;
		this.videoElement.load();
		return url;
	};
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
function SurveyVideo(videoURL, QAs, preVideoPrompt, timedQA){
	this.videoURL = videoURL;
	this.preVideoPrompt = preVideoPrompt;
	this.QAs = QAs;
	this.timedQA = timedQA;
}
