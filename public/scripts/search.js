const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const userSpan = document.getElementById('user');
const logoutButton = document.getElementById('logout-button');
const songList = document.getElementById('song-list');

let trackInfo;

searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== '') {
        // Clear previous search results
        songList.innerHTML = '';        
        // for this we're going to implement our own algorithim to search through songs, but for now this is for the general idea
        sendSong(searchTerm);
        console.log(searchTerm);
        getTracks();
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
    }
});


const userName = "Justin Kong"; // replace with whatever spotify api grabbed for username
userSpan.textContent = userName;

logoutButton.addEventListener('click', () => {
    //logout stuff here
});

// just an example function to show what we'd need to grab for each songs and to display them
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

const sendSong = (songName) => {
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

const getTracks = () => {
    console.log('Fetching Songs.....');
    fetch("http://localhost:8080/tracks-info",{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data =>{
        console.log('Data Recieved ', data);
        trackInfo = data.tracks.items;

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
         // Gets the seed of the first track in result. 
        // the number represents which track you want to get recs for
        const seed = getTrackSeed(0);
        console.log("The seed is " + seed);
        sendSeed(seed);
        getRecs();
    })
    .catch(error => {
        console.error('Error:', error);
    })
};

const getTrackSeed = (i) => {
    if (trackInfo && trackInfo[i]){
        return trackInfo[i].id;
      
    }
    else {
        console.error(`Invalid index: ${index}`);
        return null;
    }
};

const sendSeed = (trackSeed) => {
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

const getRecs = () => {
    console.log('Fetching Songs.....');
    fetch("http://localhost:8080/call-rec",{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data =>{
        console.log("----------Recommendation List --------------")
        console.log('Data Recieved ', data);
        recInfo = data.tracks;

        for (let i = 0; i < recInfo.length; i++){
            const trackName = recInfo[i].name;
            const albumName = recInfo[i].album.name;
            const artists = recInfo[i].artists.map(artist => artist.name);
            const releaseDate = recInfo[i].album.release_date;
            const trackUrl = recInfo[i].external_urls.spotify;
            const imageUrl = recInfo[i].album.images[0].url;
            const trackId = recInfo[i].id;
        
            console.log(`Track Name: ${trackName}`);
            console.log(`Album Name: ${albumName}`);
            console.log(`Artists: ${artists.join(', ')}`);
            console.log(`Release Date: ${releaseDate}`);
            console.log(`Track URL: ${trackUrl}`);
            console.log(`Image URL: ${imageUrl}`);
            console.log(`Track ID: ${trackId}`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    })
};