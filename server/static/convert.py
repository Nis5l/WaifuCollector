from PIL import Image
import os

fin = './card-old'
fout = './card'

for filename in os.listdir(fin):
    newfilename = filename.split(".")[0] + ".webp"
    print("\"" + filename + "\" -> \"" + newfilename + "\"...", end="")
    im = Image.open(fin + "/" + filename)
    im.save(fout + "/" + newfilename, 'WEBP')
    print(" done")

