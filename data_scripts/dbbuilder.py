import django
import datetime

django.setup()

from ground_truth.models import Investigation, Region, Subregion, Judgement

SIZE = 5

LAT_START = -15.807342
LON_START = -47.881063

LAT_END = -15.787342
LON_END = -47.861063

SEARCH_WIDTH = abs(LAT_START - LAT_END)
SEARCH_HEIGHT = abs(LON_START - LON_END)

SUBREGION_WIDTH = SEARCH_WIDTH / SIZE
SUBREGION_HEIGHT = SEARCH_HEIGHT / SIZE

now = datetime.datetime.now()

invest = Investigation(lat_start=LAT_START, lon_start=LON_START, lat_end=LAT_END, lon_end=LON_END, expert_id=1,
                       status=1, image="", datetime_str=now.isoformat())
invest.save()

region = Region(investigation=invest, lat_start=LAT_START, lon_start=LON_START, lat_end=LAT_END,
                lon_end=LON_END)
region.save()

index = 0
for i in range(1, SIZE + 1):
    if (i%2 == 0):
        j = SIZE
        while(j>0):
            Subregion(region=region,
                      lat_start=LAT_START + (SUBREGION_WIDTH * (j - 1)),
                      lon_start=LON_START + (SUBREGION_HEIGHT * (i - 1)),
                      lat_end=LAT_START + (SUBREGION_WIDTH * j),
                      lon_end=LON_START + (SUBREGION_HEIGHT * i),
                      index=index).save()
            index += 1
            j-=1
    else:
        for j in range(1, SIZE + 1):
            Subregion(region=region,
                lat_start=LAT_START + (SUBREGION_WIDTH * (j - 1)),
                lon_start=LON_START + (SUBREGION_HEIGHT * (i - 1)),
                lat_end=LAT_START + (SUBREGION_WIDTH * j),
                lon_end=LON_START + (SUBREGION_HEIGHT * i),
                index=index).save()
            index += 1
