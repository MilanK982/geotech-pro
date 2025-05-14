# geotech/models.py
from django.db import models
from django.contrib.auth.models import User

class ProjectManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()

class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    client = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=50, choices=[
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
        ('cancelled', 'Cancelled'),
    ], default='active')
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ProjectManager()

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'project'
        verbose_name_plural = 'projects'
        ordering = ['-updated_at']

class Object(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='objects')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ['project', 'name']

class GeotechnicalModel(models.Model):
    object = models.ForeignKey(Object, on_delete=models.CASCADE, related_name='geotechnical_models', null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='geotechnical_models')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='geotechnical_models')
    name = models.CharField(max_length=100)
    npv = models.FloatField(default=0)
    npv_max = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ['object', 'name']

class Layer(models.Model):
    model = models.ForeignKey(GeotechnicalModel, on_delete=models.CASCADE, related_name='layers')
    name = models.CharField(max_length=100, blank=True)
    depth = models.FloatField(default=0)
    unit_weight = models.FloatField(default=18)
    cohesion = models.FloatField(default=0)
    friction_angle = models.FloatField(default=0)
    compressibility = models.FloatField(default=0)
    permeability = models.FloatField(null=True, blank=True)
    cpt_data = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} (Depth: {self.depth}m)"

class CptTest(models.Model):
    model = models.ForeignKey(GeotechnicalModel, on_delete=models.CASCADE, related_name='cpt_tests')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class CptData(models.Model):
    cpt_test = models.ForeignKey(CptTest, on_delete=models.CASCADE, related_name='data')
    depth = models.FloatField(default=0)
    qc = models.FloatField(default=0)
    fs = models.FloatField(default=0)
    u2 = models.FloatField(default=0)

    def __str__(self):
        return f"CPT Data at {self.depth}m"