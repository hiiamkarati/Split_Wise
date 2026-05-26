"""
User Model
Represents a user in the application
"""


class User:
    """User data model"""
    
    def __init__(self, user_id, name, email, phone=None):
        self.user_id = user_id
        self.name = name
        self.email = email
        self.phone = phone
    
    def get_user_info(self):
        """Retrieve user information"""
        return {
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone
        }
    
    def update_profile(self, **kwargs):
        """Update user profile"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
