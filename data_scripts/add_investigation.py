import requests

#############################################
# just for coordinate points.

# this is SP
# payload = {
#     u'lat_start': -23.568,
#     u'lon_start': -46.66,
#     u'lat_end': -23.558,
#     u'lon_end': -46.65,
#     u'sub_region_width': 0.002,
#     u'sub_region_height': 0.002,
#     u'num_sub_regions_width': 5,
#     u'num_sub_regions_height': 5,
#     u'expert_id': 42
# }


# p or pope
# payload = {
#     u'lat_start': 41.692174 - 0.0025,
#     u'lon_start': 44.804135 - 0.0025,
#     u'lat_end': 41.692174 + 0.0025,
#     u'lon_end': 44.804135 + 0.0025,
#     u'sub_region_width': 0.001,
#     u'sub_region_height': 0.001,
#     u'num_sub_regions_width': 5,
#     u'num_sub_regions_height': 5,
#     u'expert_id': 23
# }

# this is charlet, NC (clt)
# payload = {
#     u'lat_start': 35.225 - 0.01,
#     u'lon_start': -80.841437 - 0.01,
#     u'lat_end': 35.225 + 0.01,
#     u'lon_end': -80.841437 + 0.01,
#     u'sub_region_width': 0.004,
#     u'sub_region_height': 0.004,
#     u'num_sub_regions_width': 5,
#     u'num_sub_regions_height': 5,
#     u'expert_id': 23
# }

#############################################
#############################################
# for real use



# this is charlet, NC (clt)
# needs diff picks, its in region 10
# payload = {
#     u'lat_start': 35.2172384 - 0.01,
#     u'lon_start': -80.8336135 - 0.01,
#     u'lat_end': 35.2172384 + 0.01,
#     u'lon_end': -80.8336135 + 0.01,
#     u'sub_region_width': 0.0014,
#     u'sub_region_height': 0.0014,
#     u'num_sub_regions_width': 4,
#     u'num_sub_regions_height': 4,
#     u'expert_id': 1,
#     u'img': "https://www.dropbox.com/s/dgmz74j1zjzbzok/CLT_level1_rotate.jpg?dl=0",
#     u'zoom': 18
# }

# payload = {
#     u'lat_start': 35.2172384 - 0.01,
#     u'lon_start': -80.8336135 - 0.01,
#     u'lat_end': 35.2172384 + 0.01,
#     u'lon_end': -80.8336135 + 0.01,
#     u'sub_region_width': 0.0014,
#     u'sub_region_height': 0.0014,
#     u'num_sub_regions_width': 4,
#     u'num_sub_regions_height': 4,
#     u'expert_id': 1,
#     u'img': "https://www.dropbox.com/s/8yvbobosd2w80lg/CLT_level3_rotate.jpg?dl=0",
#     u'zoom': 18
# }

# payload = {
#     u'lat_start': 35.2172384 - 0.01,
#     u'lon_start': -80.8336135 - 0.01,
#     u'lat_end': 35.2172384 + 0.01,
#     u'lon_end': -80.8336135 + 0.01,
#     u'sub_region_width': 0.0014,
#     u'sub_region_height': 0.0014,
#     u'num_sub_regions_width': 4,
#     u'num_sub_regions_height': 4,
#     u'expert_id': 1,
#     u'img': "https://www.dropbox.com/s/365mdmcladg7in2/CLT_level4_rotate.jpg?dl=0",
#     u'zoom': 18
# }
#########

#########
# BR

# payload = {
#     u'lat_start': -15.797342 - 0.01,
#     u'lon_start': -47.871063 - 0.01,
#     u'lat_end': -15.797342 + 0.01,
#     u'lon_end': -47.871063 + 0.01,
#     u'sub_region_width': 0.006,
#     u'sub_region_height': 0.006,
#     u'num_sub_regions_width': 4,
#     u'num_sub_regions_height': 4,
#     u'expert_id': 1,
#     u'img': "https://www.dropbox.com/s/b682urjjws672u0/Brasilia_level1_rotate.jpg?dl=0",
#     u'zoom': 17
# }

# payload = {
#     u'lat_start': -15.797342 - 0.01,
#     u'lon_start': -47.871063 - 0.01,
#     u'lat_end': -15.797342 + 0.01,
#     u'lon_end': -47.871063 + 0.01,
#     u'sub_region_width': 0.006,
#     u'sub_region_height': 0.006,
#     u'num_sub_regions_width': 4,
#     u'num_sub_regions_height': 4,
#     u'expert_id': 1,
#     u'img': "https://www.dropbox.com/s/1nvtxbeti7a7o5n/Brasilia_level3_rotate.jpg?dl=0",
#     u'zoom': 17
# }

payload = {
    u'lat_start': -15.797342 - 0.01,
    u'lon_start': -47.871063 - 0.01,
    u'lat_end': -15.797342 + 0.01,
    u'lon_end': -47.871063 + 0.01,
    u'sub_region_width': 0.006,
    u'sub_region_height': 0.006,
    u'num_sub_regions_width': 4,
    u'num_sub_regions_height': 4,
    u'expert_id': 1,
    u'img': "https://www.dropbox.com/s/o6ctfbwgyb3iutk/Brasilia_level6_rotate.jpg?dl=0",
    u'zoom': 17,
}

#########
#########
# CMD


# payload = {
#     u'lat_start': 34.053287 - 0.005,
#     u'lon_start': -118.268999 - 0.005,
#     u'lat_end': 34.053287 + 0.005,
#     u'lon_end': -118.268999 + 0.005,
#     u'sub_region_width': 0.0024,
#     u'sub_region_height': 0.0024,
#     u'num_sub_regions_width': 4,
#     u'num_sub_regions_height': 4,
#     u'expert_id': 1,
#     u'img': "https://www.dropbox.com/s/p5uez4ppyzudbdx/Comodore_level1_rotate.jpg?dl=0",
#     u'zoom': 18
# }

# payload = {
#     u'lat_start': 34.053287 - 0.005,
#     u'lon_start': -118.268999 - 0.005,
#     u'lat_end': 34.053287 + 0.005,
#     u'lon_end': -118.268999 + 0.005,
#     u'sub_region_width': 0.0024,
#     u'sub_region_height': 0.0024,
#     u'num_sub_regions_width': 4,
#     u'num_sub_regions_height': 4,
#     u'expert_id': 1,
#     u'img': "https://www.dropbox.com/s/ah71bf1hrigptiz/Comodore_level3_rotate.jpg?dl=0",
#     u'zoom': 18
# }

# payload = {
#     u'lat_start': 34.053287 - 0.005,
#     u'lon_start': -118.268999 - 0.005,
#     u'lat_end': 34.053287 + 0.005,
#     u'lon_end': -118.268999 + 0.005,
#     u'sub_region_width': 0.0024,
#     u'sub_region_height': 0.0024,
#     u'num_sub_regions_width': 4,
#     u'num_sub_regions_height': 4,
#     u'expert_id': 1,
#     u'img': "https://www.dropbox.com/s/y5e3qm5pepyscvu/Comodore_level6_rotate.jpg?dl=0",
#     u'zoom': 18
# }



#############################################

# r = requests.post("https://groundtruth.herokuapp.com/add_investigation/", data=payload)
r = requests.post("http://127.0.0.1:8000/add_investigation/", data=payload)
print(r.text)
