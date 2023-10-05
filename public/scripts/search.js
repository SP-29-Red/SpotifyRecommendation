const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const userSpan = document.getElementById('user');
const logoutButton = document.getElementById('logout-button');
const songList = document.getElementById('song-list');

searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== '') {

        // for this we're going to implement our own algorithim to search through songs, but for now this is for the general idea
        const results = searchSongs(searchTerm);

        // Clear previous search results
        songList.innerHTML = '';

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
}
