import uuid

from django.contrib.auth.models import User
from django.db import models

class ConfirmationToken(models.Model):
    """The random token that goes in the confirmation email link"""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='confirmation_token',
    )
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Token for {self.user.email}'
