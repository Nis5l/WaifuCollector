const request = require('request');

var token = "AIzaSyAoP8mZ2N0f7iN8ff5UC2atkMpc7DtBBpM";
var cx="e1b3946be0b180ba6"

https://www.googleapis.com/customsearch/v1?key=AIzaSyAoP8mZ2N0f7iN8ff5UC2atkMpc7DtBBpM&cx=e1b3946be0b180ba6&q=test

request.get(
    "https://www.googleapis.com/customsearch/v1?key=" + token + "&cx=" + cx + "&q=test",
    (error, response, body) => 
    {
        if (!error && response.statusCode == 200) {
            var json = JSON.parse(body);
            console.log(json.items);
            // for (var i = 0; i < response.body.items.length; i++) {
            //     var item = response.body.items[i];
            //     // in production code, item.htmlTitle should have the HTML entities escaped.
            //     document.getElementById("content").innerHTML += "<br>" + item.htmlTitle;
            //     console.log(item);
            //   }
            // //console.log(body);
            // token = body.token;
        }
    }
);