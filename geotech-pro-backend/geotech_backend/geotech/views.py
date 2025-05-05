from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import GeotechnicalModel
from .serializers import GeotechnicalModelSerializer

class GetLayersView(APIView):
    def get(self, request, model_id):
        try:
            model = GeotechnicalModel.objects.get(id=model_id)
            serializer = GeotechnicalModelSerializer(model)
            return Response(serializer.data)
        except GeotechnicalModel.DoesNotExist:
            return Response({'error': 'Model not found'}, status=status.HTTP_404_NOT_FOUND)

class ModelDetailView(APIView):
    def post(self, request, model_id):
        try:
            model = GeotechnicalModel.objects.get(id=model_id)
            serializer = GeotechnicalModelSerializer(model, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except GeotechnicalModel.DoesNotExist:
            serializer = GeotechnicalModelSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)