import RPi.GPIO as GPIO
from gpiozero import DistanceSensor
import time
import json
from flask import Flask
app = Flask(__name__)

GPIO_LED_G = 15
GPIO_LED_R = 14

GPIO_MOTOR = [21, 20]

GPIO.setmode(GPIO.BCM)

GPIO.setup(GPIO_LED_G, GPIO.OUT)
GPIO.setup(GPIO_LED_R, GPIO.OUT)

GPIO.setup(GPIO_MOTOR, GPIO.OUT)

GPIO.output(GPIO_MOTOR[0], GPIO.HIGH) #0: closed, #1: open
GPIO.output(GPIO_MOTOR[1], GPIO.HIGH) #0: closed, #1: open

GPIO.output(GPIO_LED_R, GPIO.LOW)
GPIO.output(GPIO_LED_G, GPIO.LOW)

exit_us = DistanceSensor(echo=17, trigger=4)
entrance_us = DistanceSensor(echo=24, trigger=25)

def motor(order):
    print(order)
    if order == 'open':
        GPIO.output(GPIO_MOTOR[0], GPIO.LOW)
        GPIO.output(GPIO_MOTOR[1], GPIO.LOW)
    elif order == 'close':
        GPIO.output(GPIO_MOTOR[0], GPIO.HIGH)
        GPIO.output(GPIO_MOTOR[1], GPIO.HIGH)

@app.route('/red_light',methods=['GET'])
def red_light():
    GPIO.output(GPIO_LED_R, GPIO.HIGH)
    time.sleep(3)
    GPIO.output(GPIO_LED_R, GPIO.LOW)
    return json.dumps('')

@app.route("/close_door",methods=['GET'])
def close_door():
    time.sleep(1)
    motor('close')
    GPIO.output(GPIO_LED_G, GPIO.LOW)
    return json.dumps('')
    
@app.route("/open_door",methods=['GET'])
def open_door():
    GPIO.output(GPIO_LED_G, GPIO.HIGH)
    motor('open')
    time_start = time.time()
    time.sleep(8)
##        distance = exit_us.distance
##        if distance < 0.75:
##            break
    time.sleep(3)
    GPIO.output(GPIO_LED_G, GPIO.LOW)
    motor('close')
    return json.dumps('')

@app.route('/check_customer',methods=['GET'])
def check_customer():
    time_start = time.time()
    customer = False
    print('Checking entrance US.')
    while (time.time() - time_start) < 3:
        time.sleep(0.05)
        distance = entrance_us.distance
        if (distance < 0.75):
            customer = True
            break
    if customer:
        return json.dumps(True)
    return json.dumps(False)

if __name__=='__main__':
    app.run(host='localhost',port=5000,threaded=True,debug=True)

