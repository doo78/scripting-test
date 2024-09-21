

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

    if (hoursIndex > -1 && minutesIndex > -1 && secondsIndex > -1) {
        return hoursInSeconds + minutesInSeconds + seconds;
    }

    else if (minutesIndex > -1 && secondsIndex > -1) {
        return minutesInSeconds + seconds;
    }

    else if (secondsIndex > -1) {
        return seconds;
    }
}

function secondsToDuration(seconds) {
    console.log(seconds);

    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    return `${hours}H ${minutes}M ${remainingSeconds}S`;
}

function getPlaylistId(url){

    const equalsIndex = url.indexOf('=');
    if(equalsIndex > -1){
        const playlistId = url.substring(equalsIndex + 1);
        return playlistId;
    } 
    
    else {
        return url;
    }
}

async function getVideoDurations(url) {
    try {
        const apiKey = 'AIzaSyAnE-ftSffxGPU5pOmBO0Z_mZblFaD6LA8';  
        const playlistId = getPlaylistId(url);
        const playlistApiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}`;
        

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
                    console.log(duration);
                    console.log(durationToSeconds(duration));
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
const confirmBtn = document.querySelector('#get-duration');

confirmBtn.addEventListener('click', () => {
    let url = document.querySelector('#playlist-url').value;
    getVideoDurations(url);
})

