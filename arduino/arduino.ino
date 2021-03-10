#define LED_MUTE      12
#define LED_UNMUTE     4
#define BUTTON_MUTE    8
#define BUTTON_UNMUTE  2

#define MUTE_CMD       0
#define UNMUTE_CMD     1

int mute = 0;
int unmute = 0;
int state = -1;

char buff[16];

void setup()
{
  pinMode(LED_UNMUTE, OUTPUT);
  pinMode(LED_MUTE, OUTPUT);
  pinMode(BUTTON_UNMUTE, OUTPUT);
  pinMode(BUTTON_MUTE, INPUT);
  digitalWrite(LED_UNMUTE, HIGH);
  digitalWrite(LED_MUTE, LOW);
  Serial.begin(9600);

  //TODO: sync state with computer
}

void loop()
{
  mute = digitalRead(BUTTON_MUTE);
  unmute = digitalRead(BUTTON_UNMUTE);

  int cmd = -1;

  if (mute == HIGH) {
    cmd = MUTE_CMD;
  } else if (unmute == HIGH) {
    cmd = UNMUTE_CMD;  
  }

  if (cmd >= 0 && cmd != state) {
    sprintf(buff, "%d", cmd);
    Serial.println(buff);
    state = cmd;
  }

  if (state == MUTE_CMD) {
    digitalWrite(LED_UNMUTE, LOW);
    digitalWrite(LED_MUTE, HIGH);
  } else if (state == UNMUTE_CMD) {
    digitalWrite(LED_UNMUTE, HIGH);
    digitalWrite(LED_MUTE, LOW);
  }
}
