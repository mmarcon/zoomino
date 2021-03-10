import { SerialCommandReader, commands } from './lib/serial.js';
import { Zoom } from './lib/zoom.js';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const commandReader = new SerialCommandReader(logger.child({ module: 'serial command reader' }));
commandReader.on('command', async c => {
  switch (c) {
    case commands.MUTE:
      logger.info('mute');
      return await Zoom.mute();
    case commands.UNMUTE:
      logger.info('unmute');
      return await Zoom.unmute();
  }
});
commandReader.start();
