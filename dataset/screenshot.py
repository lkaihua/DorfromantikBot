import pyautogui
import os
from pathlib import Path
import time
import keyboard

baseDir = Path().absolute()

def save():
    timestamp = int(time.time() * 1000)
    myScreenshot = pyautogui.screenshot(region=(1080, 581, 188, 116))
    myScreenshot.save(baseDir/'screenshot'/f'{timestamp}.png')
    print(f'{timestamp}.png has saved.')
    time.sleep(0.5)
    print('ready for next save.')

# screen resolution: [1280, 960]
# task 1: get the tile area
# mark left most vertex #1, clockwisely naming them #2, #3 until #6
# [1080, 640], [1128, 581], [1222, 581], [1268, 640], [1222, 692], [1128, 692]

def realtime_shot():
    myScreenshot = pyautogui.screenshot(region=(1080, 581, 188, 116))


while keyboard.is_pressed('0') == False:
    if keyboard.is_pressed('1'):
        print('key 1 pressed.')
        save()
