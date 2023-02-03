import cv2

target_size = 250
target_type = ".jpg"


def resize(file):
    image = cv2.imread(file)
    if image is None:
        return

    width = image.shape[0]
    height = image.shape[1]

    print("width:", width, "height:", height)

    # check if image is not a square
    if width != height:
        print("crop image!")

        fromWidth = 0
        toWidth = width
        fromHeight = 0
        toHeight = height

        # check if width is larger
        if width > height:
            print("crop width")
            toRemove = width - height
            print("toCrop:", toRemove)
            fromWidth = toRemove // 2
            toWidth = width - (toRemove // 2)
        # check if height is larger
        if height > width:
            print("crop height")
            toRemove = height - width
            print("toCrop:", toRemove)
            fromHeight = toRemove // 2
            toHeight = height - (toRemove // 2)
        # crop image
        image = image[fromWidth:toWidth, fromHeight:toHeight]

    # resize image
    image = cv2.resize(image, (target_size, target_size))

    # write to file without file ending
    success, buffer = cv2.imencode(target_type, image)
    if not success:
        return

    buffer.tofile(file)
