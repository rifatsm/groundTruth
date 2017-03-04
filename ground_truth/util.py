from ground_truth.models import Region, Investigation, Subregion, Judgement
from decimal import *


def isfloat(x):
    try:
        float(x)
    except ValueError:
        return False
    else:
        return True


def build_regions(invest, height, width, zoom):
    # TODO i am assuming that the region will fit evenly in the investigation

    ret = []
    getcontext().prec = 6
    getcontext().rounding = ROUND_HALF_UP
    vertical_bounds = + (Decimal(abs(invest.lat_start - invest.lat_end) / height) + 1)
    horizontal_bounds = + (Decimal(abs(invest.lon_start - invest.lon_end) / width) + 1)
    for i in range(1, int(vertical_bounds)):
        for j in range(1, int(horizontal_bounds)):
            ret.append(Region(
                lat_start=invest.lat_start + (width * (i - 1)),
                lon_start=invest.lon_start + (height * (j - 1)),
                lat_end=invest.lat_start + (width * i),
                lon_end=invest.lon_start + (height * j),
                investigation=invest,
                zoom=zoom
            ))
    return ret


def build_sub_regions(region, num_tall, num_wide):
    ret = []
    index = 0

    getcontext().prec = 6
    getcontext().rounding = ROUND_HALF_UP

    sub_width = +(Decimal(abs(region.lon_start - region.lon_end))) / num_wide
    sub_height = +(Decimal(abs(region.lat_start - region.lat_end))) / num_tall

    num_wide = int(+Decimal(num_wide))
    num_tall = int(+Decimal(num_tall))

    for i in range(1,  num_wide + 1):
        if (i % 2 == 0):
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
        else:
            for j in range(1,  num_tall+ 1):
                ret.append(
                    Subregion(region=region,
                              lat_start=region.lat_start + (sub_width * (j - 1)),
                              lon_start=region.lon_start + (sub_height * (i - 1)),
                              lat_end=region.lat_start + (sub_width * j),
                              lon_end=region.lon_start + (sub_height * i),
                              index=index))
                index += 1
    return ret
