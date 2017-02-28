import requests

payload = {
    u'lat_start': -23.568,
    u'lon_start': -46.66,
    u'lat_end': -23.558,
    u'lon_end': -46.65,
    u'sub_region_width': 0.002,
    u'sub_region_height': 0.002,
    u'num_sub_regions_width': 5,
    u'num_sub_regions_height': 5,
    u'expert_id': 42
}

r = requests.post("http://127.0.0.1:8000/ground_truth/add_investigation/", data=payload)
print(r.text)
