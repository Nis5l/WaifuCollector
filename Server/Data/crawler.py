from google_images_search import GoogleImagesSearch

token = "AIzaSyAoP8mZ2N0f7iN8ff5UC2atkMpc7DtBBpM"
cx="e1b3946be0b180ba6"


# you can provide API key and CX using arguments,
# or you can set environment variables: GCS_DEVELOPER_KEY, GCS_CX
gis = GoogleImagesSearch(token, cx)

# define search params:
_search_params = {
    'q': '...',
    'num': 10,
    'safe': 'high|medium|off',
    'fileType': 'jpg|gif|png',
    'imgType': 'clipart|face|lineart|news|photo',
    'imgSize': 'huge|icon|large|medium|small|xlarge|xxlarge',
    'imgDominantColor': 'black|blue|brown|gray|green|pink|purple|teal|white|yellow',
    'rights': 'cc_publicdomain|cc_attribute|cc_sharealike|cc_noncommercial|cc_nonderived'
}

# this will only search for images:
gis.search(search_params=_search_params)

# this will search and download:
#gis.search(search_params=_search_params, path_to_dir='Card')

# this will search, download and resize:
#gis.search(search_params=_search_params, path_to_dir='Card', width=500, height=500)

# search first, then download and resize afterwards:
#gis.search(search_params=_search_params)
#for image in gis.results():
    #print(image)
    #image.download('/Card')
    #image.resize(500, 500)