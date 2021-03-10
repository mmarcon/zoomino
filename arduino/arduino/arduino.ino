const int LED_MUTE = 12;
const int LED_UNMUTE = 4;
const int BUTTON_MUTE = 8;
const int BUTTON_UNMUTE = 2;
int greenState = 0;
int redState = 0;

char buff[64];

void setup()
{
  pinMode(LED_UNMUTE, OUTPUT);
  pinMode(LED_MUTE, OUTPUT);
  pinMode(BUTTON_UNMUTE, OUTPUT);
  pinMode(BUTTON_MUTE, INPUT);
  digitalWrite(LED_UNMUTE, LOW);
  digitalWrite(LED_MUTE, LOW);
  Serial.begin(9600);
}

void loop()
{
  
  greenState = digitalRead(BUTTON_UNMUTE);
  redState = digitalRead(BUTTON_MUTE);

  sprintf(buff, "%d|%d", greenState, redState);
  Serial.println(buff);
  
  if (greenState == HIGH)
  {
    digitalWrite(LED_UNMUTE, HIGH);
  } 
  else {
    digitalWrite(LED_UNMUTE, LOW);
  }
  
  if (redState == HIGH)
  {
    digitalWrite(LED_MUTE, HIGH);
  } 
  else{
    digitalWrite(LED_MUTE, LOW);
  }
}
