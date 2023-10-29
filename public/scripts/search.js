const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const userSpan = document.getElementById('user');
const logoutButton = document.getElementById('logout-button');
const songList = document.getElementById('song-list');

let trackInfo;
let username;
let recsInfo;

function convertDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    return formattedTime;
  }
searchButton.addEventListener('click', async () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== '') {
        // Clear previous search results
        songList.innerHTML = '';        
        // for this we're going to implement our own algorithim to search through songs, but for now this is for the general idea
        await sendSong(searchTerm)
        await getTracks(); //we are going to get a json file with track-info
        showTrackInfo(trackInfo); // Just prints out a pretty list for track info. Canbe taken out or used to show the list which the user pick from
        const userPick = await getUserInput(); //Here is where the user pick from the list of similar tracks, then the number pick corresponse with the position in array list
        const seed = getTrackSeed(userPick); // Here we are going to get the trackSeed needed to get recommendations for spotify API
        await sendSeed(seed);
        await getRecs(seed);
        
        if (recsInfo.length > 0) {
            recsInfo.forEach((song) => {
                const songItem = document.createElement('li');
                
                const trackName = song.name;
                const albumName = song.album.name;
                const artists = song.artists.map(artist => artist.name);
                const releaseDate = song.album.release_date;
                const trackUrl = song.external_urls.spotify;
                const imageUrl = song.album.images[0].url;
                const duration = convertDuration(song.duration_ms);
                
                songItem.classList.add('song-rectangle');
                songItem.style.backgroundImage = `url(${imageUrl})`;
                songItem.addEventListener('click', () => {
                    window.open(trackUrl, '_blank');
                });

                songItem.innerHTML = `
                    <div class="song-details">
                        <div class="song-text">
                            <h1 class="song-artist">${artists} - ${trackName}</h1>
                            <p class="song-album">Album: ${albumName}</p>
                            <p class="song-genre">Release Date: ${releaseDate}</p>
                            <p class="song-length">Duration: ${duration}</p>
                        </div>
                    </div>
                `;
                songList.append(songItem);
            }); 

        
        } else {
            const noResultsItem = document.createElement('li');
            noResultsItem.textContent = 'Couldn\'t find any recommendations...';
            songList.append(noResultsItem);
        }
        
    }
});
const getUser = async () =>{
    //Gets the user name from 'getName' in app.js
    try{
        console.log('Getting UserName.....');
        const response = await fetch("http://localhost:8080/getName")
        const data = await response.text();
        console.log('User name ',data)
        userSpan.textContent = data;
    }
    catch(error){
        console.error('Error:', error);
    }
};

getUser(); // replace with whatever spotify api grabbed for username

logoutButton.addEventListener('click', () => {
    //logout stuff here
});

const sendSong = (songName) => {
    // Send the song Name the user entered to 'song-name' in app.js in order to fetch a list of songs
    console.log('Sending song name to server: '+ songName);
    fetch("http://localhost:8080/song-name", {
        method: 'POST',
        headers:{
            'Content-Type': 'text/plain'
        },
        body: songName
    })
    .then(response =>{
        console.log("Data sent sucessfully");
    })
    .catch(error =>{
        console.log('Error sending data: ',error);
    });
};

const getTracks = async () => {
    // Gets the tracks of songs that is related to that song name from 'tracks-info' in app.js
    // i.e: Shape of you might return Shape of you - rock, Shape of you - remix etc...
    try{
        console.log('Fetching Songs.....');
        const response = await fetch("http://localhost:8080/tracks-info",{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            }
        })
        const data =  await response.json();
        console.log('Data Recieved ', data);
        trackInfo = data.tracks.items;
    }
    catch(error) {
        console.error('Error:', error);
    }
};

const openDialog = () => {
    const modal = document.getElementById('dialog-modal');
    modal.style.display = 'block';

    const trackList = document.getElementById('track-list');
    trackList.innerHTML = '';

    trackInfo.forEach((track, index) => {
        const trackItem = document.createElement('li');
        trackItem.textContent = track.name;
        trackItem.addEventListener('click', () => {
            getUserInputCallback(index);
            modal.style.display = 'none';
        });

        trackList.appendChild(trackItem);
    });
};
const closeDialog = () => {
    const modal = document.getElementById('dialog-modal');
    modal.style.display = 'none';
};

const getUserInput = () => {
    return new Promise((resolve) => {
        const modal = document.getElementById('dialog-modal');
        const trackList = document.getElementById('track-list');

        trackList.innerHTML = '';

        trackInfo.forEach((track, index) => {
            const trackItem = document.createElement('li');
            const artistAndSong = `${track.artists[0].name} - ${track.name}`;
            trackItem.textContent = artistAndSong;
            trackItem.addEventListener('click', () => {
                resolve(index); // return user selected input
                modal.style.display = 'none';
            });

            trackList.appendChild(trackItem);
        });

        // Show the dialog
        modal.style.display = 'block';
    });
};

const getTrackSeed = (i) => {
    // This gets the trackInfo array and return the seed related to the i
    // This is here to implement the confirmation of which song you want to use.
    // The 'i' corresponds with the number in the array.
    // Note that this seed is needed to get recommendations in spotify
    console.log("Here's index: ",i)
    if (trackInfo && trackInfo[i]){
        return trackInfo[i].id;
      
    }
    else {
        console.error(`Invalid index: ${index}`);
        return null;
    }
};

const sendSeed = (trackSeed) => {
    // Here the seed is being sent to the 'track-seed' in app.js
    // This is needed to get the recommendations for spotify API
    console.log('Sending Track seed to server: '+ trackSeed);
    fetch("http://localhost:8080/track-seed", {
        method: 'POST',
        headers:{
            'Content-Type': 'text/plain'
        },
        body: trackSeed
    })
    .then(response =>{
        console.log("Data sent sucessfully");
    })
    .catch(error =>{
        console.log('Error sending data: ',error);
    });
};

const getRecs = async() => {
    // Here is where the browser is recieving the list of actual recommendations.
    // It is fetching the json file from 'call-rec' in app.js
    console.log('Fetching Songs.....');
    try{
        const response = await fetch("http://localhost:8080/call-rec",{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        console.log('Data Recieved ', data);
        recsInfo = data.tracks;
    }
    catch(error) {
        console.error('Error:', error);
    }
};

const showTrackInfo = (trackInfo) => {
    // Just prints out the track info
    // Could be used to get song confirmation or something?
    console.log("----------Track List --------------")

    for (let i = 0; i < trackInfo.length; i++){
        const trackName = trackInfo[i].name;
        const albumName = trackInfo[i].album.name;
        const artists = trackInfo[i].artists.map(artist => artist.name);
        const releaseDate = trackInfo[i].album.release_date;
        const trackUrl = trackInfo[i].external_urls.spotify;
        const imageUrl = trackInfo[i].album.images[0].url;
        const trackId = trackInfo[i].id;
    
        console.log(`Track Name: ${trackName}`);
        console.log(`Album Name: ${albumName}`);
        console.log(`Artists: ${artists.join(', ')}`);
        console.log(`Release Date: ${releaseDate}`);
        console.log(`Track URL: ${trackUrl}`);
        console.log(`Image URL: ${imageUrl}`);
        console.log(`Track ID: ${trackId}`);
    }
    console.log("_______ Track List Ends __________")
}
const showRecsInfo = (recsInfo) => {
    console.log("----------Recommendation List --------------")
    for (let i = 0; i < recsInfo.length; i++){
        const trackName = recsInfo[i].name;
        const albumName = recsInfo[i].album.name;
        const artists = recsInfo[i].artists.map(artist => artist.name);
        const releaseDate = recsInfo[i].album.release_date;
        const trackUrl = recsInfo[i].external_urls.spotify;
        const imageUrl = recsInfo[i].album.images[0].url;
        const trackId = recsInfo[i].id;
    
        console.log(`Track Name: ${trackName}`);
        console.log(`Album Name: ${albumName}`);
        console.log(`Artists: ${artists.join(', ')}`);
        console.log(`Release Date: ${releaseDate}`);
        console.log(`Track URL: ${trackUrl}`);
        console.log(`Image URL: ${imageUrl}`);
        console.log(`Track ID: ${trackId}`);
    }
    console.log("_______ Recommendations List Ends __________")
}