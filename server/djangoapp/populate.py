from .models import CarMake, CarModel


def initiate():
    if CarMake.objects.exists() or CarModel.objects.exists():
        return

    car_make_data = [
        {"name": "NISSAN", "description": "Great cars. Japanese technology"},
        {"name": "Mercedes", "description": "Great cars. German technology"},
        {"name": "Audi", "description": "Great cars. German technology"},
        {"name": "Kia", "description": "Great cars. Korean technology"},
        {"name": "Toyota", "description": "Great cars. Japanese technology"},
    ]

    car_make_instances = []
    for data in car_make_data:
        car_make_instances.append(
            CarMake.objects.create(
                name=data["name"],
                description=data["description"]
            )
        )

    car_model_data = [
        ("Pathfinder", "SUV", 2023, 0),
        ("Qashqai", "SUV", 2023, 0),
        ("XTRAIL", "SUV", 2023, 0),
        ("A-Class", "Sedan", 2023, 1),
        ("C-Class", "Sedan", 2023, 1),
        ("E-Class", "Sedan", 2023, 1),
        ("A4", "Sedan", 2023, 2),
        ("A5", "Coupe", 2023, 2),
        ("A6", "Sedan", 2023, 2),
        ("Sorrento", "SUV", 2023, 3),
        ("Carnival", "Wagon", 2023, 3),
        ("Cerato", "Sedan", 2023, 3),
        ("Corolla", "Sedan", 2023, 4),
        ("Camry", "Sedan", 2023, 4),
        ("Kluger", "SUV", 2023, 4),
    ]

    for name, car_type, year, make_index in car_model_data:
        CarModel.objects.create(
            dealer_id=1,
            name=name,
            type=car_type,
            year=year,
            car_make=car_make_instances[make_index]
        )