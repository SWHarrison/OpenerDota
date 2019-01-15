const jwt = require('jsonwebtoken');
const User = require("../models/user");

module.exports = app => {

    //Home Page
    app.get('/', (req, res) => {
        var currentUser = req.user;
        console.log(currentUser)
        res.render("home.handlebars", { currentUser });
    });

    /*app.get('/new-data', (req, res) =>{
        res.render("new-data.handlebars")
    })*/

    // SIGN UP FORM
    app.get("/sign-up", (req, res) => {
        res.render("sign-up.handlebars");
    });

    // SIGN UP POST
    app.post("/sign-up", (req, res) => {
    // Create User and JWT
        const user = new User(req.body);

        user.save().then((user) => {
            var token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: "60 days" });
            res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
            res.redirect('/');
        })
        .catch(err => {
            console.log(err.message);
            return res.status(400).send({ err: err });
        });
    });

    // LOGOUT
    app.get('/logout', (req, res) => {
        res.clearCookie('nToken');
        res.redirect('/');
    });

    // LOGIN FORM
    app.get('/login', (req, res) => {
        res.render('login');
    });

    // LOGIN
    app.post("/login", (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        // Find this user name
        User.findOne({ username }, "username password")
            .then(user => {
                if (!user) {
                    // User not found
                    return res.status(401).send({ message: "Wrong Username or Password" });
                }
                // Check the password
                user.comparePassword(password, (err, isMatch) => {
                    if (!isMatch) {
                        // Password does not match
                        return res.status(401).send({ message: "Wrong Username or password" });
                    }

                    // Create a token
                    const token = jwt.sign({ _id: user._id, username: user.username }, process.env.SECRET, {
                        expiresIn: "60 days"
                    });
                    // Set a cookie and redirect to root
                    res.cookie("nToken", token, { maxAge: 900000, httpOnly: true });
                    res.redirect("/");
                });
            })
            .catch(err => {
                console.log(err);
            });
    });

    // ==============================================================
    // Handle requests with JS
    // Sends data after request of relevant match data
    app.post('/new-data-api', (req, res) => {

        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        const axios = require('axios');
        let matchIDs = [];
        let matchItemTime = [];
        let matchWin = [];
        let timeInterval = 20

        // Collect data to send from the browser
        let player = req.body.player_id;
        let hero_id = req.body.hero_id;
        let item_name = req.body.item_name;
        // Check parameters
        console.log('Recieving Data:')
        console.log(player, hero_id, item_name)
        console.log(req.body)
        //Gets matches of a specfic hero
        requestMatchesHero(player,hero_id,item_name).then(data => {
            console.log(matchItemTime);
            console.log(matchWin);
            let max = Math.max(...matchItemTime)/timeInterval
            console.log("max")
            console.log(max+2)
            let matchData = [];
            for(let i = 0; i<max+1; i++){
                matchData.push({
                    "wins": 0,
                    "loses": 0
                })
            }
            console.log(matchData.length)
            console.log(matchData)
            for(let index = 0; index<matchItemTime.length; index++){
                if(matchWin[index] == 1){
                    matchData[Math.floor(matchItemTime[index]/timeInterval)+1].wins += 1;
                } else {
                    console.log((matchItemTime[index]/timeInterval)+1)
                    matchData[Math.floor(matchItemTime[index]/timeInterval)+1].loses += 1;
                }
            }
            // Return the data to the browser.
            res.json({ matchData });
        });

        function request_player(id) {
            var url = 'https://api.opendota.com/api/players/' + id;
            axios.get(url).then(function(responseData){
                console.log(responseData.data.profile.personaname);
                player = responseData.data;
            });
        }

        function requestMatchesHero(id, hero_id, item) {
            var url = 'https://api.opendota.com/api/players/' + id + '/matches?hero_id=' + hero_id +'&limit=23';
            return axios.get(url).then(function(responseData){
                for(let i = 0; i <responseData.data.length; i++){
                    matchIDs.push(responseData.data[i].match_id);
                    let matchData = requestMatch(responseData.data[i].match_id);
                    console.log(matchData.match_id);
                    let index = -999;

                    for(let playerSlot = 0; playerSlot < 10; playerSlot++){
                        if(matchData.players[playerSlot].account_id == id){
                            index = playerSlot;
                            break;
                        }
                    }

                    let firstPurchases = matchData.players[index].first_purchase_time;
                    console.log(firstPurchases)
                    if(firstPurchases[item]){
                        matchItemTime.push(firstPurchases[item]);
                    } else {
                        matchItemTime.push(0);
                    }
                    matchWin.push(matchData.players[index].win);
                }
                return;
            })

        }

        function requestMatch(id){
            var url = 'https://api.opendota.com/api/matches/' + id;
            var http_request = new XMLHttpRequest();
            http_request.open("GET", url, false);
            http_request.responseType = "json";
            http_request.send();
            var raw = JSON.parse(http_request.responseText);
            return raw;
        }
    });
};
