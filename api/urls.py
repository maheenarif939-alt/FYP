from django.urls import path

from .views import signup, login, profile, ImageUploadView, PaymentView, case_tracking, result, doctor_dashboard, pending_cases,  doctor_verify, approved_cases, approved_case_view, approved_case_details, all_cases, doctor_profile, history, dashboard, doctor_profile, doctor_account


urlpatterns = [
    path('signup/', signup),
    path('login/', login),
    path('profile/', profile),
    path('upload/', ImageUploadView.as_view()),
    path('payment/', PaymentView.as_view()),
    path('case-tracking/', case_tracking),
    path('result/', result),
    path('doctor-dashboard/', doctor_dashboard),
    path('pending-cases/',pending_cases,name='pending-cases'),
    path('doctor-verify/',doctor_verify,name='doctor-verify'),
    path('approved-cases/',approved_cases,name='approved-cases'),
    path('approved-case-view/',approved_case_view,name='approved-case-view'),
    path('approved-case/<str:case_id>/',approved_case_details,name='approved-case-details'),
    path('all-cases/',all_cases,name='all-cases'),
    path('doctor-profile/',doctor_profile,name='doctor-profile'),
    path('history/',history,name='history'),
    path('dashboard/',dashboard,name='dashboard'),
    path('doctor-page/',doctor_profile,name='doctor-page'),
    path('doctor-account/',doctor_account,name='doctor-account'),

]