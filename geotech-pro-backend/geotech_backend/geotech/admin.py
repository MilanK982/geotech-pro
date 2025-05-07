from django.contrib import admin
from .models import GeotechnicalModel, Project, Object, Layer, CptTest, CptData

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    list_filter = ('user', 'created_at')
    search_fields = ('name',)
    ordering = ('-created_at',)

@admin.register(Object)
class ObjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'created_at')
    list_filter = ('project', 'created_at')
    search_fields = ('name', 'project__name')
    ordering = ('-created_at',)

@admin.register(GeotechnicalModel)
class GeotechnicalModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'user', 'npv', 'npv_max', 'created_at')
    list_filter = ('project', 'user', 'created_at')
    search_fields = ('name', 'project__name')
    ordering = ('-created_at',)

@admin.register(Layer)
class LayerAdmin(admin.ModelAdmin):
    list_display = ('name', 'model', 'depth', 'unit_weight', 'cohesion', 'friction_angle')
    list_filter = ('model', 'depth')
    search_fields = ('name', 'model__name')
    ordering = ('model', 'depth')

@admin.register(CptTest)
class CptTestAdmin(admin.ModelAdmin):
    list_display = ('name', 'model', 'created_at')
    list_filter = ('model', 'created_at')
    search_fields = ('name', 'model__name')
    ordering = ('-created_at',)

@admin.register(CptData)
class CptDataAdmin(admin.ModelAdmin):
    list_display = ('cpt_test', 'depth', 'qc', 'fs', 'u2')
    list_filter = ('cpt_test', 'depth')
    search_fields = ('cpt_test__name',)
    ordering = ('cpt_test', 'depth')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('cpt_test')
