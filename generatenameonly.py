import os
import sys

if(len(sys.argv) < 2):
    print("file needed")
    quit()

print("opening " + sys.argv[1])
file = open(sys.argv[1], 'r')
lines = file.readlines()

print("----")
for line in lines:
    print(line.split(',')[0])
print("----")
print("quitting...")
