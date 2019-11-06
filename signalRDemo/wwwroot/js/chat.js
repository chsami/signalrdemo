"use strict";
window.onload = function () {
    var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").withAutomaticReconnect([0, 1000, 5000, null]).build();

    //Disable send button until connection is established
    var button = document.getElementById("sendButton");
    var groupButton = document.getElementById("sendGroupButton");
    if (button && groupButton) {
        button.disabled = true;
        button.addEventListener("click", function (event) {
            var user = document.getElementById("userInput").value;
            var message = document.getElementById("messageInput").value;
            connection.invoke("SendMessage", user, message).catch(function (err) {
                return console.error(err.toString());
            });
            event.preventDefault();
        });
        groupButton.addEventListener("click", function (event) {
            var group = document.getElementById("groupInput").value;
            var message = document.getElementById("messageInput").value;
            connection.invoke("SendGroup", group, message).catch(function (err) {
                return console.error(err.toString());
            });
            event.preventDefault();
        });
    }

    connection.onclose((error) => {
        console.assert(connection.state === signalR.HubConnectionState.Disconnected);

        document.getElementById("messageInput").disabled = true;

        const li = document.createElement("li");
        li.textContent = `Connection closed due to error "${error}". Try refreshing this page to restart the connection.`;
        document.getElementById("messagesList").appendChild(li);
    });

    connection.onreconnecting((error) => {
        console.assert(connection.state === signalR.HubConnectionState.Reconnecting);

        document.getElementById("messageInput").disabled = true;

        const li = document.createElement("li");
        li.textContent = `Connection lost due to error "${error}". Reconnecting.`;
        document.getElementById("messagesList").appendChild(li);
    });

    connection.onreconnected((connectionId) => {
        console.assert(connection.state === signalR.HubConnectionState.Connected);

        document.getElementById("messageInput").disabled = false;

        const li = document.createElement("li");
        li.textContent = `Connection reestablished. Connected with connectionId "${connectionId}".`;
        document.getElementById("messagesList").appendChild(li);
    });

    connection.on("ReceiveMessage", function (user, message) {
        if (user === 'controller') {
            return alert(user + " says " + message);
        }
        var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var encodedMsg = msg;
        var li = document.createElement("li");
        li.textContent = encodedMsg;
        document.getElementById("messagesList").appendChild(li);
    });



    connection.start().then(function () {
        if (button)
            button.disabled = false;
    }).catch(function (err) {
        return console.error(err.toString());
    });
   
}
