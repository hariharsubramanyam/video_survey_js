/*
 * videoElement = the video element on the page which will display the videos
 * questionDiv = div to show the question/answers in
 * videoURLs = the list of urls of the videos to show
 * QAs = an array of question data. Takes the form
 *	[QA1, QA2, ...]
 *	where each QA takes the form
 *	{
 *		question:"What should I put here?"
 *		responses:["FirstResponse", "SecondResponse", "ThirdResponse", ...]
 *		videoURL:"the/video/url/this/question/is/associated/with"
 *	} 
 */
function VideoSurvey(videoElement, questionDiv, videoURLs, QAs){
	this.videoElement = videoElement;
	this.QAs = QAs;
	this.videoURLs = videoURLs;
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
}
