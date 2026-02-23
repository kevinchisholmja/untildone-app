# Untildone App Documentation

## Project Overview
The Untildone App is designed to help users track and manage their tasks efficiently. It provides a user-friendly interface to create, edit, and delete tasks, improving productivity and organization.

## Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Deployment**: Heroku
- **Testing**: Jest, Cypress

## Features
- Create, read, update, and delete tasks
- User authentication and authorization
- Real-time updates for task status
- Search functionality for tasks
- Task categorization and prioritization

## Architecture
The architecture follows a Model-View-Controller (MVC) pattern. The frontend communicates with the backend via RESTful APIs, which interact with the MongoDB database to fetch and store data.

### Diagram
(Insert architectural diagram here)

## Setup Instructions
### Prerequisites
- Node.js and npm installed
- MongoDB running locally or a MongoDB Atlas account

### Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/kevinchisholmja/untildone-app.git
   ```
2. Navigate into the project directory:
   ```bash
   cd untildone-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set environment variables (create a `.env` file):
   ```bash
   MONGODB_URI=<your_mongo_db_uri>
   JWT_SECRET=<your_jwt_secret>
   ```
5. Start the development server:
   ```bash
   npm start
   ```

## Development Guide
- Use feature branches for any new features being developed.
- Write clear commit messages describing the changes made.
- Ensure to run tests before pushing any changes to main.
- Follow coding standards and best practices to maintain code quality.

For detailed guidance on any of the steps, refer to the respective section in the documentation.
