import datetime
from flask.globals import request
from flask.templating import render_template
import pymongo
from .kw import kw


# Run pip install flask-blueprint
from flask import Blueprint
main = Blueprint('bot_main', __name__, url_prefix='/qbot')

client = pymongo.MongoClient('127.0.0.1', 27017)
botdb = client['qbot']

@main.route('/', methods=['GET'])
def qbot_main():
    key = request.args.get('key')
    if key is None:
        return render_template('error/pc.html',error='权限不足')
    data = botdb.console.find_one({
        'key': key
    })
    if data is None or data['deadtime'] < datetime.datetime.now():
        botdb.kw_edit.delete_one({
            'key': key
        })
        return render_template('error/pc.html', error='权限不足')
    
