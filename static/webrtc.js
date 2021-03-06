/**
 * Created by chad on 5/1/16.
 */

var signalling_server_hostname = location.hostname || "192.168.100.31";
var signalling_server_address = signalling_server_hostname + ':' + (location.port || 80);

var ws = null;
var pc;
var audio_video_stream;
var pcConfig = {"iceServers": [
    {"urls": ["stun:stun.l.google.com:19302", "stun:" + signalling_server_hostname + ":3478"]}
]};
var pcOptions = {
    optional: [
        {DtlsSrtpKeyAgreement: true}
    ]
};
var mediaConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: false, //ToDo: hook up a microphone
        OfferToReceiveVideo: true
    }
};

RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
var URL =  window.URL || window.webkitURL;

function createPeerConnection() {
    try {
        var pcConfig_ = pcConfig;
        console.log(JSON.stringify(pcConfig_));
        pc = new RTCPeerConnection(pcConfig_, pcOptions);
        pc.onicecandidate = onIceCandidate;
        pc.onaddstream = onRemoteStreamAdded;
        pc.onremovestream = onRemoteStreamRemoved;
        console.log("peer connection successfully created!");
    } catch (e) {
        console.log("createPeerConnection() failed");
    }
}

function onIceCandidate(event) {
    if (event.candidate) {
        var candidate = {
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        };
        var command = {
            command_id: "addicecandidate",
            data: JSON.stringify(candidate)
        };
        ws.send(JSON.stringify(command));
    } else {
        console.log("End of candidates.");
    }
}

function onRemoteStreamAdded(event) {
    console.log("Remote stream added:", URL.createObjectURL(event.stream));
    var remoteVideoElement = document.getElementById('remote-video');
    remoteVideoElement.src = URL.createObjectURL(event.stream);
    remoteVideoElement.play();
}

function onRemoteStreamRemoved(event) {
    var remoteVideoElement = document.getElementById('remote-video');
    remoteVideoElement.src = '';
}

function startWebrtc() {
    if ("WebSocket" in window) {
        server = signalling_server_address; //ToDo: get rid of this var
        server = "192.168.100.31:8080";

        var protocol = location.protocol === "https:" ? "wss:" : "ws:";
        console.log(protocol + '//' + server + '/stream/webrtc');
        ws = new WebSocket(protocol + '//' + server + '/stream/webrtc');
        //ws = new WebSocket('wss://192.168.31.8080/stream/webrtc');

        function offer(stream) {
            createPeerConnection();
            if (stream) {
                pc.addStream(stream);
            }
            var command = {
                command_id: "offer",
                options: {
                    //force_hw_vcodec: document.getElementById("remote_hw_vcodec").checked,
                    //vformat: document.getElementById("remote_vformat").value
                }
            };
            ws.send(JSON.stringify(command));
            console.log("offer(), command=" + JSON.stringify(command));
        }

        ws.onopen = function () {
            console.log("onopen()");
            localConstraints = {audio: false, video: false};
            offer();
        };

        ws.onmessage = function (evt) {
            var msg = JSON.parse(evt.data);
            //console.log("message=" + msg);
            console.log("type=" + msg.type);

            switch (msg.type) {
                case "offer":
                    pc.setRemoteDescription(new RTCSessionDescription(msg),
                        function onRemoteSdpSuccess() {
                            console.log('onRemoteSdpSucces()');
                            pc.createAnswer(function (sessionDescription) {
                                pc.setLocalDescription(sessionDescription);
                                var command = {
                                    command_id: "answer",
                                    data: JSON.stringify(sessionDescription)
                                };
                                ws.send(JSON.stringify(command));
                                console.log(command);

                            }, function (error) {
                                alert("Failed to createAnswer: " + error);

                            }, mediaConstraints);
                        },
                        function onRemoteSdpError(event) {
                            alert('Failed to set remote description (unsupported codec on this browser?): ' + event);
                            stop();
                        }
                    );

                    var command = {
                        command_id: "geticecandidate"
                    };
                    console.log(command);
                    ws.send(JSON.stringify(command));
                    break;

                case "answer":
                    break;

                case "message":
                    alert(msg.data);
                    break;

                case "geticecandidate":
                    var candidates = JSON.parse(msg.data);
                    for (var i = 0; candidates && i < candidates.length; i++) {
                        var elt = candidates[i];
                        var candidate = new RTCIceCandidate({sdpMLineIndex: elt.sdpMLineIndex, candidate: elt.candidate});
                        pc.addIceCandidate(candidate,
                            function () {
                                console.log("IceCandidate added: " + JSON.stringify(candidate));
                            },
                            function (error) {
                                console.log("addIceCandidate error: " + error);
                            }
                        );
                    }
                    document.documentElement.style.cursor ='default';
                    break;
            }
        };

        ws.onclose = function (evt) {
            if (pc) {
                pc.close();
                pc = null;
            }
        };

        ws.onerror = function (evt) {
            alert("An error has occurred!");
            ws.close();
        };

    } else {
        alert("Sorry, this browser does not support WebSockets.");
    }
}

function stop() {

    document.getElementById('remote-video').src = '';
    if (pc) {
        pc.close();
        pc = null;
    }
    if (ws) {
        ws.close();
        ws = null;
    }
}



window.onbeforeunload = function() {
    if (ws) {
        ws.onclose = function () {}; // disable onclose handler first
        stop();
    }
};

$(document).ready(function(){
    startWebrtc();
});
