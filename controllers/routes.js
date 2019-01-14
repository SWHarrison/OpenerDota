module.exports = app => {

    app.get('/', (req, res) => {
        //var currentUser = req.user;
        //console.log(req.user)
        res.render("home.handlebars");
    });

    app.get('/new-data', (req, res) =>{
        res.render("new-data.handlebars")
    })

    /*app.post('/new-data', (req, res) => {

        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        const axios = require('axios');
        let matchIDs = [];
        let matchItemTime = [];
        let matchWin = [];

        let player = req.body.player_id;
        let hero_id = req.body.hero_id;
        let item_name = req.body.item_name;

        requestMatchesHero(player,hero_id,8,item_name).then(data => {
            console.log(matchItemTime);
            console.log(matchWin);
            let max = [Math.max(...matchItemTime)/10]
            let matchData = [];
            for(let i = 0; i<max; i++){
                matchData.push({
                    "wins": 0,
                    "loses": 0
                })
            }
            for(let index = 0; index<matchItemTime.length; index++){
                if(matchWin[index] == 1){
                    matchData[Math.floor(matchItemTime[index]/10)].wins += 1;
                } else {
                    matchData[Math.floor(matchItemTime[index]/10)].loses += 1;
                }
            }
            res.render('new-graph', { matchData });
        });

        function request_player(id) {
            var url = 'https://api.opendota.com/api/players/' + id;
            axios.get(url).then(function(responseData){
                console.log(responseData.data.profile.personaname);
                player = responseData.data;
            });
        }

        function requestMatchesHero(id, hero_id, days, item) {
            var url = 'https://api.opendota.com/api/players/' + id + '/matches?hero_id=' + hero_id +'&date=' + days;
            return axios.get(url).then(function(responseData){
                for(let i = 0; i <responseData.data.length; i++){
                    matchIDs.push(responseData.data[i].match_id);
                    let matchData = requestMatch(responseData.data[i].match_id);
                    let index = -999;

                    for(let playerSlot = 0; playerSlot < 10; playerSlot++){
                        if(matchData.players[playerSlot].account_id == id){
                            index = playerSlot;
                            break;
                        }
                    }

                    let firstPurchases = matchData.players[index].first_purchase_time;
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
    });*/

    // ==============================================================
    // Handle requests with JS

    app.post('/new-data-api', (req, res) => {

        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        const axios = require('axios');
        let matchIDs = [];
        let matchItemTime = [];
        let matchWin = [];
        let timeInterval = 20

        // Collect data send from the browser
        let player = req.body.player_id;
        let hero_id = req.body.hero_id;
        let item_name = req.body.item_name;
        // Lets take a look at this before we work with it.
        console.log('Recieving Data:')
        console.log(player, hero_id, item_name)
        console.log(req.body)

        requestMatchesHero(player,hero_id,item_name).then(data => {
            console.log(matchItemTime);
            console.log(matchWin);
            let max = [Math.max(...matchItemTime)/timeInterval]
            let matchData = [];
            for(let i = 0; i<max+1; i++){
                matchData.push({
                    "wins": 0,
                    "loses": 0
                })
            }
            for(let index = 0; index<matchItemTime.length; index++){
                if(matchWin[index] == 1){
                    matchData[Math.floor(matchItemTime[index]/timeInterval)+1].wins += 1;
                } else {
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
