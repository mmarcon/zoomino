import {
  SimpleSerialProtocol,
  WriteCommandConfig,
  ReadCommandConfig
} from '@yesbotics/simple-serial-protocol-node';
import SerialPort from 'serialport';
import EventEmitter from 'events';

async function getSerialPortForArduino () {
  const ports = await SerialPort.list();
  return ports.find(p => /arduino/ig.test(p.manufacturer))?.path;
}

class SerialCommunicationManager extends EventEmitter {
  constructor (path, baudRate = 9600) {
    super();
    this.path = path;
    this.baudRate = baudRate;
    this.arduino = undefined;
    const noop = () => {};
    this.logger = { info: noop, error: noop, debug: noop };
  }

  setLogger (logger) {
    this.logger = logger;
  }

  async start () {
    this.arduino = new SimpleSerialProtocol(this.path, this.baudRate);
    const readConfig = new ReadCommandConfig('s', (/* byte */ msgType, /* byte */ msgContent) => {
      this.logger.debug('Received message from arduino');
      this.logger.debug({ msgType, msgContent });
      this.emit('message', { msgType, msgContent });
    });
    readConfig.addByteParam().addByteParam();
    this.arduino.registerCommand(readConfig);
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
      await this.arduino.dispose();
    } catch (err) {
      this.logger.error(err);
    }
  }
}

export { SerialCommunicationManager, getSerialPortForArduino };
