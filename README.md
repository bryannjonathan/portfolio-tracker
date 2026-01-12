# A Portfolio Tracker - Investory

A React Native mobile application for tracking stocks and crypto assets, viewing market relevant news, and managing investment portfolios.

## Features
- **User Authentication**: Secure login and registration system
- **Market News**: Stay updated with the latest market news
- **Search**: Search and track your favorite assets
- **Portfoio Management**: Create and manage multiple portfolios

## Tech Stack
- **Frontend**:
  - React Native
  - Expo router for navigation
  - React query for fetching
  - Context API for state management
  

- **Backend**:
  - Node.js with Express
  - PostgreSQL database
  - JWT Authentication
 
## Screenshots
<p align="center">
  <img src="https://github.com/user-attachments/assets/b1e0f7a1-c1ce-4202-b185-c94ab60cdaac" width="30%" />
  <img src="https://github.com/user-attachments/assets/3542ecce-575f-4f5e-a3cc-b134a6167f91" width="30%" />
  <img src="https://github.com/user-attachments/assets/e22019fb-d943-4484-8324-fb02a3034e12" width="30%" />
</p>

## Prerequisites:
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL
- Polygon.io API key
- Android Studio/Xcode for mobile development

## Installation:
1. Clone this repository:
```bash
git clone https://github.com/bryannjonathan/portfolio-tracker
```
2. Install dependecies:
```bash
npm install
```
4. Setup up environment: create a `.env` file in the root directory with:
```env
JWT_SECRET_KEY=your_jwt_secret
POLYGON_API=your_polygon_api_key
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=your_db_port
DB_NAME=your_db_name
```

## To run the app:
1. Start the backend server:
```bash
nodemon ./server/app
```
2. Start the Expo development server:
```bash
npx expo start
```
3. Swith to Expo Go and run on your preferred platform:
- Press `a` for Android
- Press `i` for iOS
- Scan the QR code with Expo Go app for physical device

## Current Development Status:
✅ Authentication system (login/register/logout) <br>
✅ Home screen with news feed <br>
✅ Asset search functionality <br>
✅ Automatic updates on stock prices <br>
✅ Portfolio page completed with list of assets owned and a piechart <br>
🛠️ Portfolio management <br>
📝 More features coming soon...

## Contributing
This is a personal project. While it's not open for open contribution at the moment, feel free to fork the repository and and experiment with your own features.
