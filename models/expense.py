"""
Expense Model
Represents an expense transaction in the application
"""

from datetime import datetime


class Expense:
    """Expense data model"""
    
    def __init__(self, expense_id, amount, description, payer_id, group_id):
        self.expense_id = expense_id
        self.amount = amount
        self.description = description
        self.payer_id = payer_id
        self.group_id = group_id
        self.created_at = datetime.now()
        self.splits = []
    
    def add_split(self, user_id, amount):
        """Add a split for an expense"""
        self.splits.append({
            'user_id': user_id,
            'amount': amount
        })
    
    def get_expense_details(self):
        """Retrieve expense details"""
        return {
            'expense_id': self.expense_id,
            'amount': self.amount,
            'description': self.description,
            'payer_id': self.payer_id,
            'group_id': self.group_id,
            'created_at': self.created_at,
            'splits': self.splits
        }
