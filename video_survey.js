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
	var currentSurveyVideo;

	this.shuffleVideoSurveys = function(){
		for(var i = 0; i < this.surveyVideos.length; i++){
			var tmp = this.surveyVideos[i];
			var swapIndex = Math.floor(Math.random()*this.surveyVideos.length);
			this.surveyVideos[i] = this.surveyVideos[swapIndex];
			this.surveyVideos[swapIndex] = tmp;
		}
	};
	this.loadVideo = function(url){
		var sources = this.videoElement.getElementsByTagName("source");
		sources[0].src = url;
		this.videoElement.load();
		return url;
	};
	this.nextVideo = function(){
		var firstElement = this.videoURLs.shift();
		this.videoURLs.push(firstElement);
		return firstElement;
	};
	this.loadNextVideo = function(){
		return this.loadVideo(this.nextVideo());
	};
	this.playVideo = function(){
		this.videoElement.play();
	};
	this.pauseVideo = function(){
		this.videoElement.pause();
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
 * timedQA = the question to show while the video is playing (and should keep track of the time taken to answer the question) - if there isn't any timed question, then pass in null
 */
function SurveyVideo(videoURL, QAs, timedQA){
	this.videoURL = videoURL;
	this.QAs = QAs;
	this.timedQA = timedQA;
}
