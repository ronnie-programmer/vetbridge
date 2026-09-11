from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AppointmentViewSet, ClaimViewSet, federal_holidays

router = DefaultRouter()
router.register('claims', ClaimViewSet, basename='claim')
router.register('appointments', AppointmentViewSet, basename='appointment')

# the router builds the CRUD urls, then we bolt the holiday endpoint on
urlpatterns = router.urls + [
    path('holidays/', federal_holidays, name='holidays'),
]
