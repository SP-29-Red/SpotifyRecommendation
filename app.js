require('dotenv').config()

const express = require('express'); // Express web server framework
const querystring = require('querystring'); // Produces a URL query string from obj 
const axios = require('axios');
const { error } = require('console');
const path = require('path');
const bodyParser = require('body-parser');


const app = express();
const port = 8080;

const CLIENT_ID = process.env.clientId; // Client id for authorization
const CLIENT_SECRET = process.env.clientSecret; // Client secret for authorization 
const REDIRECT_URI = process.env.redirectUri;  // after user login or denies they are redirected here

app.use(express.static('public'));
app.use(bodyParser.text());


let token_typeP
let access_tokenP
let username
let songName
let encodedSongName
let trackInfo
let trackSeed
let recsInfo

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const stateKey = 'spotify_auth_state';

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});
// login page will redirect the user to the spotify login page

app.get('/login', (req, res) => {

    const state = generateRandomString(16); // protects website against attacks =]
    res.cookie(stateKey, state);

    const scope = 'user-read-private user-read-email'; //access detail about user 

    const queryParams = querystring.stringify({
        client_id : CLIENT_ID,
        response_type : 'code',
        redirect_uri : REDIRECT_URI, 
        state : state,
        scope : scope
    });

    //passes in the required parameters to be redirected to spotify's login page. 
    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);

})

// After login this is where the user will be redirected to callback
app.get('/callback', (req, res) => {
    const code = req.query.code || null;
  
    axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    })
    .then(response => {
      if (response.status === 200) {
        const { access_token, token_type } = response.data;
        access_tokenP = access_token
        token_typeP = token_type
        axios.get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `${token_type} ${access_token}`
          }
        })
          .then(response => {
            //res.send(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
            username = response.data.display_name;
            res.redirect('/test-1')
          })
          .catch(error => {
            res.send(error);
          });
  
      } else {
        res.send(response);
      }
    })
    .catch(error => {
      res.send(error);
    });
  });
app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`); //runs on the local host
});

app.get('/refresh_token', (req, res) => {
  const { refresh_token } = req.query;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
  })
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      res.send(error);
    });
});

app.get('/search', (req, res) => {
  const { query } = req.query;
  if (access_tokenP == "undefined"){
    res.redirect(' http://localhost:${port}')
  }
  axios.get('https://api.spotify.com/v1/search', {
      params: {
          q: query,
          type: 'track',
          market: 'US',
          limit: 10
      },
      headers: {
          Authorization: `${token_typeP} ${access_tokenP}`
      }
  })
  .then(response => {
    res.send(response.data);
    console.log('------------------------------');
    console.log(response.data);
    console.log('--------------------------')
  })
  .catch(error => {
      res.send(error);
  });
});
app.get('/get-recs', (req, res) => {
  console.log("Query on line 171: " + req.query);  
  const { seed_track } = req.query;
  console.log("Seed Track on line 173: " + seed_track);
  console.log("Testing: "+access_tokenP +"   ,");
  console.log("Testing: "+token_typeP +"    ,");
  axios.get('https://api.spotify.com/v1/recommendations', {
      params: {
          seed_tracks: seed_track,
          market: 'US',
          limit: 10
      },
      headers: {
          Authorization: `${token_typeP} ${access_tokenP}`
      }
  })
  .then(response => {
      res.send(response.data);
      console.log(response.data.name)
  })
  .catch(error => {
      res.send(error);
  });
});

app.get('/testing', (req, res) => {
  console.log(req.body);
});
app.get('/test-1',(req,res) => {
  // needs to send the usename somehow through here
  res.sendFile(path.join(__dirname, 'public/search.html'));
  console.log(username + " Testing Surely")
})
app.post('/song-name',(req,res)=>{
  console.log('Received request:', req.body);
  songName = req.body;
  console.log('Received data: ', songName);
  encodedSongName = encodeURIComponent(songName);
  console.log(encodedSongName);
});

app.post('/tracks-info', (req,res) =>{
  axios.get('http://localhost:8080/search',{
    params:{
      query: encodedSongName
    }
  })
  .then(response => {
    console.log('response recieved');
    console.log(response.data); 
    console.log("------------PARSED------------------");

    
    trackInfo = response.data.tracks.items;
    if (!response.data || !response.data.tracks || !response.data.tracks.items){
        console.error("Unexpected response from the Spotify API")
        return res.status(404).send("unexpected")
    }
    console.log("Track info: ");
    console.log(trackInfo);
    console.log("------------------")
    console.log(trackInfo[1])
    
    console.log("-----------Specific infor-----------")
      
        const trackName = trackInfo[1].name;
        const albumName = trackInfo[1].album.name;
        const artists = trackInfo[1].artists.map(artist => artist.name);
        const releaseDate = trackInfo[1].album.release_date;
        const trackUrl = trackInfo[1].external_urls.spotify;
        const imageUrl = trackInfo[1].album.images[0].url;
        const trackId = trackInfo[1].id;
      
        console.log(`Track Name: ${trackName}`);
        console.log(`Album Name: ${albumName}`);
        console.log(`Artists: ${artists.join(', ')}`);
        console.log(`Release Date: ${releaseDate}`);
        console.log(`Track URL: ${trackUrl}`);
        console.log(`Image URL: ${imageUrl}`);
        console.log(`Track ID: ${trackId}`);
        res.send(response.data);
  })
  .catch(error => {
    res.send(error);
  });
});

app.post('/track-seed', (req,res) => {
 console.log("---------- Recs Part Begin ----------------")
  console.log('Received request:', req.body);
  trackSeed = req.body;
  console.log('Received data: ', trackSeed);
});
app.post('/call-rec', (req,res) => {
    console.log("Track Seed Line 262: "+ trackSeed);
    axios.get('http://localhost:8080/get-recs',{
    params:{
      seed_track: trackSeed
    }
  })
  .then(response => {
    console.log('Rec response recieved');
    console.log(response.data); 
    console.log("------- Recommendations ---------------");

    /*
    
    recsInfo = response.data.tracks[0];
    if (!response.data || !response.data.tracks || !response.data.tracks.items){
        console.error("Unexpected response from the Spotify API")
        return res.status(404).send("unexpected")
    }
    console.log("Rec info: ");
    console.log(recsInfo);
    console.log("------------------")
    console.log(recsInfo[1])
    
    console.log("-----------Specific infor for Recs-----------")
      
        const trackName = recsInfo[1].name;
        const albumName = recsInfo[1].album.name;
        const artists = recsInfo[1].artists.map(artist => artist.name);
        const releaseDate = recsInfo[1].album.release_date;
        const trackUrl = recsInfo[1].external_urls.spotify;
        const imageUrl = recsInfo[1].album.images[0].url;
        const trackId = recsInfo[1].id;
        const seed = recsInfo[1].album.external_urls.spotify.split('/').pop();
      
        console.log(`Track Name: ${trackName}`);
        console.log(`Album Name: ${albumName}`);
        console.log(`Artists: ${artists.join(', ')}`);
        console.log(`Release Date: ${releaseDate}`);
        console.log(`Track URL: ${trackUrl}`);
        console.log(`Image URL: ${imageUrl}`);
        console.log(`Track ID: ${trackId}`);
        console.log(`Seed: ${seed}`);
        */
        res.send(response.data);
  })
  .catch(error => {
    res.send(error);
  });
});
