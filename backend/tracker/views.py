import requests
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Appointment, Claim
from .serializers import AppointmentSerializer, ClaimSerializer

class ClaimViewSet(viewsets.ModelViewSet):
    serializer_class = ClaimSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Claim.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(claim_user=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def federal_holidays(request):
    """US federal holidays, so you do not schedule a VA appointment on one."""
    year = request.query_params.get('year', '2026')

    try:
        response = requests.get(
            f'https://date.nager.at/api/v3/PublicHolidays/{year}/US',
            timeout=5,
        )
        response.raise_for_status()
    except requests.RequestException:
        return Response(
            {'error': 'Could not reach the holiday service right now.'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    holidays = [
        {'date': holiday['date'], 'name': holiday['name']}
        for holiday in response.json()
    ]
    return Response(holidays)