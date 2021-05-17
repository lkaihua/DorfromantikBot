from PIL import Image
from os import listdir
from os.path import isfile, join


mypath = './screenshot/'
# infile = '1618335247528.png'
onlyfiles = [f for f in listdir(mypath) if isfile(join(mypath, f))]
# chopsize = 300
chopsizes = [
    [0, 0, 50, 58], [50, 0, 140, 30], [140, 0, 188, 58],
    [0, 58, 50, 116], [50, 86, 140, 116], [140, 58, 188, 116]
]


# Save Chops of original image
# for x0 in range(0, width, chopsize):
#    for y0 in range(0, height, chopsize):
def save(infile):
    img = Image.open(infile)
    # width, height = img.size
    for chopsize in chopsizes:
        x0 = chopsize[0]
        y0 = chopsize[1]
        x1 = chopsize[2]
        y1 = chopsize[3]
        box = (x0, y0, x1, y1)
            #  x0+chopsize if x0+chopsize <  width else  width - 1,
            #  y0+chopsize if y0+chopsize < height else height - 1
            #  )
        print('%s %s' % (infile, box))
        img.crop(box).save('%s.zchop.x%03d.y%03d.png' % (infile.replace('.png',''), x0, y0))


for file in onlyfiles:
    save(mypath + file)