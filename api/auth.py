import datetime
import jwt
from bson import ObjectId
from django.conf import settings
from rest_framework.permissions import BasePermission
from rest_framework.exceptions import AuthenticationFailed

from .mongodb import db

JWT_ALGO = 'HS256'


def make_tokens(user_id, role):
    now = datetime.datetime.utcnow()
    # Dev/demo ke liye lambi expiry rakhi hai taake testing ke dauran
    # baar baar login na karna paray. Production mein ise chhota karna.
    access = jwt.encode(
        {'user_id': str(user_id), 'role': role, 'type': 'access', 'exp': now + datetime.timedelta(days=30)},
        settings.SECRET_KEY, algorithm=JWT_ALGO,
    )
    refresh = jwt.encode(
        {'user_id': str(user_id), 'role': role, 'type': 'refresh', 'exp': now + datetime.timedelta(days=60)},
        settings.SECRET_KEY, algorithm=JWT_ALGO,
    )
    return {'access': access, 'refresh': refresh}


def get_user_from_request(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        raise AuthenticationFailed('Token missing — login karein.')
    token = auth_header.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Session expire ho gayi, dobara login karein.')
    except jwt.InvalidTokenError:
        raise AuthenticationFailed('Invalid token.')

    user = db.users.find_one({'_id': ObjectId(payload['user_id'])})
    if not user:
        raise AuthenticationFailed('User nahi mila.')
    return user


class IsAuthenticatedMongo(BasePermission):
    def has_permission(self, request, view):
        request.mongo_user = get_user_from_request(request)
        return True


class IsPatient(IsAuthenticatedMongo):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.mongo_user.get('role') == 'patient'


class IsDoctor(IsAuthenticatedMongo):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.mongo_user.get('role') == 'doctor'