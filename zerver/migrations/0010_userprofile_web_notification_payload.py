# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('zerver', '0009_add_missing_migrations'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='web_notification_payload',
            field=models.TextField(default=b'[]'),
        ),
    ]
