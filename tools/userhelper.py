from flask import Blueprint, render_template, request,jsonify,session,redirect
import pymongo
client = pymongo.MongoClient('127.0.0.1',27017)
userdb = client['user']
maindb = client['main']
noveldb = client['novel']
def getuser():
    user = request.cookies.get('user')
    if 'user' not in session:
        return None
    if not user == session['user']:
        return None
    return user