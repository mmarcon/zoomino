const CMD_MSG = 0x0;
const STATE_MSG = 0x1;

const StateValue = {
  MUTED: 0x0,
  UNMUTED: 0x1,
  UNKNOWN: 0x2
};

const CmdValue = {
  MUTE: 0x0,
  UNMUTE: 0x1
};

export { STATE_MSG, StateValue, CMD_MSG, CmdValue };
