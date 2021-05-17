import pyautogui
import os
from pathlib import Path
import time
# import keyboard
# from pynput.mouse import Listener
# import pynput
from pynput.mouse import Listener as MouseListener
from pynput.keyboard import Listener as KeyboardListener
from pynput.keyboard import Key

import argparse
import numpy as np
from keras.applications.xception import preprocess_input
from keras.preprocessing import image
from keras.models import load_model

from PIL import Image as pil_image

import requests


parser = argparse.ArgumentParser()
parser.add_argument('model')
parser.add_argument('classes')
# parser.add_argument('image')
# parser.add_argument('--top_n', type=int, default=10)


def prepare(args):

    # create model
    model = load_model(args.model)

    # load class names
    classes = []
    with open(args.classes, 'r') as f:
        classes = list(map(lambda x: x.strip(), f.readlines()))

    return model, classes

def calculate(img, model):
    # img = str(input("Enter a image path:"))
    # img = image.load_img(args.image, target_size=(299, 299))
    img = img.resize((299, 299), pil_image.NEAREST)
    # img = image.load_img(img, target_size=(299, 299))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)

    # predict
    pred = model.predict(x)[0]
    result = [(classes[i], float(pred[i]) * 100.0) for i in range(len(pred))]
    result.sort(reverse=True, key=lambda x: x[1])

    return result[0]
    # for i in range(min(args.top_n, len(classes))):
    #     (class_name, prob) = result[i]
    #     print("Top %d ====================" % (i + 1))
    #     print("Class name: %s" % (class_name))
    #     print("Probability: %.2f%%" % (prob))


# screen resolution: [1280, 960]
# tile w: 188, h: 116
#
# task 1: get the tile area
# mark left most vertex #1, clockwisely naming them #2, #3 until #6
# [1080, 640], [1128, 581], [1222, 581], [1268, 640], [1222, 692], [1128, 692]
#
#
# baseDir = Path().absolute()
# def save():
#     timestamp = int(time.time() * 1000)
#     myScreenshot = pyautogui.screenshot(region=(1080, 581, 188, 116))
#     myScreenshot.save(baseDir/'screenshot'/f'{timestamp}.png')
#     print(f'{timestamp}.png has saved.')
#     time.sleep(0.5)
#     print('ready for next save.')

chopsizes = [
    [0, 0, 45, 55], [45, 0, 135, 30], [135, 0, 180, 55],
    [0, 55, 45, 110], [45, 80, 135, 110], [135, 55, 180, 110]
]
# 1600 x 900
def realtime_shot():
    myScreenshot = pyautogui.screenshot(region=(1395, 545, 180, 110))
    # returns a Pillow/PIL Image object
    # <PIL.Image.Image image mode=RGB size=1920x1080 at 0x24C3EF0>

    data = []
    for i, chopsize in enumerate(chopsizes):
        x0 = chopsize[0]
        y0 = chopsize[1]
        x1 = chopsize[2]
        y1 = chopsize[3]
        box = (x0, y0, x1, y1)
        chop = myScreenshot.crop(box)
        # chop.save('%s.zchop.%01d.png' % (int(time.time()), i))

        data.append(chop)
    
    return data
    # PY inference.py .\result\model_fine_ep6_valloss0.022.h5 classes.txt images/house1.png  




def sync(tiles):
    q = []
    for tile in tiles:
        (class_name, prob) = calculate(tile, model)
        # q.append(class_name if class_name != 'sea' else 'river' )
        q.append(class_name)
        print(class_name)
    q = ",".join(q)
    print(f'sending {q} to local server.')
    requests.get(f'http://127.0.0.1:8000/update?timestamp={int(time.time())}&q={q}')


def listen_event():

    def on_click(x, y, button, pressed):

        # print('{0} {1} at {1}'.format(
        #     button, 
        #     'Pressed' if pressed else 'Released',
        #     (x, y)))

        if f'{button}' == 'Button.middle' and pressed:
            print('Button Middle pressed.')
            tiles = realtime_shot()
            sync(tiles)
        
        # if keyboard.is_pressed('1'):
        #     return False
    
    def on_press(key):
        # print("Key pressed: {0}".format(key))   

        if key == Key.esc:
            print("Key pressed: {0}".format(key))  
            # return False  
            KeyboardListener.stop()
            MouseListener.stop()

    keyboard_listener = KeyboardListener(on_press=on_press)
    mouse_listener = MouseListener(on_click=on_click)

    keyboard_listener.start()
    mouse_listener.start()
    keyboard_listener.join()
    mouse_listener.join()

if __name__ == '__main__':
    args = parser.parse_args()
    model, classes = prepare(args)

    # while keyboard.is_pressed('0') == False:
    #     if keyboard.is_pressed('1'):
    #         print('key 1 pressed.')
    #         tiles = realtime_shot()
    #         sync(tiles)

    listen_event()  
