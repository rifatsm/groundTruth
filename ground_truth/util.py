from ground_truth.models import Region, Investigation, Subregion, Judgement


def isfloat(x):
    try:
        float(x)
    except ValueError:
        return False
    else:
        return True


def build_regions(invest, height, width):
    # TODO i am assuming that the region will fit evenly in the investigation

    ret = []
    # print(int((abs(invest.lat_start - invest.lat_end) / height) + 1))
    print(

            int( ((abs(invest.lon_start - invest.lon_end) / width) + 1) )

    )
    for i in range(1, int((abs(invest.lat_start - invest.lat_end) / height) + 1)):
        for j in range(1, int((abs(invest.lon_start - invest.lon_end) / width) + 1)):
            ret.append(Region(
                lat_start=invest.lat_start + (width * (i - 1)),
                lon_start=invest.lon_start + (height * (j - 1)),
                lat_end=invest.lat_start + (width * i),
                lon_end=invest.lon_start + (height * j)
            ))
    return ret


def build_sub_regions(region, num_tall, num_wide):
    ret = []
    index = 0

    sub_width = abs(region.lon_start - region.lon_end) / num_wide
    sub_height = abs(region.lat_start - region.lat_end) / num_tall

    for i in range(1, num_wide + 1):
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
