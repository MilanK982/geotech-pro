# geotech/urls.py
from django.urls import path
from .views import GetLayersView, ModelDetailView, LoginView
from .views import SaveLayersView, SaveCptView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('get_layers/<int:model_id>/', GetLayersView.as_view(), name='get_layers'),
    path('model_detail/<int:model_id>/', ModelDetailView.as_view(), name='model_detail'),
    path('save_layers/<int:model_id>/', SaveLayersView.as_view(), name='save_layers'),
    path('save_cpt/<int:model_id>/', SaveCptView.as_view(), name='save_cpt'),
]