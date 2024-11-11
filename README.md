# Task Management and Setup Guide

## Prerequisites

1. **Create a `.env` file**:
   - Use the provided `.env.example` file as a template.
   - Add your own database connection details in the `.env` file.

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   This will install all required dependencies.

3. **Launch the Application**:
   ```bash
   npm run start
   ```
   Use this command to start the application.

---

## Running Tests

To ensure all components function as expected, use the following commands to run tests:

1. **Authentication Tests**:
   ```bash
   npm run test_auth
   ```
   Executes tests for the authentication module.

2. **Category Tests**:
   ```bash
   npm run test_category
   ```
   Executes tests for the category module.

3. **Task Tests**:
   ```bash
   npm run test_task
   ```
   Executes tests for the task module.

---

## Using Docker

For running the application in a Docker environment:

1. **Build and Start Containers**:
   ```bash
   docker-compose up --build
   ```
   Builds and starts the application with Docker. This command sets up containers and networks as per your Docker configuration.

2. **Stopping and Cleaning Up**:
   ```bash
   docker-compose down
   ```
   Stops the containers and removes networks, images, and volumes created by Docker Compose.
