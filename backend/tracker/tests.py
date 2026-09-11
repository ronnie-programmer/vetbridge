from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Claim


class ClaimTests(APITestCase):
    def setUp(self):
        self.me = User.objects.create_user(
            username='me', email='me@test.com', password='testpass123'
        )
        self.someone_else = User.objects.create_user(
            username='other', email='other@test.com', password='testpass123'
        )
        self.client.force_authenticate(user=self.me)

    def test_anonymous_users_are_rejected(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/claims/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_creating_a_claim_sets_me_as_the_owner(self):
        response = self.client.post(
            '/api/claims/',
            {'benefit_name': 'VA Disability', 'status': 'applied'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        claim = Claim.objects.get(id=response.data['id'])
        self.assertEqual(claim.user, self.me)

    def test_i_cannot_see_another_users_claims(self):
        Claim.objects.create(user=self.someone_else, benefit_name='Not mine')
        response = self.client.get('/api/claims/')
        self.assertEqual(len(response.data), 0)

    def test_i_cannot_delete_another_users_claim(self):
        theirs = Claim.objects.create(
            user=self.someone_else, benefit_name='Not mine'
        )

        response = self.client.delete(f'/api/claims/{theirs.id}/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Claim.objects.filter(id=theirs.id).exists())


class AppointmentTests(APITestCase):
    def setUp(self):
        self.me = User.objects.create_user(
            username='me', email='me@test.com', password='testpass123'
        )
        self.someone_else = User.objects.create_user(
            username='other', email='other@test.com', password='testpass123'
        )
        self.my_claim = Claim.objects.create(user=self.me, benefit_name='Mine')
        self.client.force_authenticate(user=self.me)

    def test_i_can_add_an_appointment_to_my_own_claim(self):
        response = self.client.post(
            '/api/appointments/',
            {
                'claim': self.my_claim.id,
                'title': 'C&P exam',
                'scheduled_for': '2026-10-15T13:30:00Z',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_i_cannot_add_an_appointment_to_someone_elses_claim(self):
        theirs = Claim.objects.create(
            user=self.someone_else, benefit_name='Not mine'
        )

        response = self.client.post(
            '/api/appointments/',
            {
                'claim': theirs.id,
                'title': 'sneaky',
                'scheduled_for': '2026-10-15T13:30:00Z',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
