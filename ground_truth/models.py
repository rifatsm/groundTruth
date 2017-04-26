from __future__ import unicode_literals

from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from decimal import *
from django.contrib.auth.models import User

getcontext().rounding = ROUND_HALF_UP


class Investigation(models.Model):
    lat_start = models.DecimalField(blank=False, default=(+Decimal(0.0)), max_digits=9, decimal_places=6)
    lon_start = models.DecimalField(blank=False, default=(+Decimal(0.0)), max_digits=9, decimal_places=6)

    lat_end = models.DecimalField(blank=False, default=(+Decimal(0.0)), max_digits=9, decimal_places=6)
    lon_end = models.DecimalField(blank=False, default=(+Decimal(0.0)), max_digits=9, decimal_places=6)

    expert_id = models.ForeignKey(User, on_delete=models.CASCADE)

    datetime_str = models.CharField(max_length=200)

    name = models.CharField(max_length=140, blank=False, default='Untitled Investigation')

    description = models.TextField(blank=True)

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

    ground_image = models.TextField(blank=True)
    diagram_image = models.TextField(blank=True)

    def __str__(self):
        return "lat_start: {0}  lon_start:  {1}  lat_end: {2}  lon_end: {3}  expert_id: {4}  " \
               "datetime: {5}  status: {6}  image: {7}\n".format(
            self.lat_start, self.lon_start, self.lat_end, self.lon_end,
            self.expert_id, self.datetime_str, self.status, self.image
        )


class Region(models.Model):
    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE)

    lat_start = models.DecimalField(blank=False,
                                    default=Decimal(0.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP),
                                    max_digits=9, decimal_places=6)

    lon_start = models.DecimalField(blank=False,
                                    default=Decimal(0.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP),
                                    max_digits=9, decimal_places=6)

    lat_end = models.DecimalField(blank=False,
                                  default=Decimal(0.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP),
                                  max_digits=9, decimal_places=6)

    lon_end = models.DecimalField(blank=False,
                                  default=Decimal(0.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP),
                                  max_digits=9, decimal_places=6)

    zoom = models.IntegerField(blank=False, default=18)

    access_token = models.CharField(max_length=64, blank=False)

    def __str__(self):
        return "lat_start: {0}  lon_start:  {1}  lat_end: {2}  lon_end: {3}  investigation: {4}  zoom: {5}" \
               "  access_token: {6}\n".format(
            self.lat_start, self.lon_start, self.lat_end, self.lon_end, self.investigation.pk,
            self.zoom, self.access_token
        )


# TODO Rename
class Subregion(models.Model):
    region = models.ForeignKey(Region, on_delete=models.CASCADE)

    lat_start = models.DecimalField(blank=False,
                                    default=Decimal(0.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP),
                                    max_digits=9, decimal_places=6)

    lon_start = models.DecimalField(blank=False,
                                    default=Decimal(0.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP),
                                    max_digits=9, decimal_places=6)

    lat_end = models.DecimalField(blank=False,
                                  default=Decimal(0.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP),
                                  max_digits=9, decimal_places=6)

    lon_end = models.DecimalField(blank=False,
                                  default=Decimal(0.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP),
                                  max_digits=9, decimal_places=6)

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

    worker = models.CharField(max_length=64, blank=False)

    # datetime_completed_str = models.CharField(max_length=200)

    start_time_sec = models.IntegerField(blank=False, default=-1) # from epoch
    end_time_sec = models.IntegerField(blank=False, default=-1) # from epoch

    rotation = models.IntegerField(blank=False, default=0)

    task_id = models.CharField(max_length=64, blank=False)

    def __str__(self):
        return "result: {0}  worker{1}  start sec: {2}  end sec: {3} subregion: {4}  task_id: {5}\n".format(
            self.result, self.worker, self.start_time_sec, self.end_time_sec, self.subregion.pk, self.task_id
        )

    def is_plausible(self):
        return True if self.result == 3 else False


class CompletedTasks(models.Model):
    worker = models.CharField(max_length=64, blank=False)
    task_id = models.CharField(max_length=60, blank=False)
    token = models.CharField(max_length=64, blank=False)

    comment = models.TextField(blank=True)

    def __str__(self):
        return "worker: {0}  task_id: {1}  token: {2}\n".format(
            self.worker, self.task_id, self.token
        )
