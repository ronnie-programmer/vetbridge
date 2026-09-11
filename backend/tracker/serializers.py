from rest_framework import serializers
from .models import Appointment, Claim

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            'id',
            'claim',
            'title',
            'scheduled_for',
            'facility_name',
            'facility_address',
            'notes',
        ]

    def validate_claim(self, value):
        if value.user != self.context['request'].user:
            raise serializers.ValidationError('That claim does not belong to you.')
        return value

class ClaimSerializer(serializers.ModelSerializer):
    appointments = AppointmentSerializer(many=True, read_only=True)

    class Meta:
        model = Claim
        fields = [
            'id',
            'benefit_name',
            'status',
            'date_applied',
            'notes',
            'created_at',
            'appointments',
        ]
        read_only_fields = ['created_at']

        