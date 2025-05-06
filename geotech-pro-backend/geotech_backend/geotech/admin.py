from django.contrib import admin
from .models import GeotechnicalModel, Project, Object, Layer, CptTest, CptData

admin.site.register(GeotechnicalModel)
admin.site.register(Project)
admin.site.register(Object)
admin.site.register(Layer)
admin.site.register(CptTest)
admin.site.register(CptData)
# Register your models here.
