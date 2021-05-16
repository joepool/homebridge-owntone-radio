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
    this.serverip = config['serverip'];
    this.log.debug('owntone-radio plugin loaded');

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
    async function getStatus(serverip){
      return await fetch(`http://${serverip}:3689/api/player`)
      .then(res => res.json());
    }
    let player = await getStatus(this.serverip);
    this.log.debug(player);
    //gets the device active state
    async function getActive(serverip){
      return await fetch(`http://${serverip}:3689/api/outputs`)
      .then(res => res.json());
    }
    let outputs = await getActive(this.serverip);
    var result = outputs.outputs.filter(a => a.id == this.id);
    //processes both and sets the device state accordingly. 
    //need exception handling here, incase result[] is empty.
    if(player.state == 'play' && result[0].selected == true){
      value = true;
    }
    this.log.debug(value);
    return value;
  }
  async setOnHandler(value) {
    this.log.debug('Setting switch state to:', value);
    if (value == true){
      fetch(`http://${this.serverip}:3689/api/outputs`)
      .then(res => res.json())
      .then(json => this.log.debug(json));
      fetch(`http://${this.serverip}:3689/api/queue/items/add?uris=library:playlist:7`, {
        method: 'POST'
      });
      fetch(`http://${this.serverip}:3689/api/outputs/${this.id}`,{
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({"selected":true})
      });
      fetch(`http://${this.serverip}:3689/api/player/play`, {
        method: 'PUT'
      });

    }
    else{
      this.log.debug("Switched off");
    }
  }
}