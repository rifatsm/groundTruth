import requests

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


# auzi with snap
payload = {
    u'lat_start': -27.522386 - 0.01,
    u'lon_start': 153.025970 - 0.01,
    u'lat_end': -27.522386 + 0.01,
    u'lon_end': 153.025970 + 0.01,
    u'sub_region_width': 0.003,
    u'sub_region_height': 0.003,
    u'num_sub_regions_width': 5,
    u'num_sub_regions_height': 5,
    u'expert_id': 23,
    u'img': "https://www.dropbox.com/s/uv7n6uvryplxone/Paulo_level1_rotate.jpg?dl=0",
    u'zoom': 17
}

# r = requests.post("https://groundtruth.herokuapp.com/add_investigation/", data=payload)
r = requests.post("http://127.0.0.1:8000//add_investigation/", data=payload)
print(r.text)
