//Written by Christian Maschka
//17.03.2019


#include <Stepper.h>//Uses standard Arduino Stepper Lib

//pins
const int CommsPin = 7;
const int ClosePin = 6;
const int OpenPin = 5;

//motor
const int stepsPerRevolution = 200;  // change this to fit the number of steps per revolution
int dir = 1; //movement direction. 1: Close, -1: Open
Stepper myStepper(stepsPerRevolution, 8, 9, 10, 11);
bool state = 1; //0: open, 1: closed
bool prev_CommsPin;

// the setup routine runs once when you press reset:
void setup() {
  // initialize serial communication at 9600 bits per second:
  Serial.begin(9600);

  //pins
  pinMode(CommsPin, INPUT_PULLUP); //Inverted Logic due to PullUp logic of pins
  pinMode(ClosePin, INPUT_PULLUP);
  pinMode(OpenPin, INPUT_PULLUP);

  //stepper:
  // set the speed at 10 rpm for homing:
  myStepper.setSpeed(10);
  
  //magnetize motors
  myStepper.step(1);
  myStepper.step(-1);

  //homing:
  homing();
  myStepper.step(2);
   //step few more steps to make sure button remains pressed even once backlash kicks in
}

// the loop routine runs over and over again forever:
void loop() {
  prev_CommsPin = digitalRead(CommsPin); //recording value before delay
  delay(5); //delay to avoid transient noise from PSU
  if(prev_CommsPin == digitalRead(CommsPin)){ //if nothing changed over the delay time, enter the state machine.
    if (state) { //if closed state
      if (digitalRead(CommsPin)==HIGH) {//if home and Communicated to be home, stay home
        homing();
      } else { //if home and Communicated to be open
        open_gate();
        state = 0; //set open state
      }
    } else {
      if (digitalRead(CommsPin)==HIGH) {//if open nad Communicated to be home, move to home
        close_gate();
        state = 1;//set closed state
      } else {//if outside and told to be outside, stay outside
        homing_outside();
      }
    }
  }
}

void open_gate(){ //opens gate
    homing();
    dir = -1; //OPEN
    operate(dir);
    homing_outside(); 
    myStepper.step(-2);//go extra to avoid osscilation --> makes sure the switch is pressed well
  }

void close_gate(){ //closes gate
    homing_outside();
    dir = 1; //OPEN
    operate(dir);
    homing(); 
    myStepper.step(2); //to extra to avoid osscilation --> makes sure the switch is pressed well
  }

void operate(int dir){//moves 270 steps with hardcoded acceleration curve
  if (((dir == 1) && (digitalRead(ClosePin)==LOW))||((dir == -1) && (digitalRead(OpenPin)==LOW))) //makes sure the door hasn't been kicked open
    return void();
  myStepper.setSpeed(20);
  myStepper.step(10*dir);
  if (((dir == 1) && (digitalRead(ClosePin)==LOW))||((dir == -1) && (digitalRead(OpenPin)==LOW))) //makes sure the door hasn't been kicked open
    return void();
  myStepper.setSpeed(30);
  myStepper.step(20*dir);
  if (((dir == 1) && (digitalRead(ClosePin)==LOW))||((dir == -1) && (digitalRead(OpenPin)==LOW))) //makes sure the door hasn't been kicked open
    return void();
  myStepper.setSpeed(45);
  myStepper.step(30*dir);
  if (((dir == 1) && (digitalRead(ClosePin)==LOW))||((dir == -1) && (digitalRead(OpenPin)==LOW))) //makes sure the door hasn't been kicked open
    return void();
  myStepper.setSpeed(70);
  myStepper.step(50*dir);
  if (((dir == 1) && (digitalRead(ClosePin)==LOW))||((dir == -1) && (digitalRead(OpenPin)==LOW))) //makes sure the door hasn't been kicked open
    return void();
  myStepper.step(50*dir);//continue at 70, but we check mutiple times it hasn't been clicked
  if (((dir == 1) && (digitalRead(ClosePin)==LOW))||((dir == -1) && (digitalRead(OpenPin)==LOW))) //makes sure the door hasn't been kicked open
    return void();
  myStepper.step(50*dir);//continue at 70, but we check mutiple times it hasn't been clicked
  if (((dir == 1) && (digitalRead(ClosePin)==LOW))||((dir == -1) && (digitalRead(OpenPin)==LOW))) //makes sure the door hasn't been kicked open
    return void();
  myStepper.setSpeed(45);
  myStepper.step(30*dir);
  if (((dir == 1) && (digitalRead(ClosePin)==LOW))||((dir == -1) && (digitalRead(OpenPin)==LOW))) //makes sure the door hasn't been kicked open
    return void();
  myStepper.setSpeed(30);
  myStepper.step(20*dir);
  if (((dir == 1) && (digitalRead(ClosePin)==LOW))||((dir == -1) && (digitalRead(OpenPin)==LOW))) //makes sure the door hasn't been kicked open
    return void();
  myStepper.setSpeed(20);
  myStepper.step(10*dir);
  if (((dir == 1) && (digitalRead(ClosePin)==LOW))||((dir == -1) && (digitalRead(OpenPin)==LOW))) //makes sure the door hasn't been kicked open
    return void();
  }

void homing(){ //slowly moves and docks to switch at home
  myStepper.setSpeed(10);
  while(digitalRead(ClosePin) != 0){
    myStepper.step(1);
    }
  }

void homing_outside(){ //slowly moves and docks to switch outside/open
  myStepper.setSpeed(10);
  while(digitalRead(OpenPin) != 0){
    myStepper.step(-1);
    }
  }


