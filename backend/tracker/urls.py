from rest_framework.routers import DefaultRouter

from .views import AppointmentViewSet, ClaimViewSet

router = DefaultRouter()
router.register('claims', ClaimViewSet, basename='claim')
router.register('appointments', AppointmentViewSet, basename='appointment')

urlpatterns = router.urls

