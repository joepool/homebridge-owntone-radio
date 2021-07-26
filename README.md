# homebridge-owntone-radio
[![npm](https://badgen.net/npm/v/homebridge-owntone-radio)](https://www.npmjs.com/package/homebridge-owntone-radio)
[![npm](https://badgen.net/npm/dt/homebridge-owntone-radio)](https://www.npmjs.com/package/homebridge-owntone-radio)  
This [Homebridge](https://github.com/homebridge/homebridge) Plugin allows playing internet radio streams to AirPlay devices such as HomePods, using [OwnTone](https://github.com/owntone/owntone-server) (previosuly forked-daapd), controlled using HomeKit.  
## Installation
Assuming Global Installation of Homekit: `npm i homebridge-owntone-radio`  
Or use Homebridge UI
## OwnTone Configuration

## HomeBridge Configuration
The easiest method is using [Homebridge UI](https://github.com/oznu/homebridge-config-ui-x). This is much easier than editing JSON.
### Initial Configuration
Initially you will need to find the OwnTone Device ID's of your AirPlay Devices as well as the OwnTone Radio Station URI's.   
To do this enable both `device_discovery` and `station_discovery` either as a single accessory or two seperate ones in Homebridge UI.  
JSON for manual configuration shown below
```
"accessories": [
    {
        "accessory": "owntone-radio",
        "name": "Discovery",
        "serverip": "192.168.0.5",
        "device_discovery": true,
        "station_discovery": true
    }
]
```
or
```
"accessories": [
    {
        "accessory": "owntone-radio",
        "name": "Device Discovery",
        "serverip": "192.168.0.5",
        "device_discovery": true
    },
    {
        "accessory": "owntone-radio",
        "name": "Station Discovery",
        "serverip": "192.168.0.5",
        "station_discovery": true
    }
]
```
Then, restart Homebridge and check your logs. Once Homebridge has started, you shoud see a list of all your AirPlay deveices with their Device ID's followed by a list of Radio Stations you previosuly added to your library and their URI's. Find the device and station your would like to use and get the device ID and Station URI.
### Basic Configuration
Once you have found your Device ID and Station URI, you can create an accessory that will be added to HomeKit.  
Using Homebridge UI, simply add a name, the Device ID and Station URI you found previosuly, OwnTone Server IP address (if it's not localhost) and OwnTone Server Port (if it's different from default). 
  
Save your changes and restart Homebridge. Open the Home app and you should have a new accessory that will play your chosen radio station on your AirPlay device with switched on.

JSON for manual configuration shown below

### Advanced Configuration

### Troubbleshooting
disable ipv6 in owntone
