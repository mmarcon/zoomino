#!/usr/bin/env node

import * as SerialProtocol from './lib/serial-protocol.js';
import { SerialCommunicationManager } from './lib/serial-comm-manager.js';
import { ArduinoMonitor } from './lib/arduino-monitor.js';
import { Zoom, ZoomState } from './lib/zoom.js';
import pino from 'pino';

async function start () {
  const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

  const zoom = new Zoom();
  zoom.setLogger(logger.child({ module: 'zoom' }));

  const am = new ArduinoMonitor();
  am.setLogger(logger.child({ module: 'arduino monitor' }));

  let scm;
  const scmLogger = logger.child({ module: 'serial comm mgr' });

  const onMessage = ({ msgType, msgContent }) => setImmediate(async () => {
    if (msgType !== SerialProtocol.CMD_MSG) {
      return null;
    }
    logger.debug('received command %d', msgContent);
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

  const onConnected = async (port) => {
    if (!scm) {
      // `port` is only used to set up the instance the firs time
      // An improvement would be to support potential port changes
      scm = new SerialCommunicationManager(port);
      scm.setLogger(scmLogger);
    }
    scm.on('message', onMessage);
    await scm.start();
  };

  const onDisconnected = () => {
    if (!scm) {
      return;
    }
    scm.off('message', onMessage);
    scm.stop();
  };

  zoom.on('state-update', (state) => {
    logger.debug('zoom state update %s', state);
    if (scm) {
      scm.write(SerialProtocol.STATE_MSG, state === ZoomState.MUTED ? SerialProtocol.StateValue.MUTED : SerialProtocol.StateValue.UNMUTED);
    }
  });

  am.on('arduino-connected', onConnected);
  am.on('arduino-disconnected', onDisconnected);
  am.start();

  zoom.start();
}

start();
