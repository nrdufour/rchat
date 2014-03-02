'use strict';

angular.module('chatApp.controllers', []).
 
    controller('PeerCtrl', function ($scope) {
        var peer = new Peer({
            host: 'signal.nemoworld.info',
            port: 9999,
            config: {'iceServers': [
                { url: 'stun:stun.l.google.com:19302' }
            ]}
        });

        $scope.peer = peer;
        $scope.peerid = "none";

        peer.on('open', function(id) {
            console.log("setting the id to "+id);
            $scope.$apply(function() {
                $scope.peerid = id;
            });
        });

        peer.on('connection', function(dataConnection) {
            $scope.$apply(function() {
                console.log("Received connection from: "+dataConnection.peer);

                dataConnection.on("data", function(data) {
                    $scope.$apply(function() {
                        console.log("received a message!", data)
                        $scope.chat.push(data);
                    })
                });

                $scope.conns[dataConnection.peer] = {
                    "peer" : dataConnection.peer,
                    "conn" : dataConnection
                }
            });
        });

        $scope.conns = {};

        $scope.connectTo = function() {
            console.log("Connecting to peer id: " + $scope.destid);
            var conn = $scope.peer.connect($scope.destid);

            conn.on("open", function() {
                $scope.$apply(function() {
                    console.log("now connected with "+conn.peer);

                    conn.on("data", function(data) {
                        $scope.$apply(function() {
                            console.log("received a message!", data)
                            $scope.chat.push(data);
                        })
                    });

                    $scope.conns[conn.peer] = {
                        "peer" : conn.peer,
                        "conn" : conn
                    }
                });
            });
        };

        $scope.isMyself = function(text) {
            if(text == $scope.peer.id) {
                return "me";
            }
            return text;
        }

        $scope.chat = [];
        $scope.sendMsg = function() {
            var msg = {
                "id": $scope.peer.id,
                "msg": $scope.chatText
            };
            $scope.chat.push(msg);

            // push to the peers
            for(var id in $scope.conns) {
                var conn = $scope.conns[id].conn;
                console.log("Sending message to ", $scope.conns[id].peer);
                console.log("is connected?", $scope.conns[id].conn.open);
                conn.send(msg);
            }

            $scope.chatText = "";
        };
    })
;
