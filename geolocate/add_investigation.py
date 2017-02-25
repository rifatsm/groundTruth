import requests

x = -23.568
y = -46.66
z = -23.558
k = -46.65
payload = {
    u'lat_start': x,
    u'lon_start': y,
    u'lat_end': z,
    u'lon_end': k,
    u'sub_region_width': 0.002,
    u'sub_region_height': 0.002,
    u'num_sub_regions_width': 5,
    u'num_sub_regions_height': 5,
    u'expert_id': 42
}

r = requests.post("http://127.0.0.1:8000/ground_truth/add_investigation/", data=payload)
print(r.text)
