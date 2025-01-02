from flask import Flask, request, jsonify, render_template, make_response
from flask_cors import CORS
import google.generativeai as genai
import os
from datetime import datetime
from dotenv import load_dotenv
from models import db, KnowledgeBase, Conversation

# تحميل المتغيرات البيئية
load_dotenv()

app = Flask(__name__)
CORS(app)

# إعداد قاعدة البيانات
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mediaai.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# إعداد Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

def get_ai_context():
    """جلب سياق المعرفة للذكاء الاصطناعي"""
    knowledge = KnowledgeBase.query.filter_by(active=True).all()
    context = "أنت مساعد ذكي للإقامة الجامعية Chentouf Mohamed. استخدم المعلومات التالية للإجابة على الأسئلة:\n\n"
    
    for item in knowledge:
        context += f"س: {item.question}\nج: {item.answer}\n\n"
    
    return context

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        # إنشاء السياق الكامل
        context = get_ai_context()
        prompt = context + f"\nسؤال المستخدم: {user_message}\nالإجابة:"
        
        # الحصول على رد من Gemini
        response = model.generate_content(prompt)
        ai_response = response.text
        
        # حفظ المحادثة
        conversation = Conversation(
            user_message=user_message,
            ai_response=ai_response
        )
        db.session.add(conversation)
        db.session.commit()
        
        return jsonify({'response': ai_response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/knowledge', methods=['GET'])
def get_knowledge():
    try:
        items = KnowledgeBase.query.all()
        return jsonify({
            'knowledge': [item.to_dict() for item in items]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/knowledge/export', methods=['GET'])
def export_knowledge():
    try:
        items = KnowledgeBase.query.all()
        export_text = "# قاعدة معرفة Media AI\n\n"
        
        for item in items:
            export_text += f"## {item.category}\n"
            export_text += f"س: {item.question}\n"
            export_text += f"ج: {item.answer}\n"
            export_text += f"الحالة: {'نشط' if item.active else 'غير نشط'}\n"
            export_text += f"تاريخ الإنشاء: {item.created_at}\n"
            export_text += f"آخر تحديث: {item.updated_at}\n\n"
            export_text += "---\n\n"
        
        response = make_response(export_text)
        response.headers['Content-Type'] = 'text/plain; charset=utf-8'
        response.headers['Content-Disposition'] = 'attachment; filename=knowledge_base.txt'
        
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/knowledge/truncate', methods=['POST'])
def truncate_knowledge():
    try:
        KnowledgeBase.query.delete()
        db.session.commit()
        return jsonify({'message': 'تم حذف جميع البيانات بنجاح'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/knowledge', methods=['POST'])
def add_knowledge():
    try:
        data = request.json
        knowledge = KnowledgeBase(
            category=data['category'],
            question=data['question'],
            answer=data['answer'],
            active=data.get('active', True)
        )
        db.session.add(knowledge)
        db.session.commit()
        return jsonify(knowledge.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/knowledge/<int:id>', methods=['PUT'])
def update_knowledge(id):
    try:
        knowledge = KnowledgeBase.query.get_or_404(id)
        data = request.json
        
        knowledge.category = data.get('category', knowledge.category)
        knowledge.question = data.get('question', knowledge.question)
        knowledge.answer = data.get('answer', knowledge.answer)
        knowledge.active = data.get('active', knowledge.active)
        
        db.session.commit()
        return jsonify(knowledge.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/knowledge/<int:id>', methods=['DELETE'])
def delete_knowledge(id):
    try:
        knowledge = KnowledgeBase.query.get_or_404(id)
        db.session.delete(knowledge)
        db.session.commit()
        return jsonify({'message': 'تم حذف المعلومة بنجاح'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=3000)
