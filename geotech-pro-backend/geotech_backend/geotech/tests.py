from django.test import TestCase
from django.contrib.auth.models import User
from .models import Project, GeotechnicalModel, Layer, CptTest
from django.db.models import Count

class ProjectModelTest(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create a test project
        self.project = Project.objects.create(
            user=self.user,
            name='Test Project',
            description='Test Description',
            status='active'
        )

        # Create a test model
        self.model = GeotechnicalModel.objects.create(
            project=self.project,
            user=self.user,
            name='Test Model'
        )

        # Create a test layer
        self.layer = Layer.objects.create(
            model=self.model,
            name='Test Layer',
            depth=1.0,
            unit_weight=18.0
        )

        # Create a test CPT
        self.cpt = CptTest.objects.create(
            model=self.model,
            name='Test CPT'
        )

    def test_project_creation(self):
        """Test that a project can be created and retrieved"""
        # Test direct model access
        project = Project.objects.get(id=self.project.id)
        self.assertEqual(project.name, 'Test Project')
        
        # Test through user's projects
        user_project = self.user.projects.get(id=self.project.id)
        self.assertEqual(user_project.name, 'Test Project')
        
        # Test filtering
        filtered_project = Project.objects.filter(id=self.project.id).first()
        self.assertEqual(filtered_project.name, 'Test Project')
        
        # Test with select_related
        project_with_user = Project.objects.select_related('user').get(id=self.project.id)
        self.assertEqual(project_with_user.user, self.user)

    def test_project_relationships(self):
        """Test project relationships and related data access"""
        # Test getting project with related models
        project = Project.objects.get(id=self.project.id)
        
        # Test geotechnical models relationship
        models = project.geotechnical_models.all()
        self.assertEqual(models.count(), 1)
        self.assertEqual(models.first().name, 'Test Model')
        
        # Test layers through model
        layers = Layer.objects.filter(model__project=project)
        self.assertEqual(layers.count(), 1)
        self.assertEqual(layers.first().name, 'Test Layer')
        
        # Test CPT tests through model
        cpt_tests = CptTest.objects.filter(model__project=project)
        self.assertEqual(cpt_tests.count(), 1)
        self.assertEqual(cpt_tests.first().name, 'Test CPT')

    def test_project_annotations(self):
        """Test project annotations and counts"""
        # Test project with annotations
        project = Project.objects.annotate(
            model_count=Count('geotechnical_models', distinct=True),
            layer_count=Count('geotechnical_models__layers', distinct=True),
            cpt_count=Count('geotechnical_models__cpt_tests', distinct=True)
        ).get(id=self.project.id)
        
        self.assertEqual(project.model_count, 1)
        self.assertEqual(project.layer_count, 1)
        self.assertEqual(project.cpt_count, 1)

    def test_project_manager(self):
        """Test the project manager methods"""
        # Test get_queryset
        queryset = Project.objects.get_queryset()
        self.assertEqual(queryset.count(), 1)
        
        # Test filter
        filtered = Project.objects.filter(name='Test Project')
        self.assertEqual(filtered.count(), 1)
        
        # Test get
        project = Project.objects.get(name='Test Project')
        self.assertEqual(project.id, self.project.id)
        
        # Test with select_related
        project_with_user = Project.objects.select_related('user').get(id=self.project.id)
        self.assertEqual(project_with_user.user, self.user)

    def test_get_user_projects(self):
        """Test the get_user_projects class method"""
        # Get projects for user
        user_projects = Project.get_user_projects(self.user)
        self.assertEqual(user_projects.count(), 1)
        
        # Check project details
        project = user_projects.first()
        self.assertEqual(project.name, 'Test Project')
        self.assertEqual(project.user, self.user)
        
        # Test filtering on the queryset
        filtered_project = user_projects.filter(name='Test Project').first()
        self.assertEqual(filtered_project.id, self.project.id)
