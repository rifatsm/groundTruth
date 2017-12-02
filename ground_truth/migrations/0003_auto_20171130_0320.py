# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-11-30 03:20
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ground_truth', '0002_auto_20171104_1757'),
    ]

    operations = [
        migrations.AddField(
            model_name='region',
            name='workers',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='investigation',
            name='diagram_image',
            field=models.ImageField(blank=True, null=True, upload_to='ground_truth/static/img/expert1/diagram_image/'),
        ),
        migrations.AlterField(
            model_name='investigation',
            name='ground_image',
            field=models.ImageField(blank=True, null=True, upload_to='ground_truth/static/img/expert1/ground_level_image/'),
        ),
    ]