import datetime
from flask.globals import request
from flask.templating import render_template
import pymongo
from .kw import kw


from flask import Blueprint
main = Blueprint('bot_main', __name__, url_prefix='/qbot')

client = pymongo.MongoClient('127.0.0.1', 27017)
botdb = client['qbot']

@main.route('/', methods=['GET'])
def qbot_main():
    pass
