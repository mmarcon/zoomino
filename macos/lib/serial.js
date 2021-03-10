import SerialPort from 'serialport';
import Readline from '@serialport/parser-readline';
import { EventEmitter } from 'events';

async function getSerialPortForArduino () {
  const ports = await SerialPort.list();
  return ports.find(p => /arduino/ig.test(p.manufacturer))?.path;
}

const commands = {
  MUTE: 0,
  UNMUTE: 1
};

class SerialCommandReader extends EventEmitter {
  constructor (logger) {
    super();
    if (!logger) {
      throw new TypeError('logger not specified');
    }
    this.logger = logger;
  }

  async start () {
    const path = await getSerialPortForArduino();
    const port = new SerialPort(path, {
      baudRate: 9600
    });
    const parser = port.pipe(new Readline({
      delimiter: '\n'
    }));

    port.on('open', () => {
      this.logger.info('arduino connected');
    });
    parser.on('data', data => {
      this.logger.debug('got some data');
      const parts = data.split('|');
      const command = parseInt(parts[0], 10);
      this.emit('command', command);
    });
  }
}

export { commands, SerialCommandReader };
