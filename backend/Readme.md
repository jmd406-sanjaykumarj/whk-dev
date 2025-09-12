We are using a modular structure for the backend, where the application is divided into three separate modules, each placed in its own folder.

Each module contains the following components:

routes: Defines the API endpoints for that specific module. It maps URL paths to functions that should handle those requests.

controllers: Handles the logic after a route is triggered. Controllers act as intermediaries between the routes and the service layer.

services: Contains all the service logic, including database operations and core business logic.

schemas: Used to define both the database schemas and the request/response models (Pydantic) for API validation.

The main.py file serves as the entry point to the application. It registers all the API routes and redirects requests to the appropriate module based on the URL path.

Additionally, we have a common auth folder that manages all authentication-related operations such as login and token generation.

