import requests

#############################################
# friday, april 28th

# # # cape town
# payload = {
#     u'lat_start': -33.9474785,
#     u'lon_start': 18.402071500000034,
#     u'lat_end': -33.9074785,
#     u'lon_end': 18.442071499999997,
#     u'sub_region_width': 0.0025,
#     u'sub_region_height': 0.0025,
#     u'num_sub_regions_width': 4,
#     u'num_sub_regions_height': 4,
#     u'ground_image': "https://dl.dropboxusercontent.com/s/k01rcvj1479fcr8/Image1.png",
#     u'diagram_image': 'https://dl.dropboxusercontent.com/s/9rlaxisrtm9d2xj/captown_std3.jpeg',
#     u'zoom': 18,
#     u'is_tutorial': "false",
#     u'invest_name': "cause i need one for testing",
# }

# saudi
# payload = {
#     u'lat_start': 24.692951,
#     u'lon_start': 46.66368549999993,
#     u'lat_end': 24.772951,
#     u'lon_end': 46.74368549999997,
#     u'sub_region_width': 0.005,
#     u'sub_region_height': 0.005,
#     u'num_sub_regions_width': 4,
#     u'num_sub_regions_height': 4,
#     u'ground_image': "https://dl.dropboxusercontent.com/s/bw6tqow3ddu9h2d/SA_blur.PNG",
#     u'diagram_image': 'https://dl.dropboxusercontent.com/s/1441pncuo5a290z/saudi_std3.jpeg?dl=0',
#     u'zoom': 17,
#     u'is_tutorial': "false",
#     u'invest_name': "cause i need one for testing",
# }
#####################################################
# saturday, april 29th

# # # cape town
# payload = { ##########################################################################
#     u'lat_start': -33.934741011319545,
#     u'lon_start': 18.406660705804825,
#     u'lat_end': -33.9254117956831,
#     u'lon_end': 18.419191986322403+0.01,
#     u'sub_region_width': 0.0012,
#     u'sub_region_height': 0.0012,
#     u'num_sub_regions_width': 4,
#     u'num_sub_regions_height': 4,
#     u'ground_image': "https://dl.dropboxusercontent.com/s/k01rcvj1479fcr8/Image1.png",
#     u'diagram_image': 'https://dl.dropboxusercontent.com/s/9rlaxisrtm9d2xj/captown_std3.jpeg',
#     u'zoom': 19,
#     u'is_tutorial': "false",
#     u'invest_name': "cause i need one for testing",
# }

# saudi
# payload = { ##########################################################################
#     u'lat_start': 24.7413029188033,
#     u'lon_start': 46.64411097764969,
#     u'lat_end': 24.77840253562546,
#     u'lon_end': 46.69509440660477,
#     u'sub_region_width':  0.0025,
#     u'sub_region_height':  0.0025,
#     u'num_sub_regions_width': 4,
#     u'num_sub_regions_height': 4,
#     u'ground_image': "https://dl.dropboxusercontent.com/s/bw6tqow3ddu9h2d/SA_blur.PNG",
#     u'diagram_image': 'https://dl.dropboxusercontent.com/s/1441pncuo5a290z/saudi_std3.jpeg?dl=0',
#     u'zoom': 18,
#     u'is_tutorial': "false",
#     u'invest_name': "cause i need one for testing",
# }

# CMD
payload = { ##########################################################################
    u'lat_start': 34.03708986127088 + 0.005,
    u'lon_start': -118.27226132154465,
    u'lat_end': 34.0547983317786,
    u'lon_end': -118.24711292982101 - 0.01,
    u'sub_region_width': 0.0012,
    u'sub_region_height': 0.0012,
    u'num_sub_regions_width': 4,
    u'num_sub_regions_height': 4,
    u'ground_image': "https://dl.dropboxusercontent.com/s/j45inpalpgg345d/cmd_ground_blur.png",
    u'diagram_image': 'https://dl.dropboxusercontent.com/s/hu6e6tdnxb4bxsl/cmd_la_std3.jpeg',
    u'zoom': 19,
    u'is_tutorial': "false",
    u'invest_name': "cause i need one for testing",
}


# r = requests.post(" https://groundtruth-study3.herokuapp.com/add_investigation/", data=payload) #rachel this sends it
r = requests.post("http://127.0.0.1:8000/add_investigation/", data=payload)
print(r.text)