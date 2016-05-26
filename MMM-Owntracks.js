'use strict';
/* global Module */

/* Magic Mirror
 * Module: MMM-Owntracks
 *
 * By Javier Ayala http://www.javierayala.com/
 * MIT Licensed.
 */

Module.register('MMM-Owntracks', {

  defaults: {
    mqttServer: 'mqtt://test.mosquitto.org',
    loadingText: 'Loading Location Data...',
    otUser: '+',
    showTitle: false,
    title: 'MQTT Data',
    interval: 300000,
    postText: '',
    port: 1883,
    username: false,
    password: false,
    ca: false
  },

  start: function() {
    Log.info('Starting module: ' + this.name);
    this.loaded = false;
    this.mqttVal = '';
    this.updateMqtt(this);
  },

  updateMqtt: function(self) {
    self.mqttOpts = {};
    if (self.config.port) {
      self.mqttOpts.port = self.config.port;
    }
    if (self.config.username) {
      self.mqttOpts.username = self.config.username;
    }
    if (self.config.password) {
      self.mqttOpts.password = self.config.password;
    }
    // if (self.config.ca) {
    //   self.mqttOpts.ca = fs.readFileSync(self.config.ca);
    // }
    self.config.topic = 'owntracks/' + self.config.otUser + '/+/event';
    self.sendSocketNotification('MQTT_SERVER', { mqttServer: self.config.mqttServer, topic: self.config.topic });
    setTimeout(self.updateMqtt, self.config.interval, self);
  },

  getDom: function() {
    var wrapper = document.createElement('div');

    if (!this.loaded) {
      wrapper.innerHTML = this.config.loadingText;
      return wrapper;
    }

    if (this.config.showTitle) {
      var titleDiv = document.createElement('div');
      titleDiv.innerHTML = this.config.title;
      wrapper.appendChild(titleDiv);
    }

    var mqttDiv = document.createElement('div');
    mqttDiv.innerHTML = this.mqttVal.toString().concat(this.config.postText);
    wrapper.appendChild(mqttDiv);

    return wrapper;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'MQTT_DATA' && payload.topic === this.config.topic) {
      this.mqttVal = payload.data.toString();
      this.loaded = true;
      this.updateDom();
    }

    if (notification === 'ERROR') {
      this.sendNotification('SHOW_ALERT', payload);
    }
  }

});
