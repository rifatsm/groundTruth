import requests  # pip install requests

def add_region_url(region, token):
    param = str(region) + "_" + str(token)
    request_parameters = '"https://groundtruth-study3.herokuapp.com/search/?everything=' + param + '"}],'
    return True
