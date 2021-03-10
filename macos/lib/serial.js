import { SerialPort } from 'serialport';
import { Readline } from '@serialport/parser-readline';

async function getSerialPortForArduino () {
  const ports = await SerialPort.list();
  return ports.find(p => /arduino/ig.test(p.manufacturer))?.path;
}

export async function start () {
  const path = await getSerialPortForArduino();
  const port = new SerialPort(path, {
    baudRate: 9600
  });
  const parser = port.pipe(new Readline({
    delimiter: '\n'
  }));

  port.on('open', () => {
    console.log('arduino connected');
  });
  parser.on('data', data => {
    const parts = data.split('|');
  });
}
