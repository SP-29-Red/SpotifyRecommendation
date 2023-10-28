const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const userSpan = document.getElementById('user');
const logoutButton = document.getElementById('logout-button');
const songList = document.getElementById('song-list');

let trackInfo;
let username;
let recsInfo;
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
        showRecsInfo(recsInfo); //Here I'm printing out the recommendation info. This can be changed to put information on screen or taken out  

        /*
        if (results.length > 0) {
            results.forEach((song) => {
                const songItem = document.createElement('li');

                songItem.classList.add('song-rectangle');
                songItem.style.backgroundImage = `url(${song.image})`;
                songItem.addEventListener('click', () => {
                    window.open(song.spotifyLink, '_blank');
                });

                songItem.innerHTML = `
                    <div class="song-details">
                        <div class="song-text">
                            <h1 class="song-artist">${song.artist} - ${song.title}</h1>
                            <p class="song-album">Album: ${song.album}</p>
                            <p class="song-genre">Genre: ${song.genre}</p>
                            <p class="song-length">Length: ${song.length}</p>
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
        */
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

// just an example function to show what we'd need to grab for each songs and to display them
/*
function searchSongs(searchTerm) {
    const songs = [
        {
            title: "Song 1",
            artist: "Artist 1",
            genre: "Genre 1",
            length: "3:45",
            image: "https://upload.wikimedia.org/wikipedia/en/7/70/Lil_Mosey_-_Certified_Hitmaker.png",
            spotifyLink: "https://spotify.com/link",
        },
        {
            title: "Song 2",
            artist: "Artist 2",
            genre: "Genre 2",
            length: "4:20",
            image: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/04/e2/7d/04e27d0d-be47-784a-aa80-2dacf1f0d0c4/18UMGIM66997.rgb.jpg/1200x1200bb.jpg",
            spotifyLink: "https://spotify.com/link",
        },
    ];

    return songs.filter(song => song.title.toLowerCase().includes(searchTerm.toLowerCase()));
};
*/

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

const getUserInput = async () => {
    // corresponds to getTrackSeed().
    // returns the final pick for the song she want recommended.
    // This method could be used to show the trackInformation on the screen or be taken out and moved to showTrackInfo
    const userInput = 0;
    console.log("Here's the input: ", userInput);
    return userInput;
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