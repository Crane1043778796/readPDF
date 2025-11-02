"""pdf_reader URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from reader import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.test_page, name='test'),  # 添加这行
    path('api/save-progress/', views.save_progress, name='save-progress'),
    path('api/save-highlight/', views.save_highlight, name='save-highlight'),
    path('api/generate-mindmap/', views.generate_mindmap, name='generate-mindmap'),
]
