from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .serializers import SignupSerializer, LoginSerializer


@api_view(['POST'])
def signup(request):
    serializer = SignupSerializer(data=request.data)

    if serializer.is_valid():
        user_data = serializer.validated_data

        return Response(
            {
                "message": "Account created successfully!",
                "user": {
                    "full_name": user_data["full_name"],
                    "email": user_data["email"],
                    "age": user_data["age"]
                }
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )
# login

@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        user_data = serializer.validated_data

        return Response(
            {
                "message": "Login successful!",
                "user": {
                    "email": user_data["email"],
                    "role": user_data["role"]
                }
            },
            status=status.HTTP_200_OK
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )