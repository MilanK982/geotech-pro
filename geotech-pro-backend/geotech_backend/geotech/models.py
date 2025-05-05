from django.db import models

# Create your models here.
from django.db import models

class GeotechnicalModel(models.Model):
    name = models.CharField(max_length=100)
    npv = models.FloatField(default=0)
    npv_max = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

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
    u = models.FloatField(default=0)

    def __str__(self):
        return f"CPT Data at {self.depth}m"