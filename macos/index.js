import * as SerialProtocol from './lib/serial-protocol.js';
import { SerialCommunicationManager, getSerialPortForArduino } from './lib/serial-comm-manager.js';
import { Zoom, ZoomState } from './lib/zoom.js';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

async function syncZoomState (scm) {
  const state = await Zoom.state();
  if (state !== ZoomState.UNKNOWN) {
    logger.debug('zoom state %s', state);
    scm.write(SerialProtocol.STATE_MSG, state === ZoomState.MUTED ? SerialProtocol.StateValue.MUTED : SerialProtocol.StateValue.UNMUTED);
  } else {
    logger.debug('unknown zoom state');
  }
  setTimeout(syncZoomState.bind(null, scm), 2000);
}

async function start () {
  const scm = new SerialCommunicationManager(await getSerialPortForArduino());
  scm.setLogger(logger.child({ module: 'serial comm mgr' }));
  scm.on('message', async ({ msgType, msgContent }) => {
    if (msgType !== SerialProtocol.CMD_MSG) {
      return null;
    }
    switch (msgContent) {
      case SerialProtocol.CmdValue.MUTE:
        logger.info('received mute command');
        try {
          await Zoom.mute();
          return scm.write(SerialProtocol.STATE_MSG, SerialProtocol.StateValue.MUTED);
        } catch {
          logger.error('could not mute');
          break;
        }
      case SerialProtocol.CmdValue.UNMUTE:
        logger.info('received unmute command');
        try {
          await Zoom.unmute();
          return scm.write(SerialProtocol.STATE_MSG, SerialProtocol.StateValue.UNMUTED);
        } catch {
          logger.error('could not unmute');
          break;
        }
    }
  });
  await scm.start();
  syncZoomState(scm);
}

start();
