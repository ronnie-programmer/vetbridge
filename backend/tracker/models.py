from django.contrib.auth.models import User
from django.db import models

STATUS_CHOICES = [
    ('researching', 'Researching'),
    ('applied', 'Applied'),
    ('in_review', 'In Review'),
    ('approved', 'Approved'),
    ('denied', 'Denied'),
]

class Claim(models.Model):
    """A benefit the user is tracking."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claims')
    benefit_name = models.CharField(max_length=200)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='researching',
    )
    date_applied = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.benefit_name

class Appointment(models.Model):
    """something on the calendar for a claim c&p or vso meeting"""

    claim = models.ForeignKey(
        Claim,
        on_delete=models.CASCADE,
        related_name='appointments',
    )
    title = models.CharField(max_length=200)
    scheduled_for = models.DateTimeField()
    facility_name = models.CharField(max_length=200, blank=True, default='')
    facility_address = models.CharField(max_length=300, blank=True, default='')
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['scheduled_for']

    def __str__(self):
        return self.title
    