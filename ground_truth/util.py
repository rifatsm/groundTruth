from ground_truth.models import Region, Investigation, Subregion, Judgement


def isfloat(x):
    try:
        float(x)
    except ValueError:
        return False
    else:
        return True


def build_regions(invest, height, width):

    #TODO i am assuming that the region will fit evenly in the investigation

    ret = []
    for i in range(1, (abs(invest.lat_start - invest.lat_end)/height) +1):
        for j in range(1, (abs(invest.lon_start - invest.lon_end)/width) + 1):
            ret.append(Region(
                lat_start=invest.lat_start + (width*(i-1)),
                lon_start=invest.lon_start + (height*(j-1)),
                lat_end=invest.lat_start + (width*i),
                lon_end=invest.lon_start + (height*j)
            ))
    return ret


def build_sub_regions(region, size):

    ret = []
    index = 0

    sub_width = abs(region.lon_start - region.lon_end)/size
    sub_height = abs(region.lat_start - region.lat_end)/size
    # TODO verify that these indexes are being built correctly
    for i in range(1, size+1):
        for j in range(1, size+1):
            ret.append(Subregion(
                lat_start=region.lat_start+(sub_height*(i-1)),
                lon_start=region.lon_start+(sub_width*(j-1)),
                lat_end=region.lat_start+(sub_height*i),
                lon_end=region.lon_end+(sub_height*j),
                index=index,
                region=region
            ))
            index+=1
    return ret
