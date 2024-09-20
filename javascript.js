/*
const apiKey = 'AIzaSyAnE-ftSffxGPU5pOmBO0Z_mZblFaD6LA8';  
const playlistId = 'PLa5LE8jbn876NFRANd7swmdpo3_3PEqwN'; 
 
// Combines the API key with the playlist ID to create the API URL
const playlistApiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=1&key=${apiKey}`;

let durations = [];

fetch(playlistApiUrl)
    // Convert the data received to JSON
    .then(response => response.json())
    .then(data => {

        data.items.forEach(item => {
            // Checks that the playlist contains items
            if (data.items && data.items[0]) {
                // Gets the video ID of the first video in the playlist
                const videoId = item.contentDetails.videoId;
                // URL to fetch video details
                const videoApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;
    
                 // Converts the video details received to JSON
                fetch(videoApiUrl)
                    .then(response => response.json())
                    .then(videoData => {
                        if (videoData.items && videoData.items[0]) {
                            const video = videoData.items[0].contentDetails;
                            console.log(video);
                            document.getElementById('video-information').innerText = `Duration: ${video.duration}`;
                            
                            durations.push(video.duration);
                            console.log(durations.flat());
                        } 
                        
                        else {
                            document.getElementById('video-information').innerText = 'No video details found';
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                        document.getElementById('video-information').innerText = 'Error fetching data';
                    });
    
            } 
            
            else {
                throw new Error('No video found in playlist');
            }
           
        });
    })
        */

    const apiKey = 'AIzaSyAnE-ftSffxGPU5pOmBO0Z_mZblFaD6LA8';  
//const playlistId = 'PLa5LE8jbn876NFRANd7swmdpo3_3PEqwN'; 
const playlistId = 'PLSTzdBlo5WBAZRTMWz-9_CQbLXnZ-t40n';

const playlistApiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}`;

function durationToSeconds(duration) {
    
    duration = duration.replace('PT', '');
    
    let hoursIndex = duration.indexOf('H');
    let minutesIndex = duration.indexOf('M');
    let secondsIndex = duration.indexOf('S');
    
    let hoursInSeconds, minutesInSeconds, seconds;

    if (hoursIndex > -1) {
        hoursInSeconds = parseInt(duration.substring(0, hoursIndex))*3600;
    }

    if (minutesIndex > -1) {
        minutesInSeconds = parseInt(duration.substring(hoursIndex + 1, minutesIndex))*60;
    }

    if (secondsIndex > -1) {
        seconds = parseInt(duration.substring(minutesIndex + 1, secondsIndex));
    }

    return hoursInSeconds + minutesInSeconds + seconds;
}

function secondsToDuration(seconds) {

    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    return `${hours}H ${minutes}M ${remainingSeconds}S`;
}

async function getVideoDurations() {
    try {
        // Fetch playlist data
        const playlistResponse = await fetch(playlistApiUrl);
        const playlistData = await playlistResponse.json();

        if (playlistData.items && playlistData.items.length > 0) {
            //const durations = [];
            let totalSeconds = 0;

            for (const item of playlistData.items) {
                const videoId = item.contentDetails.videoId;
                const videoApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;

                // Fetch video details
                const videoResponse = await fetch(videoApiUrl);
                const videoData = await videoResponse.json();

                if (videoData.items && videoData.items[0]) {
                    const duration = videoData.items[0].contentDetails.duration;
                    //durations.push(duration);
                    totalSeconds += durationToSeconds(duration);
                } else {
                    console.error('No video details found for video ID:', videoId);
                }
            }

            // Output the durations
            let totalDuration = secondsToDuration(totalSeconds);
            document.getElementById('video-information').innerText = `Total runtime: ${totalDuration}`;
        } else {
            document.getElementById('video-information').innerText = 'No videos found in playlist';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('video-information').innerText = 'Error fetching data';
    }
}

// Call the function to fetch video durations
getVideoDurations();


