
// Converts the ISO 8601 duration format to seconds
function durationToSeconds(duration) {
    
    duration = duration.replace('PT', '');
    
    let hoursIndex = duration.indexOf('H');
    let minutesIndex = duration.indexOf('M');
    let secondsIndex = duration.indexOf('S');
    
    let hoursInSeconds, minutesInSeconds, seconds;

    // Checks that the duration has hours, minutes and seconds
    if (hoursIndex > -1) {
        hoursInSeconds = parseInt(duration.substring(0, hoursIndex))*3600;
    }

    if (minutesIndex > -1) {
        minutesInSeconds = parseInt(duration.substring(hoursIndex + 1, minutesIndex))*60;
    }

    if (secondsIndex > -1) {
        seconds = parseInt(duration.substring(minutesIndex + 1, secondsIndex));
    }

    // Checks which combination of hours, minutes and seconds is given
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

// Converts seconds to the ISO 8601 duration format
function secondsToDuration(seconds) {

    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    return `${hours}H ${minutes}M ${remainingSeconds}S`;
}

// Gets the playlist ID from the URL
function getPlaylistId(url){

    // The playlist ID comes after = in the URL
    const equalsIndex = url.indexOf('=');
    if(equalsIndex > -1){
        const playlistId = url.substring(equalsIndex + 1);
        return playlistId;
    } 
    
    else {
        return url;
    }
}

// Calculates the duration of all the videos in the playlist
async function getVideoDurations(url) {
    try {
        const apiKey = 'AIzaSyAnE-ftSffxGPU5pOmBO0Z_mZblFaD6LA8';  
        const playlistId = getPlaylistId(url);
        // Combines the API URL with the playlist ID
        const playlistApiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}`;
        
        let nextPageToken = '';
        let totalSeconds = 0;
        let counter = 0;

        getDurationBtn.textContent = 'Calculating...'; // Shows the user it is calculating

        // Checks if there is another batch of videos to fetch
        while (nextPageToken != null) {

            // Fetches the next batch of videos
            const playlistResponse = await fetch(`${playlistApiUrl}&pageToken=${nextPageToken}`);
            const playlistData = await playlistResponse.json();

            // Checks if there are more videos in the playlist
            if (playlistData.items && playlistData.items.length > 0) {

                // For each playlist item, it fetches the video details
                for (const item of playlistData.items) {
                    const videoId = item.contentDetails.videoId;
                    const videoApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;

                    // Fetch video details
                    const videoResponse = await fetch(videoApiUrl);
                    const videoData = await videoResponse.json();

                    if (videoData.items && videoData.items[0]) {

                        counter++;
                        const duration = videoData.items[0].contentDetails.duration;
                        totalSeconds += durationToSeconds(duration);
                    } 
                }

                // Output the durations
                let totalDuration = secondsToDuration(totalSeconds);
                document.getElementById('video-information').innerText = `Total runtime: ${totalDuration}`;

                nextPageToken = playlistData.nextPageToken;
            } 
            
            else {
                nextPageToken = null;
                alert('No videos found in playlist');
            }
        }

        getDurationBtn.textContent = 'Calculate'; // Resets the button text
    } 
    
    catch (error) {
        alert('Error fetching data. Ensure the URL is correct and the playlist is public.');
    }
}

// Checks the specified video for the keyword
function checkItem(item, searchedValue, keyword, selectedOptions) {

    if (searchedValue){
        const searchResults = document.getElementById('search-results');

        // Checks for the keyword and if found, it is added to the screen
        if(searchedValue.toLowerCase().includes(keyword.toLowerCase())) {

            // Ensures the video is not deleted or private
            if (!item.snippet.title.includes('Deleted video') && !item.snippet.title.includes('Private video')){

                const resultEntry = document.createElement('div');

                // Adds the selected video details to the screen
                selectedOptions.forEach(option => {

                    let toAdd;
                    let style;
                    
                    if (option === "url") {
                        toAdd = `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`;
                        style = "text-decoration: underline;";
                    }   

                    else if (option === "title") {
                        toAdd = item.snippet.title;
                        style = "font-weight: bold; font-size: 24px; color: white;";
                    }

                    else if (option === "channelTitle") {
                        toAdd = item.snippet.videoOwnerChannelTitle;
                        style = "font-size: 18px; color: white;";
                    }

                    else if (option === "description") {
                        toAdd = item.snippet.description;
                        style = "font-size: 16px;";
                    }

                    const div = document.createElement('div');
                    div.style = style;
                    div.textContent = toAdd;

                    if (option === "thumbnail") {
                        const img = document.createElement('img');
                        img.src = item.snippet.thumbnails.high.url; 
                        img.alt = item.snippet.title; 
                        img.style.width = '500px';
                        div.appendChild(img);
                    }

                    resultEntry.appendChild(div);
                })

                searchResults.appendChild(resultEntry);

                const hr = document.createElement('hr');
                searchResults.appendChild(hr);
            }
        }
    }
}

// Fetches and queries the playlist for the keyword
async function searchKeyword(url, option, keyword, selectedOptions) {
    try {
        const apiKey = 'AIzaSyAnE-ftSffxGPU5pOmBO0Z_mZblFaD6LA8';  
        const playlistId = getPlaylistId(url);
        const playlistApiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}`;
    
        let nextPageToken = '';
        let totalSeconds = 0;

        while (nextPageToken != null) {
            
            const playlistResponse = await fetch(`${playlistApiUrl}&pageToken=${nextPageToken}`);
            const playlistData = await playlistResponse.json();
            
            if (playlistData.items && playlistData.items.length > 0) {

                //Checks each video for the keyword
                for (const item of playlistData.items) {
                    if (option === "title"){
                        checkItem(item, item.snippet.title, keyword, selectedOptions);
                    }

                    else if (option === "description"){
                        checkItem(item, item.snippet.description, keyword, selectedOptions);
                    }

                    else{
                        checkItem(item, item.snippet.videoOwnerChannelTitle, keyword, selectedOptions);
                    }
                }

                nextPageToken = playlistData.nextPageToken;
            }

            else{
                nextPageToken = null;
                alert('No videos found in playlist');
            }
        }
        
    }
    
    catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('video-information').innerText = 'Error fetching data';
    }

}

const confirmUrlBtn = document.querySelector('#confirm-url');
let url;

// Ensures the URL is valid
confirmUrlBtn.addEventListener('click', () => {
    if (document.querySelector('#playlist-url').value === '') {
        alert('Please enter a playlist URL');
    }

    else if (!document.querySelector('#playlist-url').value.includes('playlist')) {
        alert('Please enter a valid playlist URL');
    }

    url = document.querySelector('#playlist-url').value;
});

const getDurationBtn = document.querySelector('#get-duration');

getDurationBtn.addEventListener('click', () => {
    getVideoDurations(url);
});

const searchOption = document.querySelector('#search-option');
const keyword = document.querySelector('#keyword');
const searchBtn = document.querySelector('#search');

searchBtn.addEventListener('click', () => {
    let url = document.querySelector('#playlist-url').value;
    let option = searchOption.value;
    let keyword = document.querySelector('#keyword').value;

    if (keyword === '') {
        alert('Please enter a keyword');
    }

    else{
        const selectedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
        let selectedOptions = [];

        // Adds each selected option to an array
        selectedBoxes.forEach(box => {
            selectedOptions.push(box.value);
        });

        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '';

        searchKeyword(url, option, keyword, selectedOptions);
    }   
});

const createFolderBtn = document.querySelector('#create-folder-btn');
const newFolderName = document.querySelector('#new-folder-name');
const newFolderDescription = document.querySelector('#new-folder-description');
const folderList = document.querySelector('#folder-list');

// Creates a playlist folder
createFolderBtn.addEventListener('click', () => {
    const newFolder = document.createElement('li');
    newFolder.textContent = newFolderName.value;

    const folderContents = document.createElement('div')

    const folderDescription = document.createElement('p');
    folderDescription.textContent = newFolderDescription.value;
    folderDescription.style.fontWeight = 'bold';

    folderContents.appendChild(folderDescription);

    // Creates the playlist name and URL input boxes
    const addPlaylistName = document.createElement('input');
    addPlaylistName.type = 'text';
    addPlaylistName.setAttribute("maxlength", 30);
    const addPlaylistNameLabel = document.createElement('label');
    addPlaylistNameLabel.textContent = 'Playlist name: ';

    const addPlaylistUrl = document.createElement('input');
    addPlaylistUrl.type = 'text';
    addPlaylistUrl.setAttribute("maxlength", 100);
    const addPlaylistUrlLabel = document.createElement('label');
    addPlaylistUrlLabel.textContent = 'Playlist url: ';

    const addPlaylistBtn = document.createElement('button');
    addPlaylistBtn.textContent = 'Add playlist';

    // Adds the playlist to the folder
    addPlaylistBtn.addEventListener('click', () => {
        if (addPlaylistName.value === '' || addPlaylistUrl.value === '') {
            alert('Please enter a playlist name and url');
        }

        else {
            const newPlaylist = document.createElement('li');
            newPlaylist.textContent = addPlaylistName.value + ': ' + addPlaylistUrl.value;

            newPlaylist.style.margin = '10px';

            folderItems.appendChild(newPlaylist);
        
            addPlaylistName.value = '';
            addPlaylistUrl.value = '';

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'X';
            newPlaylist.appendChild(removeBtn);

            newPlaylist.style.display = 'flex';

            removeBtn.addEventListener('click', () => {
                newPlaylist.remove();
            });
        }
    });

    const folderItems = document.createElement('ul');

    // Organises all the folder contents into a HTML element
    folderItems.appendChild(addPlaylistNameLabel);
    folderItems.appendChild(addPlaylistName);
    folderItems.appendChild(addPlaylistUrlLabel);
    folderItems.appendChild(addPlaylistUrl);
    folderItems.appendChild(addPlaylistBtn);

    folderItems.style.display = 'flex';
    folderItems.style.flexDirection = 'column';

    folderContents.appendChild(folderItems);

    folderContents.style.display = 'none';

    const showContentsBtn = document.createElement('button');
    showContentsBtn.textContent = 'Show';
    newFolder.appendChild(showContentsBtn);

    const removeFolderBtn = document.createElement('button');
    removeFolderBtn.textContent = 'X';
    newFolder.appendChild(removeFolderBtn);

    // Hides and shows the contents of the folder
    showContentsBtn.addEventListener('click', () => {
        if (folderContents.style.display === 'none') {
            folderContents.style.display = 'block';
            showContentsBtn.textContent = 'Hide';
        } else {
            folderContents.style.display = 'none';
            showContentsBtn.textContent = 'Show';
        }
    });

    // Separates each folder with a line
    let horizontalLine = document.createElement('hr');
    newFolder.appendChild(horizontalLine);

    newFolder.appendChild(folderContents);

    // Adds the folder to the folder list
    folderList.appendChild(newFolder);

    removeFolderBtn.addEventListener('click', () => {
        newFolder.remove();
    });

    // Resets the input fields
    newFolderName.value = '';
    newFolderDescription.value = '';
});





