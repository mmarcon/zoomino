import * as SerialProtocol from './lib/serial-protocol.js';
import { SerialCommunicationManager, getSerialPortForArduino } from './lib/serial-comm-manager.js';
import { Zoom, ZoomState } from './lib/zoom.js';
import pino from 'pino';

async function start () {
  const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

  const scm = new SerialCommunicationManager(await getSerialPortForArduino());
  scm.setLogger(logger.child({ module: 'serial comm mgr' }));

  const zoom = new Zoom();
  zoom.setLogger(logger.child({ module: 'zoom' }));

  scm.on('message', async ({ msgType, msgContent }) => {
    if (msgType !== SerialProtocol.CMD_MSG) {
      return null;
    }
    switch (msgContent) {
      case SerialProtocol.CmdValue.MUTE:
        logger.info('received mute command');
        try {
          await zoom.mute();
        } catch {
          logger.error('could not mute');
        }
        break;
      case SerialProtocol.CmdValue.UNMUTE:
        logger.info('received unmute command');
        try {
          await zoom.unmute();
        } catch {
          logger.error('could not unmute');
        }
        break;
    }
  });

  zoom.on('state-update', (state) => {
    logger.debug('zoom state update %s', state);
    scm.write(SerialProtocol.STATE_MSG, state === ZoomState.MUTED ? SerialProtocol.StateValue.MUTED : SerialProtocol.StateValue.UNMUTED);
  });

  await scm.start();
  zoom.start();
}

start();
