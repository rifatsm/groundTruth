base_url = "http://localhost:8000/designate/?"
# base_url = "http://groundtruth-study3.herokuapp.com/designate/?"
# diagram_image_3 = "https://dl.dropboxusercontent.com/s/"

###############################################################
# CLT

diagram_image_1 = "https://dl.dropboxusercontent.com/s/m2d4swthc9hos45/study2_CLT.png"

ground_image_1 = "https://dl.dropboxusercontent.com/s/pontqtv2xv9qvk9/clt_ground_blur.png"

lat_1 = 35.227087
lon_1 = -80.843127

name_1 = "CLT_pilot"

###############################################################
# CMD

diagram_image_2 = "https://dl.dropboxusercontent.com/s/0ud01xsanoytg6a/study2_CMD.png"

ground_image_2 = "https://dl.dropboxusercontent.com/s/j45inpalpgg345d/cmd_ground_blur.png"

lat_2 = 34.052234
lon_2 = -118.243685

name_2 = "CMD_pilot"

###############################################################
# BR

diagram_image_3 = "https://dl.dropboxusercontent.com/s/637pp5xae2xuf3w/BR_2.png"

ground_image_3 = "https://dl.dropboxusercontent.com/s/ro4ivlbiraezw49/BR_ground.jpg"

lat_3 = -15.794157
lon_3 = -47.882529

name_3 = "BR_pilot"


def compose(base, d, g, lat, lon, name):
    return "{0}ground_image={1}&diagram_image={2}&lat={3}&lon={4}&name={5}".format(base, g, d, lat, lon, name)


if __name__ == "__main__":
    print("\n")
    print(compose(base_url, diagram_image_1, ground_image_1, lat_1, lon_1, name_1) + "\n")
    print("\n")
    print(compose(base_url, diagram_image_2, ground_image_2, lat_2, lon_2, name_2) + "\n")
    print("\n")
    print(compose(base_url, diagram_image_3, ground_image_3, lat_3, lon_3, name_3) + "\n")
    print("\n")
