from __future__ import unicode_literals

from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class Investigation(models.Model):
    lat_start = models.FloatField(blank=False, default=0.0)
    lon_start = models.FloatField(blank=False, default=0.0)

    lat_end = models.FloatField(blank=False, default=0.0)
    lon_end = models.FloatField(blank=False, default=0.0)

    expert_id = models.IntegerField(blank=False, default=0.0)

    date = models.DateField(auto_now_add=True, blank=True)
    time = models.DateField(auto_now_add=True, blank=True)

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
               "date: {5}  time:  {6}  status: {7}  image{8}".format(
            self.lat_start, self.lon_start, self.lat_end, self.lon_end,
            self.expert_id, self.date, self.time, self.status, self.image
        )


class Region(models.Model):
    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE)

    lat_start = models.FloatField(blank=False, default=0.0)
    lon_start = models.FloatField(blank=False, default=0.0)

    lat_end = models.FloatField(blank=False, default=0.0)
    lon_end = models.FloatField(blank=False, default=0.0)

    def __str__(self):
        return "lat_start: {0}  lon_start:  {1}  lat_end: {2}  lon_end: {3}  investigation: {4}".format(
            self.lat_start, self.lon_start, self.lat_end, self.lon_end, self.investigation
        )


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
        return "lat_start: {0}  lon_start:  {1}  lat_end: {2}  lon_end: {3}  region_id: {4}  index: {5}".format(
            self.lat_start, self.lon_start, self.lat_end, self.lon_end, self.region, self.index
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

    subregion = models.ForeignKey(Subregion, on_delete=models.CASCADE)

    result = models.IntegerField(choices=STATUS_CHOICES, default=NOT_SEEN)

    worker = models.IntegerField(default=0, blank=False)

    date_completed = models.DateField(auto_now_add=True, blank=True)
    time_completed = models.DateField(auto_now_add=True, blank=True)

    time_duration = models.IntegerField(blank=False, default=0)

    # we need to store zoom level

    def __str__(self):
        return "subregion: {0}  result: {1}  worker{2}  date: {3}  time: {4}  duration: {5}".format(
            self.subregion, self.result, self.worker, self.date_completed, self.time_completed, self.time_duration
        )
