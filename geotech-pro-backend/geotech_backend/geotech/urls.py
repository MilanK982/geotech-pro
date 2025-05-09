# geotech/urls.py
from django.urls import path
from .views import (
    GetLayersView, ModelDetailView, LoginView, RegisterView, CsrfView,
    SaveLayersView, SaveCptView, ProjectView, StatsView
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('csrf/', CsrfView.as_view(), name='csrf'),
    path('projects/', ProjectView.as_view(), name='project_list'),
    path('projects/<int:project_id>/', ProjectView.as_view(), name='project_detail'),
    path('projects/<int:project_id>/stats/', StatsView.as_view(), name='project_stats'),
    path('stats/', StatsView.as_view(), name='stats'),
    path('get_layers/<int:model_id>/', GetLayersView.as_view(), name='get_layers'),
    path('model_detail/<int:model_id>/', ModelDetailView.as_view(), name='model_detail'),
    path('save_layers/<int:model_id>/', SaveLayersView.as_view(), name='save_layers'),
    path('save_cpt/<int:model_id>/', SaveCptView.as_view(), name='save_cpt'),
]