from ground_truth.models import Region, Investigation, Subregion, Judgement
from decimal import *
import datetime
import hashlib


#####################################################################################!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
##!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
##!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# TODO dont use floats, use the Decimal class since floating point precision sucks.



def snap(lat_start, lon_start, lat_end, lon_end, sub_region_width, sub_region_height,
         num_sub_regions_width, num_sub_regions_height):
    """
    This code looks as what the expert drew and then determines if it can be perfectly divided into worker tasks. 
    If not then it snaps out in both directions evenly. 
    
    EX: if a investigation fits horizontally but not vertically, say the hight can be either 1,2,3.. but the 
    given height is 1.6 then the bottom will move 0.2 lower and the top will move 0.2 higher to have an integral fit. 
    This works for with and height independently. 
    
    :param lat_start: 
    :param lon_start: 
    :param lat_end: 
    :param lon_end: 
    :param sub_region_width: 
    :param sub_region_height: 
    :param num_sub_regions_width: 
    :param num_sub_regions_height: 
    :return: 
    """

    # TODO All lat long number should be the python Decial class due to floating point precision issues.
    # the quantize operation tells the class to round to that many decimal places.

    # lower left of investigation
    lat_start = Decimal(lat_start).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)
    lon_start = Decimal(lon_start).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)

    # upper right of investigation
    lat_end = Decimal(lat_end).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)
    lon_end = Decimal(lon_end).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)

    sub_region_width = Decimal(sub_region_width).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)
    sub_region_height = Decimal(sub_region_height).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)

    num_sub_regions_width = Decimal(num_sub_regions_width).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)
    num_sub_regions_height = Decimal(num_sub_regions_height).quantize(Decimal('.000001'),
                                                                      rounding=ROUND_HALF_UP)

    WIDTH = num_sub_regions_width * sub_region_width
    HEIGHT = num_sub_regions_height * sub_region_height

    investigation_height = (
        Decimal(abs(lat_start - lat_end)).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))

    investigation_width = (
        Decimal(abs(lon_start - lon_end)).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))

    # it doesnt fit perfectly, we need to expand out in both directions by half the discrepancy
    if investigation_width % WIDTH != 0.0:
        missing = WIDTH - (
            Decimal(investigation_width % WIDTH).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))
        expand = missing / (Decimal(2.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))

        lon_start = lon_start - expand
        lon_end = lon_end + expand

    if investigation_height % HEIGHT != 0.0:
        missing = HEIGHT - (
            Decimal(investigation_height % HEIGHT).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))
        expand = missing / (Decimal(2.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))

        lat_start = lat_start - expand
        lat_end = lat_end + expand

    return lat_start, lon_start, lat_end, lon_end, WIDTH, HEIGHT


def isfloat(x):
    try:
        float(x)
    except ValueError:
        return False
    else:
        return True


def verify_in(object, is_in):
    for item in is_in:
        if item not in object:
            return False
    return True


def build_regions(invest, height, width, zoom):
    """
    I am making assuming that regions will fit perfectly in an investigation
    :param invest: 
    :param height: 
    :param width: 
    :param zoom: 
    :return: 
    """
    # TODO i am assuming that the region will fit evenly in the investigation

    hash_lib = hashlib.sha256()
    ret = []

    Decimal(0.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)

    vertical_bounds = (Decimal(abs(invest.lat_start - invest.lat_end) / height) + 1).quantize(Decimal('.000001'),
                                                                                              rounding=ROUND_HALF_UP)
    horizontal_bounds = (Decimal(abs(invest.lon_start - invest.lon_end) / width) + 1).quantize(Decimal('.000001'),
                                                                                               rounding=ROUND_HALF_UP)
    for i in range(1, int(vertical_bounds)):
        for j in range(1, int(horizontal_bounds)):
            hash_lib.update(datetime.datetime.now().isoformat())  # the token of the region
            ret.append(Region(

                # build the regins based off of the lower left corner of the investigation
                lat_start=invest.lat_start + (width * (i - 1)),
                lon_start=invest.lon_start + (height * (j - 1)),
                lat_end=invest.lat_start + (width * i),
                lon_end=invest.lon_start + (height * j),
                investigation=invest,
                zoom=zoom,
                access_token=hash_lib.hexdigest()
            ))
    return ret


def build_sub_regions(region, num_tall, num_wide):
    ret = []
    index = 0

    sub_width = (Decimal(abs(region.lon_start - region.lon_end))).quantize(Decimal('.000001'),
                                                                           rounding=ROUND_HALF_UP) / num_wide
    sub_height = (Decimal(abs(region.lat_start - region.lat_end))).quantize(Decimal('.000001'),
                                                                            rounding=ROUND_HALF_UP) / num_tall

    num_wide = int(Decimal(num_wide).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))
    num_tall = int(Decimal(num_tall).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))

    # move from left to right accross the region
    # as the regions are built from left to right the alternate from top to bottom and bottom to top.
    # EX: the number indicates when it was built
    # 4 5 12 13
    # 3 6 11 14
    # 2 7 10 15
    # 1 8 9  16
    for i in range(1, num_wide + 1):  # build left to right
        if (i % 2 == 0):  # build up
            j = num_tall
            while (j > 0):
                ret.append(
                    Subregion(region=region,
                              lat_start=region.lat_start + (sub_width * (j - 1)),
                              lon_start=region.lon_start + (sub_height * (i - 1)),
                              lat_end=region.lat_start + (sub_width * j),
                              lon_end=region.lon_start + (sub_height * i),
                              index=index))
                index += 1
                j -= 1
        else:  # build down
            for j in range(1, num_tall + 1):
                ret.append(
                    Subregion(region=region,
                              lat_start=region.lat_start + (sub_width * (j - 1)),
                              lon_start=region.lon_start + (sub_height * (i - 1)),
                              lat_end=region.lat_start + (sub_width * j),
                              lon_end=region.lon_start + (sub_height * i),
                              index=index))
                index += 1
    return ret
