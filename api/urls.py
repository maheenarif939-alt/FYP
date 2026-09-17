from django.urls import path
from . import views

urlpatterns = [
    # Accounts
    path('accounts/signup/', views.signup),
    path('accounts/doctor-signup/', views.doctor_signup),
    path('accounts/login/', views.login),
    path('accounts/profile/', views.profile),
    path('accounts/profile/update/', views.update_profile),
    path('accounts/verification-document/', views.UploadVerificationDocView.as_view()),
    path('accounts/forgot-password/', views.forgot_password),
    path('accounts/reset-password/', views.reset_password),

    # Cases (specific paths pehle, dynamic <case_id> baad mein)
    path('cases/upload/', views.UploadCaseView.as_view()),
    path('cases/mine/', views.my_cases),
    path('cases/pending/', views.pending_cases),
    path('cases/approved/', views.approved_cases),
    path('cases/all/', views.all_cases),
    path('cases/<str:case_id>/', views.case_detail),
    path('cases/<str:case_id>/analyze/', views.analyze_case),
    path('cases/<str:case_id>/verify/', views.verify_case),
    path('cases/<str:case_id>/delete/', views.delete_case),

    # Payments
    path('payments/<str:case_id>/submit/', views.SubmitPaymentView.as_view()),
]