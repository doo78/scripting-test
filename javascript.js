const apiKey = 'AIzaSyAnE-ftSffxGPU5pOmBO0Z_mZblFaD6LA8';  
const playlistId = 'PLa5LE8jbn876NFRANd7swmdpo3_3PEqwN'; 
 
// Combines the API key with the playlist ID to create the API URL
const playlistApiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=1&key=${apiKey}`;

fetch(playlistApiUrl)
    // Convert the data received to JSON
    .then(response => response.json())
    .then(data => {
        // Checks that the playlist contains items
        if (data.items && data.items[0]) {
            // Gets the video ID of the first video in the playlist
            const videoId = data.items[0].contentDetails.videoId;
            // URL to fetch video details
            const videoApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;

            // Fetch video details
            return fetch(videoApiUrl);

        } else {
            throw new Error('No video found in playlist');
        }
    })
    // Converts the video details received to JSON
    .then(response => response.json())
    .then(data => {
        if (data.items && data.items[0]) {
            const video = data.items[0].contentDetails;
            console.log(video);
            document.getElementById('video-information').innerText = `Duration: ${video.duration}`;
        } else {
            document.getElementById('video-information').innerText = 'No video details found';
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        document.getElementById('video-information').innerText = 'Error fetching data';
    });
