# homebridge-owntone-radio
[![npm](https://badgen.net/npm/v/homebridge-owntone-radio)](https://www.npmjs.com/package/homebridge-owntone-radio)
[![npm](https://badgen.net/npm/dt/homebridge-owntone-radio)](https://www.npmjs.com/package/homebridge-owntone-radio)  
This [Homebridge](https://github.com/homebridge/homebridge) Plugin allows playing internet radio streams to AirPlay devices such as HomePods, using [OwnTone](https://github.com/owntone/owntone-server) (previosuly forked-daapd), controlled using HomeKit.  
## Installation
Assuming Global Installation of Homekit: `npm i homebridge-owntone-radio`  
Or use Homebridge UI
## OwnTone Configuration
First you will need to set up an Owntone server. This can be done on the same device as Homebridge, or something else on your network.  
Follow the instructions found in the [Owntone docs](https://github.com/owntone/owntone-server/blob/master/INSTALL.md) for setup instructions.  
You may need to edit the Owntone configuration file to suit your needs. This can be done by running the command `sudo nano /etc/owntone.conf` however this may be diffrent depending on your operating system.  
You will need to add radio station files to your Owntone library. You can either use the [examples I have created](https://github.com/joepool/homebridge-owntone-radio/tree/main/Stations), or create your own `.m3u` files.  
These files will need to be placed into your library. The default library location is `/srv/music/` but this can be changed if you like. You may need to create this directory if it doesnt already exist, for example `sudo mkdir srv/music` (make sure this is run from your root directory (run `cd /`). You can then copy your `.m3u` station files into this directory.  
Restart owntone (this will usually be `sudo service owntone restart`).  
You can then continue with the Homebridge configuration.  
## Homebridge Configuration
The easiest method is using [Homebridge UI](https://github.com/oznu/homebridge-config-ui-x). This is much easier than editing JSON.
### Initial Configuration
Initially you will need to find the OwnTone Device ID's of your AirPlay Devices as well as the OwnTone Radio Station URI's.   
To do this enable both `device_discovery` and `station_discovery` either as a single accessory or two seperate ones in Homebridge UI.  
JSON example for manual configuration shown below
```
"accessories": [
    {
        "accessory": "owntone-radio",
        "name": "Discovery",
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
        "device_discovery": true
    },
    {
        "accessory": "owntone-radio",
        "name": "Station Discovery",
        "station_discovery": true
    }
]
```
Then, restart Homebridge and check your logs. Once Homebridge has started, you shoud see a list of all your AirPlay deveices with their Device ID's followed by a list of Radio Stations you previosuly added to your library and their URI's. Find the device and station your would like to use and get the device ID and Station URI. This accessory/accessories can be removed once you have obtained your device ID's and URI's.
### Basic Configuration
Once you have found your Device ID and Station URI, you can create an accessory that will be added to HomeKit.  
Using Homebridge UI, simply add a name, the Device ID and Station URI you found previosuly, OwnTone Server IP address (if it's not localhost) and OwnTone Server Port (if it's different from default). 
  
Save your changes and restart Homebridge. Open the Home app and you should have a new accessory that will play your chosen radio station on your AirPlay device with switched on.

JSON example for manual configuration shown below
```
"accessories": [
    {
        "accessory": "owntone-radio",
        "name": "Radio 1 Kitchen",
        "id": "xxxxxxxxxxxxxxx",
        "stationuri": "library:track:x"
    },
    {
        "accessory": "owntone-radio",
        "name": "Radio 1 Living Room",
        "id": "xxxxxxxxxxxxxxx",
        "stationuri": "library:track:x"
    }
]
```

In this example, the id's should be different as they are different devices, but the stationuri's should be the same as they are the same radio station (bassed on the accessory name).

### Advanced Configuration
|Option|Required|Default|Explaination|
|------------------|:--------:|-------|------------|
|accessory|&#9745;||This **must** be owntone-radio
|name|&#9745;||The name of the switch that shows up in homekit.<br>This can be anything|
|id|&#9745;||The OwnTone AirPlay Device ID to play on. <br>This is found using the `device_discovery` option.<br>Unique to each device|
|stationuri|&#9745;||The URI of the radio station to be played.<br>This is found using the `station_discovery` option.<br>Unique to each station|
|serverip||localhost|The IP address the Owntone Server is running on|
|serverport||3689|The port the OwnTone Server is running on |
|device\_discovery||false|Option to enable AirPlay device discovery.<br>The accessory will not be added to Homekit if this option is enabled.<br>Will output a list of AirPlay devices and their ID's to Homebridge logs |
|station\_discovery||false|Option to enable Station URI discovery.<br>The accessory will not be added to Homekit if this option is enabled.<br>Will output a list of Stations devices and their URI's to Homebridge logs |
### Limitations
Only one station can be played at a time, on every device. You cannot play one station on one device, another station on another device. If you do, you will see the following message in your Homebridge logs `Alredy different station playing on another device, stop that before starting another station`. Playback will continue for the first station that was playing.
### Troubbleshooting
If no sound is played from a HomePod, you may need to disable IPv6 in the Owntone configuration:  
Edit your config file (for example: `sudo nano /etc/owntone.conf`).  
On line 44 (if the config file is unchanged), uncomment the ipv6 line (remove the `#`) and make sure it is set as `ipv6 = no`.  
Restart Owntone.  
  
If during device discovery you see a message like `device requires authentication, use OwnTone web interface to authenticate before using with this plugin`, this means that your AirPlay device requires a pin to be authenticated. This is common on AppleTV's. Go to the owntone web interface(default is your serverip:3689)>settings>remotes and outputs. Then enter the verification code in the box shown.  
  
If during station discovery you see a message like `Maximum stations per playlist exceeded, only one station per m3u playlist file`, this means a `.m3u` file you have added to your library contains more than one station link. To resolve this, edit your file to only contain one, or use the [examples I have created](https://github.com/joepool/homebridge-owntone-radio/tree/main/Stations).  
  
If during playback, or at any other time, you see a message saying `Server is down or no airplay devices found on your network` or `Cannot connect to OwnTone Server`, first check that the Owntone server is running, you have the correct server ip and port. Otherwise restart Homebridge in debug mode and you will see more detailed logging infomation. 
