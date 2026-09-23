from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from api import views as api_views
from api import admin_views

def api_root_view(request):
    return HttpResponse(
        "<h3>Backend API is Running Successfully!</h3>"
        "<p>Use <b>/api/</b> endpoints for mobile app integration.</p>"
    )

urlpatterns = [
    path('', api_root_view),
    path('api/', include('api.urls')),
    path('media/image/<str:file_id>/', api_views.serve_image),

    # ---- Admin Panel (web) endpoints ----
    path('admin-login/', admin_views.admin_login),
    path('admin/stats/', admin_views.admin_stats),
    path('admin/moderation/', admin_views.admin_moderation),
    path('admin/moderation/action/', admin_views.admin_moderation_action),
    path('admin/payments/', admin_views.admin_payments),
    path('admin/payments/approve/', admin_views.admin_payments_approve),
    path('admin/doctors/', admin_views.admin_doctors),
    path('admin/doctors/toggle/', admin_views.admin_doctors_toggle),
    path('admin/doctors/add/', admin_views.admin_doctors_add),
    path('admin/doctors/delete/', admin_views.admin_doctors_delete),
    path('admin/patients/', admin_views.admin_patients),
    path('all-cases/', admin_views.admin_all_cases),
    path('admin/ai-analysis/', admin_views.admin_ai_analysis),
]