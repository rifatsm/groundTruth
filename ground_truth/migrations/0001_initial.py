# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-21 21:52
from __future__ import unicode_literals

from decimal import Decimal
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CompletedTasks',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('worker', models.CharField(max_length=64)),
                ('task_id', models.CharField(max_length=60)),
                ('token', models.CharField(max_length=64)),
                ('comment', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Investigation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lat_start', models.DecimalField(decimal_places=6, default=Decimal('0'), max_digits=9)),
                ('lon_start', models.DecimalField(decimal_places=6, default=Decimal('0'), max_digits=9)),
                ('lat_end', models.DecimalField(decimal_places=6, default=Decimal('0'), max_digits=9)),
                ('lon_end', models.DecimalField(decimal_places=6, default=Decimal('0'), max_digits=9)),
                ('expert_id', models.IntegerField(default=0.0)),
                ('datetime_str', models.CharField(max_length=200)),
                ('status', models.IntegerField(choices=[(1, 'status 1'), (2, 'status 2'), (3, 'status 3')], default=1)),
                ('image', models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Judgement',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('result', models.IntegerField(choices=[(1, 'Not Seen'), (2, 'No'), (3, 'Yes')], default=1)),
                ('worker', models.CharField(max_length=64)),
                ('start_time_sec', models.IntegerField(default=-1)),
                ('end_time_sec', models.IntegerField(default=-1)),
                ('rotation', models.IntegerField(default=0)),
                ('task_id', models.CharField(max_length=64)),
            ],
        ),
        migrations.CreateModel(
            name='Region',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lat_start', models.DecimalField(decimal_places=6, default=Decimal('0'), max_digits=9)),
                ('lon_start', models.DecimalField(decimal_places=6, default=Decimal('0'), max_digits=9)),
                ('lat_end', models.DecimalField(decimal_places=6, default=Decimal('0'), max_digits=9)),
                ('lon_end', models.DecimalField(decimal_places=6, default=Decimal('0'), max_digits=9)),
                ('zoom', models.IntegerField(default=18)),
                ('access_token', models.CharField(max_length=64)),
                ('investigation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ground_truth.Investigation')),
            ],
        ),
        migrations.CreateModel(
            name='Subregion',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lat_start', models.DecimalField(decimal_places=6, default=Decimal('0'), max_digits=9)),
                ('lon_start', models.DecimalField(decimal_places=6, default=Decimal('0'), max_digits=9)),
                ('lat_end', models.DecimalField(decimal_places=6, default=Decimal('0'), max_digits=9)),
                ('lon_end', models.DecimalField(decimal_places=6, default=Decimal('0'), max_digits=9)),
                ('index', models.IntegerField(default=0, validators=[django.core.validators.MaxValueValidator(24), django.core.validators.MinValueValidator(0)])),
                ('region', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ground_truth.Region')),
            ],
        ),
        migrations.AddField(
            model_name='judgement',
            name='subregion',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ground_truth.Subregion'),
        ),
    ]
