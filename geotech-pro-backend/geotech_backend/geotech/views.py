from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import GeotechnicalModel
from .serializers import GeotechnicalModelSerializer
from rest_framework.permissions import AllowAny

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user_id': user.id})
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class GetLayersView(APIView):
    def get(self, request, model_id):
        try:
            model = GeotechnicalModel.objects.get(id=model_id, user=request.user)
            serializer = GeotechnicalModelSerializer(model)
            return Response(serializer.data)
        except GeotechnicalModel.DoesNotExist:
            return Response({'error': 'Model not found or not authorized'}, status=status.HTTP_404_NOT_FOUND)

class ModelDetailView(APIView):
    def post(self, request, model_id):
        try:
            model = GeotechnicalModel.objects.get(id=model_id, user=request.user)
            serializer = GeotechnicalModelSerializer(model, data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except GeotechnicalModel.DoesNotExist:
            serializer = GeotechnicalModelSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)