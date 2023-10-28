const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const userSpan = document.getElementById('user');
const logoutButton = document.getElementById('logout-button');
const songList = document.getElementById('song-list');

let trackInfo;
let username
searchButton.addEventListener('click', async () => {
    search();
})
async function search() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== '') {
        // Clear previous search results
        songList.innerHTML = '';        
        // for this we're going to implement our own algorithim to search through songs, but for now this is for the general idea
        await sendSong(searchTerm);
        //console.log(searchTerm);
        const results = await getTracks();
        console.log(results);
        if (results.length > 0) {
            results.forEach((song) => {
                
                const trackName = song.name;
                const albumName = song.album.name;
                const artists = song.artists.map(artist => artist.name);
                const releaseDate = song.album.release_date;
                const trackUrl = song.external_urls.spotify;
                const imageUrl = song.album.images[0].url;
                const trackId = song.id;
                
                const songItem = document.createElement('li');

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
                            <p class="song-length">Track ID: ${trackId}</p>
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
};

const getUser = () =>{
    console.log('Getting UserName.....');
    fetch("http://localhost:8080/getName")
    .then(response => { return response.text();})
    .then(data => {
        console.log('User name ',data)
        userSpan.textContent = data;

    })
    .catch(error => {
        console.error('Error:', error);
    })
};
getUser(); // replace with whatever spotify api grabbed for username

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

const getTracks = async () => {
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
        //const trackID = trackInfo[0].id
        /*
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
        }*/
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

const getRecs = async () => {
    console.log('Fetching Songs for Recommendation.....');

    try {
        const response = await fetch("http://localhost:8080/call-rec", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        console.log("----------Recommendation List --------------");
        console.log('Data Received ', data);
        
        return data.tracks;
    } catch (error) {
        console.error('Error:', error);
    }
};