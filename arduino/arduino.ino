#include <SimpleSerialProtocol.h>
#include <Throttle.h>

void onError(uint8_t errorNum);
void onReceivedValues();

#define LED_MUTE      12
#define LED_UNMUTE     4
#define BUTTON_MUTE    8
#define BUTTON_UNMUTE  2

// serial port config
#define BAUDRATE 9600
#define CHARACTER_TIMEOUT 500
#define COMMAND_ID_RECEIVE 'r'
#define COMMAND_ID_SEND 's'

/************************/
#define CMD_MSG        0x0
/************************/
#define CMD_MUTE       0x0
#define CMD_UNMUTE     0x1

/************************/
#define STATE_MSG      0x1
/************************/
#define STATE_MUTED    0x0
#define STATE_UNMUTED  0x1
#define STATE_UNKNOWN  0x2

int state = -1;

SimpleSerialProtocol ssp(Serial, BAUDRATE, CHARACTER_TIMEOUT, onError, 'a', 'z');
Throttle buttonMute = Throttle(BUTTON_MUTE);
Throttle buttonUnmute = Throttle(BUTTON_UNMUTE);

void setup()
{
  // Configure pins
  pinMode(LED_UNMUTE, OUTPUT);
  pinMode(LED_MUTE, OUTPUT);
  pinMode(BUTTON_UNMUTE, OUTPUT);
  pinMode(BUTTON_MUTE, INPUT);
  digitalWrite(LED_UNMUTE, LOW);
  digitalWrite(LED_MUTE, LOW);

  // Set up serial communication
  ssp.init();
  ssp.registerCommand(COMMAND_ID_RECEIVE, onReceivedValues);
}

void loop()
{
  ssp.loop();
  
  buttonMute.update();
  buttonUnmute.update();

  bool shouldMute = buttonMute.rose();
  bool shouldUnmute = buttonUnmute.rose();

  if (shouldMute || shouldUnmute) {
    ssp.writeCommand(COMMAND_ID_SEND);
    ssp.writeByte(CMD_MSG);
    if (shouldMute) {
      ssp.writeByte(CMD_MUTE);
    } else if (shouldUnmute) {
      ssp.writeByte(CMD_UNMUTE);
    }
    ssp.writeEot();
  }

  switch (state) {
    case STATE_MUTED:
      digitalWrite(LED_UNMUTE, LOW);
      digitalWrite(LED_MUTE, HIGH);
      break;
    case STATE_UNMUTED:
      digitalWrite(LED_UNMUTE, HIGH);
      digitalWrite(LED_MUTE, LOW);
      break;
    case STATE_UNKNOWN:
      digitalWrite(LED_UNMUTE, LOW);
      digitalWrite(LED_MUTE, LOW);
      break;
  }
}

void onReceivedValues() {
    // Receive data
    byte msgType = ssp.readByte();
    byte msgContent = ssp.readByte();

    if (msgType == STATE_MSG) {
      state = msgContent;
    }
    
    ssp.readEot();
}

void onError(uint8_t errorNum) {
}
