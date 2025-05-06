# geotech/urls.py
from django.urls import path
from .views import GetLayersView, ModelDetailView, LoginView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('get_layers/<int:model_id>/', GetLayersView.as_view(), name='get_layers'),
    path('model_detail/<int:model_id>/', ModelDetailView.as_view(), name='model_detail'),
]