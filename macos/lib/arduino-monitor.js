import SerialPort from 'serialport';
import EventEmitter from 'events';
import { noopLogger } from './noop-logger.js';

async function getSerialPortForArduino () {
  const ports = await SerialPort.list();
  return ports.find(p => /arduino/ig.test(p.manufacturer))?.path;
}

class ArduinoMonitor extends EventEmitter {
  constructor () {
    super();
    this.logger = noopLogger;
    this.timer = null;
    this.connected = null;
  }

  setLogger (logger) {
    this.logger = logger;
  }

  async start () {
    const port = await getSerialPortForArduino();
    this.connected = !!port;
    if (this.connected) {
      this.emit('arduino-connected', port);
    }
    this.timer = setTimeout(this._monitorConnection.bind(this), 1000);
  }

  stop () {
    clearTimeout(this.timer);
  }

  async _monitorConnection () {
    const port = await getSerialPortForArduino();
    if (port && !this.connected) {
      this.logger.debug('arduino connected on port %s', port);
      this.connected = true;
      this.emit('arduino-connected', port);
    }
    if (!port && this.connected) {
      this.logger.debug('arduino disconnected');
      this.connected = false;
      this.emit('arduino-disconnected');
    }
    this.timer = setTimeout(this._monitorConnection.bind(this), 1000);
  }
}

export { ArduinoMonitor };
