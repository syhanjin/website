# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, request,jsonify,session,redirect,abort
import pymongo,random,datetime
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']
photo = Blueprint('photo', __name__)
@photo.route('/')
def photo_():
    return render_template('photo/pc/index.html')