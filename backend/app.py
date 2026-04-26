import os
from dotenv import load_dotenv
from datetime import timedelta,datetime
from flask import Flask,request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager,create_access_token,jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
import random
import requests
from flask_migrate import Migrate
from werkzeug.utils import secure_filename
from flask import send_from_directory
import uuid
from flask_socketio import SocketIO, emit
from flask_socketio import join_room
from sqlalchemy import func

load_dotenv()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
CORS(app, resources={
    r"/*": {
        "origins": "https://ai-finance-manager-nu.vercel.app"
    }
})

UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# create folder if not exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

otp_store = {}
temp_user_data = {}

# =========================
# 🔗 DATABASE CONFIG
# =========================


app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

jwt = JWTManager(app)

uri = os.getenv("DATABASE_URL") or os.getenv("MYSQL_URL")

if uri and uri.startswith("mysql://"):
    uri = uri.replace("mysql://", "mysql+pymysql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = uri

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

mail = Mail(app)

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    mobile = db.Column(db.String(15))
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    profile_image = db.Column(db.String(255))
    
    # 🔔 Notification Settings
    email_alerts = db.Column(db.Boolean, default=True)
    budget_exceeded_alert = db.Column(db.Boolean, default=True)
    near_limit_alert = db.Column(db.Boolean, default=True)

    # 🎨 Appearance
    theme = db.Column(db.String(10), default="light")

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer,)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id'))
    account = db.relationship('Account', backref="transactions")
    type = db.Column(db.String(20))   # income / expense
    category = db.Column(db.String(50))
    amount = db.Column(db.Float)
    date = db.Column(db.String(20))
    goal_id = db.Column(db.Integer, nullable=True)
    investment_id = db.Column(db.Integer, nullable=True)

class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    name = db.Column(db.String(100))   # e.g. SBI, Paytm
    type = db.Column(db.String(50))    # bank / wallet
    balance = db.Column(db.Float)

class Budget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    category = db.Column(db.String(50))
    amount = db.Column(db.Float)

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    title = db.Column(db.String(100))
    target_amount = db.Column(db.Float)
    saved_amount = db.Column(db.Float, default=0)

class Investment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    name = db.Column(db.String(100))   # stock/crypto name
    type = db.Column(db.String(50))    # stock / crypto / mutual fund
    buy_price = db.Column(db.Float)
    quantity = db.Column(db.Float)
    current_price = db.Column(db.Float)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    message = db.Column(db.String(255))
    type = db.Column(db.String(50))  # goal / investment / report / budget
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()
 
 
def send_email(to, subject, body):
    msg = Message(subject,
                  sender=app.config['MAIL_USERNAME'],
                  recipients=[to])
    msg.body = body
    mail.send(msg)    
    
#@app.route("/test-email")
#def test_email():
#    send_email(
#        to="dharmikdipali9@gmail.com",
#        subject="Test Email",
#        body="SMTP is working 🚀"
#    )
#    return "Email sent!" 

@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "https://ai-finance-manager-nu.vercel.app")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
    return response   
    
@app.route('/')
def home():
    return {"message": "Welcome to the Finance API!"}

import random
from werkzeug.security import generate_password_hash

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data["email"]

    otp = str(random.randint(100000, 999999))

    otp_store[email] = otp
    temp_user_data[email] = {
        "name": data["name"],
        "mobile": data["mobile"],
        "password": generate_password_hash(data["password"])
    }

    send_email(
        to=email,
        subject="OTP Verification",
        body=f"Your OTP is {otp}"
    )
    

    return {"message": "OTP sent to email"}

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    email = data["email"]
    otp = data["otp"]

    if otp_store.get(email) == otp:

        user_data = temp_user_data.get(email)

        user = User(
            name=user_data["name"],
            email=email,
            mobile=user_data["mobile"],
            password=user_data["password"]
        )

        db.session.add(user)
        db.session.commit()

        # cleanup
        otp_store.pop(email, None)
        temp_user_data.pop(email, None)

        return {"message": "User registered successfully"}

    return {"message": "Invalid OTP"}, 401

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(email=data["email"]).first()

    if user and check_password_hash(user.password, data["password"]):
        token = create_access_token(identity=str(user.id))

        return {
            "message": "Login success",
            "token": token,
            "user_id": user.id
        }

    return {"message": "Invalid credentials"}, 401


@app.route("/transaction", methods=["POST"])
@jwt_required()
def add_transaction():
    data = request.json
    category = data["category"].strip().lower()
    user_id = int(get_jwt_identity())
    amount = float(data["amount"])

    # 🔹 Create transaction
    t = Transaction(
        user_id=user_id,
        account_id=data["account_id"],
        type=data["type"],
        category=category,
        amount=amount,
        date=data["date"]
    )
    db.session.add(t)

    # 🔹 Update account
    account = Account.query.get(data["account_id"])
    if not account:
        return {"error": "Account not found"}, 404

    if data["type"] == "income":
        account.balance += amount
    else:
        account.balance -= amount

    # 🔥 COMMIT FIRST (IMPORTANT)
    db.session.commit()

    # 🔔 CHECK BUDGET (SEPARATE BLOCK)
    if data["type"] == "expense":

        budget = Budget.query.filter(
            Budget.user_id == user_id,
            func.lower(Budget.category) == category
        ).first()

        print("➡️ Category:", category)
        print("➡️ Budget:", budget)

        if budget:
            total_spent = db.session.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == user_id,
                func.lower(Transaction.category) == category,
                Transaction.type == "expense"
            ).scalar() or 0

            print("➡️ Total spent:", total_spent)

            if total_spent > budget.amount:

                notification = Notification(
                    user_id=user_id,
                    message=f"⚠️ Budget exceeded for {category}",
                    type="budget"
                )

                db.session.add(notification)
                db.session.commit()

                socketio.emit(
                    "new_notification",
                    {
                        "message": notification.message,
                        "type": notification.type,
                        "created_at": notification.created_at.strftime("%H:%M")
                    },
                    room=str(user_id)
                )

    return {"message": "Transaction added successfully!"}


@app.route("/transactions", methods=["GET"])
@jwt_required()
def get_transactions():
    user_id = int(get_jwt_identity())   # 🔥 IMPORTANT

    transactions = Transaction.query.filter_by(user_id=user_id).all()

    result = []

    for t in transactions:
        result.append({
            "id": t.id,
            "type": t.type,
            "category": t.category,
            "amount": t.amount,
            "date": t.date,
            "account": t.account.name if t.account else "Unknown"   # 🔥 SBI / Paytm etc
        })

    return result   # ✅ outside loop

@app.route("/transaction/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_transaction(id):
    user_id = int(get_jwt_identity())

    transaction = Transaction.query.filter_by(id=id, user_id=user_id).first()

    if not transaction:
        return {"message": "Transaction not found"}, 404

    db.session.delete(transaction)
    db.session.commit()

    return {"message": "Transaction deleted successfully"}

@app.route("/transaction/<int:id>", methods=["PUT"])
@jwt_required()
def update_transaction(id):
    data = request.json
    user_id = int(get_jwt_identity())

    transaction = Transaction.query.filter_by(id=id, user_id=user_id).first()

    if not transaction:
        return {"message": "Transaction not found"}, 404

    transaction.type = data.get("type", transaction.type)
    transaction.category = data.get("category", transaction.category)
    transaction.amount = data.get("amount", transaction.amount)
    transaction.date = data.get("date", transaction.date)

    db.session.commit()

    return {"message": "Transaction updated successfully"}



@app.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    
    user_id = int(get_jwt_identity())  # 🔥 get user from token
    
    user = User.query.get(user_id)   # 🔥 ADD THIS
    
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    
    total_income = 0
    total_expense = 0
    
    for t in transactions:
        if t.type == "income":
            total_income += t.amount
        elif t.type == "expense":
            total_expense += t.amount
            
    balance = total_income - total_expense
    
    if total_income > 0:
        savings_rate = (balance / total_income) * 100
    else:
        savings_rate = 0
        
    return {
        "name": user.name,   # 🔥 ADD THIS
        "income": total_income,
        "expense": total_expense,
        "balance": balance,
        "savings_rate": round(savings_rate, 2)
    }
      
@app.route("/ai-insights", methods=["GET"])
@jwt_required()
def ai_insights():
    user_id = int(get_jwt_identity())  # 🔥 get from token
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    
    total_income = 0
    total_expense = 0
    category_spend = {}
    
    # 🔹 prediction logic
    avg_expense = total_expense / len(transactions) if transactions else 0
    predicted_expense = avg_expense * 30   # approx monthly

    prediction = f"📊 Estimated next month expense: ₹ {round(predicted_expense, 2)}"
        
    for t in transactions:
        if t.type == "income":
            total_income += t.amount
        
        elif t.type == "expense":
            total_expense += t.amount
            
            #category wise spend
            if t.category in category_spend:
                category_spend[t.category] += t.amount
            else:
                category_spend[t.category] = t.amount
                
    insights = []
    
    #rule 1 : overall spending
    if total_expense > total_income:
        insights.append("⚠️ You are overspending overall. Consider reviewing your expenses.")
        
    #rule 2 : food overspending
    if category_spend.get("Food", 0) > total_income * 0.3:
        insights.append("🍔 You are overspending on Food")
    
    # High shopping
    if category_spend.get("shopping", 0) > total_income * 0.2:
        insights.append("🛍️ Reduce shopping expenses")

    # Too many small expenses
    if len(transactions) > 10:
        insights.append("📊 Too many transactions, track micro-spending")
        
    #rule 3 : savings
    if total_income > total_expense:
        insights.append("💰 Good job! You are saving money overall.")
        
    else:
        insights.append("❌ Your expenses exceed income")
    
    #rule 4 : No income
    if total_income == 0:
        insights.append("⚠️ No income recorded. Please add your income transactions.")

    return {"insights": insights,
            "income": total_income,
            "expense": total_expense,
            "balance": total_income - total_expense,
            "top_category": max(category_spend, key=category_spend.get) if category_spend else "None",
            "prediction": prediction}


@app.route("/analytics/category", methods=["GET"])
@jwt_required()
def category_analytics():
    user_id = int(get_jwt_identity())

    transactions = Transaction.query.filter_by(
        user_id=user_id, type="expense"
    ).all()

    category_data = {}

    for t in transactions:
        category_data[t.category] = category_data.get(t.category, 0) + t.amount

    return dict(sorted(category_data.items(), key=lambda x: x[1], reverse=True))
    

@app.route("/analytics/summary", methods=["GET"])
@jwt_required()
def summary():
    user_id = int(get_jwt_identity())

    transactions = Transaction.query.filter_by(user_id=user_id).all()
    
    income = 0
    expense = 0
    
    
    for t in transactions:
        if t.type == "income":
            income += t.amount
        else:
            expense += t.amount
            
    return {
        "income" : income,
        "expense" : expense
    }


@app.route("/analytics/monthly" , methods=["GET"])
@jwt_required()
def monthly_analytics():
    user_id = int(get_jwt_identity())

    transaction = Transaction.query.filter_by(user_id=user_id).all()
    
    monthly_data = {}
    
    for t in transaction:
        month = t.date[:7]
         
        if month not in monthly_data:
            monthly_data[month] = 0

        if t.type == "expense":
            monthly_data[month] += t.amount
            
    return monthly_data        

@app.route("/account", methods=["POST"])
@jwt_required()
def add_account():
    data = request.json
    
    user_id = int(get_jwt_identity())   # 🔥 FIX
    
    acc =  Account(
        user_id = user_id,
        name = data["name"],
        type = data["type"],
        balance = data["balance"]
    )

    db.session.add(acc)
    db.session.commit()
    
    return {"message": "Account added successfully!"}

@app.route("/accounts", methods=["GET"])
@jwt_required()
def get_accounts():
    user_id = int(get_jwt_identity())   # 🔥 FIX
    accounts = Account.query.filter_by(user_id=user_id).all()
    
    result = []
    
    for acc in accounts:
        result.append({
            "id" : acc.id,
            "name" : acc.name,
            "type" : acc.type,
            "balance" : acc.balance
        })

    return result

@app.route("/account/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_account(id):
    user_id = int(get_jwt_identity())
    
    account = Account.query.filter_by(id=id, user_id=user_id).first()
    
    if not account:
        return {"message": "Account not found"}, 404
    
    db.session.delete(account)
    db.session.commit()
    
    return {"message": "Account deleted successfully"}


@app.route("/budget", methods=["POST"])
@jwt_required()
def add_budget():
    data = request.json
    category = data["category"].strip().lower()
    
    user_id = int(get_jwt_identity())   # 🔥 FIX
    
    b = Budget(
        user_id =user_id,
        category = category,
        amount = data['amount']
    )

    db.session.add(b)
    db.session.commit()

    return {"message" : "Budget added successfully!"}

@app.route("/budget/<string:category>", methods=["DELETE"])
@jwt_required()
def delete_budget(category):
    user_id = int(get_jwt_identity())
    
    budget = Budget.query.filter_by(category=category, user_id=user_id).first()
    
    if not budget:
        return {"message" : "Budget not found"}, 404
    
    db.session.delete(budget)
    db.session.commit()
    
    return {"message" : "Budget deleted successfully!"} 

@app.route("/budget-analysis", methods=["GET"])
@jwt_required()
def budget_analysis():
    user_id = int(get_jwt_identity())

    budgets = Budget.query.filter_by(user_id=user_id).all()
    transactions = Transaction.query.filter_by(user_id=user_id, type="expense").all()

    # category-wise spend
    category_spend = {}

    for t in transactions:
        cat = t.category.strip().lower()
        category_spend[cat] = category_spend.get(cat, 0) + t.amount

    result = []

    for b in budgets:
        cat = b.category.strip().lower()
        spent = category_spend.get(cat, 0)

        percent = (spent / b.amount) * 100 if b.amount > 0 else 0

        if percent <= 50:
            status = "within"
        elif percent < 100:
            status = "near"
        else:
            status = "exceeded"

        result.append({
            "category": b.category,  # keep original for display
            "budget": b.amount,
            "spent": spent,
            "percent": round(percent, 2),
            "status": status
        })

    return jsonify(result)

            
@app.route("/goal", methods=["POST"])
@jwt_required()
def add_goal():
    data = request.json
    
    user_id = int(get_jwt_identity())
    
    g = Goal(
        user_id = user_id,
        title = data['title'],
        target_amount = data['target_amount'],
        saved_amount = 0
    )           
        
    db.session.add(g)
    db.session.commit()
    
    return {"message": "Goal created"}

@app.route("/goal/add", methods=["POST"])
@jwt_required()
def add_to_goal():
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        goal_id = data.get("goal_id")
        amount = data.get("amount")
        account_id = data.get("account_id")

        # 🔥 VALIDATION
        if not goal_id or not amount or not account_id:
            return {"error": "Missing data"}, 400

        amount = float(amount)

        goal = Goal.query.get(goal_id)
        account = Account.query.get(account_id)

        if not goal:
            return {"error": "Goal not found"}, 400

        if not account:
            return {"error": "Account not found"}, 400

        # 🔥 FIELD CHECK
        saved = getattr(goal, "saved_amount", None) or getattr(goal, "saved", 0)
        target = getattr(goal, "target_amount", None) or getattr(goal, "target", 0)

        if account.balance < amount:
            return {"error": "Insufficient balance"}, 400

        remaining = target - saved

        if amount > remaining:
            return {"error": f"You can add only ₹{remaining}"}, 400

        # ✅ UPDATE VALUES
        if hasattr(goal, "saved_amount"):
            goal.saved_amount += amount
            updated_saved = goal.saved_amount
        else:
            goal.saved += amount
            updated_saved = goal.saved

        account.balance -= amount

        # ✅ TRANSACTION
        transaction = Transaction(
            user_id=user_id,
            category="goals",
            amount=amount,
            type="expense",
            account_id=account_id,
            goal_id=goal_id,
            date=datetime.now().date()
        )

        db.session.add(transaction)

        # 🔥 NOTIFICATION (ONLY WHEN GOAL COMPLETED)
        if updated_saved >= target:
            notification = Notification(
                user_id=user_id,
                message=f"🎯 Goal '{goal.title}' achieved!",
                type="goal"
            )

            db.session.add(notification)

            db.session.commit() 
            socketio.emit(
                "new_notification",
                {
                    "message": notification.message,
                    "type": notification.type,
                    "created_at": notification.created_at.strftime("%H:%M")
                },
                room=str(user_id)
            )
        # ✅ THIS WAS MISSING
        db.session.commit()
        return {"message": "Success"}


    except Exception as e:
        print("🔥 ERROR:", e)
        return {"error": "Server error"}, 500

@app.route("/goals", methods=["GET"])
@jwt_required()
def get_goals():
    user_id = int(get_jwt_identity())
    goals = Goal.query.filter_by(user_id=user_id).all()
    
    result = []
    
    for g in goals:
        progress = (g.saved_amount / g.target_amount) * 100 if g.target_amount > 0 else 0
        result.append({
            "id": g.id,   # 🔥 ADD THIS
             "title" : g.title,
             "target": g.target_amount,
             "saved": g.saved_amount,
             "progress": round(progress, 2)
             
         })
    return result


@app.route("/goal/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_goal(id):
    try:
        user_id = int(get_jwt_identity())

        goal = Goal.query.filter_by(id=id, user_id=user_id).first()

        if not goal:
            return {"error": "Goal not found"}, 404

        # ✅ ONLY this goal's transactions
        goal_transactions = Transaction.query.filter_by(
            user_id=user_id,
            goal_id=id
        ).all()

        # 🔥 Refund + delete
        for t in goal_transactions:
            if t.account_id:
                account = Account.query.get(t.account_id)
                if account:
                    account.balance += t.amount  # 💰 refund

            db.session.delete(t)

        # 🔥 delete goal
        db.session.delete(goal)
        db.session.commit()

        return {"message": "Goal deleted & refunded 💰"}

    except Exception as e:
        print("🔥 DELETE ERROR:", str(e))
        return {"error": str(e)}, 500

@app.route("/transactions/search")
@jwt_required()
def search_transactions():
    user_id = int(get_jwt_identity())
    
    category = request.args.get("category")
    type_ = request.args.get("type")
    
    query = Transaction.query.filter_by(user_id=user_id)
    
    if category:
        query = query.filter_by(category=category)
    if type_:
        query = query.filter_by(type=type_)
        
    transactions = query.all()
    
    return [{
        "amount": t.amount,
        "category": t.category,
        "type": t.type,
        "date": t.date
    } for t in transactions]


@app.route("/monthly-report")
@jwt_required()
def monthly_report():
    user_id = int(get_jwt_identity())
    transactions = Transaction.query.filter_by(user_id=user_id).all()

    report = {}

    for t in transactions:
        month = t.date[:7]

        if month not in report:
            report[month] = {
                "income": 0,
                "expense": 0
            }

        if t.type == "income":
            report[month]["income"] += t.amount
        else:
            report[month]["expense"] += t.amount

    return report

@app.route("/yearly-report")
@jwt_required()
def yearly_report():
    user_id = int(get_jwt_identity())
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    
    report = {}
    
    for t in transactions:
        year = t.date[:4]
         
        report[year] = report.get(year,0) + t.amount

    return report

@app.route("/investment", methods=["POST"])
@jwt_required()
def add_investment():
    try:
        data = request.json
        user_id = int(get_jwt_identity())
        
        account = Account.query.get(data["account_id"])
        
        if not account:
            return {"error" : "Account not found"}, 400
        
        total_amount = data["buy_price"] * data["quantity"]
        
        if account.balance < total_amount :
            return {"error" : "Insufficient balance"}, 400
        
        # create investment
        inv = Investment(
            user_id=user_id,
            name=data["name"],
            type=data["type"],
            buy_price=data["buy_price"],
            quantity=data["quantity"],
            current_price=data["current_price"]
        )

        db.session.add(inv)
        db.session.flush()  # 🔥 to get inv.id
        
        #deduct from account
        account.balance -= total_amount
        
        # add transaction
        
        transaction = Transaction(
            user_id = user_id,
            account_id = data["account_id"],
            type = "expense",
            category = "investment",
            amount = total_amount,
            investment_id = inv.id,
            date=datetime.now().date()            
        )
        
        db.session.add(transaction)
        
        notification = Notification(
            user_id=user_id,
            message=f"📈 Investment added: {data['name']}",
            type="investment"
        )

        db.session.add(notification)
        db.session.commit()

        socketio.emit(
            "new_notification",
            {
                "message": notification.message,
                "type": notification.type,
                "created_at": notification.created_at.strftime("%H:%M")
            },
            room=str(user_id)
        )
        
        return {"message": "Investment added"}

    except Exception as e:
         print("🔥 INVEST ERROR:", e)
         return {"error": str(e)}, 500

@app.route("/investment/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_investment(id):
    try:
        user_id = int(get_jwt_identity())

        # 🔥 Get investment
        inv = Investment.query.filter_by(id=id, user_id=user_id).first()

        if not inv:
            return {"error": "Investment not found"}, 404

        # 🔥 Get ALL related transactions
        transactions = Transaction.query.filter_by(
            user_id=user_id,
            investment_id=id
        ).all()

        total_refund = 0

        for t in transactions:
            account = Account.query.filter_by(
                id=t.account_id,
                user_id=user_id
            ).first()

            if account:
                account.balance += t.amount  # 💰 refund

            total_refund += t.amount
            db.session.delete(t)

        # 🔥 Delete investment
        db.session.delete(inv)
        
        notification = Notification(
            user_id=user_id,
            message=f"💰 Investment removed & refunded",
            type="investment"
        )

        db.session.add(notification)
        db.session.commit()

        socketio.emit(
            "new_notification",
            {
                "message": notification.message,
                "type": notification.type,
                "created_at": notification.created_at.strftime("%H:%M")
            },
            room=str(user_id)
        )

        return {
            "message": "Investment deleted & refunded 💰",
            "refund": total_refund
        }

    except Exception as e:
        print("🔥 DELETE INVEST ERROR:", e)
        return {"error": str(e)}, 500


@app.route("/investments")
@jwt_required()
def get_investments():
    user_id = int(get_jwt_identity())
    
    investments = Investment.query.filter_by(user_id=user_id).all()
    
    result = []
    
    for  i in investments:
        invested = i.buy_price * i.quantity
        current = i.current_price * i.quantity
        profit_loss = current - invested
        
        result.append({
            "id": i.id,   # 🔥 ADD THIS LINE
            "name" : i.name,
            "type" : i.type,
            "invested" : invested,
            "current_value" : current,
            "profit_loss" : profit_loss
        })
    
    return result

@app.route("/investment-summary")
@jwt_required()
def investment_summary():
    user_id = int(get_jwt_identity())
    
    investments = Investment.query.filter_by(user_id=user_id).all()
    
    total_invested = 0
    total_current = 0
    
    for i in investments:
        total_invested += i.buy_price * i.quantity
        total_current += i.current_price * i.quantity

    profit_loss = total_current - total_invested
    
    return {
        "total_invested": total_invested,
        "total_current": total_current,
        "profit_loss": profit_loss
    }
   
   
   
@app.route("/stock/<symbol>")
@jwt_required()
def get_stock(symbol):
    import yfinance as yf

    # 🔥 Clean symbol
    symbol = symbol.replace(" ", "").upper()

    # 🔥 Add .NS for Indian stocks automatically
    if "." not in symbol:
        symbol = symbol + ".NS"

    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period="1d")

        if data.empty:
            return {"error": "Invalid stock symbol"}, 400

        price = float(data["Close"].iloc[-1])

        return {
            "price": round(price, 2)
        }

    except Exception as e:
        return {"error": str(e)}, 400
    

@app.route("/ai-stock-advice")
@jwt_required()
def ai_stock_advice():
    user_id = int(get_jwt_identity())
    
    investments = Investment.query.filter_by(user_id=user_id).all()
    
    advice = []
    
    for i in investments:
        invested = i.buy_price * i.quantity
        current = i.current_price * i.quantity
        profit_loss = current - invested
        
        percent = (profit_loss / invested) * 100 if invested > 0 else 0
        
        # 🔥 IMPROVED AI-LIKE LOGIC
        if percent > 20:
            advice.append(f"🚀 {i.name}: Strong rally! Consider profit booking")
        elif percent > 10:
            advice.append(f"📈 {i.name}: Good profit, you can hold or book partial gains")
        elif percent < -20:
            advice.append(f"⚠️ {i.name}: Heavy loss, consider exit strategy")
        elif percent < -10:
            advice.append(f"📉 {i.name}: Downtrend, review fundamentals")
        else:
            advice.append(f"⚖️ {i.name}: Stable, hold position")
    
    # ✅ Handle empty portfolio
    if not advice:
        advice.append("Start investing to get AI-based insights 💡")

    return {"advice": advice}


@app.route("/settings", methods=["GET"])
@jwt_required()
def get_settings():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return {"message": "User not found"}, 404
    
    BASE_URL = "https://ai-finance-manager-h6jl.onrender.com"

    return {
        # 👤 Profile
        "name": user.name,
        "mobile": user.mobile,
        "email": user.email,
        "profile_image": (
            f"{BASE_URL}/uploads/{user.profile_image}"
            if user.profile_image else ""),

        # 🔔 Notifications
        "email_alerts": user.email_alerts,
        "budget_exceeded_alert": user.budget_exceeded_alert,
        "near_limit_alert": user.near_limit_alert,

        # 🎨 Appearance
        "theme": user.theme
    }



@app.route("/settings", methods=["POST"])
@jwt_required()
def updated_settings():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    BASE_URL = "https://ai-finance-manager-h6jl.onrender.com"
    return {
        "name" : user.name,
        "email" : user.email,
        "mobile" : user.mobile,
        "profile_image": (
            f"{BASE_URL}/uploads/{user.profile_image}"
            if user.profile_image else ""
        ),
        "email_alerts" : user.email_alerts,
        "budget_exceeded_alert" : user.budget_exceeded_alert,
        "near_limit_alert": user.near_limit_alert,

        "theme": user.theme
    }   



@app.route("/settings", methods=["PUT"])
@jwt_required()
def update_settings():
    user_id = int(get_jwt_identity())
    data = request.json
    
    user = User.query.get(user_id)
    
        # 👤 Profile update
    user.name = data.get("name", user.name)
    user.mobile = data.get("mobile", user.mobile)

    # ✅ FIXED IMAGE SAVE
    if data.get("profile_image"):
        user.profile_image = data["profile_image"]
    
    # 🔔 Notification settings
    user.email_alerts = data.get("email_alerts", user.email_alerts)
    user.budget_exceeded_alert = data.get("budget_exceeded_alert", user.budget_exceeded_alert)
    user.near_limit_alert = data.get("near_limit_alert", user.near_limit_alert)
    
   # 🎨 Theme
    user.theme = data.get("theme", user.theme)

    db.session.commit()

    return {"message": "Settings updated successfully"}
   
@app.route("/upload-profile", methods=["POST"])
@jwt_required()
def upload_profile():
     if "file" not in request.files:
        return {"error": "No file part"}, 400    
     
     file = request.files["file"]
     
     if file.filename == "":
         return {"error": "No selected file"}, 400
     
     filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
     file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
     
     file.save(file_path)
     
     user_id = int(get_jwt_identity())
     user = User.query.get(user_id)
     
     # save image path in DB
     user.profile_image = filename
     db.session.commit()
     
     BASE_URL = "https://ai-finance-manager-h6jl.onrender.com"
     
     return {
          "message": "Uploaded successfully",
          "image_url": f"{BASE_URL}/uploads/{filename}"
     }
    
@app.route("/uploads/<filename>")    
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)
    
 
@app.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    data = request.json
    
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")
    
    if not current_password or not new_password:
        return {"error": "Both current and new password are required"}, 400

    user = User.query.get(user_id)
    
    if not user :
        return {"message": "User not found"}, 400
    
    # check current password
    if not check_password_hash(user.password, current_password):
        return {"message": "Current password is incorrect"}, 400
    
    
    #validate new password (basic)
    if len(new_password) < 6:
        return {"message": "New password must be at least 6 characters long"}, 400          
    
    # hash password and save
    user.password = generate_password_hash(new_password)
    db.session.commit()
    
    send_email(
    to=user.email,
    subject="Password Changed",
    body="Your password was updated successfully. If this wasn't you, contact support immediately."
    )
    
    return {"message": "Password updated successfully!"}
    
@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    email = request.json["email"]

    user = User.query.filter_by(email=email).first()
    if not user:
        return {"message": "User not found"}, 404

    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp

    send_email(email, "Reset Password OTP", f"Your OTP is {otp}")

    return {"message": "OTP sent"}

@app.route("/verify-reset-otp", methods=["POST"])
def verify_reset_otp():
    email = request.json["email"]
    otp = request.json["otp"]

    if otp_store.get(email) != otp:
        return {"message": "Invalid OTP"}, 400

    return {"message": "OTP verified"}


@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json

    email = data.get("email")
    new_password = data.get("newPassword")

    if not email or not new_password:
        return {"message": "Missing fields"}, 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return {"message": "User not found"}, 404

    # 🔐 hash password
    user.password = generate_password_hash(new_password)

    db.session.commit()

    # 🔥 clear OTP after success
    otp_store.pop(email, None)

    return {"message": "Password reset successful"}


@app.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    try:
        user_id = int(get_jwt_identity())
        
        notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
        data = []
        
        for n in notifications:
            data.append(
                {
                    "id" : n.id,
                    "message" : n.message,
                    "type" : n.type,
                    "is_read" : n.is_read,
                    "created_at" : n.created_at.strftime("%Y-%m-%d %H:%M")
                }
            )

        return jsonify(data)
    except Exception as e :
        print("🔥 NOTIFICATION ERROR:", e)
        return {"error": "Server error"}, 500
    
@app.route("/notifications/read", methods=["PUT"])
@jwt_required()
def mark_notifications_read():
    try:
        user_id = int(get_jwt_identity())
        
        Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read" : True})
        
        db.session.commit()
        
        return {"message" : "Marked as read"}
    
    except Exception as e:
        print("Read Error: ", e)
        return {"error" : "Server error"}, 500
    
@app.route("/notifications/unread-count", methods=["GET"]) 
@jwt_required()
def unread_count():
    user_id = int(get_jwt_identity())
    
    count = Notification.query.filter_by(user_id=user_id , is_read=False).count()
    
    return {"count" : count} 

@app.route("/notifications/all", methods=["DELETE"])
@jwt_required()
def delete_all_notifications():
    user_id = int(get_jwt_identity())

    Notification.query.filter_by(user_id=user_id).delete()
    db.session.commit()

    return {"message": "All notifications deleted"}    
 
@app.route("/notify/report", methods=["POST"])
@jwt_required()
def report_notification():
    user_id = int(get_jwt_identity())

    notification = Notification(
        user_id=user_id,
        message="📊 Monthly report is ready. Click to download.",
        type="report"
    )

    db.session.add(notification)
    db.session.commit()

    socketio.emit(
        "new_notification",
        {
            "message": notification.message,
            "type": notification.type,
            "created_at": notification.created_at.strftime("%H:%M")
        },
        room=str(user_id)
    )

    return {"message": "Notification sent"} 
  
  
@socketio.on("join")
def handle_join(data):
    

    user_id = data.get("user_id")
    join_room(str(user_id))

    print(f"✅ User joined room: {user_id}")      
    
if __name__ == "__main__":
    socketio.run(app)