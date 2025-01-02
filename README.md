# Media AI Platform

A Flask-based AI platform for managing knowledge base and conversations.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Update the values in `.env` with your configuration

4. Initialize the database:
```bash
flask db upgrade
```

5. Run the development server:
```bash
flask run
```

## Features

- Knowledge base management
- Conversation tracking
- Activity logging
- Admin dashboard
- Secure authentication
- API integration with Google's Gemini AI

## Project Structure

```
media_ai/
├── app.py              # Application entry point
├── config.py           # Configuration management
├── models.py           # Database models
├── migrations/         # Database migrations
├── static/            # Static files (CSS, JS)
├── templates/         # HTML templates
├── logs/              # Application logs
└── tests/             # Test files
```

## Security

- All sensitive information is stored in environment variables
- Password hashing for user authentication
- CSRF protection
- Input validation and sanitization
- Proper error handling and logging

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License.
