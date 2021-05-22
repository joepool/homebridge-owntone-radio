const fetch = require('node-fetch');
module.exports = (api) => {
  api.registerAccessory('owntone-radio', OwnToneRadio);
}

class OwnToneRadio {

  /**
   * REQUIRED - This is the entry point to your plugin
   */
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;
    this.id = config['id'];
    this.name = config['name'];
    this.serverip = config['serverip'] || 'localhost';
    this.serverport = config['serverport'] || '3689';
    this.stationuri = config['stationuri'];
/*
    fetch(`http://${this.serverip}:${this.serverport}/api/config`)//leaving this here as an example for when i add exception handling to all the fetch calls
        .then(this.checkResponseStatus)
        .catch((err) => this.ServerError(err));

*/
    var Status = this.fetchStatus(`http://${this.serverip}:${this.serverport}/api/config`);
    Status.then(a => {
      if(a.code == 'ECONNREFUSED'){
        this.log.warn('Server is down or IP address is incorrect');
      }
    });
    var missing = ' is missing from your config, this accessory will not be loaded.';
    if (this.id == null){
    	this.log.warn('Device ID', missing);
    	return;
    }
    if (this.name == null){
      this.log.warn('Device Name', missing);
      return;
    }
    if (this.stationuri == null){
      this.log.warn('Station URI', missing);
      return;
    }
    if (this.serverip == 'localhost'){
      this.log('Server IP address not entered, using localhost');
    }
    // your accessory must have an AccessoryInformation service
    this.informationService = new this.api.hap.Service.AccessoryInformation()
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, "Custom Manufacturer")
      .setCharacteristic(this.api.hap.Characteristic.Model, "Custom Model");

    // create a new "Switch" service
    this.switchService = new this.api.hap.Service.Switch(this.name);

    // link methods used when getting or setting the state of the service 
    this.switchService.getCharacteristic(this.api.hap.Characteristic.On)
      .onGet(this.getOnHandler.bind(this))   // bind to getOnHandler method below
      .onSet(this.setOnHandler.bind(this));  // bind to setOnHandler method below
    this.log.debug('owntone-radio plugin loaded');
  }

  fetchStatus(url){//probably change this to a better method, with better exception handling etc
    return fetch(url)
    .then(response => response.json())
    .then(function(response) {
      return (response);

    })
    .catch(function(error) {
      return (error);
    });    
  }


  checkResponseStatus(res) {
    if(res.ok){
        return res
    } 
    else {
        throw new Error(`The HTTP status of the reponse: ${res.status} (${res.statusText})`);
    }
  }
  ServerError(err){
    this.log.warn('Cannot connect to OwnTone Server. Please check you have the correct IP Address and the server is running.');
    this.log.debug(err);
  }
  /**
   * REQUIRED - This must return an array of the services you want to expose.
   * This method must be named "getServices".
   */
  getServices() {
    return [
      this.informationService,
      this.switchService,
    ];
  }
  async getOnHandler() {
    // get the current value of the switch in your own code
    this.log.debug('Getting switch state');
    let value = false;
    //gets the global playing state
    async function getStatus(serverip,serverport){
      return await fetch(`http://${serverip}:${serverport}/api/player`)
      .then(res => res.json());
    }
    let player = await getStatus(this.serverip, this.serverport);
    //gets the device active state
    async function getActive(serverip, serverport){
      return await fetch(`http://${serverip}:${serverport}/api/outputs`)
      .then(res => res.json());
    }
    let outputs = await getActive(this.serverip, this.serverport);
    var result = outputs.outputs.filter(a => a.id == this.id);
    //this gets the queue and then check if the station in the config matches whats in the queue.
    async function getQueue(serverip, serverport){
    	return await fetch(`http://${serverip}:${serverport}/api/queue`)
        .then(res => res.json());
    }
    let queue = await getQueue(this.serverip, this.serverport);
    let items = queue.items;
    let inqueue = items.some(a => a.uri == this.stationuri);
    //need exception handling here, incase result[] is empty.
    if(player.state == 'play' && result[0].selected && inqueue){
      value = true;
    }
    this.log.debug(value);
    return value;
  }
  async setOnHandler(value) {
    // add new item to queue, then check if there are two items in queue with different uri's, if there are, dont activate device or play, if not, continue 
    this.log.debug('Setting switch state to:', value);
    if (value == true){
      fetch(`http://${this.serverip}:${this.serverport}/api/queue/items/add?uris=${this.stationuri}`, {
        method: 'POST'
      });
      async function getQueue(serverip, serverport){
        return await fetch(`http://${serverip}:${serverport}/api/queue`)
        .then(res => res.json());
      }
      let queue = await getQueue(this.serverip, this.serverport);
      var items = queue.items
      function urisAreIdentical(arr) {//function to check if there are duplicate items in queue.
        let theuri, urisAreTheSame = true;
        arr.forEach(obj => {
          if (!theuri) theuri = obj.uri;
          else if (theuri != obj.uri) urisAreTheSame = false;
        })
      return urisAreTheSame;
      }
      var DifferentInQueue = urisAreIdentical(items);//true or false depending on if there are duplicate items in the queue.
      if (DifferentInQueue){
      fetch(`http://${this.serverip}:${this.serverport}/api/outputs/${this.id}`,{
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({"selected":true})
      });
      fetch(`http://${this.serverip}:${this.serverport}/api/player/play`, {
        method: 'PUT'
      });
    }
    else{
      //this removes all the items from the queue that are different to what is currently playing. This runs if the item just added to the queue is different to what is currently playing
      let queued = items.filter(a => a.uri == this.stationuri);
      let ids_to_remove = queued.map(a => a.id);
      this.log.debug(ids_to_remove);
      for (const id of ids_to_remove) {
        fetch(`http://${this.serverip}:${this.serverport}/api/queue/items/${id}`, {
          method: 'DELETE'
        });
      }

      this.log("Alredy different station playing on another device, stop that before starting another station");
    }
    }
    else{
      async function getActive(serverip, serverport){
        return await fetch(`http://${serverip}:${serverport}/api/outputs`)
        .then(res => res.json());
       }
      let outputs = await getActive(this.serverip, this.serverport);
      let arr_active = outputs.outputs.filter(a => a.selected == true);//get array of active outputs
      if (arr_active.length > 1){// if this isn't the last output active, only toggle the output
        fetch(`http://${this.serverip}:${this.serverport}/api/outputs/${this.id}`,{
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({"selected":false})
      });
      }
      else{// if its the last output active, stop playback, clear queue, toggle output.
        fetch(`http://${this.serverip}:${this.serverport}/api/player/stop`, {
          method: 'PUT'
        });
        fetch(`http://${this.serverip}:${this.serverport}/api/queue/clear`, {
          method: 'PUT'
        });
        fetch(`http://${this.serverip}:${this.serverport}/api/outputs/${this.id}`,{
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json; charset=UTF-8'
          },
          body: JSON.stringify({"selected":false})
        });
      }
      this.log.debug("Switched off");
    }
  }
}