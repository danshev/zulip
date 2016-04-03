'use strict';

// This file is rendered as a template when the browser calls:
//
//      navigator.serviceWorker.register("/service-worker.js") ... see notifications.js
//
//  This file is cached locally and runs in the background to handle messages received from GCM.
//      It needs to be entirely self-contained (i.e. it cannot reference functions that are not
//      either declared within this file or included).

// A few things are passed as URL parameters (from notification.js) in order to make this work:
//  The basic format is:  your-domain.com/service-worker.js?email:api_key-hostname
var passed_params = location.search.substring(1).split('-');

//  Email and API-key are passed so to allow background calls from the Service Worker to be
//      performed in an authenticated manner using the Zulip's API authentiation method (more below).
var email_and_api_key = passed_params[0];
var b64_encoded_auth_data = btoa(email_and_api_key);

// Hostname is passed so that, later, when a User clicks on a notification, the Service Worker knows
//  which hostname to search for when determining if a browser window is already looking at our domain.
var hostname = passed_params[1];

self.addEventListener("push", function(event) {  
    event.waitUntil(  
        fetch("/api/v1/users/me/pickup_web_notification", {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "BASIC "+ b64_encoded_auth_data    // <--- Zulip's auth format
            },
            "credentials": "include"
        }).then(function(response) {  
            if (response.status !== 200) {  
                console.error("Looks like there was a problem; status code: " + response.status);  
                throw new Error();  
            }
      
            // `data` is json served up from the /pickup_web_notification endpoint
            //  In the notificationClick function (below), client.postMessage() uses
            //  cross-window messaging (? I think) to post a message, but DOES NOT INCLUDE
            //  the `domain` key, which prevents us from blocking non-ourDomain.com messages --
            //  which is a major security concern.  Current solution:  /pickup_web_notification
            //  passes back the User's current API-key, and we validate on this (more later).
            return response.json().then(function(data) {
                if (data.api_key == null) {
                    throw new Error("api_key not included in payload"); 
                }
                return self.registration.showNotification(data.title, {  
                    body: data.body,  
                    icon: "/static/images/favicon/android-chrome-192x192.png",  
                    tag: data.tag,
                    data: { raw_operators: data.raw_operators, "api_key": data.api_key }
                });  
            });
        }).catch(function(err) {  
            console.error("Error retrieving data:", err);
            return self.registration.showNotification("Zulip", {  
                "body": "Received a notification, but you need to be signed-in to view it!",
                "icon": "/static/images/favicon/android-chrome-192x192.png"
            });  
        })  
    );  
});

self.addEventListener("notificationclick", function(event) {
    console.log("Notification clicked: ", event.notification.tag);
    // Android doesn’t close the notification when you click on it -- http://crbug.com/463146
    event.notification.close();
  
    // This looks to see if the window is already open and focuses if it is
    event.waitUntil(clients.matchAll({
        includeUncontrolled: true, 
        type: 'window'
    }).then(function(clientList) {

        var raw_operators = event.notification.data.raw_operators;

        clientList.forEach(function(client) {
            if (client.url.includes(hostname)) {
                
                // A browser is is viewing our website, so use cross-window messaging
                //  to send a message, which will be "heard" by the listener (in notifications.js)
                //  and respond.
                client.postMessage({
                    "message": "narrow",
                    "raw_operators": raw_operators,
                    "api_key": event.notification.data.api_key
                });
                return client.focus();
            }
        });

        // If we get here, then an existing browser window [at our domain] was
        //  NOT open --> open one, specifying an appropriate URL
        if (clients.openWindow) {
            var url = "/"+ operators_to_hash(raw_operators);
            return clients.openWindow(url);   
        }
    }));
});

function encodeHashComponent (str) {
    return encodeURIComponent(str)
        .replace(/\./g, '%2E')
        .replace(/%/g,  '.');
};

function decodeHashComponent(str) {
    return decodeURIComponent(str.replace(/\./g, '%'));
}

function operators_to_hash (operators) {
    var hash = '#';

    if (operators !== undefined) {
        hash = '#narrow';
        operators.forEach(function(elem) {
            // Support legacy tuples.
            var operator = elem.operator;
            var operand = elem.operand;

            var sign = elem.negated ? '-' : '';
            hash += '/' + sign + encodeHashComponent(operator)
                  + '/' + encodeHashComponent(operand);
        });
    }

    return hash;
};