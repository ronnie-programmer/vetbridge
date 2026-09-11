from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import ConfirmationToken


class RegistrationTests(APITestCase):
    def test_register_creates_an_inactive_user(self):
        response = self.client.post(
            '/api/auth/register/',
            {'username': 'newguy', 'email': 'new@test.com', 'password': 'testpass123'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='newguy')
        self.assertFalse(user.is_active)

    def test_register_makes_a_confirmation_token(self):
        self.client.post(
            '/api/auth/register/',
            {'username': 'newguy', 'email': 'new@test.com', 'password': 'testpass123'},
            format='json',
        )
        self.assertEqual(ConfirmationToken.objects.count(), 1)

    def test_register_rejects_a_duplicate_email(self):
        User.objects.create_user(
            username='first', email='same@test.com', password='testpass123'
        )
        response = self.client.post(
            '/api/auth/register/',
            {'username': 'second', 'email': 'same@test.com', 'password': 'testpass123'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ConfirmationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='pending', email='p@test.com', password='testpass123'
        )
        self.user.is_active = False
        self.user.save()

    def test_confirming_activates_the_user(self):
        token = ConfirmationToken.objects.create(user=self.user)

        response = self.client.post(f'/api/auth/confirm/{token.token}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)

    def test_a_bad_token_gives_404(self):
        response = self.client.post(
            '/api/auth/confirm/3ee99837-b61b-4338-aaed-b5cd207790fd/'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_an_unconfirmed_user_cannot_log_in(self):
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'pending', 'password': 'testpass123'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)