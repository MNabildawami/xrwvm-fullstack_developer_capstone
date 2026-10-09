
import json
import logging

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import CarMake, CarModel
from .populate import initiate
from .restapis import (
    get_request,
    analyze_review_sentiments,
    post_review,
)

logger = logging.getLogger(__name__)


@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "POST method required"},
            status=405
        )

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400
        )

    username = data.get("userName")
    password = data.get("password")

    if not username or not password:
        return JsonResponse(
            {"error": "Username and password are required"},
            status=400
        )

    user = authenticate(
        request,
        username=username,
        password=password
    )

    if user is not None:
        login(request, user)
        return JsonResponse({
            "userName": username,
            "status": "Authenticated"
        })

    return JsonResponse({
        "userName": username,
        "status": "Invalid credentials"
    }, status=401)


@csrf_exempt
def logout_request(request):
    logout(request)
    return JsonResponse({"status": "Logged out"})


@csrf_exempt
def registration(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "POST method required"},
            status=405
        )

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400
        )

    username = data.get("userName")
    password = data.get("password")
    first_name = data.get("firstName", "")
    last_name = data.get("lastName", "")
    email = data.get("email", "")

    if not username or not password:
        return JsonResponse(
            {"error": "Username and password are required"},
            status=400
        )

    if User.objects.filter(username=username).exists():
        return JsonResponse(
            {"error": "Username already exists"},
            status=400
        )

    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        email=email
    )

    return JsonResponse(
        {
            "userName": user.username,
            "status": "Registered"
        },
        status=201
    )


def get_cars(request):
    if not CarMake.objects.exists() and not CarModel.objects.exists():
        initiate()

    car_models = CarModel.objects.select_related("car_make")

    cars = [
        {
            "CarModel": car_model.name,
            "CarMake": car_model.car_make.name
        }
        for car_model in car_models
    ]

    return JsonResponse({"CarModels": cars})


def get_dealers(request, state=None):
    try:
        if state and state.lower() != "all":
            dealers = get_request(f"/fetchDealers/{state}")
        else:
            dealers = get_request("/fetchDealers")

        return JsonResponse({
            "status": 200,
            "dealers": dealers
        })

    except Exception:
        logger.exception("Failed to fetch dealers")
        return JsonResponse({
            "status": 500,
            "error": "Failed to fetch dealers"
        }, status=500)


def get_dealer(request, dealer_id):
    try:
        dealers = get_request(f"/fetchDealer/{dealer_id}")

        return JsonResponse({
            "status": 200,
            "dealer": dealers
        })

    except Exception:
        logger.exception("Failed to fetch dealer")
        return JsonResponse({
            "status": 500,
            "error": "Failed to fetch dealer"
        }, status=500)


def get_dealer_reviews(request, dealer_id):
    try:
        reviews = get_request(f"/fetchReviews/dealer/{dealer_id}")

        return JsonResponse({
            "status": 200,
            "reviews": reviews
        })

    except Exception:
        logger.exception("Failed to fetch dealer reviews")
        return JsonResponse({
            "status": 500,
            "error": "Failed to fetch dealer reviews"
        }, status=500)


@csrf_exempt
def add_review(request):
    if request.method != "POST":
        return JsonResponse(
            {"status": 405, "error": "POST method required"},
            status=405
        )

    try:
        data = json.loads(request.body)

        required = [
            "name",
            "dealership",
            "review",
            "purchase",
            "purchase_date",
            "car_make",
            "car_model",
            "car_year",
        ]

        if any(data.get(key) in (None, "") for key in required):
            return JsonResponse({
                "status": 400,
                "error": "Missing required fields"
            }, status=400)

        data["sentiment"] = analyze_review_sentiments(data["review"])
        saved_review = post_review(data)

        return JsonResponse({
            "status": 200,
            "review": saved_review
        })

    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({
            "status": 400,
            "error": "Invalid JSON"
        }, status=400)

    except Exception:
        logger.exception("Failed to add review")
        return JsonResponse({
            "status": 500,
            "error": "Failed to add review"
        }, status=500)
