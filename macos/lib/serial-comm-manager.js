import {
  SimpleSerialProtocol,
  WriteCommandConfig,
  ReadCommandConfig
} from '@yesbotics/simple-serial-protocol-node';
import { noopLogger } from './noop-logger.js';
import EventEmitter from 'events';
import SerialPort from 'serialport';

class SerialCommunicationManager extends EventEmitter {
  constructor (path, baudRate = 9600) {
    super();
    this.baudRate = baudRate;
    this.arduino = undefined;
    this.logger = noopLogger;
    this.arduino = new SimpleSerialProtocol(path, this.baudRate);
    const readConfig = new ReadCommandConfig('s', (/* byte */ msgType, /* byte */ msgContent) => {
      this.logger.debug('Received message from arduino');
      this.logger.debug({ msgType, msgContent });
      this.emit('message', { msgType, msgContent });
    });
    readConfig.addByteParam().addByteParam();
    this.arduino.registerCommand(readConfig);
  }

  setLogger (logger) {
    this.logger = logger;
  }

  resetSerialPort (path) {
    // Resets the SerialPort instance
    // Unfortunately, we have to touch the internals
    // of SimpleSerialProtocol as they don't expose a good
    // API to dispose and instance and recreate a new one
    // given that some instance methods rely on a static singleton
    // that can't be reset in any way
    this.arduino.serialPort = new SerialPort(path, {
      autoOpen: false,
      baudRate: this.baudRate
    });
  }

  async start () {
    try {
      await this.arduino.init(2000);
      this.logger.info('connected');
    } catch (err) {
      this.logger.error('Could not init connection. reason:', err);
      this.arduino = undefined;
    }
  }

  write (msgType, msgContent) {
    const command = new WriteCommandConfig('r');
    command.addByteValue(msgType).addByteValue(msgContent);
    this.arduino.writeCommand(command);
  }

  async stop () {
    try {
      this.logger.debug('stopping serial connection');
      // Soft dispose
      // Relies on internals :(
      this.arduino.oneByteParser.removeAllListeners();
      this.arduino._isInitialized = false;
    } catch (err) {
      this.logger.error(err);
    }
  }
}

export { SerialCommunicationManager };
