from django.contrib import admin

from .models import Appointment, Claim

admin.site.register(Claim)
admin.site.register(Appointment)

