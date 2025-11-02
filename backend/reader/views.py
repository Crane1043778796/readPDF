from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import ReadingProgress, Highlight
import json

@csrf_exempt
def save_progress(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        progress = ReadingProgress.objects.create(
            user=request.user,
            pdf_file=data['pdf_file'],
            page_number=data['page_number']
        )
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': '请使用POST请求'})

@csrf_exempt
def save_highlight(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        highlight = Highlight.objects.create(
            user=request.user,
            pdf_file=data['pdf_file'],
            page_number=data['page_number'],
            text=data['text'],
            highlight_type=data['type']
        )
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': '请使用POST请求'})

@csrf_exempt
def generate_mindmap(request):
    if request.method == 'POST':
        highlights = Highlight.objects.filter(user=request.user)
        mindmap_data = {
            'nodes': [],
            'edges': []
        }
        return JsonResponse(mindmap_data)
    return JsonResponse({'status': 'error', 'message': '请使用POST请求'})


from django.shortcuts import render

def test_page(request):
    return render(request, 'reader/test.html')
