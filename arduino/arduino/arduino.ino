const int LED1 = 2;
const int LED2 = 4;
const int BUTTON1 = 8;
const int BUTTON2 = 12;
int greenState = 0;
int redState = 0;

char buff[64];

void setup()
{
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(BUTTON1, OUTPUT);
  pinMode(BUTTON2, INPUT);
  digitalWrite(LED1, LOW);
  digitalWrite(LED2, LOW);
  Serial.begin(9600);
}

void loop()
{
  
  greenState = digitalRead(BUTTON1);
  redState = digitalRead(BUTTON2);

  sprintf(buff, "%d|%d", greenState, redState);
  Serial.println(buff);
  
  if (greenState == HIGH)
  {
    digitalWrite(LED1, HIGH);
  } 
  else {
    digitalWrite(LED1, LOW);
  }
  
  if (redState == HIGH)
  {
    digitalWrite(LED2, HIGH);
  } 
  else{
    digitalWrite(LED2, LOW);
  }
}
