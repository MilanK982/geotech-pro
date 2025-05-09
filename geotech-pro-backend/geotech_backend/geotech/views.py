# geotech/views.py
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import GeotechnicalModel, CptTest, CptData, Layer, Project
from .serializers import GeotechnicalModelSerializer, ProjectSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

class CsrfView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return JsonResponse({'message': 'CSRF cookie set'})

class LoginView(APIView):
    permission_classes = [AllowAny]
    @method_decorator(csrf_exempt)
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user_id': user.id})
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    @method_decorator(csrf_exempt)
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        full_name = request.data.get('fullName')
        if not email or not password or not full_name:
            return Response({'error': 'Email, password, and fullName are required'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=full_name.split()[0],
                last_name=' '.join(full_name.split()[1:]) if len(full_name.split()) > 1 else ''
            )
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user_id': user.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id=None):
        if project_id:
            try:
                project = Project.objects.get(id=project_id, user=request.user)
                serializer = ProjectSerializer(project)
                return Response(serializer.data)
            except Project.DoesNotExist:
                return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            try:
                projects = Project.objects.filter(user=request.user).order_by('-updated_at')
                serializer = ProjectSerializer(projects, many=True)
                return Response(serializer.data)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = ProjectSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id, user=request.user)
            serializer = ProjectSerializer(project, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id, user=request.user)
            project.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StatsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, project_id=None):
        if project_id:
            try:
                project = Project.objects.get(id=project_id, user=request.user)
                stats = {
                    'totalCptTests': CptTest.objects.filter(model__project=project).count(),
                    'totalSoilLayers': Layer.objects.filter(model__project=project).count(),
                }
                return Response(stats)
            except Project.DoesNotExist:
                return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            stats = {
                'totalProjects': Project.objects.filter(user=request.user).count(),
                'totalCptTests': CptTest.objects.filter(model__project__user=request.user).count(),
                'totalSoilLayers': Layer.objects.filter(model__project__user=request.user).count(),
                'recentActivity': GeotechnicalModel.objects.filter(
                    user=request.user,
                    created_at__gte=timezone.now() - timezone.timedelta(hours=24)
                ).count(),
            }
            return Response(stats)

class GetLayersView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, model_id):
        try:
            model = GeotechnicalModel.objects.get(id=model_id, user=request.user)
            if not model.project:
                return Response(
                    {'error': 'Model must be associated with a project'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            serializer = GeotechnicalModelSerializer(model)
            return Response(serializer.data)
        except GeotechnicalModel.DoesNotExist:
            return Response(
                {'error': 'Model not found or not authorized'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ModelDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, model_id):
        try:
            model = GeotechnicalModel.objects.get(id=model_id, user=request.user)
            serializer = GeotechnicalModelSerializer(model, data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response({
                'error': 'Validation error',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except GeotechnicalModel.DoesNotExist:
            serializer = GeotechnicalModelSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response({
                'error': 'Validation error',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': str(e),
                'type': type(e).__name__
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SaveLayersView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, model_id):
        try:
            model = GeotechnicalModel.objects.get(id=model_id, user=request.user)
            if not model.project:
                return Response(
                    {"error": "Model must be associated with a project"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            data = {
                'name': model.name,
                'project': model.project.id,
                'npv': model.npv,
                'npv_max': model.npv_max,
                'layers': request.data.get('layers', [])
            }
            serializer = GeotechnicalModelSerializer(model, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except GeotechnicalModel.DoesNotExist:
            return Response(
                {"error": "Model not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class SaveCptView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, model_id):
        try:
            model = GeotechnicalModel.objects.get(id=model_id, user=request.user)
            if not model.project:
                return Response(
                    {"error": "Model must be associated with a project"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if 'cpt_tests' not in request.data:
                return Response(
                    {"error": "CPT tests data is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            data = {
                'name': model.name,
                'project': model.project.id,
                'npv': model.npv,
                'npv_max': model.npv_max,
                'cpt_tests': request.data['cpt_tests']
            }
            serializer = GeotechnicalModelSerializer(model, data=data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response({
                'error': 'Validation error',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except GeotechnicalModel.DoesNotExist:
            return Response(
                {"error": "Model not found or not authorized"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({
                'error': str(e),
                'type': type(e).__name__
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)