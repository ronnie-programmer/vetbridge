from django.core.mail import send_mail
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import ConfirmationToken
from .serializers import RegisterSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()
    confirmation = ConfirmationToken.objects.create(user=user)

    link = f'http://localhost:5173/confirm/{confirmation.token}'
    send_mail(
        'Confirm your Vetbridge Account',
        f'Click this link to confirm your account: {link}',
        'noreply@vetbridge.local',
        [user.email],
    )
    return Response(
        {'message': 'Account created. Check your email to confirm the link.'},
        status=status.HTTP_201_CREATED,
    )

@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_email(request, token):
    try:
        confirmation = ConfirmationToken.objects.get(token=token)
    except ConfirmationToken.DoesNotExist:
        return Response(
            {'error': 'That confirmation link is not valid.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    user = confirmation.user
    user.is_active = True
    user.save()
    confirmation.delete()

    return Response({'message': 'Your account is confirmed. Login now please.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh = request.data.get('refresh')
    if not refresh:
        return Response(
            {'error': 'A refresh token is required to log out.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        RefreshToken(refresh).blacklist()
    except Exception:
        return Response(
            {'error': 'Token is not valid.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return Response({'message': 'Logged out.'}, status=status.HTTP_200_OK)