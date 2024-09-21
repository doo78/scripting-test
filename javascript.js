

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

    else if (hoursIndex > -1) {
        return hoursInSeconds;
    }

    else if (minutesIndex > -1) {
        return minutesInSeconds;
    }

    else if (hoursIndex > -1 && minutesIndex > -1) {
        return hoursInSeconds + minutesInSeconds;
    } 

    else if (hoursIndex > -1 && secondsIndex > -1) {
        return hoursInSeconds + seconds;
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
        
        let nextPageToken = '';
        let totalSeconds = 0;

        // Checks if there is another batch of videos to fetch
        while (nextPageToken != null) {

            // Fetches the next batch of videos
            const playlistResponse = await fetch(`${playlistApiUrl}&pageToken=${nextPageToken}`);
            const playlistData = await playlistResponse.json();

            if (playlistData.items && playlistData.items.length > 0) {

                // For each playlist item, it fetches the video details
                for (const item of playlistData.items) {
                    const videoId = item.contentDetails.videoId;
                    const videoApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;

                    // Fetch video details
                    const videoResponse = await fetch(videoApiUrl);
                    const videoData = await videoResponse.json();

                    if (videoData.items && videoData.items[0]) {

                        const duration = videoData.items[0].contentDetails.duration;
                        totalSeconds += durationToSeconds(duration);
                    } 
                    
                    else {
                        console.error('No video details found for video ID:', videoId);
                    }
                }

                // Output the durations
                let totalDuration = secondsToDuration(totalSeconds);
                document.getElementById('video-information').innerText = `Total runtime: ${totalDuration}`;

                nextPageToken = playlistData.nextPageToken;
            } 
            
            else {
                nextPageToken = null;
                document.getElementById('video-information').innerText = 'No videos found in playlist';
            }
        }

    } 
    
    catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('video-information').innerText = 'Error fetching data';
    }
}

function checkItem(item, keyword){
    const searchResults = document.getElementById('search-results');

    // Checks for the keyword and if found, it is added to the screen
    if(item.toLowerCase().includes(keyword)){
        const div = document.createElement('div');
        div.textContent = item;
        searchResults.appendChild(div);
    }
}

async function searchKeyword(url, option, keyword) {
    try {
        const apiKey = 'AIzaSyAnE-ftSffxGPU5pOmBO0Z_mZblFaD6LA8';  
        const playlistId = getPlaylistId(url);
        const playlistApiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`;
    
        let nextPageToken = '';
        let totalSeconds = 0;
        const titles = [];

        while (nextPageToken != null) {
            
            const playlistResponse = await fetch(`${playlistApiUrl}&pageToken=${nextPageToken}`);
            const playlistData = await playlistResponse.json();
            
            if (playlistData.items && playlistData.items.length > 0) {
                //Checks each video for the keyword
                for (const item of playlistData.items) {
                    checkItem(item.snippet.title, keyword);
                }

                nextPageToken = playlistData.nextPageToken;
            }

            else{
                nextPageToken = null;
                document.getElementById('search-results').innerText = 'No videos found in playlist';
            }
        }
        
    }
    
    catch (error) {
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

const searchOption = document.querySelector('#search-option');
const keyword = document.querySelector('#keyword');

const searchBtn = document.querySelector('#search');

searchBtn.addEventListener('click', () => {
    let url = document.querySelector('#playlist-url').value;
    let option = searchOption.value;
    let keyword = document.querySelector('#keyword').value;

    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';

    searchKeyword(url, option, keyword);
});



