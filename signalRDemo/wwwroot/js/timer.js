"use strict"
window.onload = function () {
    var connection = new signalR.HubConnectionBuilder().withUrl("/chathub").withAutomaticReconnect([0, 1000, 5000, null]).build();


    document.getElementById("timerButton").addEventListener("click", function (event) {
       connection.invoke("StartTimer").catch(function (err) {
            return console.error(err.toString());
        });
       
        event.preventDefault();
    });

    document.getElementById("streamingButton").addEventListener("click", function (event) {
        connection.stream("ServerTimer", 10, 500)
            .subscribe({
                next: (item) => {
                    var counter = document.getElementById('counter');
                    counter.innerText = item;
                },
                complete: () => {
                },
                error: (err) => {
                },
            });
        event.preventDefault();
    });

    document.getElementById("button1").addEventListener("click", function (event) {
        connection.invoke("Func1").catch(function (err) {
            return console.error(err.toString());
        });
    });

    document.getElementById("button2").addEventListener("click", function (event) {
        connection.invoke("Func2").catch(function (err) {
            return console.error(err.toString());
        });
    });


    connection.on("ReceiveStartTimer", function (time) {
        var counter = document.getElementById('counter');
        counter.innerText = time;
    });

    connection.on("ReceiveFunc1", function () {
        alert('function 1 invoked!');
    });

    connection.on("ReceiveFunc2", function () {
        alert('function 2 invoked!');
    });

    connection.start().then(function () {
    }).catch(function (err) {
        return console.error(err.toString());
    });

};
