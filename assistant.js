/////////////
//VARIABLES//
/////////////
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost', { port: 1883 });
var relay = require('./lightcontrol.js');
var fan = require('./fancontrol.js');
var everloop = require('./everloop.js');
var snipsUserName = 'vimarsh';
var wakeword = 'hermes/hotword/default/detected';
var sessionEnd = 'hermes/dialogueManager/sessionEnded';
var lightState = 'hermes/intent/'+snipsUserName+':lightVal';    
var fanRequest = 'hermes/intent/'+snipsUserName+':fanVal';
var TimeGet = 'hermes/intent/'+snipsUserName+':TimeSet';

//////////////
//ON CONNECT//
//////////////
client.on('connect', function() {
   console.log('Connected to Snips MQTT server\n');
   client.subscribe('hermes/hotword/default/detected');
   client.subscribe('hermes/dialogueManager/sessionEnded');
   client.subscribe(lightState);
   client.subscribe(fanRequest);
});
//////////////
//ON MESSAGE//
//////////////
client.on('message', function(topic,message) {
   var message = JSON.parse(message);
   switch(topic) {
       // * On Wakeword
       case wakeword:
           everloop.startWaiting();
           console.log('Wakeword Detected');
       break;
       // * On Light State Change
       case lightState:
           // Turn lights On/Off
           try{
               if (message.slots[0].rawValue === 'on'){
                   relay.lightsOn();
                   everloop.stopWaiting();
                   console.log('Lights On');
               }
               else{
                   relay.lightsOff();
                   everloop.stopWaiting();
                   console.log('Lights Off');
               }
           }
           // Expect error if `on` or `off` is not heard
           catch(e){
               console.log('Did not receive an On/Off state')
           }
       break;
       case fanRequest:
           // Turn fan On/half/Off
           try{
            if (message.slots[0].rawValue === 'full'){
                fan.fullOn();
                everloop.stopWaiting();
                console.log('Fan speed if full');
            }
            else if (message.slots[0].rawValue === 'half'){
                fan.halfOn();
                everloop.stopWaiting();
                console.log('Fan speed is half');
            }
            else{
                fan.Off();
                everloop.stopWaiting();
                console.log('Fan is Off');
            }
        }
        // Expect error if `on` or `off` is not heard
        catch(e){
            console.log('Did not receive any fan state')
        }
        break;
        case TimeGet:
           // set alarm time
           try{
               var timeval=message.slots[0].rawValue;
                client.publish('alarm', timeval);
                console.log('alarm set of ',timeval);
            }
        // Expect error if time is not heard
        catch(e){
            console.log('Did not receive any alarm time')
        }
        break;
       // * On Conversation End
       case sessionEnd:
           everloop.stopWaiting();
           console.log('Session Ended\n');
       break;
   }
});