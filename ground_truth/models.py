from __future__ import unicode_literals

from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class Investigation(models.Model):
    lat_start = models.FloatField(blank=False, default=0.0)
    lon_start = models.FloatField(blank=False, default=0.0)

    lat_end = models.FloatField(blank=False, default=0.0)
    lon_end = models.FloatField(blank=False, default=0.0)

    expert_id = models.IntegerField(blank=False, default=0.0)

    datetime_str = models.CharField(max_length=200)


    # TODO Give meaning
    # TODO idk how this works, this was from a guide
    STATUS_1 = 1
    STATUS_2 = 2
    STATUS_3 = 3
    STATUS_CHOICES = (
        (STATUS_1, 'status 1'),
        (STATUS_2, 'status 2'),
        (STATUS_3, 'status 3'),
    )

    status = models.IntegerField(choices=STATUS_CHOICES, default=STATUS_1)

    image = models.TextField(blank=True)

    def __str__(self):
        return "lat_start: {0}  lon_start:  {1}  lat_end: {2}  lon_end: {3}  expert_id: {4}  " \
               "datetime: {5}  status: {6}  image: {7}\n".format(
            self.lat_start, self.lon_start, self.lat_end, self.lon_end,
            self.expert_id, self.datetime_str, self.status, self.image
        )


class Region(models.Model):
    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE)

    lat_start = models.FloatField(blank=False, default=0.0)
    lon_start = models.FloatField(blank=False, default=0.0)

    lat_end = models.FloatField(blank=False, default=0.0)
    lon_end = models.FloatField(blank=False, default=0.0)

    def __str__(self):
        return "lat_start: {0}  lon_start:  {1}  lat_end: {2}  lon_end: {3}  investigation: {4}\n".format(
            self.lat_start, self.lon_start, self.lat_end, self.lon_end, self.investigation.pk
        )


#TODO Rename
class Subregion(models.Model):
    region = models.ForeignKey(Region, on_delete=models.CASCADE)

    lat_start = models.FloatField(blank=False, default=0.0)
    lon_start = models.FloatField(blank=False, default=0.0)

    lat_end = models.FloatField(blank=False, default=0.0)
    lon_end = models.FloatField(blank=False, default=0.0)

    # go up, then right, then down, then right, then up.....
    index = models.IntegerField(
        blank=False,
        default=0,
        validators=[MaxValueValidator(24), MinValueValidator(0)]
    )

    def __str__(self):
        return "lat_start: {0}  lon_start:  {1}  lat_end: {2}  lon_end: {3}  index: {5} region_id: {4}\n".format(
            self.lat_start, self.lon_start, self.lat_end, self.lon_end, self.index, self.region.pk
        )


class Judgement(models.Model):
    NOT_SEEN = 1
    NO = 2
    YES = 3
    STATUS_CHOICES = (
        (NOT_SEEN, 'Not Seen'),
        (NO, 'No'),
        (YES, 'Yes'),
    )

    # TODO rename
    subregion = models.ForeignKey(Subregion, on_delete=models.CASCADE)

    result = models.IntegerField(choices=STATUS_CHOICES, default=NOT_SEEN)

    worker = models.IntegerField(default=0, blank=False)

    datetime_completed_str = models.CharField(max_length=200)

    time_duration_ms = models.IntegerField(blank=False, default=0)

    # we need to store zoom level

    def __str__(self):
        return "result: {0}  worker{1}  datetime: {2}  duration: {3} subregion: {4}\n".format(
            self.result, self.worker, self.datetime_completed_str, self.time_duration, self.subregion.pk
        )
