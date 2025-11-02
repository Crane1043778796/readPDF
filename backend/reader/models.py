from django.db import models
from django.contrib.auth.models import User

class ReadingProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pdf_file = models.CharField(max_length=255)
    page_number = models.IntegerField()
    timestamp = models.DateTimeField(auto_now=True)

class Highlight(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pdf_file = models.CharField(max_length=255)
    page_number = models.IntegerField()
    text = models.TextField()
    highlight_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
